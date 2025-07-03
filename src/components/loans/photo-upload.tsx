"use client"

import { useCallback, useState, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, X, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { validateFile } from "@/lib/upload"

interface PhotoUploadProps {
  photos: File[]
  onPhotosChange: (photos: File[]) => void
  maxFiles?: number
  label?: string
  description?: string
}

export function PhotoUpload({
  photos,
  onPhotosChange,
  maxFiles = 5,
  label = "Photos",
  description,
}: PhotoUploadProps) {
  const [errors, setErrors] = useState<string[]>([])
  const [photoUrls, setPhotoUrls] = useState<string[]>([])

  // Clean up object URLs when component unmounts or photos change
  useEffect(() => {
    // Create new URLs for current photos
    const urls = photos.map(photo => URL.createObjectURL(photo))
    setPhotoUrls(urls)

    // Cleanup function to revoke previous URLs
    return () => {
      urls.forEach(url => URL.revokeObjectURL(url))
    }
  }, [photos])

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setErrors([])
      const newErrors: string[] = []
      const validFiles: File[] = []

      // Check if adding these files would exceed the limit
      if (photos.length + acceptedFiles.length > maxFiles) {
        newErrors.push(`Maximum ${maxFiles} photos allowed`)
        acceptedFiles = acceptedFiles.slice(0, maxFiles - photos.length)
      }

      // Validate each file
      for (const file of acceptedFiles) {
        const error = await validateFile(file)
        if (error) {
          newErrors.push(`${file.name}: ${error}`)
        } else {
          validFiles.push(file)
        }
      }

      setErrors(newErrors)
      onPhotosChange([...photos, ...validFiles])
    },
    [photos, onPhotosChange, maxFiles]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    maxFiles: maxFiles - photos.length,
    disabled: photos.length >= maxFiles,
  })

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    onPhotosChange(newPhotos)
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      {errors.length > 0 && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
          <div className="flex gap-2">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <div className="text-sm text-destructive space-y-1">
              {errors.map((error, i) => (
                <p key={i}>{error}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {photos.length < maxFiles && (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-accent/50",
            photos.length >= maxFiles && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {isDragActive
              ? "Drop the photos here..."
              : "Drag & drop photos here, or click to select"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            JPG or PNG, max 5MB each
          </p>
        </div>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <Card key={index} className="relative overflow-hidden">
              <div className="relative aspect-square">
                <Image
                  src={photoUrls[index] || "/placeholder-loan.png"}
                  alt={`Photo ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => removePhoto(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="p-2">
                <p className="text-xs text-muted-foreground truncate">
                  {photo.name}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}