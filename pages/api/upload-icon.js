import formidable from 'formidable'
import fs from 'fs'
import path from 'path'

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
      uploadDir: path.join(process.cwd(), 'public', 'icons'),
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB limit
    })

    // Create icons directory if it doesn't exist
    const iconsDir = path.join(process.cwd(), 'public', 'icons')
    if (!fs.existsSync(iconsDir)) {
      fs.mkdirSync(iconsDir, { recursive: true })
    }

    const [fields, files] = await form.parse(req)
    
    if (!files.icon || !files.icon[0]) {
      return res.status(400).json({ error: 'No icon file uploaded' })
    }

    const file = files.icon[0]
    const originalName = file.originalFilename || 'icon'
    const extension = path.extname(originalName)
    const timestamp = Date.now()
    const newFileName = `icon-${timestamp}${extension}`
    const newFilePath = path.join(iconsDir, newFileName)

    // Move file to final location
    fs.renameSync(file.filepath, newFilePath)

    // Return the public path
    const publicPath = `/icons/${newFileName}`
    
    res.status(200).json({ 
      success: true, 
      iconPath: publicPath,
      message: 'Icon uploaded successfully' 
    })

  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: 'Upload failed' })
  }
}
