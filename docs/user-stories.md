<!-- Classification: INTERNAL -->
# User Story & Acceptance Criteria

Sekalian Foto Queue System. This is the latest requirements version and the source of truth.

---

## Requirement: For User #1 - Customer

### US-01: Join Queue via QR Code

> Sebagai pelanggan, saya ingin scan QR code dan mengisi data singkat, agar saya otomatis masuk ke antrian booth tersebut tanpa perlu dicatat manual oleh staff.

**Dependencies:** QR code booth harus sudah di-generate oleh admin (tergantung US-06).

**What will fail & backup:**
- Kalau nama tidak diisi, sistem tidak bisa submit dan kasih tau bagian mana yang harus diisi.
- Nomor telepon sifatnya opsional, jadi kalau dikosongin tetap bisa lanjut, cuma nanti fitur notifikasi/reminder yang butuh nomor telp jadi tidak aktif buat pelanggan itu.

**Acceptance Criteria #1 - Happy Path**
- **Given:** Pelanggan sudah scan QR code booth dan masuk ke halaman form pendaftaran antrian.
- **When:** Pelanggan mengisi nama (wajib) dan nomor telepon (opsional), lalu menekan tombol daftar/submit.
- **Then:** Sistem membuatkan nomor antrian baru untuk pelanggan tersebut sesuai urutan di booth itu, dan menampilkan nomor antriannya di layar.

**Acceptance Criteria #2 - Edge Case**
- **Given:** Pelanggan membuka form pendaftaran antrian.
- **When:** Pelanggan menekan submit tanpa mengisi nama.
- **Then:** Sistem menampilkan pesan validasi bahwa nama wajib diisi, dan antrian tidak dibuat.

---

### US-02: Lihat Status & Estimasi Antrian

> Sebagai pelanggan, saya ingin melihat nomor antrian saya dan posisi saya saat ini di halaman web, agar saya tahu kira-kira berapa lama lagi saya harus menunggu.

**Dependencies:** Membutuhkan US-01 (antrian sudah terdaftar).

**What will fail & backup:** Kalau koneksi pelanggan sempat putus, begitu halaman dibuka lagi status antrian tetap muncul sesuai kondisi terakhir di sistem (data disimpan di server, bukan cuma di sisi browser).

**Acceptance Criteria #1 - Happy Path**
- **Given:** Pelanggan sudah mendapat nomor antrian dari proses pendaftaran.
- **When:** Pelanggan membuka/refresh halaman status antriannya.
- **Then:** Sistem menampilkan nomor antrian pelanggan, posisi antrian saat ini (berapa orang lagi di depan), dan estimasi waktu tunggu.

---

### US-03: Notifikasi Giliran via Browser Notification

> Sebagai pelanggan, saya ingin dapat notifikasi dari browser saat giliran saya sudah dekat/tiba, agar saya tidak perlu terus-terusan buka halaman web untuk mantau antrian.

**Dependencies:** Pelanggan harus mengizinkan permission notifikasi browser saat diminta.

**What will fail & backup:** Kalau pelanggan menolak permission notifikasi browser, sistem tetap bisa jalan, cuma pelanggan harus memantau progress antrian secara manual lewat halaman web karena notifikasi tidak bisa dikirim.

**Acceptance Criteria #1 - Happy Path**
- **Given:** Pelanggan sudah mengizinkan notifikasi browser dan sedang berada di posisi antrian tertentu.
- **When:** Status antriannya berubah jadi giliran dia (lihat US-07).
- **Then:** Browser pelanggan menampilkan push notification yang memberi tahu bahwa gilirannya sudah tiba.

**Acceptance Criteria #2 - Edge Case**
- **Given:** Pelanggan menolak/belum mengizinkan permission notifikasi browser.
- **When:** Statusnya berubah jadi giliran dia.
- **Then:** Sistem tetap mengubah status di halaman web (sesuai US-07), tanpa mengirim push notification.

---

### US-04: Cancel Antrian

