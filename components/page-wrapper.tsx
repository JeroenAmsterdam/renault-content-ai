export function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-300 via-pink-300 via-purple-300 to-yellow-200 animate-gradient-slow"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-pink-400/30 via-purple-400/30 to-orange-300/30 animate-gradient-reverse blur-3xl"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-300/20 via-orange-400/20 to-pink-400/20 animate-gradient-slow" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
