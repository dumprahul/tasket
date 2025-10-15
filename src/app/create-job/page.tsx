'use client'
import Silk from "@/components/Silk";
import { useState } from 'react'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText, InputGroupButton } from '@/components/ui/input-group'
import { Spinner } from '@/components/ui/spinner'

export default function CreateJobPage(){
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [headline, setHeadline] = useState('')
  const [creatorName, setCreatorName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [success, setSuccess] = useState(false)

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
      if (creatorName) fd.append('creatorName', creatorName)
      const res = await fetch('/api/register-asset', { method: 'POST', body: fd })
      const json = await res.json()
      if(!res.ok) throw new Error(json?.error || 'Failed')
      setResult(json)
      setSuccess(true)
    }catch(err:any){
      setResult({ error: err.message })
      setSuccess(false)
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
        <div className="w-full max-w-2xl space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight">create job</h1>
            <p className="text-white/90 text-lg sm:text-xl">Register an asset to get a Nid</p>
          </div>
          <form onSubmit={onSubmit} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 space-y-6">
            <div className="space-y-2">
              <label className="block text-sm text-white/80">creator name</label>
              <InputGroup>
                <InputGroupAddon>
                  <InputGroupText>👤</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput placeholder="e.g., Priya" value={creatorName} onChange={e=>setCreatorName(e.target.value)} />
              </InputGroup>
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-white/80">headline</label>
              <InputGroup>
                <InputGroupAddon>
                  <InputGroupText>🏷️</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput placeholder="Short title (≤25 chars)" value={headline} onChange={e=>setHeadline(e.target.value)} />
              </InputGroup>
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-white/80">caption</label>
              <InputGroup>
                <InputGroupAddon>
                  <InputGroupText>✍️</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput placeholder="Brief description" value={caption} onChange={e=>setCaption(e.target.value)} />
              </InputGroup>
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-white/80">asset image</label>
              <label className="group flex w-full cursor-pointer items-center justify-center rounded-xl border border-dashed border-white/30 bg-white/5 p-6 text-center transition hover:bg-white/10">
                <div>
                  <div className="text-white/90 font-medium">{file ? file.name : 'Click to upload or drop an image here'}</div>
                  <div className="text-white/60 text-sm mt-1">PNG, JPG up to your plan limit</div>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={e=>setFile(e.target.files?.[0]||null)} required />
              </label>
            </div>

            <InputGroup className="h-auto">
              <InputGroupAddon align="block-end" className="w-full">
                <InputGroupButton type="submit" variant="secondary" className="w-full bg-white text-black font-semibold" disabled={loading || !file}>
                  {loading && <Spinner className="mr-2" />}
                  {loading ? 'registering asset…' : 'register asset'}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </form>

          {loading && (
            <div className="flex items-center justify-center gap-2 text-white/90"><Spinner /> <span>processing your registration…</span></div>
          )}
          {success && result && !result.error && (
            <div className="flex items-center justify-center gap-2 text-emerald-300"><Spinner className="text-emerald-300" /> <span>asset registered successfully</span></div>
          )}
          {result && (
            <pre className="whitespace-pre-wrap break-words text-xs bg-black/40 border border-white/10 rounded-xl p-4">{JSON.stringify(result, null, 2)}</pre>
          )}
        </div>
      </div>
    </main>
  )
}


