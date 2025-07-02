import React from "react"
import { render, screen } from "@testing-library/react"
import { Button } from "@/components/ui/button"

describe("Button Component", () => {
  it("renders children correctly", () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText("Click me")).toBeInTheDocument()
  })

  it("applies default variant classes", () => {
    render(<Button>Default Button</Button>)
    const button = screen.getByRole("button")
    expect(button).toHaveClass("bg-primary", "text-primary-foreground")
  })

  it("applies destructive variant classes", () => {
    render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByRole("button")
    expect(button).toHaveClass("bg-destructive", "text-destructive-foreground")
  })

  it("applies outline variant classes", () => {
    render(<Button variant="outline">Outline</Button>)
    const button = screen.getByRole("button")
    expect(button).toHaveClass("border", "border-input")
  })

  it("applies size classes correctly", () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    let button = screen.getByRole("button")
    expect(button).toHaveClass("h-9", "px-3")

    rerender(<Button size="lg">Large</Button>)
    button = screen.getByRole("button")
    expect(button).toHaveClass("h-11", "px-8")

    rerender(<Button size="icon">Icon</Button>)
    button = screen.getByRole("button")
    expect(button).toHaveClass("h-10", "w-10")
  })

  it("renders as child when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    )
    
    const link = screen.getByRole("link")
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute("href", "/test")
  })

  it("handles disabled state", () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole("button")
    expect(button).toBeDisabled()
  })

  it("merges custom className", () => {
    render(<Button className="custom-class">Custom</Button>)
    const button = screen.getByRole("button")
    expect(button).toHaveClass("custom-class")
  })
})