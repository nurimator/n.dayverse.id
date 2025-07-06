---
layout: default_en
title: "Menguasai State Management di React dengan Zustand"
date: 2025-05-05 10:30:00 +0700
category: "Tutorial"
page_id: "3"
author: "Nurhidayat"
author_role: "Penulis"
author_bio: "Menulis tentang apa saja yang menurutku menarik."
author_avatar: "/assets/image/nurimator-logo-512.webp"
type: "Artikel"
image: "https://placehold.co/1200x600/111827/60a5fa?text=Zustand%20Tutorial"
---

Dalam ekosistem React, manajemen state adalah salah satu topik yang paling sering dibicarakan. Meskipun Redux telah lama menjadi standar de facto, banyak developer mencari alternatif yang lebih sederhana dan tidak terlalu _boilerplate_. Di sinilah Zustand hadir sebagai solusi yang elegan, ringan, dan sangat mudah digunakan.

> Zustand adalah sebuah library manajemen state yang kecil, cepat, dan terukur dengan API yang nyaman berdasarkan hooks. Ia tidak memerlukan banyak kode boilerplate seperti Redux, dan terasa lebih "React-ish".

## Kenapa Memilih Zustand?

Berikut beberapa alasan mengapa Zustand menjadi pilihan yang menarik:

* **Sederhana:** API-nya minimalis dan mudah dipelajari. Anda bisa membuat store hanya dengan beberapa baris kode.
* **Tanpa Boilerplate:** Lupakan _actions_, _reducers_, dan _dispatchers_ yang rumit. Cukup definisikan state dan fungsi untuk mengubahnya.
* **Fleksibel:** Bisa digunakan di luar komponen React dan mudah diintegrasikan dengan middleware.
* **Performa:** Hanya me-render ulang komponen yang benar-benar menggunakan state yang berubah, tanpa perlu selector yang rumit.

## Membuat Store Pertama Anda

Memulai dengan Zustand sangatlah mudah. Pertama, instal pustakanya melalui npm atau yarn.

```bash
# Menggunakan npm
npm install zustand

# Atau menggunakan yarn
yarn add zustand
```

Selanjutnya, buat file untuk store Anda, misalnya `store.js`. Di dalamnya, Anda hanya perlu memanggil fungsi `create` dari Zustand.

```jsx
import { create } from 'zustand'

const useBearStore = create((set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
}))

export default useBearStore;
```

## Menggunakan Store di Komponen React

Untuk menggunakan store di dalam komponen React, Anda cukup mengimpor custom hook yang telah Anda buat (`useBearStore`) dan memanggilnya seperti hook biasa.

```jsx
import React from 'react';
import useBearStore from './store';

function BearCounter() {
  const bears = useBearStore((state) => state.bears)
  return <h1>{bears} beruang di sekitar sini ...</h1>
}

function Controls() {
  const increasePopulation = useBearStore((state) => state.increasePopulation)
  return <button onClick={increasePopulation}>Tambah Beruang</button>
}
```

Seperti yang Anda lihat, kodenya sangat bersih dan intuitif. Tidak ada `connect`, tidak ada `mapStateToProps`, dan tidak ada `useDispatch`. Semuanya terasa alami dalam paradigma hooks React. Untuk informasi lebih lanjut, Anda bisa mengunjungi [dokumentasi resmi Zustand](https://github.com/pmndrs/zustand).
