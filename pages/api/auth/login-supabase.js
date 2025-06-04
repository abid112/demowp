import { authenticateUser } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' })
  }

  try {
    const user = await authenticateUser(username, password)
    
    if (user) {
      res.status(200).json({ 
        success: true, 
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      })
    } else {
      res.status(401).json({ error: 'Invalid username or password' })
    }
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
