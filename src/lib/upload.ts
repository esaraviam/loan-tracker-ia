// Client-side validation only
const MAX_FILE_SIZE = 5242880 // 5MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png"]

export interface UploadedFile {
  url: string
  filename: string
}

export async function validateFile(file: File): Promise<string | null> {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return "File type not allowed. Only JPG and PNG files are accepted."
  }

  if (file.size > MAX_FILE_SIZE) {
    return `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit.`
  }

  return null
}