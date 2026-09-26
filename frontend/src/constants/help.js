// Konten bantuan kontekstual per halaman modul (Bahasa Indonesia formal, langkah demi langkah).
export const HELP = {
  dashboard: {
    title: "Dashboard",
    purpose: "Menyajikan ringkasan kondisi pengajuan dan status penjurnalan secara sekilas.",
    steps: [
      "Perhatikan kartu jumlah dokumen per jenis (PPBJ, PUM, PP, PTUM) di bagian atas.",
      "Pantau kartu status: Menunggu, Disetujui, Jurnal Dibuat, dan Total Nilai Pengajuan.",
      "Klik kartu jenis dokumen untuk membuka daftar dokumen terkait.",
      "Tinjau tabel “Pengajuan Terbaru” untuk melihat aktivitas terkini.",
    ],
    tips: ["Angka diperbarui otomatis mengikuti dokumen yang disetujui/diposkan."],
  },
  ppbj: {
    title: "PPBJ — Permintaan Pengadaan Barang & Jasa",
    purpose: "Mengajukan kebutuhan pengadaan barang/jasa untuk diverifikasi anggaran dan disetujui.",
    steps: [
      "Klik “Buat PPBJ”.",
      "Isi unit kerja, kegiatan, tanggal, dan lokasi.",
      "Tambahkan rincian item: uraian, kuantitas, satuan, dan harga estimasi.",
      "Periksa total yang terhitung otomatis, lampirkan nota bila ada.",
      "Simpan untuk mengajukan ke proses persetujuan bertingkat.",
    ],
    tips: [
      "Gunakan kolom pencarian untuk menemukan dokumen berdasarkan nomor, kegiatan, atau supplier.",
      "Sistem memberi peringatan bila pengajuan melebihi pagu anggaran unit kerja.",
    ],
  },
  pum: {
    title: "PUM — Permohonan Uang Muka",
    purpose: "Mengajukan pencairan uang muka atas kegiatan yang telah disetujui.",
    steps: [
      "Klik “Buat PUM”.",
      "Isi unit kerja, keterangan, dan nilai uang muka yang diminta.",
      "Tentukan akun pembayaran dan akun uang muka bila diperlukan.",
      "Simpan untuk diajukan ke Approver/Keuangan.",
    ],
    tips: ["Uang muka nantinya wajib dipertanggungjawabkan melalui dokumen PTUM."],
  },
  pp: {
    title: "PP — Permohonan Pembayaran",
    purpose: "Mengajukan pembayaran kepada pihak ketiga/vendor lengkap dengan perhitungan pajak.",
    steps: [
      "Klik “Buat PP”.",
      "Isi penerima/supplier, keterangan, dan Dasar Pengenaan Pajak (DPP).",
      "Aktifkan PPN bila berlaku dan pilih jenis PPh yang sesuai.",
      "Periksa perhitungan pajak otomatis (mengikuti Pengaturan Pajak).",
      "Simpan untuk diproses persetujuan.",
    ],
    tips: [
      "Tarif PPN/PPh diambil dari menu Pengaturan Pajak; ubah di sana bila regulasi berubah.",
      "Isi Nomor Faktur Pajak agar ikut terekspor ke Accurate.",
    ],
  },
  ptum: {
    title: "PTUM — Pertanggungjawaban Uang Muka",
    purpose: "Melaporkan realisasi penggunaan uang muka (PUM) yang telah dicairkan.",
    steps: [
      "Klik “Buat PTUM”.",
      "Kaitkan dengan dokumen PUM terkait.",
      "Rinci realisasi penggunaan beserta nilai dan pajak bila ada.",
      "Sistem menghitung selisih (sisa/kelebihan) uang muka secara otomatis.",
      "Simpan untuk diverifikasi Bagian Keuangan.",
    ],
    tips: ["Selisih lebih akan dikembalikan ke kas; selisih kurang dibayar tambahan."],
  },
  kaskecil: {
    title: "Kas Kecil",
    purpose: "Mengajukan pengeluaran atau pengisian kas kecil operasional.",
    steps: [
      "Klik “Buat KASKECIL”.",
      "Isi keterangan pengeluaran dan rincian nominal.",
      "Pilih akun pembayaran (umumnya Kas Kecil).",
      "Simpan untuk persetujuan.",
    ],
  },
  nrp: {
    title: "NRP — No Receipt Payment",
    purpose: "Mencatat pembayaran yang tidak memiliki kuitansi/bukti formal.",
    steps: [
      "Klik “Buat NRP”.",
      "Isi tujuan pembayaran, keterangan, dan nilainya.",
      "Simpan untuk ditinjau.",
    ],
    tips: ["Umumnya tanpa pajak dan dibayar melalui kas kecil."],
  },
  jurnal: {
    title: "Jurnal Umum",
    purpose: "Mengubah dokumen yang telah disetujui menjadi jurnal akuntansi siap ekspor ke Accurate Online.",
    steps: [
      "Jurnal dibuat dari halaman detail dokumen berstatus Disetujui (tombol “Buat Jurnal Umum”).",
      "Di halaman ini, gunakan filter Jenis/Tanggal untuk menyaring jurnal.",
      "Klik ikon mata untuk memeriksa rincian baris debit/kredit.",
      "Pastikan setiap jurnal berstatus “Balance”.",
      "Klik “CSV” atau “Export Excel” untuk mengunduh berkas impor Accurate.",
    ],
    tips: [
      "Format ekspor mengikuti template “Impor Bukti Jurnal Umum” Accurate Online.",
      "Kode akun mengacu pada Master Akun (COA).",
    ],
  },
  anggaran: {
    title: "Anggaran",
    purpose: "Memantau pagu vs realisasi per unit kerja dan mengekspor rekap untuk pelaporan.",
    steps: [
      "Tab “Bulanan”: pilih periode untuk melihat pagu, realisasi, sisa, dan serapan per unit.",
      "Klik “Tambah Anggaran” untuk menetapkan pagu unit kerja (peran Admin/Keuangan).",
      "Klik “Export Excel” untuk rekap satu bulan, atau “Rentang” untuk beberapa bulan.",
      "Tab “Tahunan”: lihat tren 12 bulan dan “Export Excel” rekap tahunan.",
    ],
    tips: [
      "Realisasi dihitung dari dokumen berstatus Disetujui/Diposkan pada periode terkait.",
      "Berkas Excel dilengkapi kop/logo dan kolom tanda tangan, siap dicetak.",
    ],
  },
  pajak: {
    title: "Pengaturan Pajak",
    purpose: "Mengatur tarif dan jenis pajak (PPN/PPh) yang dipakai pada perhitungan dokumen.",
    steps: [
      "Atur Tarif PPN (%) dan pilih akun PPN Masukan.",
      "Pada tabel PPh, tambah/ubah kode, nama, tarif, dan akun hutang pajak.",
      "Isi keterangan agar mudah dikenali pengguna lain.",
      "Klik “Simpan” — tarif langsung dipakai pada modul PP/PTUM.",
    ],
    tips: ["Tarif mengikuti ketentuan perpajakan Indonesia; perbarui bila ada perubahan regulasi."],
  },
  akun: {
    title: "Master Akun (COA)",
    purpose: "Mengelola Chart of Accounts sebagai dasar penjurnalan.",
    steps: [
      "Klik “Tambah Akun”.",
      "Isi kode akun, nama, kategori, tipe, dan saldo normal (debit/kredit).",
      "Sesuaikan kode dengan struktur akun Accurate Online Anda.",
      "Simpan — akun menjadi pilihan saat penjurnalan & pengaturan pajak.",
    ],
    tips: ["Gunakan pencarian untuk menemukan akun berdasarkan kode atau nama."],
  },
  pengguna: {
    title: "Pengguna & Peran",
    purpose: "Mengelola akun pengguna, peran, status aktif, dan reset kata sandi.",
    steps: [
      "Klik “Tambah Pengguna”, isi nama, email, kata sandi, dan tetapkan peran.",
      "Gunakan filter peran untuk menyaring daftar pengguna.",
      "Gunakan ikon kunci untuk reset kata sandi, dan ikon daya untuk aktif/nonaktif.",
      "Ikon pensil untuk mengubah data; ikon tempat sampah untuk menghapus.",
    ],
    tips: [
      "Hanya Super Admin yang dapat mengelola akun Super Admin.",
      "Anda tidak dapat menonaktifkan atau menghapus akun sendiri.",
    ],
  },
  log: {
    title: "Log Aktivitas",
    purpose: "Menelusuri jejak audit tindakan pada akun pengguna.",
    steps: [
      "Gunakan filter aksi (Membuat, Mengubah, Reset Sandi, dll.) untuk menyaring.",
      "Baca kolom Waktu, Dilakukan Oleh, Aksi, Target, dan Detail.",
      "Klik “Muat Ulang” untuk memperbarui data terbaru.",
    ],
    tips: ["Gunakan log ini untuk keperluan audit dan keamanan."],
  },
};
