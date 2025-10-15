'use client'
import Silk from "@/components/Silk";
import { useEffect, useState } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase'

export default function SearchJobPage(){
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
                        onClick={() => {
                          console.log('take job clicked for nid:', card.nid)
                          window.open(`https://verify.numbersprotocol.io/asset-profile/${card.nid}`, '_blank')
                        }}
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
    </main>
  )
}


