import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { Input } from "@/components/ui/input"

describe("Input Component", () => {
  it("renders correctly", () => {
    render(<Input placeholder="Enter text" />)
    const input = screen.getByPlaceholderText("Enter text")
    expect(input).toBeInTheDocument()
  })

  it("handles value changes", () => {
    const handleChange = jest.fn()
    render(<Input onChange={handleChange} placeholder="Type here" />)
    
    const input = screen.getByPlaceholderText("Type here")
    fireEvent.change(input, { target: { value: "test value" } })
    
    expect(handleChange).toHaveBeenCalled()
    expect(input).toHaveValue("test value")
  })

  it("can be disabled", () => {
    render(<Input disabled placeholder="Disabled input" />)
    const input = screen.getByPlaceholderText("Disabled input")
    expect(input).toBeDisabled()
  })

  it("supports different types", () => {
    const { rerender } = render(<Input type="email" placeholder="Email" />)
    let input = screen.getByPlaceholderText("Email")
    expect(input).toHaveAttribute("type", "email")

    rerender(<Input type="password" placeholder="Password" />)
    input = screen.getByPlaceholderText("Password")
    expect(input).toHaveAttribute("type", "password")

    rerender(<Input type="number" placeholder="Number" />)
    input = screen.getByPlaceholderText("Number")
    expect(input).toHaveAttribute("type", "number")
  })

  it("applies custom className", () => {
    render(<Input className="custom-input" placeholder="Custom" />)
    const input = screen.getByPlaceholderText("Custom")
    expect(input).toHaveClass("custom-input")
  })

  it("forwards ref correctly", () => {
    const ref = React.createRef<HTMLInputElement>()
    render(<Input ref={ref} placeholder="Ref input" />)
    
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
    expect(ref.current?.placeholder).toBe("Ref input")
  })

  it("handles focus and blur events", () => {
    const handleFocus = jest.fn()
    const handleBlur = jest.fn()
    
    render(
      <Input 
        onFocus={handleFocus} 
        onBlur={handleBlur} 
        placeholder="Focus test" 
      />
    )
    
    const input = screen.getByPlaceholderText("Focus test")
    
    fireEvent.focus(input)
    expect(handleFocus).toHaveBeenCalled()
    
    fireEvent.blur(input)
    expect(handleBlur).toHaveBeenCalled()
  })

  it("supports maxLength attribute", () => {
    render(<Input maxLength={10} placeholder="Max length" />)
    const input = screen.getByPlaceholderText("Max length")
    expect(input).toHaveAttribute("maxLength", "10")
  })

  it("supports required attribute", () => {
    render(<Input required placeholder="Required" />)
    const input = screen.getByPlaceholderText("Required")
    expect(input).toHaveAttribute("required")
  })

  it("supports autoComplete attribute", () => {
    render(<Input autoComplete="email" placeholder="Email" />)
    const input = screen.getByPlaceholderText("Email")
    expect(input).toHaveAttribute("autoComplete", "email")
  })

  it("handles keyboard events", () => {
    const handleKeyDown = jest.fn()
    render(<Input onKeyDown={handleKeyDown} placeholder="Type" />)
    
    const input = screen.getByPlaceholderText("Type")
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" })
    
    expect(handleKeyDown).toHaveBeenCalled()
  })

  it("applies default styling classes", () => {
    render(<Input placeholder="Styled" />)
    const input = screen.getByPlaceholderText("Styled")
    
    expect(input).toHaveClass("flex", "h-10", "w-full", "rounded-md")
    expect(input).toHaveClass("border", "border-input")
    expect(input).toHaveClass("bg-background")
  })

  it("can have a default value", () => {
    render(<Input defaultValue="Default text" />)
    const input = screen.getByDisplayValue("Default text")
    expect(input).toBeInTheDocument()
  })

  it("supports pattern validation", () => {
    render(<Input pattern="[0-9]*" placeholder="Numbers only" />)
    const input = screen.getByPlaceholderText("Numbers only")
    expect(input).toHaveAttribute("pattern", "[0-9]*")
  })
})