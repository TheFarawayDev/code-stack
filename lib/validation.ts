import { z } from "zod";

export const TeacherSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email().optional(),
  subjects: z.array(z.string()).default([]),
  active: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable().default(null),
});

export type Teacher = z.infer<typeof TeacherSchema>;
