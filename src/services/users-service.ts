import { db } from "../db";
import { users, sessions } from "../schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { UnauthorizedError, BadRequestError } from "../errors";

/**
 * Mendaftarkan pengguna baru ke dalam sistem.
 * 
 * Fungsi ini akan mengecek apakah email sudah terdaftar. Jika belum, 
 * fungsi akan melakukan hashing pada password dan menyimpannya ke database.
 * 
 * @param {any} data - Objek yang berisi informasi registrasi pengguna (name, email, password).
 * @returns {Promise<{success: boolean}>} Objek indikator keberhasilan registrasi.
 * @throws {BadRequestError} Jika email sudah terdaftar sebelumnya.
 */
export const registerUser = async (data: any) => {
  const { name, email, password } = data;

  // 1. Check if email already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    throw new BadRequestError("Email sudah terdaftar");
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

/**
 * Melakukan proses otentikasi/login untuk pengguna.
 * 
 * Fungsi ini memvalidasi keberadaan email, mencocokkan password dengan hash 
 * di database, dan menghasilkan token UUID baru untuk sesi pengguna yang berhasil login.
 * 
 * @param {any} data - Objek kredensial login (email, password).
 * @returns {Promise<string>} Token sesi (UUID) yang dihasilkan setelah login berhasil.
 * @throws {UnauthorizedError} Jika email tidak ditemukan atau password salah.
 */
export const loginUser = async (data: any) => {
  const { email, password } = data;

  // 1. Find user by email
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    throw new UnauthorizedError("Email/password salah");
  }

  // 2. Compare password
  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    throw new UnauthorizedError("Email/password salah");
  }

  // 3. Generate token
  const token = crypto.randomUUID();

  // 4. Save session
  await db.insert(sessions).values({
    token,
    userId: user.id,
  });

  return token;
};

/**
 * Mengambil data profil pengguna yang sedang login berdasarkan token sesi.
 * 
 * @param {string} token - Token otentikasi (Bearer token) milik pengguna.
 * @returns {Promise<Object>} Data profil pengguna (id, name, email, created_at).
 * @throws {UnauthorizedError} Jika sesi/token tidak valid atau tidak ditemukan di database.
 */
export const getCurrentUser = async (token: string) => {
  const session = await db.query.sessions.findFirst({
    where: eq(sessions.token, token),
    with: {
      user: true,
    },
  });

  if (!session) {
    throw new UnauthorizedError("Session tidak valid");
  }

  const { id, name, email, createdAt } = session.user;
  return { id, name, email, created_at: createdAt };
};

/**
 * Mengakhiri sesi pengguna (logout) dengan menghapus token dari database.
 * 
 * @param {string} token - Token sesi yang akan dihapus.
 * @returns {Promise<string>} String "OK" yang menandakan sesi berhasil dihapus.
 * @throws {UnauthorizedError} Jika token yang diberikan tidak valid atau tidak ada di database.
 */
export const logoutUser = async (token: string) => {
  const session = await db.query.sessions.findFirst({
    where: eq(sessions.token, token),
  });

  if (!session) {
    throw new UnauthorizedError();
  }

  await db.delete(sessions).where(eq(sessions.token, token));

  return "OK";
};

