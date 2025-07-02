import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import type { UploadedFile } from "./upload"

export async function saveFile(file: File): Promise<UploadedFile> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Create unique filename
  const ext = path.extname(file.name)
  const filename = `${uuidv4()}${ext}`
  const uploadDir = path.join(process.cwd(), "public", "uploads")
  const filePath = path.join(uploadDir, filename)

  // Ensure upload directory exists
  await mkdir(uploadDir, { recursive: true })

  // Write file to disk
  await writeFile(filePath, buffer)

  return {
    url: `/uploads/${filename}`,
    filename,
  }
}

export async function saveMultipleFiles(files: File[]): Promise<UploadedFile[]> {
  const uploadPromises = files.map(file => saveFile(file))
  return Promise.all(uploadPromises)
}