import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dhlsfmtlrbxdnrdrzuui.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Storage functions for icon uploads
export async function uploadIcon(file, fileName) {
  try {
    const { data, error } = await supabase.storage
      .from('plugin-icons')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) {
      console.error('Upload error:', error)
      throw error
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('plugin-icons')
      .getPublicUrl(fileName)

    return urlData.publicUrl
  } catch (error) {
    console.error('Error uploading icon:', error)
    throw error
  }
}

export async function deleteIcon(fileName) {
  try {
    const { error } = await supabase.storage
      .from('plugin-icons')
      .remove([fileName])

    if (error) {
      console.error('Delete error:', error)
      throw error
    }
  } catch (error) {
    console.error('Error deleting icon:', error)
    throw error
  }
}

// Initialize database tables
export async function initializeDatabase() {
  try {
    // Create users table
    const { error: usersError } = await supabase.rpc('create_users_table')
    if (usersError && !usersError.message.includes('already exists')) {
      console.error('Error creating users table:', usersError)
    }

    // Create plugins table
    const { error: pluginsError } = await supabase.rpc('create_plugins_table')
    if (pluginsError && !pluginsError.message.includes('already exists')) {
      console.error('Error creating plugins table:', pluginsError)
    }

    console.log('Database tables initialized successfully')
  } catch (error) {
    console.error('Error initializing database:', error)
  }
}

// User operations
export async function getUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching users:', error)
    return []
  }
  return data
}

export async function createUser(userData) {
  const { data, error } = await supabase
    .from('users')
    .insert([userData])
    .select()

  if (error) {
    console.error('Error creating user:', error)
    throw error
  }
  return data[0]
}

export async function updateUser(id, userData) {
  const { data, error } = await supabase
    .from('users')
    .update(userData)
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error updating user:', error)
    throw error
  }
  return data[0]
}

export async function deleteUser(id) {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}

// Plugin operations
export async function getPlugins() {
  const { data, error } = await supabase
    .from('plugins')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching plugins:', error)
    return []
  }
  return data
}

export async function createPlugin(pluginData) {
  const { data, error } = await supabase
    .from('plugins')
    .insert([{
      plugin: pluginData.plugin,
      title: pluginData.title,
      file: pluginData.file,
      type: pluginData.type,
      description: pluginData.description,
      file_size: pluginData.fileSize,
      icon_path: pluginData.iconPath, // Use icon_path instead of icon
      created_at: new Date().toISOString()
    }])
    .select()

  if (error) {
    console.error('Error creating plugin:', error)
    throw error
  }
  return data[0]
}

export async function updatePlugin(id, pluginData) {
  const updateData = {
    updated_at: new Date().toISOString()
  }

  // Only update fields that are provided
  if (pluginData.plugin) updateData.plugin = pluginData.plugin
  if (pluginData.title) updateData.title = pluginData.title
  if (pluginData.file) updateData.file = pluginData.file
  if (pluginData.type) updateData.type = pluginData.type
  if (pluginData.description !== undefined) updateData.description = pluginData.description
  if (pluginData.fileSize) updateData.file_size = pluginData.fileSize
  if (pluginData.iconPath !== undefined) updateData.icon_path = pluginData.iconPath

  const { data, error } = await supabase
    .from('plugins')
    .update(updateData)
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error updating plugin:', error)
    throw error
  }
  return data[0]
}

export async function deletePlugin(id) {
  const { error } = await supabase
    .from('plugins')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting plugin:', error)
    throw error
  }
}

// Authentication
export async function authenticateUser(username, password) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .single()

  if (error) {
    console.error('Authentication error:', error)
    return null
  }
  return data
}
