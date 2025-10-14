import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import crypto from 'crypto'
import { ethers } from 'ethers'
import * as nit from '@numbersprotocol/nit'
import mime from 'mime'
import { getSupabaseServer } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function sha256File(path: string): Promise<string> {
  const data = await fs.readFile(path)
  const hash = crypto.createHash('sha256')
  hash.update(data)
  return hash.digest('hex')
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Content-Type must be multipart/form-data' }, { status: 400 })
    }

    const form = await req.formData()
    const file = form.get('asset_file') as File | null
    const caption = (form.get('caption') as string) || ''
    const headline = (form.get('headline') as string) || ''

    if (!file) {
      return NextResponse.json({ error: 'asset_file is required' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buf = Buffer.from(arrayBuffer)
    const tmpPath = join(tmpdir(), `upload-${Date.now()}-${file.name}`)
    await fs.writeFile(tmpPath, buf)

    const proofHash = await sha256File(tmpPath)
    const asset_mime_type = mime.getType(file.name) || 'application/octet-stream'
    const created_at = Math.floor(Date.now() / 1000)

    const integrityProof = {
      proof_hash: proofHash,
      asset_mime_type,
      created_at,
    }

    const integritySha = await nit.getIntegrityHash(ethers.toUtf8Bytes(JSON.stringify(integrityProof)))

    const privateKey = process.env.SIGNATURE_WALLET_PRIVATE_KEY
    const captureToken = process.env.CAPTURE_TOKEN
    if (!privateKey || !captureToken) {
      return NextResponse.json({ error: 'Server missing SIGNATURE_WALLET_PRIVATE_KEY or CAPTURE_TOKEN' }, { status: 500 })
    }
    const signer = new ethers.Wallet(privateKey)
    const publicKey = await signer.getAddress()
    const signature = await nit.signIntegrityHash(integritySha, signer)

    const signatureArray = [
      {
        proofHash: proofHash,
        provider: 'TasketSignatureProvider',
        signature,
        publicKey,
        integritySha,
      },
    ]

    const formOut = new FormData()
    formOut.append('asset_file', new Blob([buf], { type: asset_mime_type }), file.name)
    formOut.append('signed_metadata', JSON.stringify(integrityProof))
    formOut.append('signature', JSON.stringify(signatureArray))
    if (caption) formOut.append('caption', caption)
    if (headline) formOut.append('headline', headline)

    const resp = await fetch('https://api.numbersprotocol.io/api/v3/assets/', {
      method: 'POST',
      headers: {
        Authorization: `token ${captureToken}`,
      },
      body: formOut as any,
    })

    if (!resp.ok) {
      const txt = await resp.text()
      return NextResponse.json({ error: 'Upstream error', details: txt }, { status: 502 })
    }
    const json = await resp.json()

    // Persist to Supabase
    try {
      const supabase = getSupabaseServer()
      const uploadedAt = new Date().toISOString()
      await supabase.from('assets').insert({
        nid: json?.id || null,
        asset_file_name: json?.asset_file_name || file.name,
        asset_file_mime_type: json?.asset_file_mime_type || asset_mime_type,
        caption,
        headline,
        asset_timestamp_created: created_at,
        creator_name: form.get('creatorName') || null,
        uploaded_at: uploadedAt,
      })
    } catch (e) {
      // do not fail the whole request if DB insert fails
      console.warn('Supabase insert failed:', e)
    }

    return NextResponse.json(json)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 })
  }
}


