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

    // --- Data untuk Menu & Terjemahan UI ---
    const langMenuItems = [
        { href: '#', text: 'Bahasa Indonesia', dataLang: 'id' },
        { href: '#', text: 'English', dataLang: 'en' }
    ];

    const mainMenuItems = {
        id: [
            { href: '/index.html', text: 'Beranda' },
            { href: '/id/articles/', text: 'Artikel' },
            { href: '/id/resources/', text: 'Bahan Desain' },
            { href: '/id/media/', text: 'Media' },
            { href: '/id/donate.html', text: 'Donasi' },
            { href: '/id/tentang.html', text: 'Tentang' }
        ],
        en: [
            { href: '/en/index.html', text: 'Home' },
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
            menuButton: 'Menu'
        },
        en: {
            searchPlaceholder: 'Search...',
            menuButton: 'Menu'
        }
    };
    
    // --- Sistem Kontrol Menu Terpusat ---
    const activeMenus = new Map();

    const closeAllMenus = (excludeId = null) => {
        activeMenus.forEach((menuControl, menuId) => {
            if (menuId !== excludeId) {
                menuControl.close();
            }
        });
    };

    const createMenuItem = (item) => {
        const a = document.createElement('a');
        a.href = item.href;
        a.textContent = item.text.toUpperCase(); 
        a.className = 'menu-item-hidden transition-all duration-300 bg-gray-700/80 backdrop-blur-md border border-gray-600/50 text-white font-medium text-sm rounded-lg block w-48 py-3 px-4 text-center hover:bg-gray-600/80';
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
        
        // =================================================================
        // [UPDATE] Logika pembuatan menu digabungkan dengan logika bahasa global
        // =================================================================
        if (menuId.includes('lang-switcher')) {
            const currentPath = window.location.pathname;
            const currentLang = currentPath.startsWith('/en/') ? 'en' : 'id';

            langMenuItems.forEach(item => {
                const targetLang = item.dataLang;
                let newHref = '#';
                let isAvailable = true;

                if (targetLang !== currentLang) {
                    // Prioritas 1: Cek terjemahan untuk konten spesifik (misal: artikel)
                    if (typeof postMeta !== 'undefined' && typeof allSitePosts !== 'undefined') {
                        const alternatePost = allSitePosts.find(p => String(p.page_id) === String(postMeta.page_id) && p.lang === targetLang);
                        if (alternatePost && alternatePost.url) {
                            newHref = alternatePost.url;
                        } else {
                            isAvailable = false; // Tandai jika terjemahan tidak tersedia
                        }
                    } else {
                        // Prioritas 2: Fallback ke logika penggantian URL global
                        const basePath = currentPath.startsWith(`/${currentLang}/`) ? currentPath.substring(3) : currentPath;
                        let finalPath = basePath;
                        if (targetLang === 'en') {
                            newHref = '/en' + (finalPath.startsWith('/') ? finalPath : '/' + finalPath);
                        } else { // targetLang is 'id'
                            newHref = finalPath;
                            if (newHref === '' || newHref === '/') {
                                newHref = '/index.html';
                            }
                        }
                    }
                }

                const newItem = { ...item, href: newHref };
                const menuItemElement = createMenuItem(newItem);
                
                // Nonaktifkan tautan jika terjemahan tidak tersedia
                if (!isAvailable) {
                    menuItemElement.classList.add('opacity-50', 'cursor-not-allowed');
                    menuItemElement.title = 'Terjemahan tidak tersedia';
                    menuItemElement.addEventListener('click', e => e.preventDefault());
                }

                menu.appendChild(menuItemElement);
            });
        } else {
            // Logika asli untuk menu lainnya (seperti menu utama)
            const itemsToRender = itemsData[pageLang] || itemsData.id || itemsData;
            itemsToRender.forEach(item => menu.appendChild(createMenuItem(item)));
        }
        // =================================================================
        // [UPDATE END]
        // =================================================================

        const menuItems = Array.from(menu.children);

        const openMenu = () => {
            if (isOpen) return;
            isOpen = true;

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

        const closeMenu = () => {
            if (!isOpen) return;
            isOpen = false;
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
        };

        button.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!isOpen) {
                closeAllMenus(menuId);
                openMenu();
            } else {
                closeMenu();
            }
        });

        activeMenus.set(menuId, { open: openMenu, close: closeMenu });
    };

    // --- Fungsi Global Lainnya ---
    const setupLanguageSwitcherUI = () => {
        const path = window.location.pathname;
        const currentLang = path.startsWith('/en/') ? 'en' : 'id';
        
        const currentLangDisplay = document.getElementById('current-lang-display');
        if (currentLangDisplay) currentLangDisplay.textContent = currentLang.toUpperCase();
        
        setTimeout(() => {
            document.querySelectorAll('.lang-option').forEach(link => {
                if (link.dataset.lang === currentLang) {
                    link.classList.add('bg-blue-600', 'cursor-default');
                    link.classList.remove('hover:bg-gray-600/80');
                    link.addEventListener('click', e => e.preventDefault());
                }
            });
        }, 100);
    };

    const handleSearch = (event) => {
        event.preventDefault();
        const input = event.target.querySelector('input[name="q"]');
        const query = input.value.trim();
        if (!query) return;
        const currentLang = window.location.pathname.startsWith('/en/') ? 'en' : 'id';
        window.location.href = `/${currentLang}/all/?q=${encodeURIComponent(query)}`;
    };
    
    const setUiLanguage = () => {
        const pageLang = document.documentElement.lang || 'id';
        const translations = uiStrings[pageLang] || uiStrings.id;

        if(desktopSearchInput) desktopSearchInput.placeholder = translations.searchPlaceholder;
        if(mobileSearchInput) mobileSearchInput.placeholder = translations.searchPlaceholder;
        if(desktopMenuButtonText) desktopMenuButtonText.textContent = translations.menuButton;
    };

    // --- Inisialisasi ---
    setUiLanguage();
    
    setupAnimatedMenu('desktop-lang-switcher-button', 'desktop-lang-switcher-menu', langMenuItems);
    setupAnimatedMenu('desktop-dropdown-button', 'desktop-dropdown-menu', mainMenuItems);
    setupAnimatedMenu('mobile-lang-switcher-button', 'mobile-lang-switcher-menu', langMenuItems);
    setupAnimatedMenu('mobile-menu-button', 'mobile-menu', mainMenuItems);

    if (mobileSearchOpenButton) {
        mobileSearchOpenButton.addEventListener('click', () => {
            closeAllMenus();
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
    
    window.addEventListener('click', () => closeAllMenus());
    
    setupLanguageSwitcherUI();
    
    desktopSearchForm?.addEventListener('submit', handleSearch);
    mobileSearchForm?.addEventListener('submit', handleSearch);
    
    window.scrollTo(0, 0);
});