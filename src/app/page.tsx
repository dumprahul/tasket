'use client'
import Silk from "@/components/Silk";
import Dock from "@/components/Dock";
import ShinyText from "@/components/ShinyText";
import CardSwap, { Card } from "@/components/CardSwap";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { VscHome, VscArchive, VscAccount, VscSettingsGear } from "react-icons/vsc";

export default function Home(){
  const dockItems = [
    { icon: <VscHome size={18} />, label: 'Home', onClick: () => alert('Home!') },
    { icon: <VscArchive size={18} />, label: 'Archive', onClick: () => alert('Archive!') },
    { icon: <VscAccount size={18} />, label: 'Profile', onClick: () => alert('Profile!') },
    { icon: <VscSettingsGear size={18} />, label: 'Settings', onClick: () => alert('Settings!') },
  ];

  return(
    <main className="relative min-h-[200svh] w-full overflow-hidden font-sans">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <Silk speed={5} scale={1} color="#4F39E3" noiseIntensity={1.2} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(255,255,255,0.1),transparent_40%),radial-gradient(circle_at_50%_120%,rgba(0,0,0,0.35),transparent_50%)]" />
      </div>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center px-6 text-center text-white">
        <div className="flex flex-col items-center gap-8">
          <div className="flex flex-col items-center space-y-6">
            <ShimmerButton
              shimmerColor="#ffffff"
              shimmerSize="0.02em"
              shimmerDuration="3s"
              borderRadius="50px"
              background="rgba(255, 255, 255, 0.1)"
              className="backdrop-blur-md border-white/20 shadow-lg"
            >
              powered by Numbers
            </ShimmerButton>
            
            <h1 className="text-5xl font-black tracking-tight sm:text-7xl md:text-8xl lg:text-9xl">tasket.</h1>
            <p className="mx-auto max-w-3xl text-balance text-xl font-medium text-white/90 sm:text-2xl md:text-3xl">every task gets it ticket.</p>
          </div>

          <div className="flex flex-col items-center gap-12">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Dock 
                items={dockItems}
                panelHeight={68}
                baseItemSize={50}
                magnification={70}
                className="backdrop-blur-md bg-white/15 border-white/30 shadow-xl relative !absolute !bottom-auto !top-auto !left-auto !transform-none"
              />
            </div>
            
            <div className="flex justify-center">
              <ShinyText 
                text="scroll down to see how tasket works" 
                speed={3}
                className="text-lg font-medium"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CardSwap Section */}
      <section className="relative h-screen flex items-center justify-center px-6">
        <div style={{ height: '600px', position: 'relative' }}>
          <CardSwap
            cardDistance={60}
            verticalDistance={70}
            delay={5000}
            pauseOnHover={false}
          >
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
              <h3 className="text-xl font-bold mb-2 text-white">Task Management</h3>
              <p className="text-white/80">Organize your tasks efficiently</p>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
              <h3 className="text-xl font-bold mb-2 text-white">Team Collaboration</h3>
              <p className="text-white/80">Work together seamlessly</p>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
              <h3 className="text-xl font-bold mb-2 text-white">Analytics & Insights</h3>
              <p className="text-white/80">Track your productivity</p>
            </Card>
          </CardSwap>
        </div>
      </section>
    </main>
  )
}