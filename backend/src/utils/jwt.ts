import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const generateAccessToken = (userId: number): string => {
  return jwt.sign({ userId }, env.jwt.accessSecret, { expiresIn: env.jwt.accessExpiry });
};

export const generateRefreshToken = (userId: number): string => {
  return jwt.sign({ userId }, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpiry });
};

export const verifyAccessToken = (token: string): { userId: number } => {
  return jwt.verify(token, env.jwt.accessSecret) as { userId: number };
};

export const verifyRefreshToken = (token: string): { userId: number } => {
  return jwt.verify(token, env.jwt.refreshSecret) as { userId: number };
};
