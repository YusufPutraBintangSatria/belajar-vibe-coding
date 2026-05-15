# Belajar Vibe Coding

Aplikasi ini adalah contoh *backend* RESTful API sederhana untuk manajemen pengguna (registrasi, otentikasi, dan manajemen sesi) yang dibangun menggunakan runtime JavaScript modern yang super cepat, **Bun**, dipadukan dengan framework **ElysiaJS**.

## 🛠️ Teknologi & Stack

*   **Runtime**: [Bun](https://bun.sh/)
*   **Web Framework**: [ElysiaJS](https://elysiajs.com/)
*   **Database ORM**: [Drizzle ORM](https://orm.drizzle.team/)
*   **Database**: MySQL
*   **Kriptografi**: `bcrypt` (untuk *hashing password*)
*   **Testing**: `bun test`

## 📁 Arsitektur & Struktur Folder

Aplikasi ini menggunakan arsitektur modular yang memisahkan antara *routing* dan logika bisnis (*service*).

```text
├── src/
│   ├── routes/          # Menampung definisi routing HTTP (ElysiaJS)
│   │   └── users-route.ts
│   ├── services/        # Menampung logika bisnis dan interaksi database
│   │   └── users-service.ts
│   ├── db.ts            # Konfigurasi koneksi database MySQL
│   ├── errors.ts        # Definisi Custom Error Classes (AppError, dsb)
│   ├── index.ts         # Entry point aplikasi (Inisialisasi server)
│   └── schema.ts        # Definisi skema tabel Drizzle ORM dan relasinya
├── tests/               # Menampung file unit testing API
│   └── users.test.ts
├── drizzle/             # (Auto-generated) Hasil generate migrasi Drizzle
├── .env                 # File kredensial environment (port, database_url)
├── package.json         # Konfigurasi project dependensi dan scripts
└── drizzle.config.ts    # Konfigurasi Drizzle Kit
```

**Aturan Penamaan File (Naming Convention):**
*   File di dalam direktori `routes/` menggunakan akhiran `-route.ts` (contoh: `users-route.ts`).
*   File di dalam direktori `services/` menggunakan akhiran `-service.ts` (contoh: `users-service.ts`).

## 🗄️ Database Schema

Aplikasi ini menggunakan 2 tabel utama:

1.  **Tabel `users`** (Menyimpan data profil pengguna)
    *   `id`: `serial` (Primary Key)
    *   `name`: `varchar(255)` (Maksimal 255 karakter)
    *   `email`: `varchar(255)` (Unique)
    *   `password`: `varchar(255)` (Sudah di-hash)
    *   `createdAt`: `timestamp` (Default: *current time*)

2.  **Tabel `sessions`** (Menyimpan token sesi login pengguna)
    *   `id`: `serial` (Primary Key)
    *   `token`: `varchar(255)` (UUID Token otentikasi)
    *   `userId`: `bigint` (Foreign Key, berelasi ke tabel `users.id`)
    *   `createdAt`: `timestamp` (Default: *current time*)

## 📡 API Endpoints

Berikut adalah API yang tersedia. (*Base URL asumsi:* `http://localhost:3001`)

### 1. Registrasi User
*   **Endpoint:** `POST /api/users`
*   **Body (JSON):**
    ```json
    {
      "name": "User Baru",
      "email": "user@example.com",
      "password": "passwordRahasia"
    }
    ```
*   *Terdapat validasi panjang maksimal string.*

### 2. Login User
*   **Endpoint:** `POST /api/users/login`
*   **Body (JSON):**
    ```json
    {
      "email": "user@example.com",
      "password": "passwordRahasia"
    }
    ```
*   **Response (Sukses):** Mengembalikan string *token* sesi.

### 3. Get Current User
*   **Endpoint:** `POST /api/users/current`
*   **Headers:** `Authorization: Bearer <TOKEN>`
*   **Response (Sukses):** Mengembalikan profil user (`id`, `name`, `email`, `created_at`).

### 4. Logout User
*   **Endpoint:** `DELETE /api/users/logout`
*   **Headers:** `Authorization: Bearer <TOKEN>`
*   **Response (Sukses):** Token akan dihapus permanen dari database.

---

## 🚀 Cara Setup & Run Aplikasi

### 1. Persiapan Environment
*   Pastikan **Bun** dan **MySQL** sudah terpasang dan berjalan di mesin Anda.
*   Copy file `.env.example` ke `.env` dan konfigurasikan `DATABASE_URL` milik Anda:
    ```env
    PORT=3001
    DATABASE_URL=mysql://root:password@localhost:3306/belajar_vibe_coding
    ```

### 2. Install Dependensi
```bash
bun install
```

### 3. Setup Database
Jalankan perintah berikut untuk mengaplikasikan skema Drizzle ORM ke database MySQL Anda secara langsung:
```bash
bun run db:push
```
*(Opsional)* Jika Anda ingin membuat file migrasi SQL fisik terlebih dahulu:
```bash
bun run db:generate
```

### 4. Menjalankan Aplikasi (Mode Development)
```bash
bun run dev
```
Aplikasi akan berjalan dengan *hot-reload* bawaan dari Bun.

---

## 🧪 Cara Menjalankan Test

Proyek ini dilengkapi dengan *Unit Test* API yang komprehensif. Tes dikonfigurasi menggunakan test runner dari Bun (`bun:test`).

Untuk menjalankan semua test case:
```bash
bun test
```

**Catatan:** Skrip *test* telah dilengkapi dengan operasi *cleanup* (menghapus data dummy dari tabel `users` dan `sessions`) sebelum setiap skenario dijalankan untuk memastikan integritas dan konsistensi hasil tes.
