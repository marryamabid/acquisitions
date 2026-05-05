import { z } from 'zod';
export const signupSchema = z.object({
  name: z.string().min(1).max(255).trim(),
  email: z.email().min(1).max(255).toLowerCase().trim(),
  password: z.string().min(5).max(124),
  role: z.enum(['user', 'admin']).default('user'),
});

export const signinSchema = z.object({
  email: z.email().min(1).max(255).toLowerCase().trim(),
  password: z.string().min(1).max(124),
});
