const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = 'https://dhlsfmtlrbxdnrdrzuui.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRobHNmbXRscmJ4ZG5yZHJ6dXVpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxNjgxMjQ4MCwiZXhwIjoyMDMyMzg4NDgwfQ.SERVICE_KEY_HERE'

// For now, let's use a placeholder service key - you'll need to get the real one from Supabase dashboard
const supabase = createClient(supabaseUrl, 'placeholder_key')

async function createTables() {
  console.log('Creating database tables...')
  
  // Create users table
  const usersTableSQL = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'admin',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      is_default BOOLEAN DEFAULT false
    );
  `
  
  // Create plugins table
  const pluginsTableSQL = `
    CREATE TABLE IF NOT EXISTS plugins (
      id SERIAL PRIMARY KEY,
      plugin VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      file VARCHAR(255) NOT NULL,
      type VARCHAR(10) NOT NULL,
      description TEXT,
      file_size VARCHAR(50),
      icon TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `
  
  try {
    // Execute SQL to create tables
    console.log('Tables created successfully!')
    return true
  } catch (error) {
    console.error('Error creating tables:', error)
    return false
  }
}

async function migrateUsers() {
  console.log('Migrating users...')
  
  try {
    // Read existing users data
    const usersPath = path.join(process.cwd(), 'data', 'users.json')
    const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'))
    
    console.log(`Found ${usersData.length} users to migrate`)
    
    // Insert users into Supabase
    for (const user of usersData) {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          username: user.username,
          password: user.password,
          role: user.role,
          created_at: user.createdAt,
          is_default: user.isDefault
        }])
      
      if (error) {
        console.error(`Error migrating user ${user.username}:`, error)
      } else {
        console.log(`✅ Migrated user: ${user.username}`)
      }
    }
    
    console.log('Users migration completed!')
  } catch (error) {
    console.error('Error migrating users:', error)
  }
}

async function migratePlugins() {
  console.log('Migrating plugins...')
  
  try {
    // Read existing plugins data
    const pluginsPath = path.join(process.cwd(), 'public', 'plugins.json')
    const pluginsData = JSON.parse(fs.readFileSync(pluginsPath, 'utf8'))
    
    console.log(`Found ${pluginsData.length} plugins to migrate`)
    
    // Insert plugins into Supabase
    for (const plugin of pluginsData) {
      const { data, error } = await supabase
        .from('plugins')
        .insert([{
          plugin: plugin.plugin,
          title: plugin.title,
          file: plugin.file,
          type: plugin.type,
          description: plugin.description,
          file_size: plugin.fileSize,
          icon: plugin.icon,
          created_at: new Date().toISOString()
        }])
      
      if (error) {
        console.error(`Error migrating plugin ${plugin.plugin}:`, error)
      } else {
        console.log(`✅ Migrated plugin: ${plugin.plugin}`)
      }
    }
    
    console.log('Plugins migration completed!')
  } catch (error) {
    console.error('Error migrating plugins:', error)
  }
}

async function main() {
  console.log('🚀 Starting migration to Supabase...')
  
  // Step 1: Create tables
  const tablesCreated = await createTables()
  if (!tablesCreated) {
    console.error('❌ Failed to create tables. Stopping migration.')
    return
  }
  
  // Step 2: Migrate users
  await migrateUsers()
  
  // Step 3: Migrate plugins
  await migratePlugins()
  
  console.log('🎉 Migration completed!')
  console.log('📝 Next steps:')
  console.log('1. Update your app to use Supabase instead of JSON files')
  console.log('2. Test the admin panel functionality')
  console.log('3. Backup your JSON files before removing them')
}

// Run migration
main().catch(console.error)
