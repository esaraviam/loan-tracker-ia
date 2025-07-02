import Link from "next/link"
import { Package2 } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthButtons } from "@/components/auth/auth-buttons"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Package2 className="h-6 w-6" />
          <span className="text-xl font-bold">Loan Tracker</span>
        </Link>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <AuthButtons />
        </div>
      </div>
    </header>
  )
}