> Sebagai pelanggan, saya ingin bisa membatalkan antrian saya sendiri lewat halaman web, agar saya tidak perlu lanjut menunggu kalau berubah pikiran.

**Dependencies:** Membutuhkan US-01 (antrian aktif).

**What will fail & backup:** -

**Acceptance Criteria #1 - Happy Path**
- **Given:** Pelanggan sedang berada di halaman status antriannya dengan status masih waiting.
- **When:** Pelanggan menekan tombol cancel dan mengonfirmasi pembatalan.
- **Then:** Status antrian pelanggan berubah jadi cancelled, pelanggan keluar dari list antrian booth tersebut, dan posisi pelanggan lain di belakangnya otomatis maju satu.

---

### US-05: Notifikasi "It's Your Turn"

> Sebagai pelanggan, saya ingin halaman web saya otomatis menampilkan pesan khusus saat giliran saya tiba, agar saya langsung tahu harus masuk ke booth dan mulai sesi foto.

**Dependencies:** Membutuhkan US-02 (halaman status antrian) dan logic admin End Session (US-11) yang memicu perubahan giliran.

**What will fail & backup:** -

**Acceptance Criteria #1 - Happy Path**
- **Given:** Pelanggan berada di urutan antrian nomor 1 (barisan terdepan) pada booth yang dipantau.
- **When:** Staff menekan End Session untuk pelanggan yang sedang di dalam booth, sehingga posisi pelanggan ini naik jadi yang dipanggil.
- **Then:** Halaman web pelanggan otomatis berubah menampilkan pesan bahwa sekarang gilirannya, dan mempersilakan dia masuk ke booth untuk memulai sesi foto.

---

## Requirement: For User #2 - Admin/Staff

### US-06: Login Admin

> Sebagai staff, saya ingin login ke sistem menggunakan akun saya, agar hanya staff yang berwenang yang bisa mengakses dan mengelola data antrian.

**Dependencies:** -

**What will fail & backup:** -

**Acceptance Criteria #1 - Happy Path**
- **Given:** Staff membuka halaman login dan memasukkan email/username serta password yang valid.
- **When:** Staff menekan tombol login.
- **Then:** Staff berhasil masuk dan diarahkan ke halaman dashboard.

**Acceptance Criteria #2 - Edge Case**
- **Given:** Staff memasukkan email/username atau password yang salah.
- **When:** Staff menekan tombol login.
- **Then:** Sistem menampilkan pesan error bahwa kredensial salah, dan staff tetap berada di halaman login.

---

### US-07: Tambah Booth Baru & Generate QR Code

> Sebagai admin, saya ingin menambahkan booth baru dan langsung mendapat QR code uniknya, agar tiap booth punya antrian sendiri-sendiri yang terpisah dari booth lain.

**Dependencies:** Membutuhkan US-06 (sudah login).

**What will fail & backup:** Kalau nama booth belum diisi, sistem tidak bisa generate QR dan kasih tau bagian mana yang masih kosong.

**Acceptance Criteria #1 - Happy Path**
- **Given:** Admin berada di halaman dashboard dan menekan tombol "Add New Booth".
- **When:** Admin mengisi nama booth (dan cabang, jika ada lebih dari satu cabang) lalu menekan simpan.
- **Then:** Sistem membuat booth baru beserta QR code unik untuk booth tersebut, yang nantinya dipakai pelanggan untuk masuk ke antrian booth itu.

**Acceptance Criteria #2 - Edge Case**
- **Given:** Admin membuka form tambah booth baru.
- **When:** Admin menekan simpan tanpa mengisi nama booth.
- **Then:** Sistem menampilkan pesan validasi, dan booth baru tidak dibuat.

---

### US-08: Pilih/Filter Booth

> Sebagai admin, saya ingin memilih booth tertentu di dashboard, agar saya hanya melihat data antrian booth yang relevan sama saya saat itu, bukan semua booth sekaligus.

**Dependencies:** Membutuhkan US-06 (sudah login) dan minimal 1 booth sudah terdaftar (US-07).

**What will fail & backup:** -

