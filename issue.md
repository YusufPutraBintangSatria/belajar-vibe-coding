# Implementasi Fitur Logout User

**Deskripsi Tugas:**
Tugas ini bertujuan untuk membuat API endpoint untuk proses logout user. Saat proses logout berhasil, sesi user (berupa token) harus dihapus dari database.

**Detail Spesifikasi:**
- **Endpoint:** `DELETE /api/users/logout`
- **Headers yang dibutuhkan:** 
  - `Authorization: Bearer <token>`
- **Response Body (Sukses - 200 OK):**
  ```json
  {
      "data" : "OK"
  }
  ```
- **Response Body (Gagal/Token tidak valid/Header tidak ada - 401 Unauthorized):**
  ```json
  {    
      "error" : "Unauthorized" 
  }
  ```

**Konteks Struktur Proyek:**
- Folder `src/routes/` digunakan untuk mendefinisikan routing menggunakan framework ElysiaJS. Penamaan file menggunakan format `-route.ts` (contoh: `users-route.ts`).
- Folder `src/services/` digunakan untuk menempatkan logika bisnis (berinteraksi dengan database Drizzle ORM dll). Penamaan file menggunakan format `-service.ts` (contoh: `users-service.ts`).

---

## 🛠️ Tahapan Implementasi Langkah-demi-Langkah

Ikuti petunjuk di bawah ini secara berurutan untuk menyelesaikan tugas.

### Langkah 1: Buat Fungsi Logout di Layer Service
Lokasi file yang harus diubah: `src/services/users-service.ts`

1. Buka file `src/services/users-service.ts`.
2. Pastikan kamu sudah mengimpor tabel `sessions` dari `../schema` dan operator `eq` dari `drizzle-orm`.
3. Buat dan ekspor sebuah fungsi asynchronous baru bernama `logoutUser`. Fungsi ini harus menerima parameter `token` dengan tipe data `string`.
4. Di dalam fungsi `logoutUser`:
   - Lakukan pencarian di database untuk mengecek apakah token tersebut ada di tabel `sessions`. Kamu bisa menggunakan query seperti `db.query.sessions.findFirst(...)`.
   - Jika token **tidak ditemukan**, lemparkan error (throw error) dengan pesan `"Unauthorized"`.
   - Jika token **ditemukan**, lakukan perintah `delete` pada database untuk menghapus data di tabel `sessions` di mana nilai kolom `token` sama persis dengan parameter `token`.
   *(Referensi query Drizzle: `await db.delete(sessions).where(eq(sessions.token, token));`)*

### Langkah 2: Tambahkan Endpoint Logout di Layer Route
Lokasi file yang harus diubah: `src/routes/users-route.ts`

1. Buka file `src/routes/users-route.ts`.
2. Pada bagian atas file, tambahkan fungsi `logoutUser` ke dalam daftar import dari `../services/users-service`.
3. Pada instance `Elysia` (`usersRoute`), tambahkan method `.delete("/users/logout", async ({ headers, set }) => { ... })`.
4. Di dalam handler endpoint `delete` tersebut, lakukan validasi Header Authorization:
   - Ambil nilai dari `headers['authorization']`.
   - Cek apakah header tersebut ada dan apakah formatnya diawali dengan teks `"Bearer "`.
   - Jika tidak valid, ubah status response HTTP menjadi `401` (`set.status = 401;`) lalu kembalikan object `{ error: "Unauthorized" }`.
5. Jika header valid, ekstrak string token aslinya dengan membuang teks `"Bearer "` (misal menggunakan `.split(' ')[1]`).
6. Jalankan logika service di dalam blok `try...catch`:
   - **Blok Try:** Panggil fungsi `await logoutUser(token)`. Jika tidak ada error, kembalikan response sukses `{ data: "OK" }`.
   - **Blok Catch:** Tangkap error yang dilemparkan dari layer service. Jika tipe error message adalah `"Unauthorized"`, atur `set.status = 401` dan kembalikan `{ error: "Unauthorized" }`. Untuk error lainnya, atur `set.status = 500` dan kembalikan `{ error: "Internal Server Error" }`.

### Langkah 3: Pengujian (Checklist untuk Programer)
Setelah kode diimplementasikan, pastikan fungsionalitas berjalan dengan skenario berikut:
- [ ] Hit API Login, salin token yang didapatkan.
- [ ] Hit API `DELETE /api/users/logout` menggunakan token valid tersebut. Pastikan HTTP Status 200 dengan respons `{"data": "OK"}`.
- [ ] Cek database (tabel `sessions`), pastikan baris dengan token tersebut sudah hilang/terhapus.
- [ ] Hit kembali API Logout dengan token yang sama (yang sudah terhapus). Pastikan HTTP Status 401 dengan respons `{"error": "Unauthorized"}`.
- [ ] Hit API Logout tanpa menyertakan header Authorization. Pastikan HTTP Status 401 dengan respons `{"error": "Unauthorized"}`.
