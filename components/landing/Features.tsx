import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, BrainCircuit, Trophy, Zap, Shield, Globe } from 'lucide-react'

const features = [
  {
    title: "Advanced Analytics",
    description: "Deep dive into match statistics with comprehensive data visualization tools.",
    icon: BarChart3,
    className: "md:col-span-2",
  },
  {
    title: "Pattern Recognition",
    description: "AI-powered algorithms to identify winning patterns and trends.",
    icon: BrainCircuit,
    className: "",
  },
  {
    title: "League Management",
    description: "Complete control over seasons, teams, and match schedules.",
    icon: Trophy,
    className: "",
  },
  {
    title: "Real-time Updates",
    description: "Instant synchronization of match results and standings.",
    icon: Zap,
    className: "md:col-span-2",
  },
  {
    title: "Secure Data",
    description: "Enterprise-grade security for your sensitive league data.",
    icon: Shield,
    className: "",
  },
  {
    title: "Global Coverage",
    description: "Support for multiple leagues and international competitions.",
    icon: Globe,
    className: "",
  },
]

export function Features() {
  return (
    <section id="features" className="py-20 bg-secondary/30">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Everything you need to manage your league
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful tools designed for league managers, analysts, and enthusiasts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className={`bg-background/50 backdrop-blur-sm border-border/50 hover:border-brand/50 transition-colors ${feature.className}`}>
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-brand/10 flex items-center justify-center mb-4 text-brand">
                  <feature.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
