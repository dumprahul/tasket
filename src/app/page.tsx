import Silk from "@/components/Silk";


export default function Home(){

  return(
    <main className="relative min-h-[100svh] w-full overflow-hidden font-sans">
      {/* Navbar */}

      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <Silk speed={5} scale={1} color="#4F39E3" noiseIntensity={1.2} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(255,255,255,0.1),transparent_40%),radial-gradient(circle_at_50%_120%,rgba(0,0,0,0.35),transparent_50%)]" />
      </div>

      {/* Content */}
      <section className="absolute inset-0 flex items-center justify-center px-6 text-center text-white">
        <div className="flex flex-col items-center gap-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-black tracking-tight sm:text-7xl md:text-8xl lg:text-9xl">tasket.</h1>
            <p className="mx-auto max-w-3xl text-balance text-xl font-medium text-white/90 sm:text-2xl md:text-3xl">every task gets it ticket.</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#get-started"
              className="rounded-full bg-white px-8 py-4 text-lg font-semibold text-black shadow-[0_0_0_1px_rgba(255,255,255,0.2)] transition-colors hover:bg-white/90"
            >
              get started
            </a>
            <a
              href="#learn-more"
              className="rounded-full border border-white/30 bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-[background,opacity,border-color] hover:border-white/40 hover:bg-white/15"
            >
              learn more  
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}