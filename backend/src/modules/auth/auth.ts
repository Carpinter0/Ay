import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../../config/db.js';
import { generateToken } from '../../config/jwt.js';
import { ok, fail } from '../../utils/http.js';
import bcryptjs from 'bcryptjs';
import { ApiError } from '../../middleware/error.js';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  nombre: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const syncSchema = z.object({
  nombre: z.string().min(1),
  fotoUrl: z.string().optional(),
});

export async function register(req: Request, res: Response): Promise<void> {
  const { email, password, nombre } = registerSchema.parse(req.body);

  const existingUser = await prisma.usuario.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(409, 'USER_EXISTS', 'User with this email already exists');
  }

  const passwordHash = await bcryptjs.hash(password, 10);

  const user = await prisma.usuario.create({
    data: {
      email,
      nombre,
      passwordHash,
      plan: 'GRATUITO',
    },
  });

  const token = generateToken(user.id, user.email);

  ok(res, { user, token }, 201);
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = loginSchema.parse(req.body);

  const user = await prisma.usuario.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  const passwordMatch = await bcryptjs.compare(password, user.passwordHash);

  if (!passwordMatch) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  const token = generateToken(user.id, user.email);

  ok(res, { user, token });
}

export async function sync(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Unauthorized');
  }

  const { nombre, fotoUrl } = syncSchema.parse(req.body);

  const user = await prisma.usuario.update({
    where: { id: req.user.sub },
    data: {
      nombre,
      ...(fotoUrl && { fotoUrl }),
    },
  });

  ok(res, user);
}

export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Unauthorized');
  }

  const user = await prisma.usuario.findUnique({
    where: { id: req.user.sub },
  });

  if (!user) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'User not found');
  }

  ok(res, user);
}
