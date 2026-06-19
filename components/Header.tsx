import { memo } from "react"
import { Trophy, BarChart3, ChevronDown, Settings, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  currentSeason?: string
  className?: string
}

const Logo = memo(() => (
  <div className="flex items-center gap-3 group">
    <Trophy
      size={28}
      className="text-blue-500 transition-transform duration-300 group-hover:scale-110"
      aria-hidden="true"
    />
    <div>
      <h1 className="text-xl md:text-2xl font-bold text-white">Soccer Championship Analysis</h1>
      <p className="text-xs text-gray-400 hidden md:block">Professional Soccer Statistics & Analysis</p>
    </div>
  </div>
))

Logo.displayName = "Logo"

const SeasonIndicator = memo(({ season }: { season: string }) => (
  <div className="flex items-center gap-3">
    <Button
      variant="outline"
      className="bg-white/5 border-white/10 text-white hover:bg-white/10 flex items-center gap-2"
    >
      <BarChart3 size={16} className="text-blue-500" aria-hidden="true" />
      <span className="font-medium">Season {season}</span>
      <ChevronDown size={14} className="text-gray-400" aria-hidden="true" />
    </Button>
  </div>
))

SeasonIndicator.displayName = "SeasonIndicator"

export const Header = memo(({ currentSeason = "2023-2024", className = "" }: HeaderProps) => {
  return (
    <header
      className={`
        bg-[#0a0f14]/90 backdrop-blur-md border-b border-white/5 
        text-white shadow-lg sticky top-0 z-50 
        transition-all duration-300 ease-in-out
        ${className}
      `}
    >
      <nav className="container mx-auto px-4 md:px-6 py-4" role="navigation" aria-label="Main navigation">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo />
          <div className="flex items-center gap-3">
            <SeasonIndicator season={currentSeason} />
            <Button variant="outline" size="icon" className="w-9 h-9 bg-white/5 border-white/10 hover:bg-white/10">
              <Bell className="h-4 w-4 text-gray-300" />
            </Button>
            <Button variant="outline" size="icon" className="w-9 h-9 bg-white/5 border-white/10 hover:bg-white/10">
              <Settings className="h-4 w-4 text-gray-300" />
            </Button>
          </div>
        </div>
      </nav>
    </header>
  )
})

Header.displayName = "Header"

