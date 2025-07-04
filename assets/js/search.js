/**
 * search.js (Global Version with Pagination)
 * Mengelola pencarian, pemfilteran, pengurutan, dan paginasi.
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
  
  // --- Elemen Pencarian & Pemfilteran ---
  const desktopSearchForm = document.getElementById('desktop-search-form');
  const desktopSearchInput = document.getElementById('desktop-search-input');
  const mobileSearchForm = document.getElementById('mobile-search-form');
  const mobileSearchInput = document.getElementById('mobile-search-input');
  const postsContainer = document.getElementById('posts-container');
  const pageTitle = document.getElementById('page-title');
  const paginationContainer = document.getElementById('pagination-container');

  // --- Elemen Dropdown Kustom ---
  const typeFilterButton = document.getElementById('type-filter-button');
  const typeFilterMenu = document.getElementById('type-filter-menu');
  const categoryFilterButton = document.getElementById('category-filter-button');
  const categoryFilterMenu = document.getElementById('category-filter-menu');
  const sortFilterButton = document.getElementById('sort-filter-button');
  const sortFilterMenu = document.getElementById('sort-filter-menu');
  
  // --- Validasi Data & State ---
  if (typeof searchableData === 'undefined' || searchableData.length === 0) {
    console.error('Error: Variabel `searchableData` tidak ditemukan atau kosong.');
    if (postsContainer) postsContainer.innerHTML = '<p class="text-center text-red-400 col-span-full">Kesalahan: Data pencarian tidak dapat dimuat.</p>';
    return;
  }
  const allItems = searchableData;
  let selectedType = 'all';
  let selectedCategory = 'all';
  let currentSortCriteria = 'date-desc';
  let currentPage = 1;
  let itemsPerPage = 12; // Default, akan diupdate

  // --- Logika UI Header ---
  if (mobileMenuButton) mobileMenuButton.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
  if (desktopDropdownButton) {
    desktopDropdownButton.addEventListener('click', (e) => {
      e.stopPropagation();
      desktopDropdownMenu.classList.toggle('hidden');
    });
  }
  
  // --- FUNGSI BANTUAN ---
  const truncateWords = (text, numWords) => {
    if (!text) return '';
    const contentWithoutCodeblocks = text.replace(/```[\s\S]*?```/g, '');
    const words = contentWithoutCodeblocks.split(' ');
    if (words.length <= numWords) return contentWithoutCodeblocks;
    return words.slice(0, numWords).join(' ') + '...';
  };

  const getItemsPerPage = () => {
    // Tailwind sm breakpoint = 640px
    return window.innerWidth < 640 ? 5 : 12;
  };
  
  // FUNGSI UNTUK MENGISI DROPDOWN KUSTOM DENGAN STATUS AKTIF
  const populateCustomDropdown = (menuElement, options, currentSelection, onSelectCallback) => {
    menuElement.innerHTML = ''; // Kosongkan menu
    options.forEach(option => {
      const optionEl = document.createElement('a');
      optionEl.href = '#';
      if (option.value === currentSelection) {
        optionEl.className = 'block p-3 text-sm text-white bg-blue-600 rounded-lg';
      } else {
        optionEl.className = 'block p-3 text-sm text-white hover:bg-gray-700 rounded-lg';
      }
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
  
  // --- Logika Dropdown Kustom ---
  const setupDropdowns = () => {
    const allMenus = [typeFilterMenu, categoryFilterMenu, sortFilterMenu, desktopDropdownMenu];
    const closeAllMenus = () => allMenus.forEach(menu => menu && menu.classList.add('hidden'));
    window.addEventListener('click', () => closeAllMenus());

    const createToggle = (button, menu) => {
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

    repopulateAllDropdowns();
  };

  const repopulateAllDropdowns = () => {
    const typeOptions = [
      { value: 'all', label: 'Semua Jenis' }, { value: 'Postingan', label: 'Postingan' },
      { value: 'Proyek', label: 'Proyek' }, { value: 'Resource', label: 'Resource' }
    ];
    populateCustomDropdown(typeFilterMenu, typeOptions, selectedType, (value) => {
      selectedType = value;
      currentPage = 1; updateView();
    });

    const categories = new Set();
    allItems.forEach(item => {
      if (item.categories && Array.isArray(item.categories)) {
        item.categories.forEach(cat => cat && categories.add(cat));
      }
    });
    const categoryOptions = [{ value: 'all', label: 'Semua Kategori' }];
    Array.from(categories).sort().forEach(cat => categoryOptions.push({ value: cat, label: cat }));
    populateCustomDropdown(categoryFilterMenu, categoryOptions, selectedCategory, (value) => {
      selectedCategory = value;
      currentPage = 1; updateView();
    });

    const sortOptions = [
        { value: 'date-desc', label: 'Terbaru' }, { value: 'date-asc', label: 'Terlama' },
        { value: 'name-asc', label: 'Nama A-Z' }, { value: 'name-desc', label: 'Nama Z-A' }
    ];
    populateCustomDropdown(sortFilterMenu, sortOptions, currentSortCriteria, (value) => {
        currentSortCriteria = value;
        currentPage = 1; updateView();
    });
  };

  const createItemCardHTML = (item) => {
    // ... (Fungsi ini tidak berubah, tanggal sudah dihapus sebelumnya) ...
    const itemUrl = item.url || '#';
    const itemImage = item.image || 'https://placehold.co/600x400/111827/FFFFFF?text=Image+Not+Found';
    const itemCategory = (item.categories && item.categories[0]) ? item.categories[0].toUpperCase() : 'UNCATEGORIZED';
    const itemTitle = item.title || 'Tanpa Judul';
    const itemExcerpt = truncateWords(item.content, 20);
    const itemType = item.type || '';
    return '<div class="post-item bg-gray-800 rounded-2xl overflow-hidden h-full shadow-lg transition-all duration-300 border border-gray-700/80 hover:border-blue-500/50 hover:-translate-y-1"><a href="'+itemUrl+'" class="block group h-full flex flex-col"><div class="relative flex-shrink-0"><div class="absolute inset-0 shimmer"></div><img src="'+itemImage+'" alt="[Gambar] '+itemTitle+'" class="w-full h-48 object-cover opacity-0 transition-all duration-500 group-hover:scale-105" loading="lazy" onload="this.style.opacity=\'1\'; this.previousElementSibling.remove();"></div><div class="p-5 flex flex-col flex-grow"><div class="flex items-center space-x-2"><span class="text-xs font-semibold text-cyan-400">'+itemType.toUpperCase()+'</span><span class="text-gray-500">&bull;</span><span class="text-xs font-semibold text-blue-400">'+itemCategory+'</span></div><h3 class="mt-2 text-lg font-bold text-white transition-colors group-hover:text-blue-400 line-clamp-2 flex-grow">'+itemTitle+'</h3><p class="mt-2 text-gray-400 text-sm line-clamp-2">'+itemExcerpt+'</p></div></a></div>';
  };

  // FUNGSI BARU: Untuk membuat tombol paginasi
  const renderPagination = (totalItems) => {
    if (!paginationContainer) return;
    paginationContainer.innerHTML = '';
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) return;

    // Tombol "Sebelumnya"
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Sebelumnya';
    prevButton.className = 'px-4 py-2 rounded-lg ' + (currentPage === 1 ? 'text-gray-600 cursor-not-allowed' : 'text-white bg-gray-700 hover:bg-blue-600');
    if (currentPage === 1) prevButton.disabled = true;
    prevButton.addEventListener('click', () => {
        currentPage--;
        updateView();
    });
    paginationContainer.appendChild(prevButton);

    // Tombol "Berikutnya"
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Berikutnya';
    nextButton.className = 'px-4 py-2 rounded-lg ' + (currentPage === totalPages ? 'text-gray-600 cursor-not-allowed' : 'text-white bg-gray-700 hover:bg-blue-600');
    if (currentPage === totalPages) nextButton.disabled = true;
    nextButton.addEventListener('click', () => {
        currentPage++;
        updateView();
    });
    paginationContainer.appendChild(nextButton);
  };

  const updateView = () => {
    if (!postsContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = (urlParams.get('q') || '').toLowerCase().trim();
    
    let filteredItems = searchQuery 
      ? allItems.filter(item => {
          const title = (item.title || '').toLowerCase();
          const searchableContent = (item.content || '').replace(/```[\s\S]*?```/g, '').toLowerCase();
          return title.includes(searchQuery) || searchableContent.includes(searchQuery);
        })
      : allItems;

    if (selectedType !== 'all') {
      filteredItems = filteredItems.filter(item => item.type === selectedType);
    }
    if (selectedCategory !== 'all') {
      filteredItems = filteredItems.filter(item => item.categories && item.categories.includes(selectedCategory));
    }
    
    filteredItems.sort((a, b) => {
        switch (currentSortCriteria) {
            case 'date-asc': return new Date(a.date) - new Date(b.date);
            case 'name-asc': return a.title.localeCompare(b.title);
            case 'name-desc': return b.title.localeCompare(a.title);
            case 'date-desc': default: return new Date(b.date) - new Date(a.date);
        }
    });

    // Logika paginasi
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);

    postsContainer.innerHTML = '';
    if (paginatedItems.length > 0) {
      paginatedItems.forEach(item => {
        postsContainer.innerHTML += createItemCardHTML(item);
      });
    } else {
      postsContainer.innerHTML = `<p class="text-center text-gray-400 col-span-full">Tidak ada hasil yang ditemukan.</p>`;
    }
    
    if (pageTitle) {
        if (searchQuery) { pageTitle.textContent = `Hasil untuk "${urlParams.get('q')}"`; } 
        else { pageTitle.textContent = 'Jelajahi Semua Konten'; }
    }
    
    repopulateAllDropdowns();
    renderPagination(filteredItems.length);
  };
  
  // --- EVENT LISTENERS ---
  const handleSearch = (event) => {
      event.preventDefault();
      event.target.submit();
  };

  if (desktopSearchForm) desktopSearchForm.addEventListener('submit', handleSearch);
  if (mobileSearchForm) mobileSearchForm.addEventListener('submit', handleSearch);

  window.addEventListener('resize', () => {
    const newItemsPerPage = getItemsPerPage();
    if (newItemsPerPage !== itemsPerPage) {
        itemsPerPage = newItemsPerPage;
        currentPage = 1;
        updateView();
    }
  });

  // --- INISIALISASI ---
  const initializePage = () => {
      itemsPerPage = getItemsPerPage(); // Setel item per halaman saat pertama kali dimuat
      const urlParams = new URLSearchParams(window.location.search);
      const initialQuery = urlParams.get('q');
      if (initialQuery) {
          if(desktopSearchInput) desktopSearchInput.value = initialQuery;
          if(mobileSearchInput) mobileSearchInput.value = initialQuery;
      }
      
      setupDropdowns();
      updateView();
  };

  if (document.getElementById('search-page-marker')) {
    initializePage();
  }
});
