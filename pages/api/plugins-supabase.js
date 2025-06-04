import { getPlugins, createPlugin, updatePlugin, deletePlugin } from '../../lib/supabase'

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        const plugins = await getPlugins()
        res.status(200).json(plugins)
        break

      case 'POST':
        const newPlugin = await createPlugin(req.body)
        res.status(201).json(newPlugin)
        break

      case 'PUT':
        const { id, ...updateData } = req.body
        const updatedPlugin = await updatePlugin(id, updateData)
        res.status(200).json(updatedPlugin)
        break

      case 'DELETE':
        const { id: deleteId } = req.body
        await deletePlugin(deleteId)
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
