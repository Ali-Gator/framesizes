import type { ExtensionCopy } from "./en";

export const id = {
  seo: {
    title: "Gallery Wall Layout Generator untuk Chrome",
    h1: "Cara Menggunakan Gallery Wall Layout Generator",
    description:
      "Cara menggunakan ekstensi Chrome Gallery Wall Layout Generator: rencanakan dinding di panel samping, atau coba poster dari toko dalam ukuran sebenarnya.",
  },
  crumbs: { home: "Beranda", hub: "Dinding galeri", page: "Ekstensi Chrome" },
  answer:
    "Klik tombol ekstensi di toolbar Chrome untuk membuka panel samping dan merencanakan dinding galeri. Di toko mana pun, klik kanan sebuah poster dan pilih “Try on my wall” untuk menggantungnya di dinding Anda dalam ukuran sebenarnya.",
  store: "Dapatkan dari Chrome Web Store",
  noButton: "Tidak melihat tombolnya?",
  showPin: "Lihat cara menyematkannya",
  pin: {
    title: "Sematkan ke toolbar",
    text: "Chrome menyimpan ekstensi baru di balik tombol kepingan puzzle. Klik kepingan puzzle (1) di kanan atas Chrome, lalu pin (2) di samping Gallery Wall Layout Generator. Tombolnya akan tetap ada di toolbar.",
    picture:
      "Toolbar Chrome: tombol kepingan puzzle, bertanda 1, membuka menu Ekstensi, dan pin di samping Gallery Wall Layout Generator bertanda 2",
    pinned: "Sudah disematkan?",
    showUsage: "Lihat cara menggunakannya",
  },
  usage: "Yang bisa Anda lakukan di panel samping",
  steps: [
    {
      title: "Rencanakan dinding galeri",
      figure: "Lima bingkai di atas sofa di ruang contoh",
      text: "Pilih salah satu dari lima template, atur jaraknya, dan pindahkan bingkainya. Ruang contoh langsung berfungsi; foto dinding Anda sendiri butuh waktu semenit.",
    },
    {
      title: "Coba poster dari toko",
      figure: "Menu klik kanan pada poster di toko, dengan Try on my wall dipilih",
      text: "Klik kanan sebuah poster, pilih “Try on my wall”, lalu pilih ukuran yang dicantumkan toko. Poster itu tergantung di dinding Anda dalam ukuran sebenarnya.",
    },
    {
      title: "Dapatkan tanda paku",
      figure: "Lima bingkai dengan satu paku bernomor di masing-masing",
      text: "Ketik seberapa jauh gantungan berada di bawah tepi atas bingkai. Setiap paku mendapat nomor dan titik, diukur dari satu sudut.",
    },
  ],
  wall: {
    title: "Gunakan dinding Anda sendiri",
    text: "Foto dinding lurus dari depan, lalu tandai satu benda yang ukurannya Anda ketahui. Panel menskalakan semuanya berdasarkan benda itu:",
    items: [
      "lebar dinding",
      "pintu (setinggi {door} di AS)",
      "sofa atau tempat tidur yang sudah Anda ukur",
      "kertas Letter atau A4 yang ditempel di dinding",
      "kartu kredit",
    ],
  },
  perm: {
    title: "Yang dapat dilihat ekstensi",
    rows: [
      {
        dt: "Menu klik kanan",
        dd: "Menambahkan “Try on my wall” saat Anda mengklik kanan sebuah gambar.",
      },
      {
        dt: "Tab tempat Anda mengklik",
        dd: "Membaca halaman itu sekali, saat Anda memilih “Try on my wall”: gambarnya dan ukuran apa pun di teksnya. Tidak ada hal lain di situs itu.",
      },
      {
        dt: "framesizes.app",
        dd: "Dapat menanyakan apakah ekstensi terpasang dan disematkan. Tidak ada hal lain yang dibagikan.",
      },
    ],
    tip: "Foto dinding Anda tetap di komputer ini.",
  },
  faq: {
    title: "Pertanyaan",
    items: [
      {
        q: "Apakah berfungsi di semua toko?",
        a: "Di halaman mana pun yang memiliki gambar yang bisa Anda klik kanan. Jika halaman tidak mencantumkan ukuran, ketik sendiri lebar dan tingginya.",
      },
      {
        q: "Mengapa tombolnya tidak ada di toolbar saya?",
        a: "Chrome menaruh ekstensi baru di balik tombol kepingan puzzle. Sematkan sekali dan tombolnya akan tetap di toolbar.",
      },
      {
        q: "Di browser apa saja ekstensi ini berjalan?",
        a: "Chrome 116 atau yang lebih baru, di komputer. Ekstensi ini terbuka di panel samping Chrome.",
      },
    ],
  },
  chrome: {
    extensions: "Ekstensi",
    noAccess: "Tidak perlu akses",
    noAccessLines: ["Ekstensi ini tidak perlu melihat dan mengubah", "informasi pada situs ini."],
    manage: "Kelola ekstensi",
    copyImage: "Salin gambar",
    inspect: "Inspeksi",
  },
} satisfies ExtensionCopy;
