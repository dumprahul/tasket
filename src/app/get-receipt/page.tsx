'use client'
import Silk from "@/components/Silk";
import { useState } from 'react'

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
              {commits.map((c:any, idx:number) => (
                <article key={idx} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4">
                  <div className="text-sm text-white/70">{new Date((c.timestampCreated || c.timestamp || 0)*1000).toLocaleString()}</div>
                  <h3 className="text-lg font-bold">{c.commitMessage || c.actionName || 'Commit'}</h3>
                  <div className="text-white/80 text-sm break-words">{c.abstract || c.custom?.payloadCid || ''}</div>
                  {c.transaction && c.transaction.hash && (
                    <a className="text-sky-300 underline text-sm" href={`https://mainnet.num.network/tx/${c.transaction.hash}`} target="_blank" rel="noreferrer">View Tx</a>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}


