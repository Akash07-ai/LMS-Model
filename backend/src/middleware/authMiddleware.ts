import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      console.warn('[AUTH] No authorization header provided for:', req.method, req.path);
      return res.status(401).json({ message: 'No token provided' });
    }
    
    if (!authHeader.startsWith('Bearer ')) {
      console.warn('[AUTH] Invalid authorization header format for:', req.method, req.path);
      return res.status(401).json({ message: 'Invalid token format' });
    }
    
    const token = authHeader.substring(7);
    console.log('[AUTH] Verifying token for:', req.method, req.path);
    
    const decoded = verifyAccessToken(token);
    req.userId = decoded.userId;
    
    console.log('[AUTH] Token verified successfully for user:', decoded.userId);
    next();
  } catch (error) {
    console.error('[AUTH] Token verification failed:', error instanceof Error ? error.message : error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
