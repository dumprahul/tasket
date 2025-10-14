'use client'
import Silk from "@/components/Silk";
import { useState } from 'react'

export default function CreateJobPage(){
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [headline, setHeadline] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    setResult(null)
    try{
      const fd = new FormData()
      fd.append('asset_file', file)
      if (caption) fd.append('caption', caption)
      if (headline) fd.append('headline', headline)
      const res = await fetch('/api/register-asset', { method: 'POST', body: fd })
      const json = await res.json()
      if(!res.ok) throw new Error(json?.error || 'Failed')
      setResult(json)
    }catch(err:any){
      setResult({ error: err.message })
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

      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-xl space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight">create job</h1>
            <p className="text-white/90 text-lg sm:text-xl">Register an asset to get a Nid</p>
          </div>
          <form onSubmit={onSubmit} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 space-y-4">
            <div className="text-left space-y-2">
              <label className="block text-sm text-white/80">asset image</label>
              <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0]||null)} className="w-full rounded-md bg-white/10 border border-white/20 p-2" required />
            </div>
            <div className="text-left space-y-2">
              <label className="block text-sm text-white/80">headline</label>
              <input value={headline} onChange={e=>setHeadline(e.target.value)} placeholder="Short title (≤25 chars)" className="w-full rounded-md bg-white/10 border border-white/20 p-2" />
            </div>
            <div className="text-left space-y-2">
              <label className="block text-sm text-white/80">caption</label>
              <input value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Brief description" className="w-full rounded-md bg-white/10 border border-white/20 p-2" />
            </div>
            <button disabled={loading || !file} className="w-full rounded-md bg-white text-black font-semibold py-3 disabled:opacity-60">
              {loading ? 'registering…' : 'register asset'}
            </button>
          </form>
          {result && (
            <pre className="whitespace-pre-wrap break-words text-xs bg-black/40 border border-white/10 rounded-xl p-4">{JSON.stringify(result, null, 2)}</pre>
          )}
        </div>
      </div>
    </main>
  )
}


