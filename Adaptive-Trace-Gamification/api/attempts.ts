import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../lib/storage';
import { insertAttemptSchema } from '../shared/schema';
import { z } from 'zod';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      const input = insertAttemptSchema.parse(req.body);
      const newAttempt = await storage.createAttempt(input);
      return res.status(201).json(newAttempt);
    }
    
    if (req.method === 'GET') {
      const allAttempts = await storage.getAttempts();
      return res.status(200).json(allAttempts);
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: error.errors[0].message,
        field: error.errors[0].path.join('.')
      });
    }
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
