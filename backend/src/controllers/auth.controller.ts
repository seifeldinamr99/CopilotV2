import type { Request, Response } from "express";
import bcrypt from "bcrypt";

import { prisma } from "../config/database";
import { signToken } from "../utils/jwt";
import {
  registerSchema,
  loginSchema,
} from "../routes/validators/auth.schema";

export async function registerHandler(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
  }

  const { email, password, name } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: "Email already in use." });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, passwordHash, name },
  });

  const token = signToken({ userId: user.id, email: user.email });
  return res.status(201).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
}

export async function loginHandler(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const token = signToken({ userId: user.id, email: user.email });
  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
}
