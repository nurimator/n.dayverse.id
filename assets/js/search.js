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
  const typeFilter = document.getElementById('filter-type');
  const categoryFilter = document.getElementById('filter-category');
  const postsContainer = document.getElementById('posts-container');
  const pageTitle = document.getElementById('page-title');
  
  // --- Validasi Data ---
  if (typeof searchableData === 'undefined' || searchableData.length === 0) {
    console.error('Error: Variabel `searchableData` tidak ditemukan atau kosong.');
    if (postsContainer) postsContainer.innerHTML = '<p class="text-center text-red-400 col-span-full">Kesalahan: Data pencarian tidak dapat dimuat.</p>';
    return;
  }
  const allItems = searchableData;
  let currentSortDirection = 'desc';

  // --- Logika UI Header (tidak berubah) ---
  if (mobileMenuButton) mobileMenuButton.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
  if (desktopDropdownButton) {
    desktopDropdownButton.addEventListener('click', (event) => {
      event.stopPropagation();
      desktopDropdownMenu.classList.toggle('hidden');
    });
    window.addEventListener('click', (event) => {
      if (desktopDropdownContainer && !desktopDropdownContainer.contains(event.target)) {
        desktopDropdownMenu.classList.add('hidden');
      }
    });
  }
  if (mobileSearchOpenButton) {
    mobileSearchOpenButton.addEventListener('click', () => {
      headerMainContent.classList.add('hidden');
      mobileSearchView.classList.remove('hidden');
      mobileSearchView.classList.add('flex');
      mobileSearchInput.focus();
    });
  }
  if (mobileSearchCloseButton) {
    mobileSearchCloseButton.addEventListener('click', () => {
      headerMainContent.classList.remove('hidden');
      mobileSearchView.classList.add('hidden');
      mobileSearchView.classList.remove('flex');
    });
  }


  // --- FUNGSI BANTUAN ---

  const truncateWords = (text, numWords) => {
    if (!text) return '';
    // Hapus blok kode SEBELUM memotong kata
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
  
  const populateCategoryFilter = () => {
    if (!categoryFilter) return;
    const categories = new Set();
    allItems.forEach(item => {
        if (item.categories && Array.isArray(item.categories)) {
            item.categories.forEach(cat => cat && categories.add(cat));
        }
    });

    const sortedCategories = Array.from(categories).sort();
    categoryFilter.innerHTML = '<option value="all">Semua Kategori</option>'; // Reset
    sortedCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categoryFilter.appendChild(option);
    });
  };

  const createItemCardHTML = (item) => {
    try {
      const itemUrl = item.url || '#';
      const itemImage = item.image || 'https://placehold.co/600x400/111827/FFFFFF?text=Image+Not+Found';
      const itemCategory = (item.categories && item.categories[0]) ? item.categories[0].toUpperCase() : 'UNCATEGORIZED';
      const itemTitle = item.title || 'Tanpa Judul';
      const itemExcerpt = truncateWords(item.content, 20);
      const itemDate = item.date ? new Date(item.date).toISOString() : '';
      const formattedDate = formatDate(item.date);
      const itemType = item.type || '';

      // Menggunakan string concatenation untuk menghindari potensi masalah template literal
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

  // FUNGSI UTAMA YANG DIPERBARUI: Sekarang memfilter berdasarkan semua kriteria
  const updateView = () => {
    if (!postsContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = (urlParams.get('q') || '').toLowerCase().trim();
    const selectedType = typeFilter ? typeFilter.value : 'all';
    const selectedCategory = categoryFilter ? categoryFilter.value : 'all';

    // 1. Filter berdasarkan teks pencarian
    let filteredItems = searchQuery 
      ? allItems.filter(item => {
          const title = (item.title || '').toLowerCase();
          // Hapus blok kode dari konten sebelum melakukan pencarian
          const searchableContent = (item.content || '').replace(/```[\s\S]*?```/g, '').toLowerCase();
          return title.includes(searchQuery) || searchableContent.includes(searchQuery);
        })
      : allItems;

    // 2. Filter berdasarkan jenis
    if (selectedType !== 'all') {
      filteredItems = filteredItems.filter(item => item.type === selectedType);
    }

    // 3. Filter berdasarkan kategori
    if (selectedCategory !== 'all') {
      filteredItems = filteredItems.filter(item => item.categories && item.categories.includes(selectedCategory));
    }
    
    // 4. Urutkan hasil
    filteredItems.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return currentSortDirection === 'desc' ? dateB - dateA : dateA - dateB;
    });

    // 5. Tampilkan hasil
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

  if (typeFilter) typeFilter.addEventListener('change', updateView);
  if (categoryFilter) categoryFilter.addEventListener('change', updateView);

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
      
      populateCategoryFilter();
      setActiveSortButton(sortNewestBtn, sortOldestBtn);
      updateView();
  };

  if (document.getElementById('search-page-marker')) {
    initializePage();
  }
});