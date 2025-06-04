import { getUsers, createUser, updateUser, deleteUser } from '../../lib/supabase'

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        const users = await getUsers()
        res.status(200).json(users)
        break

      case 'POST':
        const newUser = await createUser({
          ...req.body,
          created_at: new Date().toISOString()
        })
        res.status(201).json(newUser)
        break

      case 'PUT':
        const { id, ...updateData } = req.body
        const updatedUser = await updateUser(id, updateData)
        res.status(200).json(updatedUser)
        break

      case 'DELETE':
        const { id: deleteId } = req.body
        await deleteUser(deleteId)
        res.status(200).json({ success: true })
        break

      default:
        res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
