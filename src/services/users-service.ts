import { db } from "../db";
import { users } from "../schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export const registerUser = async (data: any) => {
  const { name, email, password } = data;

  // 1. Check if email already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    throw new Error("Email sudah terdaftar");
  }

  // 2. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Save to database
  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

  return { success: true };
};
