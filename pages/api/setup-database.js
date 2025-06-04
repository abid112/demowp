import { supabase } from '../../lib/supabase'
import fs from 'fs'
import path from 'path'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('🚀 Starting database setup...')

    // Step 1: Create users table
    console.log('Creating users table...')
    const { error: usersTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(20) DEFAULT 'admin',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          is_default BOOLEAN DEFAULT false
        );
      `
    })

    if (usersTableError) {
      console.log('Users table might already exist or using direct SQL...')
    }

    // Step 2: Create plugins table
    console.log('Creating plugins table...')
    const { error: pluginsTableError } = await supabase.rpc('exec_sql', {
      sql: `
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
    })

    if (pluginsTableError) {
      console.log('Plugins table might already exist or using direct SQL...')
    }

    // Step 3: Migrate users data
    console.log('Migrating users...')
    try {
      const usersPath = path.join(process.cwd(), 'data', 'users.json')
      const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'))
      
      for (const user of usersData) {
        const { error: insertError } = await supabase
          .from('users')
          .upsert({
            username: user.username,
            password: user.password,
            role: user.role,
            created_at: user.createdAt,
            is_default: user.isDefault
          }, { onConflict: 'username' })
        
        if (insertError) {
          console.error(`Error migrating user ${user.username}:`, insertError)
        } else {
          console.log(`✅ Migrated user: ${user.username}`)
        }
      }
    } catch (error) {
      console.error('Error reading users file:', error)
    }

    // Step 4: Migrate plugins data
    console.log('Migrating plugins...')
    try {
      const pluginsPath = path.join(process.cwd(), 'public', 'plugins.json')
      const pluginsData = JSON.parse(fs.readFileSync(pluginsPath, 'utf8'))
      
      for (const plugin of pluginsData) {
        const { error: insertError } = await supabase
          .from('plugins')
          .insert({
            plugin: plugin.plugin,
            title: plugin.title,
            file: plugin.file,
            type: plugin.type,
            description: plugin.description,
            file_size: plugin.fileSize,
            icon: plugin.icon,
            created_at: new Date().toISOString()
          })
        
        if (insertError) {
          console.error(`Error migrating plugin ${plugin.plugin}:`, insertError)
        } else {
          console.log(`✅ Migrated plugin: ${plugin.plugin}`)
        }
      }
    } catch (error) {
      console.error('Error reading plugins file:', error)
    }

    console.log('🎉 Database setup completed!')
    res.status(200).json({ 
      success: true, 
      message: 'Database setup and migration completed successfully!' 
    })

  } catch (error) {
    console.error('Setup error:', error)
    res.status(500).json({ 
      error: 'Setup failed', 
      details: error.message 
    })
  }
}
