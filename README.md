# PantauDesa ![PD](0-repo-asset/PantauDesa.jpeg)

Platform pemantauan pembangunan desa berbasis gamifikasi. Petugas membuat quest
pembangunan, warga memantau langsung di lapangan lewat foto + validasi GPS, dan
mengumpulkan XP untuk ditukar reward nyata (mis. minyak goreng, beras, pulsa).

Dibangun dengan **React 18 + Vite + Tailwind CSS**.

## Menjalankan proyek

```bash
npm install
npm run dev
```

Buka `http://localhost:5173` di browser. Untuk build produksi:

```bash
npm run build
npm run preview
```

## Akun demo

| Peran   | Username | Kata Sandi  |
|---------|----------|-------------|
| Admin   | admin    | admin123    |
| Petugas | rudi     | petugas123  |
| Warga   | budi     | warga123    |

Warga baru bisa mendaftar sendiri lewat halaman **Daftar** di layar login.
Akun Petugas hanya bisa dibuat oleh Admin (menu *Kelola Pengguna*).

## Struktur proyek

```
src/
├── App.jsx                 # Komponen utama: routing peran, state, aksi CRUD
├── main.jsx                # Entry point React
├── index.css                # Tailwind directives + base style
├── lib/
│   ├── data.js              # Seed data awal & fungsi bantu (haversine, level, format tanggal)
│   └── storage.js           # Lapisan persistensi berbasis localStorage
├── components/
│   ├── ui.jsx                # Komponen UI primitif (Button, Panel, Tag, dll.)
│   ├── AuthScreen.jsx         # Halaman Login & Daftar
│   └── Shell.jsx              # Layout sidebar (desktop) + hamburger (mobile), dipakai oleh Admin, Petugas & Warga
└── pages/
    ├── AdminPages.jsx         # Dashboard, Kritik & Saran, Kelola Pengguna, Kelola Reward
    ├── PetugasPages.jsx       # Dashboard, Buat/Daftar Quest, Verifikasi Laporan, Leaderboard
    └── WargaPages.jsx         # Beranda, Misi, Detail Misi, Reward, Peringkat, Profil — layout kartu/grid responsif
```

Ketiga peran (Admin, Petugas, Warga) memakai `Shell` yang sama sehingga tampilan
konsisten dan otomatis responsif: sidebar hijau tetap di desktop, berubah jadi
menu hamburger yang bisa dibuka-tutup di layar mobile.

## Alur inti

1. **Petugas** membuat quest baru (judul, kategori, XP, koordinat lokasi, radius toleransi meter, periode).
2. **Warga** membuka misi aktif, mengunggah foto bukti pantauan, lalu mengecek lokasi GPS.
   Jarak dihitung dengan rumus haversine terhadap koordinat proyek — laporan hanya bisa
   dikirim jika berada dalam radius yang ditentukan, dan dibatasi 1 laporan/quest/hari.
3. **Petugas** meninjau laporan masuk (foto + jarak GPS), menyetujui (memberi XP) atau menolak.
4. **Warga** menukar XP dengan reward yang tersedia; stok otomatis berkurang.
5. **Admin** memantau statistik keseluruhan, mengelola kritik & saran warga, kelola pengguna,
   dan kelola katalog reward.

## Catatan penting

- **Persistensi data**: proyek ini memakai `localStorage` (lihat `src/lib/storage.js`) agar
  bisa langsung jalan tanpa backend. Konsekuensinya, data **hanya tersimpan di browser
  masing-masing perangkat** — tidak otomatis sinkron antara HP warga dan laptop petugas.
  Untuk penggunaan nyata di desa (banyak pengguna berbeda perangkat), ganti lapisan ini
  dengan panggilan ke backend sungguhan, misalnya:
  - **Supabase** atau **Firebase** (paling cepat diintegrasikan, sudah ada auth & database), atau
  - **REST API** kustom (Node.js/Express, Laravel, dll.) + database (PostgreSQL/MySQL).
  Struktur data di `src/lib/data.js` (`users`, `quests`, `reports`, `rewards`, `redemptions`,
  `feedback`) bisa langsung dipetakan menjadi tabel/koleksi di backend pilihan Anda.
- **Autentikasi**: sistem login saat ini mengecek username/password yang tersimpan di
  `localStorage` — cukup untuk mencegah akses asal-asalan pada tahap prototipe, tapi
  **bukan pengamanan tingkat produksi** (password tidak di-hash, semua logic ada di
  client). Untuk produksi, gunakan auth service (Supabase Auth/Firebase Auth/NextAuth)
  dengan hashing password di server.
- **GPS**: fitur "Cek Lokasi GPS Saya" memakai Geolocation API bawaan browser
  (`navigator.geolocation`) — akan meminta izin lokasi ke pengguna saat dijalankan di
  domain HTTPS atau `localhost`. Tombol simulasi disediakan sebagai fallback jika izin
  ditolak, untuk keperluan demo.
- **Peta**: radius proyek saat ini divisualisasikan sebagai lingkaran sederhana (bukan
  peta interaktif). Untuk peta sungguhan, integrasikan **Leaflet + OpenStreetMap** (gratis)
  atau **Google Maps JavaScript API** (perlu API key) di `WargaQuestDetail` dan `QuestForm`.
