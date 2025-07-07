document.addEventListener('DOMContentLoaded', function () {

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
  
  const currentLang = window.location.pathname.includes('/en/') ? 'en' : 'id';
  const translations = {
    types: {
      all: { id: 'Semua Jenis', en: 'All Types' },
      artikel: { id: 'Artikel', en: 'Article' },
      bahan: { id: 'Bahan', en: 'Resource' },
      media: { id: 'Media', en: 'Media' }
    },
    categories: {
      all: { id: 'Semua Kategori', en: 'All Categories' }
    },
    sorts: {
      newest: { id: 'Terbaru', en: 'Newest' },
      oldest: { id: 'Terlama', en: 'Oldest' },
      nameAsc: { id: 'Nama A-Z', en: 'Name A-Z' },
      nameDesc: { id: 'Nama Z-A', en: 'Name Z-A' }
    },
    pageTitles: {
      resultsFor: { id: 'Hasil untuk', en: 'Results for' }
    },
    noResults: {
      message: { id: 'Tidak ada hasil yang ditemukan', en: 'No results found' },
      try: { id: 'Coba', en: 'Try' },
      clearFilterLink: { id: 'bersihkan filter', en: 'clearing the filters' },
      searchInSuggestion: { id: 'Atau, coba cari dalam', en: 'Or, try searching in' },
      otherLangName: { id: 'English', en: 'Bahasa Indonesia' }
    }
  };


  // --- State Management ---
  const allItems = searchableData;
  let selectedType = pageConfig.preselectedType || 'all';
  let selectedCategory = 'all';
  let currentSortCriteria = 'date-desc';

  // --- Fungsi-fungsi Inti Halaman Pencarian ---
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
      optionEl.className = (option.value === currentSelection) 
        ? 'block p-3 text-sm text-white bg-teal-600 rounded-lg' 
        : 'block p-3 text-sm text-white hover:bg-gray-700 rounded-lg';
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
    const allMenus = [typeFilterMenu, categoryFilterMenu, sortFilterMenu];
    const closeAllMenus = () => allMenus.forEach(menu => menu && menu.classList.add('hidden'));
    
    window.addEventListener('click', () => closeAllMenus());

    const createToggle = (button, menu) => {
      if (!button || !menu) return;
      
      menu.classList.add('z-20');

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
    // Dropdown Tipe
    const typeToUrlMap = { 
      'all': `/${currentLang}/all/`, 
      'Artikel': `/${currentLang}/articles/`, 
      'Bahan': `/${currentLang}/resources/`, 
      'Media': `/${currentLang}/media/` 
    };
    const typeOptions = [ 
      { value: 'all', label: translations.types.all[currentLang] }, 
      { value: 'Artikel', label: translations.types.artikel[currentLang] }, 
      { value: 'Bahan', label: translations.types.bahan[currentLang] }, 
      { value: 'Media', label: translations.types.media[currentLang] }
    ];
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

    // Dropdown Kategori
    const categories = new Set();
    allItems.forEach(item => {
      if (Array.isArray(item.categories)) {
        item.categories.forEach(cat => cat && categories.add(cat));
      }
    });
    const categoryOptions = [{ value: 'all', label: translations.categories.all[currentLang] }];
    Array.from(categories).sort().forEach(cat => categoryOptions.push({ value: cat, label: cat }));
    populateCustomDropdown(categoryFilterMenu, categoryOptions, selectedCategory, (value) => {
      selectedCategory = value;
      updateView();
    });

    // Dropdown Urutan
    const sortOptions = [ 
      { value: 'date-desc', label: translations.sorts.newest[currentLang] }, 
      { value: 'date-asc', label: translations.sorts.oldest[currentLang] }, 
      { value: 'name-asc', label: translations.sorts.nameAsc[currentLang] }, 
      { value: 'name-desc', label: translations.sorts.nameDesc[currentLang] }
    ];
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
    
    let mediaIconHTML = '';
    if (itemType === 'Media') {
      mediaIconHTML = `
        <div class="absolute top-2 right-2 bg-black/50 p-1.5 rounded-lg z-15 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#ffffff" viewBox="0 0 256 256"><path d="M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z"></path></svg>
        </div>
      `;
    }
    
    return `
      <div class="post-item bg-gray-800 rounded-2xl overflow-hidden h-full shadow-lg transition-all duration-300 border border-gray-700/80 hover:border-teal-500/50 hover:-translate-y-1">
        <a href="${itemUrl}" class="block group h-full flex flex-col">
          <div class="relative flex-shrink-0 h-48 bg-gray-900">
            <div class="absolute inset-0 shimmer z-5"></div>
            <img src="${itemImage}" alt="[Gambar] ${itemTitle}" class="absolute inset-0 w-full h-full object-cover opacity-0 transition-all duration-500 z-10" loading="lazy" onload="this.style.opacity='1'; const shimmer = this.parentElement.querySelector('.shimmer'); if (shimmer) shimmer.remove();">
            ${mediaIconHTML}
          </div>
          <div class="p-5 flex flex-col flex-grow">
            <div class="flex items-center space-x-2">
              <span class="text-xs font-semibold text-cyan-400">${itemType.toUpperCase()}</span>
              <span class="text-gray-500">&bull;</span>
              <span class="text-xs font-semibold text-teal-400">${itemCategory}</span>
            </div>
            <h3 class="mt-2 text-lg font-bold text-white transition-colors group-hover:text-teal-400 line-clamp-2 flex-grow">${itemTitle}</h3>
            <p class="mt-2 text-gray-400 text-sm line-clamp-2">${itemExcerpt}</p>
          </div>
        </a>
      </div>`;
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
      // [MODIFIKASI] Logika baru untuk pesan "Tidak ada hasil" dengan gaya yang lebih rapi.
      const otherLang = currentLang === 'id' ? 'en' : 'id';
      const otherLangName = currentLang === 'id' ? translations.noResults.otherLangName.id : translations.noResults.otherLangName.en;
      
      const newPath = window.location.pathname.replace(`/${currentLang}/`, `/${otherLang}/`);
      const alternateUrl = newPath + window.location.search;
      
      const areFiltersActive = selectedType !== 'all' || selectedCategory !== 'all';
      
      let clearFilterHTML = '';
      if (areFiltersActive) {
        const clearFilterBasePath = `/${currentLang}/all/`;
        const clearFilterUrl = searchQuery ? `${clearFilterBasePath}?q=${encodeURIComponent(searchQuery)}` : clearFilterBasePath;
        clearFilterHTML = `
          <p class="text-sm text-gray-400">
            ${translations.noResults.try[currentLang]} <a href="${clearFilterUrl}" class="text-teal-400 hover:underline font-medium">${translations.noResults.clearFilterLink[currentLang]}</a>.
          </p>
        `;
      }

      let searchOtherLangHTML = '';
      if (searchQuery) {
        searchOtherLangHTML = `
          <p class="text-sm text-gray-400">
            ${translations.noResults.searchInSuggestion[currentLang]} <a href="${alternateUrl}" class="text-teal-400 hover:underline font-medium">${otherLangName}</a>.
          </p>
        `;
      }

      postsContainer.innerHTML = `
        <div class="text-center col-span-full flex flex-col items-center justify-center space-y-3 py-10">
          <h4 class="text-lg font-semibold text-white">${translations.noResults.message[currentLang]}</h4>
          ${clearFilterHTML}
          ${searchOtherLangHTML}
        </div>
      `;
    }
        
    if (pageTitle) {
      pageTitle.textContent = searchQuery
        ? `${translations.pageTitles.resultsFor[currentLang]} "${searchQuery}"`
        : pageConfig.defaultTitle;
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
    if (initialCategory) {
        selectedCategory = initialCategory;
    }
    
    setupDropdowns();

    // Beri sedikit waktu agar browser bisa merender skeleton sebelum proses berat dimulai
    setTimeout(() => {
        updateView();
    }, 10);
  };

  // Mulai!
  initializePage();
});
