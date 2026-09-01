import dotenv from 'dotenv';
import path from 'path';

// Load .env from workspace root or current dir
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'scriptforge-super-secret-jwt-key-development-38294719823',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'scriptforge-refresh-secret-jwt-key-development-91823749812',
  groqApiKey: process.env.GROQ_API_KEY || '',
  groqModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  imageProvider: process.env.IMAGE_PROVIDER || 'none',
  imageApiKey: process.env.IMAGE_API_KEY || '',
  imageModel: process.env.IMAGE_MODEL || 'flux-1-schnell',
};