**Acceptance Criteria #1 - Happy Path**
- **Given:** Admin sudah login dan berada di halaman dashboard dengan beberapa booth terdaftar.
- **When:** Admin memilih salah satu booth dari filter/opsi yang tersedia.
- **Then:** Dashboard menampilkan table antrian yang isinya khusus data dari booth yang dipilih saja.

---

### US-09: Lihat Table Antrian per Booth

> Sebagai admin, saya ingin melihat daftar antrian booth dalam bentuk table yang urutannya sesuai antrian, agar saya tahu siapa yang sekarang lagi di dalam booth dan siapa selanjutnya.

**Dependencies:** Membutuhkan US-08 (booth sudah dipilih).

**What will fail & backup:** -

**Acceptance Criteria #1 - Happy Path**
- **Given:** Admin sudah memilih salah satu booth di dashboard.
- **When:** Halaman dashboard dimuat.
- **Then:** Sistem menampilkan table berisi nama, nomor telp (kalau diisi), dan nomor antrian pelanggan, diurutkan sesuai antrian; baris paling atas adalah pelanggan yang sedang di dalam booth, dengan tombol End Session dan Extend Session di tiap baris.

---

### US-10: End Session

> Sebagai admin, saya ingin menandai sesi pelanggan yang di dalam booth sebagai selesai, agar antrian bisa lanjut ke pelanggan berikutnya, baik karena sesi fotonya benar-benar sudah kelar maupun karena pelanggan tidak datang saat dipanggil.

**Dependencies:** Membutuhkan US-09 (table antrian aktif).

**What will fail & backup:** Tidak ada backup, aksi ini final, tapi staff diharapkan memastikan dulu kondisi di booth sebelum menekan tombol ini (sesuai catatan di bagian risiko), supaya tidak salah pencet selagi pelanggan masih di dalam.

**Acceptance Criteria #1 - Happy Path**
- **Given:** Baris antrian paling atas di table adalah pelanggan yang sedang di dalam booth.
- **When:** Admin menekan tombol End Session pada baris tersebut.
- **Then:** Baris pelanggan itu hilang dari table, baris di bawahnya otomatis naik jadi yang paling atas (giliran berikutnya), dan pelanggan yang baru naik ini mendapat notifikasi/perubahan status "it's your turn" di halaman webnya (US-05).

---

### US-11: Extend Session

> Sebagai admin, saya ingin memperpanjang sesi pelanggan yang sedang di dalam booth ketika mereka minta tambah sesi, agar pelanggan bisa foto lebih lama tanpa harus di-End Session dan antri ulang, sekaligus memperbarui estimasi waktu buat antrian di belakangnya.

**Dependencies:** Membutuhkan US-09 (table antrian aktif), konfirmasi lisan antara pelanggan dan staff di lokasi sebelum tombol ditekan.

**What will fail & backup:** Tidak ada backup khusus — kalau admin salah pencet extend, sesi tetap bisa diakhiri lewat End Session seperti biasa begitu pelanggan benar-benar selesai.

**Acceptance Criteria #1 - Happy Path**
- **Given:** Pelanggan yang sedang di dalam booth (baris paling atas) meminta tambahan sesi ke staff.
- **When:** Admin menekan tombol Extend Session pada baris tersebut.
- **Then:** Sesi pelanggan itu bertambah 1 sesi (5 menit), baris pelanggan tetap berada di posisi paling atas (belum di-End Session), dan estimasi waktu tunggu untuk seluruh antrian di bawahnya bertambah mengikuti durasi tambahan sesi tersebut.

---

## Functional Requirements

### 1. Customer Queue Registration (Scan QR & Form)

| Scope | Description | Elements |
|---|---|---|
| QR Scan Entry Point | QR code per booth, saat di-scan mengarahkan pelanggan ke halaman form pendaftaran antrian booth tersebut. | - |
| Registration Form | Form singkat berisi data pelanggan sebelum masuk antrian. | Input nama (wajib), input nomor telepon (opsional), tombol daftar/submit. |
| Queue Number Result | Tampilan konfirmasi setelah submit berhasil. | Nomor antrian, posisi antrian saat ini, estimasi waktu tunggu. |

