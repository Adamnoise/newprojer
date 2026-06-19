import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "Can I import data from Excel or CSV?",
    answer: "Yes! WinMix supports direct CSV imports. Simply format your data according to our template, and our system will automatically parse and analyze your match results.",
  },
  {
    question: "Is there a limit to how many leagues I can manage?",
    answer: "The Starter plan supports up to 2 leagues. The Pro plan offers unlimited league management, perfect for regional associations or multi-league organizations.",
  },
  {
    question: "How does the pattern recognition work?",
    answer: "Our algorithms analyze historical match data to identify recurring trends, such as home team advantage, comeback frequency, and scoring patterns, providing you with actionable insights.",
  },
  {
    question: "Can I export the reports?",
    answer: "Absolutely. You can export standings, form tables, and statistical analysis reports in PDF or CSV formats for offline use or presentation.",
  },
  {
    question: "Do you offer support for custom rules?",
    answer: "Yes, our system is flexible enough to handle various point systems and tie-breaker rules. For complex custom requirements, our Enterprise plan offers tailored configuration.",
  },
]

export function FAQ() {
  return (
    <section id="faq" className="py-20 bg-secondary/30">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about WinMix.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-lg font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
