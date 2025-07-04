/**
 * search.js (Global Version with Custom Dropdowns)
 * Mengelola pencarian, pemfilteran, dan pengurutan dengan dropdown kustom.
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
  const desktopDropdownContainer = document.getElementById('desktop-dropdown-container');
  
  // --- Elemen Pencarian & Pemfilteran ---
  const desktopSearchForm = document.getElementById('desktop-search-form');
  const desktopSearchInput = document.getElementById('desktop-search-input');
  const mobileSearchForm = document.getElementById('mobile-search-form');
  const mobileSearchInput = document.getElementById('mobile-search-input');
  const sortNewestBtn = document.getElementById('sort-newest');
  const sortOldestBtn = document.getElementById('sort-oldest');
  const postsContainer = document.getElementById('posts-container');
  const pageTitle = document.getElementById('page-title');

  // --- Elemen Dropdown Kustom ---
  const typeFilterContainer = document.getElementById('type-filter-container');
  const typeFilterButton = document.getElementById('type-filter-button');
  const typeFilterLabel = document.getElementById('type-filter-label');
  const typeFilterMenu = document.getElementById('type-filter-menu');

  const categoryFilterContainer = document.getElementById('category-filter-container');
  const categoryFilterButton = document.getElementById('category-filter-button');
  const categoryFilterLabel = document.getElementById('category-filter-label');
  const categoryFilterMenu = document.getElementById('category-filter-menu');
  
  // --- Validasi Data & State ---
  if (typeof searchableData === 'undefined' || searchableData.length === 0) {
    console.error('Error: Variabel `searchableData` tidak ditemukan atau kosong.');
    if (postsContainer) postsContainer.innerHTML = '<p class="text-center text-red-400 col-span-full">Kesalahan: Data pencarian tidak dapat dimuat.</p>';
    return;
  }
  const allItems = searchableData;
  let currentSortDirection = 'desc';
  let selectedType = 'all';
  let selectedCategory = 'all';

  // --- Logika UI Header (tidak berubah) ---
  if (mobileMenuButton) mobileMenuButton.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
  if (desktopDropdownButton) {
    desktopDropdownButton.addEventListener('click', (event) => {
      event.stopPropagation();
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };
  
  // FUNGSI UNTUK MENGISI DROPDOWN KUSTOM
  const populateCustomDropdown = (menuElement, options, currentSelection, onSelectCallback) => {
    menuElement.innerHTML = ''; // Kosongkan menu
    options.forEach(option => {
      const optionEl = document.createElement('a');
      optionEl.href = '#';
      optionEl.className = 'block p-3 text-sm text-white hover:bg-gray-700 rounded-lg';
      optionEl.textContent = option.label;
      optionEl.dataset.value = option.value;

      optionEl.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        onSelectCallback(option.value, option.label);
        menuElement.classList.add('hidden');
      });
      menuElement.appendChild(optionEl);
    });
  };
  
  // --- Logika Dropdown Kustom ---
  const setupDropdowns = () => {
    // Tutup semua dropdown jika klik di luar
    window.addEventListener('click', () => {
      typeFilterMenu.classList.add('hidden');
      categoryFilterMenu.classList.add('hidden');
      if (desktopDropdownMenu) desktopDropdownMenu.classList.add('hidden');
    });

    // Toggle Dropdown Jenis
    typeFilterButton.addEventListener('click', (e) => {
      e.stopPropagation();
      typeFilterMenu.classList.toggle('hidden');
      categoryFilterMenu.classList.add('hidden'); // Tutup yang lain
    });

    // Toggle Dropdown Kategori
    categoryFilterButton.addEventListener('click', (e) => {
      e.stopPropagation();
      categoryFilterMenu.classList.toggle('hidden');
      typeFilterMenu.classList.add('hidden'); // Tutup yang lain
    });

    // Isi Dropdown Jenis (statis)
    const typeOptions = [
      { value: 'all', label: 'Semua Jenis' },
      { value: 'Postingan', label: 'Postingan' },
      { value: 'Proyek', label: 'Proyek' },
      { value: 'Resource', label: 'Resource' }
    ];
    populateCustomDropdown(typeFilterMenu, typeOptions, selectedType, (value, label) => {
      selectedType = value;
      typeFilterLabel.textContent = label;
      updateView();
    });

    // Isi Dropdown Kategori (dinamis)
    const categories = new Set();
    allItems.forEach(item => {
      if (item.categories && Array.isArray(item.categories)) {
        item.categories.forEach(cat => cat && categories.add(cat));
      }
    });
    const categoryOptions = [{ value: 'all', label: 'Semua Kategori' }];
    Array.from(categories).sort().forEach(cat => categoryOptions.push({ value: cat, label: cat }));
    
    populateCustomDropdown(categoryFilterMenu, categoryOptions, selectedCategory, (value, label) => {
      selectedCategory = value;
      categoryFilterLabel.textContent = label;
      updateView();
    });
  };

  const updateFilterStyles = () => {
    // Gaya untuk Filter Jenis
    if (selectedType !== 'all') {
        typeFilterButton.classList.add('bg-blue-600', 'text-white');
        typeFilterButton.classList.remove('bg-gray-700', 'text-gray-300');
    } else {
        typeFilterButton.classList.add('bg-gray-700', 'text-gray-300');
        typeFilterButton.classList.remove('bg-blue-600', 'text-white');
    }

    // Gaya untuk Filter Kategori
    if (selectedCategory !== 'all') {
        categoryFilterButton.classList.add('bg-blue-600', 'text-white');
        categoryFilterButton.classList.remove('bg-gray-700', 'text-gray-300');
    } else {
        categoryFilterButton.classList.add('bg-gray-700', 'text-gray-300');
        categoryFilterButton.classList.remove('bg-blue-600', 'text-white');
    }
  };

  const createItemCardHTML = (item) => {
    // ... (Fungsi ini tidak berubah dari versi sebelumnya) ...
    try {
      const itemUrl = item.url || '#';
      const itemImage = item.image || 'https://placehold.co/600x400/111827/FFFFFF?text=Image+Not+Found';
      const itemCategory = (item.categories && item.categories[0]) ? item.categories[0].toUpperCase() : 'UNCATEGORIZED';
      const itemTitle = item.title || 'Tanpa Judul';
      const itemExcerpt = truncateWords(item.content, 20);
      const itemDate = item.date ? new Date(item.date).toISOString() : '';
      const formattedDate = formatDate(item.date);
      const itemType = item.type || '';

      var cardHtml = 
        '<div class="post-item bg-gray-800 rounded-2xl overflow-hidden h-full shadow-lg transition-all duration-300 border border-gray-700/80 hover:border-blue-500/50 hover:-translate-y-1">' +
          '<a href="' + itemUrl + '" class="block group h-full flex flex-col">' +
            '<div class="relative flex-shrink-0">' +
              '<div class="absolute inset-0 shimmer"></div>' +
              '<img src="' + itemImage + '" alt="[Gambar] ' + itemTitle + '" class="w-full h-48 object-cover opacity-0 transition-all duration-500 group-hover:scale-105" loading="lazy" onload="this.style.opacity=\'1\'; this.previousElementSibling.remove();">' +
            '</div>' +
            '<div class="p-5 flex flex-col flex-grow">' +
              '<div class="flex items-center space-x-2">' +
                '<span class="text-xs font-semibold text-cyan-400">' + itemType.toUpperCase() + '</span>' +
                '<span class="text-gray-500">&bull;</span>' +
                '<span class="text-xs font-semibold text-blue-400">' + itemCategory + '</span>' +
              '</div>' +
              '<h3 class="mt-2 text-lg font-bold text-white transition-colors group-hover:text-blue-400 line-clamp-2 flex-grow">' + itemTitle + '</h3>' +
              '<p class="mt-2 text-gray-400 text-sm line-clamp-2">' + itemExcerpt + '</p>' +
              '<div class="mt-4 pt-4 border-t border-gray-700/80">' +
                '<p class="text-xs text-gray-500">' +
                  '<time datetime="' + itemDate + '">' + formattedDate + '</time>' +
                '</p>' +
              '</div>' +
            '</div>' +
          '</a>' +
        '</div>';
        
      return cardHtml;
    } catch (e) {
      console.error("Gagal membuat kartu untuk item:", item, e);
      return '<div class="text-red-500 p-4">Gagal menampilkan item ini.</div>';
    }
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
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return currentSortDirection === 'desc' ? dateB - dateA : dateA - dateB;
    });

    postsContainer.innerHTML = '';
    if (filteredItems.length > 0) {
      filteredItems.forEach(item => {
        postsContainer.innerHTML += createItemCardHTML(item);
      });
    } else {
      postsContainer.innerHTML = `<p class="text-center text-gray-400 col-span-full">Tidak ada hasil yang ditemukan.</p>`;
    }
    
    if (pageTitle) {
        if (searchQuery) {
            pageTitle.textContent = `Hasil untuk "${urlParams.get('q')}"`;
        } else {
            pageTitle.textContent = 'Jelajahi Semua Konten';
        }
    }
    updateFilterStyles();
  };
  
  const setActiveSortButton = (activeBtn, inactiveBtn) => {
    if (!activeBtn || !inactiveBtn) return;
    activeBtn.classList.add('bg-blue-600', 'text-white');
    activeBtn.classList.remove('bg-gray-700', 'text-gray-300');
    inactiveBtn.classList.add('bg-gray-700', 'text-gray-300');
    inactiveBtn.classList.remove('bg-blue-600', 'text-white');
  };

  // --- EVENT LISTENERS ---
  if (sortNewestBtn && sortOldestBtn) {
    sortNewestBtn.addEventListener('click', () => {
      currentSortDirection = 'desc';
      setActiveSortButton(sortNewestBtn, sortOldestBtn);
      updateView();
    });
    sortOldestBtn.addEventListener('click', () => {
      currentSortDirection = 'asc';
      setActiveSortButton(sortOldestBtn, sortNewestBtn);
      updateView();
    });
  }

  const handleSearch = (event) => {
      event.preventDefault();
      event.target.submit();
  };

  if (desktopSearchForm) desktopSearchForm.addEventListener('submit', handleSearch);
  if (mobileSearchForm) mobileSearchForm.addEventListener('submit', handleSearch);

  // --- INISIALISASI ---
  const initializePage = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const initialQuery = urlParams.get('q');
      if (initialQuery) {
          if(desktopSearchInput) desktopSearchInput.value = initialQuery;
          if(mobileSearchInput) mobileSearchInput.value = initialQuery;
      }
      
      setupDropdowns();
      setActiveSortButton(sortNewestBtn, sortOldestBtn);
      updateView();
  };

  if (document.getElementById('search-page-marker')) {
    initializePage();
  }
});
