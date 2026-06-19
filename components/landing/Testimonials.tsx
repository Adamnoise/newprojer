import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

const testimonials = [
  {
    name: "Alex Morgan",
    role: "League Manager",
    content: "WinMix has completely transformed how we manage our regional league. The automated standings and form tracking save us hours every week.",
    initials: "AM",
  },
  {
    name: "David Silva",
    role: "Sports Analyst",
    content: "The pattern recognition features are incredible. I can spot trends that were previously invisible in the raw data.",
    initials: "DS",
  },
  {
    name: "Sarah Thompson",
    role: "Club Director",
    content: "Finally, a tool that gives us professional-grade analytics at an affordable price point. Highly recommended for any serious organization.",
    initials: "ST",
  },
]

export function Testimonials() {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Trusted by Professionals
          </h2>
          <p className="text-lg text-muted-foreground">
            See what league managers and analysts are saying about WinMix.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-background/50 backdrop-blur-sm border-border/50">
              <CardHeader className="flex flex-row items-center gap-4 pb-4">
                <Avatar>
                  <AvatarImage src={`/generic-placeholder-graphic.png?height=40&width=40`} />
                  <AvatarFallback>{testimonial.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium leading-none">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground italic">
                  "{testimonial.content}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