**Notes:**
- Validasi: nama wajib diisi sebelum sistem bisa generate nomor antrian; nomor telepon boleh kosong dan tidak memblokir proses pendaftaran.
- Satu booth = satu antrian terpisah; nomor antrian dihitung per booth, bukan gabungan semua booth.

### 2. Queue Status, Estimation & Notification

| Scope | Description | Elements |
|---|---|---|
| Status Page | Halaman yang bisa diakses pelanggan setelah daftar, menampilkan status antrian terkini. | Nomor antrian, posisi di antrian, estimasi waktu tunggu, tombol cancel. |
| Turn Notification | Perubahan tampilan otomatis di halaman status saat giliran pelanggan tiba. | Pesan "It's your turn, enjoy your session" atau sejenisnya. |
| Browser Push Notification | Notifikasi browser yang dikirim saat giliran pelanggan tiba, sebagai pengingat tambahan di luar halaman web. | - |

**Notes:**
- Perhitungan estimasi waktu tunggu: jumlah orang di depan × durasi rata-rata per sesi (5 menit), disesuaikan kembali tiap kali ada Extend Session dari booth tersebut.
- Push notification bergantung pada permission browser; kalau pelanggan menolak, fitur ini otomatis nonaktif untuk pelanggan tersebut tapi tidak mengganggu fitur lain.

### 3. Cancel Antrian

| Scope | Description | Elements |
|---|---|---|
| Cancel Action | Tombol cancel yang tersedia selama status pelanggan masih waiting. | Tombol cancel, modal/konfirmasi sebelum benar-benar dibatalkan. |

**Notes:**
- Begitu dibatalkan, pelanggan langsung hilang dari antrian dan urutan pelanggan di belakangnya otomatis maju tanpa perlu aksi tambahan dari admin.

### 4. Admin Authentication

| Scope | Description | Elements |
|---|---|---|
| Login Page | Halaman login admin sebelum bisa mengakses dashboard. | Input email/username, input password, tombol login. |

**Notes:**
- Semua halaman admin (dashboard, add booth, dll) hanya bisa diakses setelah login berhasil.

### 5. Booth Management & QR Generation

| Scope | Description | Elements |
|---|---|---|
| Add New Booth | Form untuk mendaftarkan booth baru. | Input nama booth, pilihan cabang (jika lebih dari satu cabang), tombol simpan. |
| QR Code Generation | Form untuk mendaftarkan booth baru. | Input nama booth, pilihan cabang (jika lebih dari satu cabang), tombol simpan. |

**Notes:**
- Semua halaman admin (dashboard, add booth, dll) hanya bisa diakses setelah login berhasil.

### 6. Queue Monitoring Dashboard (End Session & Extend Session)

| Scope | Description | Elements |
|---|---|---|
| Booth Filter | Opsi/dropdown untuk memilih booth mana yang mau dipantau di dashboard. | - |
| Queue Table | Table data antrian booth yang sedang dipilih, diurutkan sesuai antrian. | Kolom nama, nomor telp, nomor antrian, tombol End Session, tombol Extend Session per baris. |
| End Session Action | Mengakhiri sesi pelanggan yang ada di baris paling atas (sedang di dalam booth), baik karena sesi selesai maupun pelanggan tidak datang (no-show). | - |
| Extend Session Action | Menambah durasi sesi pelanggan yang ada di baris paling atas sebanyak 1 sesi (5 menit), tanpa menghapus baris tersebut dari table. | - |

**Notes:**
- Baris paling atas pada table selalu merepresentasikan pelanggan yang sedang berada di dalam booth saat itu.
- End Session menghapus baris teratas dan otomatis memajukan baris berikutnya jadi baris teratas baru, sekaligus memicu notifikasi "it's your turn" ke pelanggan yang baru naik.
- Extend Session tidak mengubah urutan/menghapus baris, hanya menambah durasi sesi pelanggan yang sedang di dalam dan memperbarui estimasi waktu tunggu pelanggan lain di bawahnya.