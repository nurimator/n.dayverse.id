document.addEventListener('DOMContentLoaded', function () {

    // --- Elemen UI Global ---
    const header = document.getElementById('header');
    const headerMainContent = document.getElementById('header-main-content');
    const mobileSearchView = document.getElementById('mobile-search-view');
    const mobileSearchOpenButton = document.getElementById('mobile-search-open-button');
    const mobileSearchCloseButton = document.getElementById('mobile-search-close-button');
    const mobileSearchForm = document.getElementById('mobile-search-form');
    const desktopSearchForm = document.getElementById('desktop-search-form');
    const desktopSearchInput = document.querySelector('#desktop-search-form input[name="q"]');
    const mobileSearchInput = document.querySelector('#mobile-search-input');
    const desktopMenuButtonText = document.querySelector('#desktop-dropdown-button span');
    const menuBackgroundOverlay = document.getElementById('menu-background-overlay');

    // --- Data untuk Menu & Terjemahan UI ---
    const langMenuItems = [
        { href: '#', text: 'Bahasa Indonesia', dataLang: 'id' },
        { href: '#', text: 'English', dataLang: 'en' }
    ];

    const mainMenuItems = {
        id: [
            { href: '/id/articles/', text: 'Artikel' },
            { href: '/id/resources/', text: 'Bahan Desain' },
            { href: '/id/media/', text: 'Media' },
            { href: '/id/donate.html', text: 'Donasi' },
            { href: '/id/tentang.html', text: 'Tentang' }
        ],
        en: [
            { href: '/en/articles/', text: 'Articles' },
            { href: '/en/resources/', text: 'Resources' },
            { href: '/en/media/', text: 'Media' },
            { href: '/en/donate.html', text: 'Donate' },
            { href: '/en/about.html', text: 'About' }
        ]
    };

    const uiStrings = {
        id: {
            searchPlaceholder: 'Cari...',
            menuButton: 'Menu',
            footer: {
                description: 'Sebuah ruang berkarya dari bentuk dan tanya, menghadirkan gerak, warna, dan kisah yang menyimpan makna.',
                navTitle: 'Navigasi',
                infoTitle: 'Informasi',
                socialTitle: 'Ikuti kami',
                navLinks: [
                    { text: 'Semua Konten', href: '/id/all/' },
                    { text: 'Artikel', href: '/id/articles/' },
                    { text: 'Bahan Desain', href: '/id/resources/' },
                    { text: 'Media', href: '/id/media/' },
                    { text: 'Donasi', href: '/id/donate.html' }
                ],
                infoLinks: [
                    { text: 'Term and Conditions', href: '/term-and-conditions' },
                    { text: 'Privacy Policy', href: '/privacy-policy' },
                    { text: 'License', href: '/license' },
                    { text: 'Disclaimer', href: '/disclaimer' },
                    { text: 'Tentang Kami', href: '/id/about-us' }
                ]
            }
        },
        en: {
            searchPlaceholder: 'Search...',
            menuButton: 'Menu',
            footer: {
                description: 'A creative space of form and inquiry, presenting motion, color, and stories that hold meaning.',
                navTitle: 'Navigation',
                infoTitle: 'Information',
                socialTitle: 'Follow us',
                navLinks: [
                    { text: 'All Content', href: '/en/all/' },
                    { text: 'Articles', href: '/en/articles/' },
                    { text: 'Design Resources', href: '/en/resources/' },
                    { text: 'Media', href: '/en/media/' },
                    { text: 'Donate', href: '/en/donate' }
                ],
                infoLinks: [
                    { text: 'Term and Conditions', href: '/term-and-conditions' },
                    { text: 'Privacy Policy', href: '/privacy-policy' },
                    { text: 'License', href: '/license' },
                    { text: 'Disclaimer', href: '/disclaimer' },
                    { text: 'About Us', href: '/en/about-us' }
                ]
            }
        }
    };
    
    // --- Sistem Kontrol Menu Terpusat ---
    const activeMenus = new Map();

    const closeAllMenus = (excludeId = null, instant = false) => {
        activeMenus.forEach((menuControl, menuId) => {
            if (menuId !== excludeId) {
                menuControl.close(instant);
            }
        });
        // Sembunyikan overlay hanya jika kita menutup SEMUA menu (bukan saat beralih)
        if (!excludeId) {
            if (menuBackgroundOverlay) menuBackgroundOverlay.classList.remove('visible');
        }
    };

    const createMenuItem = (item) => {
        const a = document.createElement('a');
        a.href = item.href;
        a.textContent = item.text.toUpperCase(); 
        // Hapus bg-gray-700/80 dari inisialisasi awal. Akan ditambahkan kembali di setupLanguageSwitcherUI
        // untuk opsi yang tidak aktif.
        a.className = 'menu-item-hidden transition-all duration-300 backdrop-blur-md border border-gray-600/50 text-white font-medium text-sm rounded-lg block w-48 py-3 px-4 text-center';
        if (item.dataLang) {
            a.dataset.lang = item.dataLang;
            a.classList.add('lang-option');
        }
        return a;
    };

    const setupAnimatedMenu = (buttonId, menuId, itemsData) => {
        const button = document.getElementById(buttonId);
        const menu = document.getElementById(menuId);
        if (!button || !menu) return;
        
        const pageLang = document.documentElement.lang || 'id';
        
        let isOpen = false;
        while (menu.firstChild) {
            menu.removeChild(menu.firstChild);
        }
        
        if (menuId.includes('lang-switcher')) {
            const currentPath = window.location.pathname;
            const currentLang = pageLang;

            langMenuItems.forEach(item => {
                const targetLang = item.dataLang;
                let newHref = '#';
                let isAvailable = true;

                if (targetLang === currentLang) {
                    // Tautan untuk bahasa saat ini, tidak perlu href
                } else if (typeof postMeta !== 'undefined' && typeof allSitePosts !== 'undefined') {
                    // Logika prioritas untuk halaman konten spesifik
                    const alternatePost = allSitePosts.find(p => String(p.page_id) === String(postMeta.page_id) && p.lang === targetLang);
                    if (alternatePost && alternatePost.url) {
                        newHref = alternatePost.url;
                    } else {
                        isAvailable = false; // Terjemahan tidak ditemukan
                    }
                } else {
                    // Logika global untuk pergantian URL (disederhanakan)
                    if (currentPath.startsWith('/en/')) {
                            if (targetLang === 'id') newHref = currentPath.replace('/en/', '/id/');
                    } else if (currentPath.startsWith('/id/')) {
                            if (targetLang === 'en') newHref = currentPath.replace('/id/', '/en/');
                    } else {
                        // Halaman tanpa awalan bahasa (misal: /privacy-policy.html)
                        isAvailable = false;
                    }
                }

                const newItem = { ...item, href: newHref };
                const menuItemElement = createMenuItem(newItem);
                
                if (!isAvailable) {
                    menuItemElement.classList.add('opacity-50', 'cursor-not-allowed');
                    menuItemElement.title = 'Terjemahan tidak tersedia';
                    menuItemElement.addEventListener('click', e => e.preventDefault());
                }

                menu.appendChild(menuItemElement);
            });
        } else {
            // Logika untuk menu lainnya
            const itemsToRender = itemsData[pageLang] || itemsData.id || itemsData;
            itemsToRender.forEach(item => menu.appendChild(createMenuItem(item)));
        }

        const menuItems = Array.from(menu.children);

        const openMenu = () => {
            if (isOpen) return;
            isOpen = true;
            if (menuBackgroundOverlay) menuBackgroundOverlay.classList.add('visible');

            const buttonRect = button.getBoundingClientRect();
            const headerHeight = header.offsetHeight;
            menu.style.top = `${headerHeight + 8}px`; 
            menu.style.right = `${window.innerWidth - buttonRect.right}px`;
            menu.classList.remove('hidden');
            menu.classList.add('flex');
            menuItems.forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('menu-item-visible');
                    item.classList.remove('menu-item-hidden');
                }, index * 75);
            });
        };

        const closeMenu = (instant = false) => {
            if (!isOpen) return;
            isOpen = false;

            if (instant) {
                // Tutup langsung tanpa animasi
                menu.classList.add('hidden');
                menu.classList.remove('flex');
                menuItems.forEach(item => {
                    item.classList.remove('menu-item-visible');
                    item.classList.add('menu-item-hidden');
                });
            } else {
                // Tutup dengan animasi
                const reversedItems = [...menuItems].reverse();
                reversedItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.classList.remove('menu-item-visible');
                        item.classList.add('menu-item-hidden');
                    }, index * 75);
                });
                setTimeout(() => {
                    menu.classList.add('hidden');
                    menu.classList.remove('flex');
                }, reversedItems.length * 75 + 50);
            }
        };

        button.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isOpen) {
                // Jika menu ini sudah terbuka, tutup dengan animasi.
                closeMenu(false);
                if (menuBackgroundOverlay) menuBackgroundOverlay.classList.remove('visible');
            } else {
                // Jika membuka menu baru, tutup menu lain secara instan.
                closeAllMenus(menuId, true);
                openMenu();
            }
        });

        activeMenus.set(menuId, { open: openMenu, close: closeMenu });
    };

    // --- Fungsi Global Lainnya ---
    const setupLanguageSwitcherUI = () => {
        const pageLang = document.documentElement.lang || 'id';
        
        const currentLangDisplay = document.getElementById('current-lang-display');
        if (currentLangDisplay) currentLangDisplay.textContent = pageLang.toUpperCase();
        
        // Timeout ini mungkin tidak lagi diperlukan dengan logika yang diperbaiki,
        // tetapi tetap dipertahankan untuk keamanan jika ada penundaan rendering.
        setTimeout(() => {
            document.querySelectorAll('.lang-option').forEach(link => {
                // Hapus semua kelas yang terkait dengan status aktif/tidak aktif sebelumnya
                link.classList.remove('bg-teal-600', 'cursor-default', 'bg-gray-700/80', 'hover:bg-gray-600/80', 'opacity-50', 'cursor-not-allowed');
                link.removeEventListener('click', e => e.preventDefault()); // Hapus listener lama jika ada

                if (link.dataset.lang === pageLang) {
                    // Tambahkan kelas untuk bahasa aktif
                    link.classList.add('bg-teal-600', 'cursor-default');
                    link.addEventListener('click', e => e.preventDefault()); // Nonaktifkan klik untuk bahasa aktif
                } else {
                    // Tambahkan kembali kelas abu-abu dan hover untuk bahasa tidak aktif
                    link.classList.add('bg-gray-700/80', 'hover:bg-gray-600/80');
                    // Periksa kembali ketersediaan terjemahan jika diperlukan
                    if (link.title === 'Terjemahan tidak tersedia') { // Ini mengandalkan title yang diset di createMenuItem
                        link.classList.add('opacity-50', 'cursor-not-allowed');
                        link.addEventListener('click', e => e.preventDefault());
                    }
                }
            });
        }, 100);
    };

    const handleSearch = (event) => {
        event.preventDefault();
        const input = event.target.querySelector('input[name="q"]');
        const query = input.value.trim();
        if (!query) return;
        const pageLang = document.documentElement.lang || 'id';
        window.location.href = `/${pageLang}/all/?q=${encodeURIComponent(query)}`;
    };
    
    const setUiLanguage = () => {
        const pageLang = document.documentElement.lang || 'id';
        const translations = uiStrings[pageLang] || uiStrings.id;
        const searchActionUrl = `/${pageLang}/all/`;

        if(desktopSearchInput) desktopSearchInput.placeholder = translations.searchPlaceholder;
        if(mobileSearchInput) mobileSearchInput.placeholder = translations.searchPlaceholder;
        if(desktopMenuButtonText) desktopMenuButtonText.textContent = translations.menuButton;
        if(desktopSearchForm) desktopSearchForm.action = searchActionUrl;
        if(mobileSearchForm) mobileSearchForm.action = searchActionUrl;
    };

    const setFooterLanguage = () => {
        const pageLang = document.documentElement.lang || 'id';
        const footerStrings = uiStrings[pageLang]?.footer || uiStrings.id.footer;

        if (!footerStrings) return;

        document.getElementById('footer-description').textContent = footerStrings.description;
        document.getElementById('footer-nav-title').textContent = footerStrings.navTitle;
        document.getElementById('footer-info-title').textContent = footerStrings.infoTitle;
        document.getElementById('footer-social-title').textContent = footerStrings.socialTitle;

        const navLinksContainer = document.getElementById('footer-nav-links');
        if (navLinksContainer) {
            navLinksContainer.innerHTML = '';
            footerStrings.navLinks.forEach(linkData => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = linkData.href;
                a.textContent = linkData.text;
                a.className = 'text-gray-400 hover:text-teal-400';
                li.appendChild(a);
                navLinksContainer.appendChild(li);
            });
        }
        
        const infoLinksContainer = document.getElementById('footer-info-links');
        if (infoLinksContainer) {
            infoLinksContainer.innerHTML = '';
            footerStrings.infoLinks.forEach(linkData => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = linkData.href;
                a.textContent = linkData.text;
                a.className = 'text-gray-400 hover:text-teal-400';
                li.appendChild(a);
                infoLinksContainer.appendChild(li);
            });
        }
    };

    // --- Inisialisasi ---
    setUiLanguage();
    setFooterLanguage();
    
    // Panggil setupAnimatedMenu untuk semua menu Anda
    setupAnimatedMenu('desktop-lang-switcher-button', 'desktop-lang-switcher-menu', langMenuItems);
    setupAnimatedMenu('desktop-dropdown-button', 'desktop-dropdown-menu', mainMenuItems);
    setupAnimatedMenu('mobile-lang-switcher-button', 'mobile-lang-switcher-menu', langMenuItems);
    setupAnimatedMenu('mobile-menu-button', 'mobile-menu', mainMenuItems);

    if (mobileSearchOpenButton) {
        mobileSearchOpenButton.addEventListener('click', () => {
            closeAllMenus(null, true);
            if (menuBackgroundOverlay) menuBackgroundOverlay.classList.remove('visible');
            if (headerMainContent) headerMainContent.classList.add('hidden');
            if (mobileSearchView) {
                mobileSearchView.classList.remove('hidden');
                mobileSearchView.classList.add('flex');
                mobileSearchView.querySelector('input')?.focus();
            }
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
    
    if(menuBackgroundOverlay) {
        menuBackgroundOverlay.addEventListener('click', () => {
            closeAllMenus(null, false); // Tutup semua menu dengan animasi
        });
    }
    
    // Panggil setupLanguageSwitcherUI setelah semua menu bahasa dibuat
    setupLanguageSwitcherUI();
    
    desktopSearchForm?.addEventListener('submit', handleSearch);
    mobileSearchForm?.addEventListener('submit', handleSearch);
    
    window.scrollTo(0, 0);
});
