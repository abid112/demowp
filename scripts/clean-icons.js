const fs = require('fs')
const path = require('path')

async function cleanIconsInJSON() {
  try {
    // Read the current plugins.json
    const pluginsPath = path.join(process.cwd(), 'public', 'plugins.json')
    const pluginsData = JSON.parse(fs.readFileSync(pluginsPath, 'utf8'))
    
    console.log(`Found ${pluginsData.length} plugins to process`)
    
    // Create icons directory if it doesn't exist
    const iconsDir = path.join(process.cwd(), 'public', 'icons')
    if (!fs.existsSync(iconsDir)) {
      fs.mkdirSync(iconsDir, { recursive: true })
      console.log('Created icons directory')
    }
    
    let cleanedCount = 0
    let savedCount = 0
    
    // Process each plugin
    for (let i = 0; i < pluginsData.length; i++) {
      const plugin = pluginsData[i]
      
      if (plugin.icon && plugin.icon.startsWith('data:')) {
        try {
          // Extract the base64 data
          const matches = plugin.icon.match(/^data:image\/([a-zA-Z]*);base64,(.+)$/)
          if (matches) {
            const extension = matches[1] === 'jpeg' ? 'jpg' : matches[1]
            const base64Data = matches[2]
            
            // Create filename
            const filename = `plugin-${plugin.plugin.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}.${extension}`
            const filepath = path.join(iconsDir, filename)
            
            // Save the image file
            fs.writeFileSync(filepath, Buffer.from(base64Data, 'base64'))
            
            // Update the plugin to use file path instead
            plugin.icon = `/icons/${filename}`
            
            console.log(`✅ Converted icon for ${plugin.plugin} -> ${filename}`)
            savedCount++
          }
        } catch (error) {
          console.error(`❌ Failed to convert icon for ${plugin.plugin}:`, error.message)
          // Remove the problematic base64 data
          plugin.icon = ''
        }
        cleanedCount++
      }
    }
    
    // Save the cleaned JSON
    fs.writeFileSync(pluginsPath, JSON.stringify(pluginsData, null, 2))
    
    console.log(`\n🎉 Cleanup completed!`)
    console.log(`- Processed: ${cleanedCount} base64 icons`)
    console.log(`- Saved as files: ${savedCount} icons`)
    console.log(`- JSON file size reduced significantly`)
    
    // Show file size comparison
    const stats = fs.statSync(pluginsPath)
    console.log(`- Current JSON file size: ${(stats.size / 1024).toFixed(1)} KB`)
    
  } catch (error) {
    console.error('Error cleaning icons:', error)
  }
}

// Run the cleanup
cleanIconsInJSON()
