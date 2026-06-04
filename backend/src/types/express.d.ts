import type { Usuario } from './usuario';

declare global {
  namespace Express {
    interface Request {
      /**
       * Populated by auth.middleware after verifying the Firebase ID token.
       * Contains the decoded uid and email from the token payload.
       */
      user?: Pick<Usuario, 'uid' | 'email'>;
    }
  }
}

export {};
