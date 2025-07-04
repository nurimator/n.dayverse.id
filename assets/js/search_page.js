/**
 * search-page.js
 * * Berisi semua skrip yang hanya berjalan di halaman pencarian/daftar.
 * - Memfilter, menyortir, dan merender daftar item.
 * - Mengelola state filter (jenis, kategori, urutan).
 * - Membuat kartu item secara dinamis.
 * - Tergantung pada variabel global `searchableData` dan `pageConfig` yang harus 
 * didefinisikan di HTML sebelum skrip ini dimuat.
 */
document.addEventListener('DOMContentLoaded', function () {

  // Berhenti menjalankan skrip jika ini bukan halaman pencarian/daftar.
  if (!document.getElementById('search-page-marker')) {
    return;
  }

  // --- Elemen-elemen khusus halaman pencarian ---
  const postsContainer = document.getElementById('posts-container');
  const pageTitle = document.getElementById('page-title');
  const typeFilterButton = document.getElementById('type-filter-button');
  const typeFilterMenu = document.getElementById('type-filter-menu');
  const categoryFilterButton = document.getElementById('category-filter-button');
  const categoryFilterMenu = document.getElementById('category-filter-menu');
  const sortFilterButton = document.getElementById('sort-filter-button');
  const sortFilterMenu = document.getElementById('sort-filter-menu');
  const desktopSearchInput = document.getElementById('desktop-search-input');
  const mobileSearchInput = document.getElementById('mobile-search-input');

  // Validasi Data & State
  if (typeof searchableData === 'undefined' || typeof pageConfig === 'undefined') {
    console.error('Error: Variabel `searchableData` atau `pageConfig` tidak ditemukan.');
    if (postsContainer) postsContainer.innerHTML = '<p class="text-center text-red-400 col-span-full">Kesalahan konfigurasi halaman.</p>';
    return;
  }

  // --- State Management ---
  const allItems = searchableData;
  let selectedType = pageConfig.preselectedType || 'all';
  let selectedCategory = 'all';
  let currentSortCriteria = 'date-desc';

  // --- Fungsi-fungsi Inti Halaman Pencarian ---

  /**
   * Memotong teks berdasarkan jumlah kata.
   * @param {string} text - Teks input.
   * @param {number} numWords - Jumlah kata maksimum.
   * @returns {string} Teks yang sudah dipotong.
   */
  const truncateWords = (text, numWords) => {
    if (!text) return '';
    const contentWithoutCodeblocks = text.replace(/```[\s\S]*?```/g, ''); // Hapus blok kode
    const words = contentWithoutCodeblocks.split(' ');
    if (words.length <= numWords) return contentWithoutCodeblocks;
    return words.slice(0, numWords).join(' ') + '...';
  };

  /**
   * Mengisi menu dropdown kustom dengan opsi.
   * @param {HTMLElement} menuElement - Elemen menu.
   * @param {Array<Object>} options - Opsi untuk ditampilkan.
   * @param {string} currentSelection - Opsi yang sedang dipilih.
   * @param {Function} onSelectCallback - Fungsi yang dipanggil saat opsi dipilih.
   */
  const populateCustomDropdown = (menuElement, options, currentSelection, onSelectCallback) => {
    if (!menuElement) return;
    menuElement.innerHTML = '';
    options.forEach(option => {
      const optionEl = document.createElement('a');
      optionEl.href = '#';
      optionEl.className = (option.value === currentSelection) 
        ? 'block p-3 text-sm text-white bg-blue-600 rounded-lg' 
        : 'block p-3 text-sm text-white hover:bg-gray-700 rounded-lg';
      optionEl.textContent = option.label;
      optionEl.dataset.value = option.value;
      optionEl.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        onSelectCallback(option.value);
        menuElement.classList.add('hidden');
      });
      menuElement.appendChild(optionEl);
    });
  };

  /**
   * Mengatur perilaku buka/tutup untuk semua dropdown filter.
   */
  const setupDropdowns = () => {
    const allMenus = [typeFilterMenu, categoryFilterMenu, sortFilterMenu];
    const closeAllMenus = () => allMenus.forEach(menu => menu && menu.classList.add('hidden'));
    
    // Menutup menu saat mengklik di luar (event ini mungkin sudah ada di global.js,
    // namun aman untuk menambahkannya di sini untuk memastikan fungsionalitas)
    window.addEventListener('click', () => closeAllMenus());

    const createToggle = (button, menu) => {
      if (!button || !menu) return;
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = menu.classList.contains('hidden');
        closeAllMenus();
        if (isHidden) menu.classList.remove('hidden');
      });
    };

    createToggle(typeFilterButton, typeFilterMenu);
    createToggle(categoryFilterButton, categoryFilterMenu);
    createToggle(sortFilterButton, sortFilterMenu);
  };

  /**
   * Mengisi ulang semua dropdown dengan data dan pilihan terbaru.
   */
  const repopulateAllDropdowns = () => {
    const currentLang = window.location.pathname.includes('/en/') ? 'en' : 'id';
    const typeToUrlMap = { 
      'all': `/${currentLang}/all/`, 
      'Artikel': `/${currentLang}/articles/`, 
      'Bahan': `/${currentLang}/resources/`, 
      'Media': `/${currentLang}/media/` 
    };
    const typeOptions = [ { value: 'all', label: 'Semua Jenis' }, { value: 'Artikel', label: 'Artikel' }, { value: 'Bahan', label: 'Bahan' }, { value: 'Media', label: 'Media' }];
    populateCustomDropdown(typeFilterMenu, typeOptions, selectedType, (value) => {
      const targetPath = typeToUrlMap[value];
      if (!targetPath) return;
      
      // Pertahankan parameter URL yang ada (q, category) saat berganti halaman
      const urlParams = new URLSearchParams(window.location.search);
      const searchQuery = urlParams.get('q');
      const newParams = new URLSearchParams();
      if (searchQuery) newParams.set('q', searchQuery);
      if (selectedCategory !== 'all') newParams.set('category', selectedCategory);
      
      const queryString = newParams.toString();
      window.location.href = targetPath + (queryString ? '?' + queryString : '');
    });

    // Ambil semua kategori unik dari data
    const categories = new Set();
    allItems.forEach(item => {
      if (Array.isArray(item.categories)) {
        item.categories.forEach(cat => cat && categories.add(cat));
      }
    });
    const categoryOptions = [{ value: 'all', label: 'Semua Kategori' }];
    Array.from(categories).sort().forEach(cat => categoryOptions.push({ value: cat, label: cat }));
    populateCustomDropdown(categoryFilterMenu, categoryOptions, selectedCategory, (value) => {
      selectedCategory = value;
      updateView(); // Hanya perbarui tampilan, tidak perlu pindah halaman
    });

    const sortOptions = [ { value: 'date-desc', label: 'Terbaru' }, { value: 'date-asc', label: 'Terlama' }, { value: 'name-asc', label: 'Nama A-Z' }, { value: 'name-desc', label: 'Nama Z-A' }];
    populateCustomDropdown(sortFilterMenu, sortOptions, currentSortCriteria, (value) => {
      currentSortCriteria = value;
      updateView(); // Hanya perbarui tampilan
    });
  };

  /**
   * Membuat string HTML untuk satu kartu item.
   * @param {Object} item - Objek data item.
   * @returns {string} String HTML.
   */
  const createItemCardHTML = (item) => {
    const itemUrl = item.url || '#';
    const itemImage = item.image || 'https://placehold.co/600x400/111827/FFFFFF?text=Image+Not+Found';
    const itemCategory = (Array.isArray(item.categories) && item.categories[0]) ? item.categories[0].toUpperCase() : 'UNCATEGORIZED';
    const itemTitle = item.title || 'Tanpa Judul';
    const itemExcerpt = truncateWords(item.content, 20);
    const itemType = item.type || '';
    
    return `
      <div class="post-item bg-gray-800 rounded-2xl overflow-hidden h-full shadow-lg transition-all duration-300 border border-gray-700/80 hover:border-blue-500/50 hover:-translate-y-1">
        <a href="${itemUrl}" class="block group h-full flex flex-col">
          <div class="relative flex-shrink-0">
            <div class="absolute inset-0 shimmer"></div>
            <img src="${itemImage}" alt="[Gambar] ${itemTitle}" class="w-full h-48 object-cover opacity-0 transition-all duration-500 group-hover:scale-105" loading="lazy" onload="this.style.opacity='1'; this.previousElementSibling.remove();">
          </div>
          <div class="p-5 flex flex-col flex-grow">
            <div class="flex items-center space-x-2">
              <span class="text-xs font-semibold text-cyan-400">${itemType.toUpperCase()}</span>
              <span class="text-gray-500">&bull;</span>
              <span class="text-xs font-semibold text-blue-400">${itemCategory}</span>
            </div>
            <h3 class="mt-2 text-lg font-bold text-white transition-colors group-hover:text-blue-400 line-clamp-2 flex-grow">${itemTitle}</h3>
            <p class="mt-2 text-gray-400 text-sm line-clamp-2">${itemExcerpt}</p>
          </div>
        </a>
      </div>`;
  };

  /**
   * Fungsi utama untuk memfilter, menyortir, dan memperbarui DOM dengan hasil.
   */
  const updateView = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = (urlParams.get('q') || '').toLowerCase().trim();

    // 1. Filter
    let filteredItems = allItems.filter(item => {
      // Filter berdasarkan tipe
      if (selectedType !== 'all' && item.type !== selectedType) return false;
      // Filter berdasarkan kategori
      if (selectedCategory !== 'all' && (!Array.isArray(item.categories) || !item.categories.includes(selectedCategory))) return false;
      // Filter berdasarkan query pencarian
      if (searchQuery) {
        const title = (item.title || '').toLowerCase();
        const content = (item.content || '').replace(/```[\s\S]*?```/g, '').toLowerCase();
        return title.includes(searchQuery) || content.includes(searchQuery);
      }
      return true;
    });

    // 2. Sort
    filteredItems.sort((a, b) => {
      switch (currentSortCriteria) {
        case 'date-asc': return new Date(a.date) - new Date(b.date);
        case 'name-asc': return a.title.localeCompare(b.title);
        case 'name-desc': return b.title.localeCompare(a.title);
        case 'date-desc': default: return new Date(b.date) - new Date(a.date);
      }
    });

    // 3. Render
    postsContainer.innerHTML = '';
    if (filteredItems.length > 0) {
      filteredItems.forEach(item => { postsContainer.innerHTML += createItemCardHTML(item); });
    } else {
      const currentLang = window.location.pathname.includes('/en/') ? 'en' : 'id';
      const otherLang = currentLang === 'id' ? 'en' : 'id';
      const otherLangName = currentLang === 'id' ? 'English' : 'Bahasa Indonesia';
      const newPath = window.location.pathname.replace(`/${currentLang}/`, `/${otherLang}/`);
      const alternateUrl = newPath + window.location.search;
      let suggestionHtml = searchQuery ? `<p class="mt-4 text-sm text-gray-400">Atau, coba cari dalam <a href="${alternateUrl}" class="text-blue-400 hover:underline">${otherLangName}</a>.</p>` : '';
      postsContainer.innerHTML = `<div class="text-center text-gray-400 col-span-full"><p>Tidak ada hasil yang ditemukan.</p>${suggestionHtml}</div>`;
    }
    
    // Perbarui judul halaman
    if (pageTitle) {
      pageTitle.textContent = searchQuery ? `Hasil untuk "${searchQuery}"` : pageConfig.defaultTitle;
    }
    
    // Perbarui state dropdown
    repopulateAllDropdowns();
  };
  
  /**
   * Inisialisasi halaman dengan mengambil parameter dari URL.
   */
  const initializePage = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('q');
    const initialCategory = urlParams.get('category');
    
    if (initialQuery) {
      if (desktopSearchInput) desktopSearchInput.value = initialQuery;
      if (mobileSearchInput) mobileSearchInput.value = initialQuery;
    }
    if (initialCategory) {
        selectedCategory = initialCategory;
    }
    
    setupDropdowns();
    updateView();
  };

  // Mulai!
  initializePage();
});
