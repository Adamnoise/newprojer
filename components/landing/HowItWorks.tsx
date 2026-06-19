import { Upload, BarChart, Trophy } from 'lucide-react'

const steps = [
  {
    title: "Import Data",
    description: "Upload your match data via CSV or connect directly to your league database.",
    icon: Upload,
  },
  {
    title: "Analyze Patterns",
    description: "Our system automatically processes the data to find trends and insights.",
    icon: BarChart,
  },
  {
    title: "Optimize Strategy",
    description: "Use the insights to make better decisions and improve league performance.",
    icon: Trophy,
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            How WinMix Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Get started in minutes with our simple three-step process.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -z-10" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center space-y-6 bg-background md:bg-transparent p-6 md:p-0 rounded-xl border md:border-none">
                <div className="h-24 w-24 rounded-full bg-background border-4 border-secondary flex items-center justify-center shadow-sm relative z-10">
                  <div className="h-16 w-16 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                    <step.icon className="h-8 w-8" />
                  </div>
                  <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-brand text-brand-foreground flex items-center justify-center font-bold text-sm border-4 border-background">
                    {index + 1}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{step.title}</h3>
                  <p className="text-muted-foreground text-balance">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
