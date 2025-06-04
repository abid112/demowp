import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const pluginsFilePath = path.join(process.cwd(), 'public', 'plugins.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const fileContents = fs.readFileSync(pluginsFilePath, 'utf8');
      const plugins = JSON.parse(fileContents);
      res.status(200).json(plugins);
    } catch (error) {
      res.status(500).json({ error: 'Failed to read plugins file' });
    }
  } else if (req.method === 'POST') {
    try {
      const plugins = req.body;
      fs.writeFileSync(pluginsFilePath, JSON.stringify(plugins, null, 2));
      res.status(200).json({ message: 'Plugins updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update plugins file' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
