# Implementasi Dokumentasi API menggunakan Swagger

**Deskripsi Tugas:**
Tugas ini bertujuan untuk mengintegrasikan fitur **Swagger** ke dalam proyek aplikasi backend ini. Tujuannya adalah agar *developer* atau *user* lain yang ingin mengonsumsi API kita dapat dengan mudah melihat dokumentasi, membaca skema *request/response*, dan bahkan menguji langsung API tersebut dari halaman browser (Swagger UI).

Framework yang kita gunakan adalah **ElysiaJS**, yang sudah memiliki plugin resmi untuk Swagger, sehingga implementasinya akan sangat rapi dan otomatis membaca skema tipe (*TypeBox*) yang sudah kita definisikan di *routes*.

---

## 🛠️ Tahapan Implementasi Langkah-demi-Langkah

Ikuti petunjuk di bawah ini secara detail dan berurutan. Panduan ini dirancang agar mudah diikuti oleh *junior programmer* maupun *AI agent*.

### Langkah 1: Instalasi Plugin Swagger
Hal pertama yang harus dilakukan adalah menambahkan library resmi Swagger dari ekosistem ElysiaJS.

1. Buka terminal/command prompt di direktori root proyek (`belajar-vibe-coding`).
2. Jalankan perintah instalasi menggunakan Bun:
   ```bash
   bun add @elysiajs/swagger
   ```
3. Tunggu hingga proses instalasi selesai dan pastikan `package.json` sudah terupdate dengan dependency baru tersebut.

### Langkah 2: Registrasi Plugin di File Utama
Setelah plugin terinstal, kita harus mendaftarkannya (memakainya) di dalam instance utama aplikasi kita.

1. Buka file **`src/index.ts`**.
2. Di bagian paling atas file (bersama deretan `import` lainnya), tambahkan *import statement* untuk memanggil fungsi `swagger`:
   ```typescript
   import { swagger } from "@elysiajs/swagger";
   ```
3. Cari blok kode di mana instance `app` (Elysia) dideklarasikan:
   ```typescript
   export const app = new Elysia()
     .get("/", () => ({ message: "Hello Elysia!" }))
     // ... kode lainnya
   ```
4. Tambahkan method `.use()` untuk memanggil plugin `swagger` **SEBELUM** aplikasi melakukan deklarasi `.use(usersRoute)`. Urutan sangat penting agar Swagger dapat membaca seluruh rute yang dideklarasikan setelahnya.
   Contoh penerapannya:
   ```typescript
   export const app = new Elysia()
     .use(swagger({
         documentation: {
             info: {
                 title: 'Belajar Vibe Coding API',
                 version: '1.0.0'
             }
         }
     }))
     .get("/", () => ({ message: "Hello Elysia!" }))
     // ... kode lainnya
     .use(usersRoute);
   ```

### Langkah 3: Mengelompokkan Dokumentasi Route (Opsional namun Sangat Disarankan)
Untuk membuat tampilan Swagger lebih rapi, kita bisa menambahkan metadata detail pada *route* kita. Elysia secara otomatis sudah meng-generate dokumentasi dari skema validasi (`t.Object` pada `body`), namun menambahkan *tag* akan mengelompokkan API dengan rapi di halaman antarmuka.

1. Buka file **`src/routes/users-route.ts`**.
2. Pada setiap deklarasi endpoint (misalnya `.post("/users", ...)`), kamu bisa menambahkan konfigurasi `detail` di objek opsi (parameter ketiga atau setelah deklarasi `body` validator).
   *Contoh untuk endpoint Registrasi:*
   ```typescript
   .post("/users", async ({ body }) => {
       // ... logika register ...
   }, {
       body: t.Object({ ... }),
       detail: {
           tags: ['Users'],
           summary: 'Register User Baru'
       }
   })
   ```
3. Terapkan konfigurasi `detail` serupa pada endpoint `/users/login`, `/users/current`, dan `/users/logout` dengan memberikan deskripsi (`summary`) yang sesuai untuk masing-masing API. Pastikan menggunakan `tags: ['Users']` pada semuanya agar mereka berada di kelompok yang sama di UI Swagger.

### Langkah 4: Pengujian / Verifikasi
1. Jalankan server aplikasi di terminal:
   ```bash
   bun run dev
   ```
2. Buka browser web favoritmu (Chrome, Firefox, Safari).
3. Akses URL dokumentasi Swagger yang secara otomatis digenerate oleh plugin, yaitu: **`http://localhost:3001/swagger`**
   *(Ganti port `3001` sesuai dengan yang berjalan di terminalmu).*
4. **Validasi Akhir:** Pastikan halaman antarmuka Swagger terbuka dan memunculkan semua endpoint API yang telah dibuat (`/api/users`, `/api/users/login`, dsb). Coba fitur *'Try it out'* di halaman tersebut untuk memastikan skema request body yang diminta sudah benar sesuai dengan yang dideskripsikan.
