"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { FileJson, FileSpreadsheet, FileText, Loader2 } from "lucide-react"
import { exportLoansAction } from "@/app/actions/loans"

export function ExportOptions() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [format, setFormat] = useState("csv")
  const [dateRange, setDateRange] = useState("all")
  const [includePhotos, setIncludePhotos] = useState(false)
  const [includeReturned, setIncludeReturned] = useState(true)

  const handleExport = async () => {
    try {
      setIsLoading(true)

      const result = await exportLoansAction(format as "csv" | "json" | "pdf")
      
      if (!result.success) {
        throw new Error(result.error || "Export failed")
      }

      if (result.data?.format === "pdf") {
        // For PDF, we need to handle it differently
        toast({
          title: "PDF Export",
          description: "PDF export needs to be implemented on the client side",
          variant: "destructive",
        })
        return
      }

      // Download the file
      const blob = new Blob([result.data?.content || ""], { 
        type: result.data?.mimeType || "text/plain" 
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = result.data?.filename || `loans-export.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Export successful!",
        description: `Your loan data has been exported`,
      })
    } catch (error) {
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Failed to export data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getFormatIcon = () => {
    switch (format) {
      case "json":
        return <FileJson className="h-4 w-4" />
      case "csv":
        return <FileSpreadsheet className="h-4 w-4" />
      case "pdf":
        return <FileText className="h-4 w-4" />
      default:
        return <FileSpreadsheet className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Export Format</CardTitle>
          <CardDescription>
            Choose the format for your exported data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={format} onValueChange={setFormat}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="csv" id="csv" />
              <Label htmlFor="csv" className="flex items-center gap-2 cursor-pointer">
                <FileSpreadsheet className="h-4 w-4" />
                CSV (Spreadsheet compatible)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="json" id="json" />
              <Label htmlFor="json" className="flex items-center gap-2 cursor-pointer">
                <FileJson className="h-4 w-4" />
                JSON (Developer friendly)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pdf" id="pdf" />
              <Label htmlFor="pdf" className="flex items-center gap-2 cursor-pointer">
                <FileText className="h-4 w-4" />
                PDF (Print ready report)
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
          <CardDescription>
            Customize what data to include in the export
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date-range">Date Range</Label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger id="date-range">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="lastyear">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-returned"
                checked={includeReturned}
                onCheckedChange={(checked) => setIncludeReturned(checked as boolean)}
              />
              <Label
                htmlFor="include-returned"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Include returned loans
              </Label>
            </div>

            {format !== "pdf" && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-photos"
                  checked={includePhotos}
                  onCheckedChange={(checked) => setIncludePhotos(checked as boolean)}
                />
                <Label
                  htmlFor="include-photos"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Include photo URLs
                </Label>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button
          onClick={handleExport}
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            getFormatIcon()
          )}
          Export Data
        </Button>
      </div>
    </div>
  )
}