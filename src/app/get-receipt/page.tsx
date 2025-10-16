'use client'
import Silk from "@/components/Silk";
import { useEffect, useState } from 'react'
import jsPDF from 'jspdf'
import { getSupabaseBrowser } from '@/lib/supabase'

export default function GetReceiptPage(){
  const [nid, setNid] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [commits, setCommits] = useState<any[]>([])
  const [works, setWorks] = useState<any[]>([])
  const [worksLoading, setWorksLoading] = useState(false)
  const [worksError, setWorksError] = useState<string | null>(null)

  const fetchCommitsByNid = async (nidToFetch: string) => {
    if (!nidToFetch) return
    setLoading(true)
    setError(null)
    setCommits([])
    try{
      const res = await fetch(`/api/get-commits?nid=${encodeURIComponent(nidToFetch)}`)
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

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nid) return
    await fetchCommitsByNid(nid)
  }

  useEffect(() => {
    const loadWorks = async () => {
      setWorksLoading(true)
      setWorksError(null)
      try{
        const supabase = getSupabaseBrowser()
        const { data, error: dbError } = await supabase
          .from('assets')
          .select('nid, headline, caption, creator_name, uploaded_at, asset_file')
          .order('uploaded_at', { ascending: false })
          .limit(50)
        if (dbError) throw dbError
        setWorks(data || [])
      }catch(e:any){
        setWorksError(e?.message || 'Failed to load works')
      }finally{
        setWorksLoading(false)
      }
    }
    loadWorks()
  }, [])

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

          {/* Commits (receipts) should appear directly under the search box */}
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
                    const author = c.author || c.owner || c.identity?.author || c.identity?.name || c.identity || c.account || ''
                    const txHash = c.transaction?.hash || c.txHash || c.hash || ''
                    const explorerURL = c.explorerURL || (txHash ? `https://mainnet.num.network/tx/${txHash}` : '')

                    doc.setFont('Helvetica', 'bold')
                    doc.setFontSize(13)
                    doc.text(`${idx+1}. ${title}`, margin, y)
                    y += 6
                    doc.setFont('Helvetica', 'normal')
                    doc.setFontSize(10)

                    const details: string[] = []
                    details.push(`• Time: ${ts}`)
                    if (author) details.push(`• Author: ${author}`)
                    if (summary) details.push(`• Summary: ${summary}`)
                    if (txHash) details.push(`• Transaction ID: ${txHash}`)
                    if (explorerURL) details.push(`• Explorer: ${explorerURL}`)

                    const lines = doc.splitTextToSize(details.join('\n'), 182)
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

          {/* Works from Supabase - cards like search-job */}
          <div className="w-full">
            {worksLoading && <div className="text-white/80">Loading works…</div>}
            {worksError && <div className="text-red-300">{worksError}</div>}
            {!worksLoading && works.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {works.map((w:any, i:number) => {
                  const createdAt = (w.uploaded_at ? new Date(w.uploaded_at) : null)
                  const title = w.headline || 'Untitled'
                  const subtitle = w.caption || ''
                  return (
                    <article key={i} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden shadow-md">
                      <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-white/10 to-white/0">
                        {w.asset_file ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={w.asset_file} alt={title} className="absolute inset-0 w-full h-full object-cover" />
                        ) : null}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      </div>
                      <div className="p-4 text-white">
                        <h3 className="text-lg font-bold mb-1 truncate">{title}</h3>
                        {createdAt && (
                          <div className="text-xs text-white/70 mb-1">{createdAt.toLocaleString()}</div>
                        )}
                        <p className="text-sm text-white/85 line-clamp-2 min-h-[2.5rem]">{subtitle}</p>
                        <div className="pt-4 flex justify-end">
                          <button
                            type="button"
                            onClick={() => { setNid(w.nid); fetchCommitsByNid(w.nid) }}
                            className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-[background,border-color] hover:border-white/50 hover:bg-white/20"
                          >
                            get receipt
                          </button>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>

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
                    const author = c.author || c.owner || c.identity?.author || c.identity?.name || c.identity || c.account || ''
                    const txHash = c.transaction?.hash || c.txHash || c.hash || ''
                    const explorerURL = c.explorerURL || (txHash ? `https://mainnet.num.network/tx/${txHash}` : '')

                    doc.setFont('Helvetica', 'bold')
                    doc.setFontSize(13)
                    doc.text(`${idx+1}. ${title}`, margin, y)
                    y += 6
                    doc.setFont('Helvetica', 'normal')
                    doc.setFontSize(10)

                    const details: string[] = []
                    details.push(`• Time: ${ts}`)
                    if (author) details.push(`• Author: ${author}`)
                    if (summary) details.push(`• Summary: ${summary}`)
                    if (txHash) details.push(`• Transaction ID: ${txHash}`)
                    if (explorerURL) details.push(`• Explorer: ${explorerURL}`)

                    const lines = doc.splitTextToSize(details.join('\n'), 182)
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


