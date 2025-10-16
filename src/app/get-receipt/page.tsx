'use client'
import Silk from "@/components/Silk";
import { useState } from 'react'
import jsPDF from 'jspdf'

export default function GetReceiptPage(){
  const [nid, setNid] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [commits, setCommits] = useState<any[]>([])

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nid) return
    setLoading(true)
    setError(null)
    setCommits([])
    try{
      const res = await fetch(`/api/get-commits?nid=${encodeURIComponent(nid)}`)
      const json = await res.json()
      console.log('Commits response:', json)
      if (!res.ok) throw new Error(json?.error || 'Failed to fetch commits')
      const list = Array.isArray(json?.commits) ? json.commits : (json?.data || [])
      setCommits(list)
    }catch(e:any){
      setError(e?.message || 'Failed to fetch commits')
    }finally{
      setLoading(false)
    }
  }

  return(
    <main className="relative min-h-[100svh] w-full overflow-hidden font-sans text-white">
      <div className="fixed inset-0 -z-10">
        <Silk speed={5} scale={1} color="#4F39E3" noiseIntensity={1.2} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(255,255,255,0.1),transparent_40%),radial-gradient(circle_at_50%_120%,rgba(0,0,0,0.35),transparent_50%)]" />
      </div>

      <section className="relative min-h-screen px-6 py-16">
        <div className="mx-auto max-w-5xl space-y-8">
          <header className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight">get receipt</h1>
            <p className="text-white/90 text-lg sm:text-xl">Enter an asset Nid to list its commit receipts.</p>
          </header>

          <form onSubmit={onSearch} className="flex w-full max-w-3xl gap-3">
            <input
              className="flex-1 rounded-md bg-white/10 border border-white/20 p-3 text-white placeholder-white/60"
              placeholder="Enter asset Nid (bafy...)"
              value={nid}
              onChange={e=>setNid(e.target.value)}
            />
            <button className="rounded-md bg-white text-black font-semibold px-4">Search</button>
          </form>

          {error && <div className="text-red-300">{error}</div>}
          {loading && <div className="text-white/80">Loading…</div>}

          {!loading && commits.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {commits.map((c:any, idx:number) => {
                const author = c.author || c.owner || c.identity?.author || c.identity?.name || c.identity || c.account || ''
                const txHash = c.transaction?.hash || c.txHash || c.hash || ''
                const explorerURL = c.explorerURL || (txHash ? `https://mainnet.num.network/tx/${txHash}` : '')
                return (
                  <article key={idx} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4">
                    <div className="text-sm text-white/70">{new Date((c.timestampCreated || c.timestamp || 0)*1000).toLocaleString()}</div>
                    <h3 className="text-lg font-bold">{c.commitMessage || c.actionName || 'Commit'}</h3>
                    <div className="text-white/80 text-sm break-words">{c.abstract || c.custom?.payloadCid || ''}</div>

                    <div className="mt-3 space-y-1 text-sm">
                      {author && (
                        <div>
                          <span className="text-white/60">Author: </span>
                          <span className="text-white/90">{author}</span>
                        </div>
                      )}
                      {txHash && (
                        <div className="break-words">
                          <span className="text-white/60">Transaction ID: </span>
                          <span className="text-white/90 break-all">{txHash}</span>
                        </div>
                      )}
                      {explorerURL && (
                        <div className="break-words">
                          <span className="text-white/60">Explorer: </span>
                          <a className="text-sky-300 underline break-all" href={explorerURL} target="_blank" rel="noreferrer">{explorerURL}</a>
                        </div>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          {!loading && commits.length > 0 && (
            <div className="pt-6">
              <button
                className="rounded-md bg-white text-black font-semibold px-4 py-2"
                onClick={() => {
                  const doc = new jsPDF()
                  const margin = 14
                  let y = margin
                  doc.setFont('Helvetica', 'bold')
                  doc.setFontSize(18)
                  doc.text('Tasket — Asset Receipt', margin, y)
                  y += 8
                  doc.setFontSize(11)
                  doc.setFont('Helvetica', 'normal')
                  doc.text(`Nid: ${nid}`, margin, y)
                  y += 6
                  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y)
                  y += 10

                  commits.forEach((c:any, idx:number) => {
                    const ts = new Date((c.timestampCreated || c.timestamp || 0) * 1000).toLocaleString()
                    const title = c.commitMessage || c.actionName || `Commit #${idx+1}`
                    const summary = c.abstract || c.custom?.payloadCid || ''
                    const tx = c.transaction?.hash || ''

                    doc.setFont('Helvetica', 'bold')
                    doc.setFontSize(13)
                    doc.text(`${idx+1}. ${title}`, margin, y)
                    y += 6
                    doc.setFont('Helvetica', 'normal')
                    doc.setFontSize(10)
                    const lines = doc.splitTextToSize(`• Time: ${ts}\n• Summary: ${summary}\n${tx ? `• Tx: ${tx}` : ''}`, 182)
                    lines.forEach((ln:string) => {
                      if (y > 280) { doc.addPage(); y = margin }
                      doc.text(ln, margin, y)
                      y += 5
                    })
                    y += 3
                    if (y > 280) { doc.addPage(); y = margin }
                  })

                  doc.save(`tasket-receipt-${nid || 'asset'}.pdf`)
                }}
              >
                Download as PDF
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}


