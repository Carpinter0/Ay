import { Usuario } from './usuario.js';

declare global {
  namespace Express {
    interface Request {
      user?: Usuario;
    }
  }
}

export {};
