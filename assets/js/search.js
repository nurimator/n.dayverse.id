/**
 * search.js (Global Version - Multi-language)
 * - Menambahkan logika untuk tombol pengganti bahasa di header.
 * - Memberikan saran pencarian dalam bahasa lain jika tidak ada hasil.
 */
document.addEventListener('DOMContentLoaded', function () {

  // --- Elemen-elemen UI ---
  const headerMainContent = document.getElementById('header-main-content');
  const mobileSearchView = document.getElementById('mobile-search-view');
  const mobileSearchOpenButton = document.getElementById('mobile-search-open-button');
  const mobileSearchCloseButton = document.getElementById('mobile-search-close-button');
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  const desktopDropdownButton = document.getElementById('desktop-dropdown-button');
  const desktopDropdownMenu = document.getElementById('desktop-dropdown-menu');
  
  const desktopSearchForm = document.getElementById('desktop-search-form');
  const mobileSearchForm = document.getElementById('mobile-search-form');

  // --- Elemen Pengganti Bahasa ---
  const langSwitcherButton = document.getElementById('desktop-lang-switcher-button');
  const langSwitcherMenu = document.getElementById('desktop-lang-switcher-menu');
  const currentLangDisplay = document.getElementById('current-lang-display');
  
  // --- Logika UI Header (Berjalan di semua halaman) ---
  if (mobileMenuButton) mobileMenuButton.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
  if (desktopDropdownButton) {
    desktopDropdownButton.addEventListener('click', (e) => {
      e.stopPropagation();
      desktopDropdownMenu.classList.toggle('hidden');
    });
  }
  if (mobileSearchOpenButton) {
    mobileSearchOpenButton.addEventListener('click', () => {
      if (headerMainContent) headerMainContent.classList.add('hidden');
      if (mobileSearchView) {
        mobileSearchView.classList.remove('hidden');
        mobileSearchView.classList.add('flex');
      }
      if (mobileSearchInput) mobileSearchInput.focus();
    });
  }
  if (mobileSearchCloseButton) {
    mobileSearchCloseButton.addEventListener('click', () => {
      if (headerMainContent) headerMainContent.classList.remove('hidden');
      if (mobileSearchView) {
        mobileSearchView.classList.add('hidden');
        mobileSearchView.classList.remove('flex');
      }
    });
  }

  // --- Fungsi untuk menangani penggantian bahasa ---
  const setupLanguageSwitcher = () => {
    const desktopSwitcherButton = document.getElementById('desktop-lang-switcher-button');
    const desktopSwitcherMenu = document.getElementById('desktop-lang-switcher-menu');
    const currentLangDisplay = document.getElementById('current-lang-display');
    const mobileSwitcherButton = document.getElementById('mobile-lang-switcher-button');
    const mobileSwitcherMenu = document.getElementById('mobile-lang-switcher-menu');

    const path = window.location.pathname;
    const currentLang = path.includes('/en/') ? 'en' : 'id';
    if (currentLangDisplay) currentLangDisplay.textContent = currentLang.toUpperCase();

    if (desktopSwitcherButton) {
      desktopSwitcherButton.addEventListener('click', (e) => {
        e.stopPropagation();
        if (desktopSwitcherMenu) desktopSwitcherMenu.classList.toggle('hidden');
      });
    }
    if (mobileSwitcherButton) {
      mobileSwitcherButton.addEventListener('click', (e) => {
        e.stopPropagation();
        if (mobileSwitcherMenu) mobileSwitcherMenu.classList.toggle('hidden');
      });
    }

    const langLinks = document.querySelectorAll('.lang-option');
    if (typeof postMeta !== 'undefined' && typeof allSitePosts !== 'undefined') {
      // --- Logika untuk Halaman Postingan Tunggal ---
      langLinks.forEach(link => {
        const targetLang = link.dataset.lang;
        if (targetLang === currentLang) {
          link.classList.add('opacity-50', 'cursor-default');
          link.addEventListener('click', e => e.preventDefault());
          return;
        }
        // PERUBAHAN: Menggunakan page_id
        const alternatePost = allSitePosts.find(p => String(p.page_id) === String(postMeta.page_id) && p.lang === targetLang);
        if (alternatePost && alternatePost.url) {
          link.href = alternatePost.url;
        } else {
          link.href = '#';
          link.classList.add('opacity-50', 'cursor-default');
          link.title = 'Terjemahan tidak tersedia';
          link.addEventListener('click', e => e.preventDefault());
        }
      });
    } else {
      // --- Logika untuk Halaman Daftar ---
      langLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetLang = link.dataset.lang;
          if (targetLang === currentLang) return;
          let newPath = path.startsWith(`/${currentLang}/`) ? path.replace(`/${currentLang}/`, `/${targetLang}/`) : `/${targetLang}${path}`;
          window.location.href = newPath + window.location.search;
        });
      });
    }
  };

  // Panggil fungsi bahasa di semua halaman
  setupLanguageSwitcher();

  // --- Logika Pencarian (Hanya berjalan di halaman pencarian) ---
  if (!document.getElementById('search-page-marker')) return;

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

  // --- Validasi Data & State ---
  if (typeof searchableData === 'undefined' || typeof pageConfig === 'undefined') {
    console.error('Error: Variabel `searchableData` atau `pageConfig` tidak ditemukan.');
    if (postsContainer) postsContainer.innerHTML = '<p class="text-center text-red-400 col-span-full">Kesalahan konfigurasi halaman.</p>';
    return;
  }

  const allItems = searchableData;
  let selectedType = pageConfig.preselectedType || 'all';
  let selectedCategory = 'all';
  let currentSortCriteria = 'date-desc';

  // --- Fungsi-fungsi Inti ---
  const truncateWords = (text, numWords) => {
    if (!text) return '';
    const contentWithoutCodeblocks = text.replace(/```[\s\S]*?```/g, '');
    const words = contentWithoutCodeblocks.split(' ');
    if (words.length <= numWords) return contentWithoutCodeblocks;
    return words.slice(0, numWords).join(' ') + '...';
  };

  const populateCustomDropdown = (menuElement, options, currentSelection, onSelectCallback) => {
    if (!menuElement) return;
    menuElement.innerHTML = '';
    options.forEach(option => {
      const optionEl = document.createElement('a');
      optionEl.href = '#';
      optionEl.className = (option.value === currentSelection) ? 'block p-3 text-sm text-white bg-blue-600 rounded-lg' : 'block p-3 text-sm text-white hover:bg-gray-700 rounded-lg';
      optionEl.textContent = option.label;
      optionEl.dataset.value = option.value;
      optionEl.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        onSelectCallback(option.value);
        menuElement.classList.add('hidden');
      });
      menuElement.appendChild(optionEl);
    });
  };

  const setupDropdowns = () => {
    const allMenus = [typeFilterMenu, categoryFilterMenu, sortFilterMenu, document.getElementById('desktop-dropdown-menu'), document.getElementById('desktop-lang-switcher-menu'), document.getElementById('mobile-lang-switcher-menu')];
    const closeAllMenus = () => allMenus.forEach(menu => menu && menu.classList.add('hidden'));
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

  const repopulateAllDropdowns = () => {
    // PERUBAHAN: Menggunakan /id/all/
    const typeToUrlMap = { 'all': '/id/all/', 'Artikel': '/id/articles/', 'Bahan': '/id/resources/', 'Media': '/id/media/' };
    const typeOptions = [ { value: 'all', label: 'Semua Jenis' }, { value: 'Artikel', label: 'Artikel' }, { value: 'Bahan', label: 'Bahan' }, { value: 'Media', label: 'Media' }];
    populateCustomDropdown(typeFilterMenu, typeOptions, selectedType, (value) => {
      const targetPath = typeToUrlMap[value];
      if (!targetPath) return;
      const urlParams = new URLSearchParams(window.location.search);
      const searchQuery = urlParams.get('q');
      const newParams = new URLSearchParams();
      if (searchQuery) newParams.set('q', searchQuery);
      if (selectedCategory !== 'all') newParams.set('category', selectedCategory);
      const queryString = newParams.toString();
      window.location.href = targetPath + (queryString ? '?' + queryString : '');
    });

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
      updateView();
    });

    const sortOptions = [ { value: 'date-desc', label: 'Terbaru' }, { value: 'date-asc', label: 'Terlama' }, { value: 'name-asc', label: 'Nama A-Z' }, { value: 'name-desc', label: 'Nama Z-A' }];
    populateCustomDropdown(sortFilterMenu, sortOptions, currentSortCriteria, (value) => {
      currentSortCriteria = value;
      updateView();
    });
  };

  const createItemCardHTML = (item) => {
    const itemUrl = item.url || '#';
    const itemImage = item.image || 'https://placehold.co/600x400/111827/FFFFFF?text=Image+Not+Found';
    const itemCategory = (Array.isArray(item.categories) && item.categories[0]) ? item.categories[0].toUpperCase() : 'UNCATEGORIZED';
    const itemTitle = item.title || 'Tanpa Judul';
    const itemExcerpt = truncateWords(item.content, 20);
    const itemType = item.type || '';
    return '<div class="post-item bg-gray-800 rounded-2xl overflow-hidden h-full shadow-lg transition-all duration-300 border border-gray-700/80 hover:border-blue-500/50 hover:-translate-y-1"><a href="'+itemUrl+'" class="block group h-full flex flex-col"><div class="relative flex-shrink-0"><div class="absolute inset-0 shimmer"></div><img src="'+itemImage+'" alt="[Gambar] '+itemTitle+'" class="w-full h-48 object-cover opacity-0 transition-all duration-500 group-hover:scale-105" loading="lazy" onload="this.style.opacity=\'1\'; this.previousElementSibling.remove();"></div><div class="p-5 flex flex-col flex-grow"><div class="flex items-center space-x-2"><span class="text-xs font-semibold text-cyan-400">'+itemType.toUpperCase()+'</span><span class="text-gray-500">&bull;</span><span class="text-xs font-semibold text-blue-400">'+itemCategory+'</span></div><h3 class="mt-2 text-lg font-bold text-white transition-colors group-hover:text-blue-400 line-clamp-2 flex-grow">'+itemTitle+'</h3><p class="mt-2 text-gray-400 text-sm line-clamp-2">'+itemExcerpt+'</p></div></a></div>';
  };

  const updateView = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = (urlParams.get('q') || '').toLowerCase().trim();
    let filteredItems = allItems.filter(item => {
      if (selectedType !== 'all' && item.type !== selectedType) return false;
      if (selectedCategory !== 'all' && (!Array.isArray(item.categories) || !item.categories.includes(selectedCategory))) return false;
      if (searchQuery) {
        const title = (item.title || '').toLowerCase();
        const content = (item.content || '').replace(/```[\s\S]*?```/g, '').toLowerCase();
        return title.includes(searchQuery) || content.includes(searchQuery);
      }
      return true;
    });

    filteredItems.sort((a, b) => {
      switch (currentSortCriteria) {
        case 'date-asc': return new Date(a.date) - new Date(b.date);
        case 'name-asc': return a.title.localeCompare(b.title);
        case 'name-desc': return b.title.localeCompare(a.title);
        case 'date-desc': default: return new Date(b.date) - new Date(a.date);
      }
    });

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
    
    if (pageTitle) {
      pageTitle.textContent = searchQuery ? `Hasil untuk "${searchQuery}"` : pageConfig.defaultTitle;
    }
    
    repopulateAllDropdowns();
  };
  
  const initializePage = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('q');
    const initialCategory = urlParams.get('category');
    if (initialQuery) {
      if (desktopSearchInput) desktopSearchInput.value = initialQuery;
      if (mobileSearchInput) mobileSearchInput.value = initialQuery;
    }
    if (initialCategory) selectedCategory = initialCategory;
    setupDropdowns();
    updateView();
  };

  initializePage();
});
