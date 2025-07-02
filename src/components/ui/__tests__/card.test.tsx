import React from "react"
import { render, screen } from "@testing-library/react"
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"

describe("Card Components", () => {
  describe("Card", () => {
    it("renders children correctly", () => {
      render(
        <Card>
          <div>Card content</div>
        </Card>
      )
      expect(screen.getByText("Card content")).toBeInTheDocument()
    })

    it("applies custom className", () => {
      render(<Card className="custom-card">Content</Card>)
      const card = screen.getByText("Content").parentElement
      expect(card).toHaveClass("custom-card")
    })

    it("forwards ref correctly", () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<Card ref={ref}>Card with ref</Card>)
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
      expect(ref.current?.textContent).toBe("Card with ref")
    })

    it("applies default styling", () => {
      render(<Card>Styled card</Card>)
      const card = screen.getByText("Styled card").parentElement
      expect(card).toHaveClass("rounded-lg", "border", "bg-card", "text-card-foreground")
    })
  })

  describe("CardHeader", () => {
    it("renders children correctly", () => {
      render(
        <CardHeader>
          <div>Header content</div>
        </CardHeader>
      )
      expect(screen.getByText("Header content")).toBeInTheDocument()
    })

    it("applies default spacing", () => {
      render(<CardHeader>Header</CardHeader>)
      const header = screen.getByText("Header").parentElement
      expect(header).toHaveClass("flex", "flex-col", "space-y-1.5", "p-6")
    })

    it("accepts custom className", () => {
      render(<CardHeader className="custom-header">Header</CardHeader>)
      const header = screen.getByText("Header").parentElement
      expect(header).toHaveClass("custom-header")
    })
  })

  describe("CardTitle", () => {
    it("renders as h3 by default", () => {
      render(<CardTitle>Title text</CardTitle>)
      const title = screen.getByText("Title text")
      expect(title.tagName).toBe("H3")
    })

    it("applies title styling", () => {
      render(<CardTitle>Styled title</CardTitle>)
      const title = screen.getByText("Styled title")
      expect(title).toHaveClass("text-2xl", "font-semibold", "leading-none", "tracking-tight")
    })

    it("accepts custom className", () => {
      render(<CardTitle className="custom-title">Title</CardTitle>)
      const title = screen.getByText("Title")
      expect(title).toHaveClass("custom-title")
    })
  })

  describe("CardDescription", () => {
    it("renders as p tag", () => {
      render(<CardDescription>Description text</CardDescription>)
      const description = screen.getByText("Description text")
      expect(description.tagName).toBe("P")
    })

    it("applies description styling", () => {
      render(<CardDescription>Styled description</CardDescription>)
      const description = screen.getByText("Styled description")
      expect(description).toHaveClass("text-sm", "text-muted-foreground")
    })
  })

  describe("CardContent", () => {
    it("renders children correctly", () => {
      render(
        <CardContent>
          <p>Content paragraph</p>
        </CardContent>
      )
      expect(screen.getByText("Content paragraph")).toBeInTheDocument()
    })

    it("applies default padding", () => {
      render(<CardContent>Content</CardContent>)
      const content = screen.getByText("Content").parentElement
      expect(content).toHaveClass("p-6", "pt-0")
    })
  })

  describe("CardFooter", () => {
    it("renders children correctly", () => {
      render(
        <CardFooter>
          <button>Footer button</button>
        </CardFooter>
      )
      expect(screen.getByText("Footer button")).toBeInTheDocument()
    })

    it("applies flex layout by default", () => {
      render(<CardFooter>Footer</CardFooter>)
      const footer = screen.getByText("Footer").parentElement
      expect(footer).toHaveClass("flex", "items-center", "p-6", "pt-0")
    })
  })

  describe("Complete Card", () => {
    it("renders a complete card with all sections", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
            <CardDescription>This is a test card</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card body content</p>
          </CardContent>
          <CardFooter>
            <button>Action</button>
          </CardFooter>
        </Card>
      )

      expect(screen.getByText("Test Card")).toBeInTheDocument()
      expect(screen.getByText("This is a test card")).toBeInTheDocument()
      expect(screen.getByText("Card body content")).toBeInTheDocument()
      expect(screen.getByText("Action")).toBeInTheDocument()
    })

    it("card sections maintain proper hierarchy", () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      )

      const card = container.firstChild
      const header = card?.firstChild
      const content = card?.lastChild

      expect(header).toHaveClass("flex", "flex-col", "space-y-1.5", "p-6")
      expect(content).toHaveClass("p-6", "pt-0")
    })
  })
})