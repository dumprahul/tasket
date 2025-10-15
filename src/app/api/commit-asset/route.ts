import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      assetCid, // Nid
      assetTimestampCreated, // unix seconds
      assetCreator, // string
      assetSha256, // hex string
      commitMessage, // string
      abstract, // optional
      encodingFormat = 'image/jpeg',
      testnet,
    } = body || {}

    if (!assetCid || !assetTimestampCreated || !assetCreator || !assetSha256 || !commitMessage) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const captureToken = process.env.CAPTURE_TOKEN
    if (!captureToken) {
      return NextResponse.json({ error: 'Server missing CAPTURE_TOKEN' }, { status: 500 })
    }

    const payload: any = {
      encodingFormat,
      assetCid,
      assetTimestampCreated,
      assetCreator,
      assetSha256,
      commitMessage,
    }
    if (abstract) payload.abstract = abstract
    if (typeof testnet === 'boolean') payload.testnet = testnet

    const resp = await fetch('https://us-central1-numbers-protocol-api.cloudfunctions.net/nit-commit-to-jade', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `token ${captureToken}`,
      },
      body: JSON.stringify(payload),
    })

    const json = await resp.json().catch(() => ({}))
    if (!resp.ok) {
      return NextResponse.json({ error: 'Upstream error', details: json }, { status: resp.status })
    }

    return NextResponse.json(json)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 })
  }
}


