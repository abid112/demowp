const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dhlsfmtlrbxdnrdrzuui.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function migrateIconsToSupabase() {
  console.log('🚀 Starting icon migration to Supabase Storage...')

  try {
    // Read plugins.json
    const pluginsPath = path.join(process.cwd(), 'public', 'plugins.json')
    const pluginsData = JSON.parse(fs.readFileSync(pluginsPath, 'utf8'))
    
    console.log(`Found ${pluginsData.length} plugins to check`)

    let migratedCount = 0
    let skippedCount = 0

    for (let i = 0; i < pluginsData.length; i++) {
      const plugin = pluginsData[i]
      
      // Check if plugin has a local file icon (starts with /icons/)
      if (plugin.icon && plugin.icon.startsWith('/icons/')) {
        const localIconPath = path.join(process.cwd(), 'public', plugin.icon)
        
        if (fs.existsSync(localIconPath)) {
          try {
            console.log(`📤 Migrating icon for ${plugin.plugin}...`)
            
            // Read the file
            const fileBuffer = fs.readFileSync(localIconPath)
            const fileName = path.basename(plugin.icon)
            
            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
              .from('plugin-icons')
              .upload(fileName, fileBuffer, {
                cacheControl: '3600',
                upsert: true
              })

            if (error) {
              console.error(`❌ Failed to upload ${fileName}:`, error.message)
              continue
            }

            // Get public URL
            const { data: urlData } = supabase.storage
              .from('plugin-icons')
              .getPublicUrl(fileName)

            // Update plugin data with new URL
            plugin.icon = urlData.publicUrl
            
            console.log(`✅ Migrated ${plugin.plugin} icon to: ${urlData.publicUrl}`)
            migratedCount++
            
          } catch (error) {
            console.error(`❌ Error migrating ${plugin.plugin}:`, error.message)
          }
        } else {
          console.log(`⚠️  Local icon file not found for ${plugin.plugin}: ${plugin.icon}`)
          // Reset to default emoji
          plugin.icon = ''
          skippedCount++
        }
      } else {
        // Plugin uses emoji or already has cloud URL
        skippedCount++
      }
    }

    // Save updated plugins.json
    fs.writeFileSync(pluginsPath, JSON.stringify(pluginsData, null, 2))
    
    console.log('\n🎉 Migration completed!')
    console.log(`✅ Migrated: ${migratedCount} icons`)
    console.log(`⏭️  Skipped: ${skippedCount} plugins (emoji or already cloud-based)`)
    console.log('📝 Updated plugins.json with new cloud URLs')
    
    if (migratedCount > 0) {
      console.log('\n📋 Next steps:')
      console.log('1. Commit the updated plugins.json file')
      console.log('2. Push to GitHub')
      console.log('3. Deploy to Vercel')
      console.log('4. Icons will now work on production!')
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    
    if (error.message.includes('Invalid API key')) {
      console.log('\n🔑 Please set up your Supabase API keys:')
      console.log('1. Go to your Supabase dashboard')
      console.log('2. Copy your anon key')
      console.log('3. Update .env.local with the real key')
      console.log('4. Run this script again')
    }
  }
}

// Run migration
migrateIconsToSupabase()
