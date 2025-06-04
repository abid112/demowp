import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize with default admin user if file doesn't exist
if (!fs.existsSync(usersFilePath)) {
  const defaultUsers = [
    {
      id: 1,
      username: 'abid',
      password: '2|EGNC0MkKap',
      role: 'admin',
      createdAt: new Date().toISOString(),
      isDefault: true
    }
  ];
  fs.writeFileSync(usersFilePath, JSON.stringify(defaultUsers, null, 2));
}

export interface User {
  id: number;
  username: string;
  password: string;
  role: string;
  createdAt: string;
  isDefault?: boolean;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const fileContents = fs.readFileSync(usersFilePath, 'utf8');
      const users = JSON.parse(fileContents);
      // Don't send passwords in response
      const safeUsers = users.map((user: User) => ({
        id: user.id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        isDefault: user.isDefault
      }));
      res.status(200).json(safeUsers);
    } catch (error) {
      res.status(500).json({ error: 'Failed to read users file' });
    }
  } else if (req.method === 'POST') {
    try {
      const { action, user } = req.body;
      const fileContents = fs.readFileSync(usersFilePath, 'utf8');
      let users = JSON.parse(fileContents);

      if (action === 'create') {
        // Check if username already exists
        if (users.find((u: User) => u.username === user.username)) {
          return res.status(400).json({ error: 'Username already exists' });
        }

        const newUser = {
          id: Math.max(...users.map((u: User) => u.id), 0) + 1,
          username: user.username,
          password: user.password,
          role: user.role || 'admin',
          createdAt: new Date().toISOString(),
          isDefault: false
        };
        users.push(newUser);
      } else if (action === 'delete') {
        const userToDelete = users.find((u: User) => u.id === user.id);
        if (userToDelete?.isDefault) {
          return res.status(400).json({ error: 'Cannot delete default admin user' });
        }
        users = users.filter((u: User) => u.id !== user.id);
      } else if (action === 'update') {
        const index = users.findIndex((u: User) => u.id === user.id);
        if (index !== -1) {
          users[index] = { ...users[index], ...user };
        }
      }

      fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
      res.status(200).json({ message: 'Users updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update users' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
