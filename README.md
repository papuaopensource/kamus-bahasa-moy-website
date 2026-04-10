<h1 align="center">Kamus Bahasa Moy - Website</h1>

<div align="center">
  <img src="apps/web/src/assets/images/logo-kamus-bahasa-moy.svg" alt="Logo Kamus Bahasa Moy" width="200"/>
  <h3>Website Kamus Digital untuk Pelestarian Bahasa Moy</h3>
  <p><em>Untuk versi aplikasi mobile, kunjungi <a href="https://github.com/papua-opensource/kamus-bahasa-moy-mobile">repository mobile</a></em></p>
</div>

<div align="center">

[![All Contributors](https://img.shields.io/github/contributors/papua-opensource/kamus-bahasa-moy-website)](https://github.com/papua-opensource/kamus-bahasa-moy-website/graphs/contributors)
![GitHub last commit](https://img.shields.io/github/last-commit/papua-opensource/kamus-bahasa-moy-website.svg)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/papua-opensource/kamus-bahasa-moy-website)
[![License](https://img.shields.io/github/license/papua-opensource/kamus-bahasa-moy-website.svg)](LICENSE)

</div>

## Deskripsi

Kamus Bahasa Moy Website adalah platform web yang dikembangkan untuk membantu melestarikan dan mempromosikan bahasa Moy dari Jayapura, Papua. Website ini menyediakan kosakata bahasa Moy beserta terjemahan, pengucapan, dan contoh penggunaan dalam kalimat. Dengan antarmuka yang modern dan responsif, website ini memudahkan pengguna untuk mempelajari dan mengapresiasi bahasa Moy melalui berbagai perangkat.

**Data bahasa dalam website ini diambil dari Kamus Dwibahasa Mooi yang dibuat oleh Balai Bahasa Provinsi Papua**, sehingga menjamin keakuratan dan keaslian konten bahasa yang disajikan.

## Fitur Utama

- **Kamus Komprehensif**: Berisi lebih dari 1.000+ kata bahasa Moy dengan arti, pengucapan, dan kelas kata
- **Pencarian Cepat**: Cari kata dengan mudah menggunakan fitur pencarian realtime
- **Navigasi Abjad**: Akses kata-kata berdasarkan awalan huruf untuk penelusuran yang lebih terstruktur
- **Contoh Kalimat**: Setiap kata dilengkapi dengan contoh penggunaan dalam kalimat bahasa Moy dan terjemahan Bahasa Indonesia
- **Klasifikasi Kelas Kata**: Identifikasi jenis kata (nomina, verba, adjektiva, dll)
- **Lirik Lagu**: Koleksi lirik lagu dalam bahasa Moy untuk belajar sambil menikmati budaya
- **Tampilan Responsif**: Desain yang optimal untuk penggunaan di desktop, tablet, dan smartphone
- **Mode Gelap/Terang**: Pilihan tampilan sesuai preferensi pengguna

## Teknologi

Proyek ini menggunakan struktur monorepo dengan [Turborepo](https://turbo.build/) dan [pnpm workspaces](https://pnpm.io/workspaces).

**Frontend** (`apps/web`): [Astro](https://astro.build/), [React](https://react.dev/), [TailwindCSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)

**Backend** (`apps/api`): [FastAPI](https://fastapi.tiangolo.com/), [SQLAlchemy](https://www.sqlalchemy.org/), [SQLite](https://www.sqlite.org/), [Alembic](https://alembic.sqlalchemy.org/)

**Tooling**: [Turborepo](https://turbo.build/), [pnpm](https://pnpm.io/), [uv](https://docs.astral.sh/uv/)

Untuk panduan setup dan pengembangan lokal, lihat [DEVELOPMENT.md](DEVELOPMENT.md).

## Kontribusi

Kontribusi untuk pengembangan Website Kamus Bahasa Moy sangat diapresiasi. Silakan baca panduan lengkapnya di [CONTRIBUTING.md](CONTRIBUTING.md).

## Lisensi

Proyek ini dilisensikan di bawah lisensi AGPL-3.0 — lihat file [LICENSE](LICENSE) untuk detailnya.

## Kredit

- Dikembangkan oleh Papua Open Source
- UI/UX Design oleh Tim Papua Open Source, dengan beberapa aset visual lainnya yang berasal dari berbagai sumber
- Logo dibuat menggunakan Grok AI
- Data kosakata berasal dari Kamus Dwibahasa Mooi yang disusun oleh Balai Bahasa Provinsi Papua

## Sumber Data

Website ini menggunakan data kosakata dan definisi dari **Kamus Dwibahasa Mooi** yang diterbitkan oleh **Balai Bahasa Provinsi Papua**. Kamus tersebut merupakan sumber otoritatif untuk bahasa Moy/Mooi dan telah disusun melalui penelitian bahasa yang ekstensif oleh ahli linguistik dari Balai Bahasa.

## Adaptasi untuk Bahasa Daerah Lain

Kode sumber Website Kamus Bahasa Moy dapat Anda gunakan untuk membuat website kamus untuk bahasa daerah lainnya di Indonesia atau di seluruh dunia. Kami mendorong upaya pelestarian bahasa daerah melalui teknologi dan dengan senang hati menyediakan codebase ini sebagai dasar pengembangan aplikasi serupa.

Dalam mengadaptasi kode sumber ini, Anda wajib:
- Tetap mencantumkan atribusi kepada Papua Open Source sebagai pengembang awal
- Mematuhi ketentuan lisensi AGPL-3.0, termasuk menjaga kode sumber tetap terbuka untuk umum

## Kontak

- Email: contact@papuaopensource.org
- Website: www.papuaopensource.org
