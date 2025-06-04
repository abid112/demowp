import formidable from 'formidable'
import fs from 'fs'
import { uploadIcon } from '../../lib/supabase'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const form = formidable({
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB limit
    })

    const [fields, files] = await form.parse(req)

    if (!files.icon || !files.icon[0]) {
      return res.status(400).json({ error: 'No icon file uploaded' })
    }

    const file = files.icon[0]
    const originalName = file.originalFilename || 'icon'
    const extension = originalName.split('.').pop()
    const timestamp = Date.now()
    const fileName = `icon-${timestamp}.${extension}`

    // Read file buffer
    const fileBuffer = fs.readFileSync(file.filepath)

    // Upload to Supabase Storage
    const publicUrl = await uploadIcon(fileBuffer, fileName)

    // Clean up temporary file
    fs.unlinkSync(file.filepath)

    res.status(200).json({
      success: true,
      iconPath: publicUrl,
      message: 'Icon uploaded successfully to cloud storage'
    })

  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({
      error: 'Upload failed',
      details: error.message
    })
  }
}
