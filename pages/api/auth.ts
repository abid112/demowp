import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    if (!fs.existsSync(usersFilePath)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const fileContents = fs.readFileSync(usersFilePath, 'utf8');
    const users = JSON.parse(fileContents);
    
    const user = users.find((u: any) => u.username === username && u.password === password);
    
    if (user) {
      res.status(200).json({ 
        success: true, 
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
}
