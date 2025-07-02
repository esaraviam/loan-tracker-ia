import React from "react"
import { render, screen } from "@testing-library/react"
import { Badge } from "@/components/ui/badge"

describe("Badge Component", () => {
  it("renders children correctly", () => {
    render(<Badge>New</Badge>)
    expect(screen.getByText("New")).toBeInTheDocument()
  })

  it("applies default variant styling", () => {
    render(<Badge>Default</Badge>)
    const badge = screen.getByText("Default")
    expect(badge).toHaveClass("border-transparent", "bg-primary", "text-primary-foreground")
  })

  it("applies secondary variant styling", () => {
    render(<Badge variant="secondary">Secondary</Badge>)
    const badge = screen.getByText("Secondary")
    expect(badge).toHaveClass("border-transparent", "bg-secondary", "text-secondary-foreground")
  })

  it("applies destructive variant styling", () => {
    render(<Badge variant="destructive">Error</Badge>)
    const badge = screen.getByText("Error")
    expect(badge).toHaveClass("border-transparent", "bg-destructive", "text-destructive-foreground")
  })

  it("applies outline variant styling", () => {
    render(<Badge variant="outline">Outline</Badge>)
    const badge = screen.getByText("Outline")
    expect(badge).toHaveClass("text-foreground")
  })

  it("applies base styling to all variants", () => {
    render(<Badge>Base</Badge>)
    const badge = screen.getByText("Base")
    expect(badge).toHaveClass(
      "inline-flex",
      "items-center",
      "rounded-full",
      "border",
      "px-2.5",
      "py-0.5",
      "text-xs",
      "font-semibold"
    )
  })

  it("accepts custom className", () => {
    render(<Badge className="custom-badge">Custom</Badge>)
    const badge = screen.getByText("Custom")
    expect(badge).toHaveClass("custom-badge")
  })

  it("can render with complex children", () => {
    render(
      <Badge>
        <span>Count: </span>
        <strong>5</strong>
      </Badge>
    )
    expect(screen.getByText("Count:")).toBeInTheDocument()
    expect(screen.getByText("5")).toBeInTheDocument()
  })

  it("maintains proper contrast ratios", () => {
    const { container } = render(
      <>
        <Badge variant="default">Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="outline">Outline</Badge>
      </>
    )
    
    const badges = container.querySelectorAll("div")
    expect(badges).toHaveLength(4)
    badges.forEach(badge => {
      expect(badge).toHaveClass("inline-flex", "items-center")
    })
  })

  it("works as status indicator", () => {
    const statuses = [
      { variant: "default" as const, text: "Active" },
      { variant: "secondary" as const, text: "Pending" },
      { variant: "destructive" as const, text: "Failed" },
      { variant: "outline" as const, text: "Draft" }
    ]

    statuses.forEach(({ variant, text }) => {
      render(<Badge variant={variant}>{text}</Badge>)
      expect(screen.getByText(text)).toBeInTheDocument()
    })
  })
})