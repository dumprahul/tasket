'use client'
import Silk from "@/components/Silk";

export default function GetReceiptPage(){
  return(
    <main className="relative min-h-[100svh] w-full overflow-hidden font-sans text-white">
      <div className="fixed inset-0 -z-10">
        <Silk speed={5} scale={1} color="#4F39E3" noiseIntensity={1.2} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(255,255,255,0.1),transparent_40%),radial-gradient(circle_at_50%_120%,rgba(0,0,0,0.35),transparent_50%)]" />
      </div>

      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-3xl text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">get receipt</h1>
          <p className="text-white/90 text-lg sm:text-xl">Retrieve on-chain proof of your completed task.</p>
        </div>
      </div>
    </main>
  )
}


