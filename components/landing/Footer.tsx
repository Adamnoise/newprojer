import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Trophy, Twitter, Facebook, Instagram, Linkedin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container px-4 mx-auto pt-20 pb-12">
        {/* CTA Section */}
        <div className="bg-brand rounded-3xl p-8 md:p-16 text-center mb-20 relative overflow-hidden">
          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-foreground">
              Ready to elevate your league?
            </h2>
            <p className="text-brand-foreground/80 text-lg">
              Join thousands of managers who trust WinMix for their league analysis.
            </p>
            <Button size="lg" variant="secondary" className="h-12 px-8 text-base">
              Get Started for Free
            </Button>
          </div>
          
          {/* Decorative Circles */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-brand-foreground">
                <Trophy className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight">WinMix.hu</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Professional soccer statistics and league management platform for the modern era.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-brand transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-brand transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-brand transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-brand transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground">Features</Link></li>
              <li><Link href="#" className="hover:text-foreground">Pricing</Link></li>
              <li><Link href="#" className="hover:text-foreground">API</Link></li>
              <li><Link href="#" className="hover:text-foreground">Integrations</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground">Documentation</Link></li>
              <li><Link href="#" className="hover:text-foreground">Blog</Link></li>
              <li><Link href="#" className="hover:text-foreground">Community</Link></li>
              <li><Link href="#" className="hover:text-foreground">Help Center</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground">About</Link></li>
              <li><Link href="#" className="hover:text-foreground">Careers</Link></li>
              <li><Link href="#" className="hover:text-foreground">Legal</Link></li>
              <li><Link href="#" className="hover:text-foreground">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} WinMix.hu. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
