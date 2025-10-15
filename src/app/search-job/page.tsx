'use client'
import Silk from "@/components/Silk";
import { useEffect, useState } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase'
import { Spinner } from '@/components/ui/spinner'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'

export default function SearchJobPage(){
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [activeNid, setActiveNid] = useState<string | null>(null)
  const [commitFile, setCommitFile] = useState<File | null>(null)
  const [commitMsg, setCommitMsg] = useState('Work in progress')
  const [submitting, setSubmitting] = useState(false)
  const [commitResponse, setCommitResponse] = useState<any>(null)

  useEffect(() => {
    const run = async () => {
      try{
        setLoading(true)
        const supabase = getSupabaseBrowser()
        const { data, error } = await supabase
          .from('assets')
          .select('nid, caption, headline, asset_file, asset_file_name, asset_file_mime_type')
          .order('created_at', { ascending: false })
          .limit(30)
        if (error) throw error
        const mapped = (data || []).map((row:any) => ({
          nid: row.nid,
          title: row.headline || 'Untitled',
          subtitle: row.caption || '',
          image: row.asset_file || null,
        }))
        setItems(mapped)
      }catch(e:any){
        setError(e?.message || 'Failed to load jobs')
      }finally{
        setLoading(false)
      }
    }
    run()
  }, [])

  return(
    <main className="relative min-h-[100svh] w-full overflow-hidden font-sans text-white">
      <Toaster position="top-center" richColors />
      <div className="fixed inset-0 -z-10">
        <Silk speed={5} scale={1} color="#4F39E3" noiseIntensity={1.2} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(255,255,255,0.1),transparent_40%),radial-gradient(circle_at_50%_120%,rgba(0,0,0,0.35),transparent_50%)]" />
      </div>

      <section className="relative min-h-screen px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <header className="mb-10">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight">search job</h1>
            <p className="text-white/90 text-lg sm:text-xl mt-2">Find and take the tasks you want to work on.</p>
          </header>

          {error && (
            <div className="text-red-300">{error}</div>
          )}
          {loading ? (
            <div className="text-white/80">Loading…</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((card) => (
                <article key={card.nid} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden shadow-md">
                  <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-white/10 to-white/0">
                    {card.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={card.image} alt={card.title} className="absolute inset-0 w-full h-full object-cover" />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                  <div className="p-4 text-white">
                    <h3 className="text-lg font-bold mb-1 truncate">{card.title}</h3>
                    <p className="text-sm text-white/85 line-clamp-2 min-h-[2.5rem]">{card.subtitle}</p>
                    <div className="pt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => { setActiveNid(card.nid); setModalOpen(true); setCommitFile(null); setCommitMsg('Work in progress'); setCommitResponse(null) }}
                        className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-[background,border-color] hover:border-white/50 hover:bg-white/20"
                      >
                        take job
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={()=>!submitting && setModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-white space-y-4">
            <h3 className="text-xl font-bold">Commit work</h3>
            <div className="space-y-2">
              <label className="block text-sm text-white/80">upload image</label>
              <input type="file" accept="image/*" onChange={e=>setCommitFile(e.target.files?.[0]||null)} disabled={submitting} className="w-full rounded-md bg-white/10 border border-white/20 p-2" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-white/80">commit message</label>
              <input value={commitMsg} onChange={e=>setCommitMsg(e.target.value)} disabled={submitting} className="w-full rounded-md bg-white/10 border border-white/20 p-2" placeholder="Describe your update" />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={()=>setModalOpen(false)} disabled={submitting} className="px-4 py-2 rounded-md border border-white/20">Cancel</button>
              <button
                type="button"
                disabled={submitting || !commitFile || !activeNid}
                onClick={async()=>{
                  if (!commitFile || !activeNid) return
                  setSubmitting(true)
                  setCommitResponse(null)
                  toast.loading('Submitting commit…')
                  try{
                    const ab = await commitFile.arrayBuffer()
                    const digest = await crypto.subtle.digest('SHA-256', ab)
                    const sha = Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('')
                    const ts = (Date.now()/1000)|0
                    const res = await fetch('/api/commit-asset', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        encodingFormat: commitFile.type || 'image/jpeg',
                        assetCid: activeNid,
                        assetTimestampCreated: ts, // ideally: original registered timestamp stored in DB
                        assetCreator: 'Tasket User',
                        assetSha256: sha,
                        commitMessage: commitMsg,
                        abstract: commitMsg,
                      })
                    })
                    const json = await res.json()
                    console.log('Commit response:', json)
                    setCommitResponse(json)
                    toast.dismiss()
                    if (!res.ok) throw new Error(json?.error || 'Commit failed')
                    toast.success('Commit submitted', {
                      action: {
                        label: 'Explorer',
                        onClick: ()=> window.open(json?.explorer || `https://verify.numbersprotocol.io/asset-profile/${activeNid}`, '_blank')
                      }
                    })
                  }catch(e:any){
                    toast.dismiss()
                    toast.error(e?.message || 'Commit failed')
                  }finally{
                    setSubmitting(false)
                  }
                }}
                className="px-4 py-2 rounded-md bg-white text-black font-semibold disabled:opacity-60 flex items-center gap-2"
              >
                {submitting && <Spinner className="text-black" />}
                {submitting ? 'Committing…' : 'Commit'}
              </button>
            </div>
            {commitResponse && (
              <pre className="whitespace-pre-wrap break-words text-xs bg-black/40 border border-white/10 rounded-xl p-3">{JSON.stringify(commitResponse, null, 2)}</pre>
            )}
          </div>
        </div>
      )}
    </main>
  )
}


