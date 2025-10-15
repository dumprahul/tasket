import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const nid = searchParams.get('nid')
    const testnet = searchParams.get('testnet') === 'true'
    if (!nid) return NextResponse.json({ error: 'nid is required' }, { status: 400 })

    const captureToken = process.env.CAPTURE_TOKEN
    if (!captureToken) return NextResponse.json({ error: 'Server missing CAPTURE_TOKEN' }, { status: 500 })

    const base = 'https://e23hi68y55.execute-api.us-east-1.amazonaws.com/default/get-commits-storage-backend-jade-near'
    const url = `${base}?nid=${encodeURIComponent(nid)}${testnet ? '&testnet=true' : ''}`

    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `token ${captureToken}`,
      },
    })
    const json = await resp.json().catch(() => ({}))
    if (!resp.ok) return NextResponse.json({ error: 'Upstream error', details: json }, { status: resp.status })
    return NextResponse.json(json)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 })
  }
}


