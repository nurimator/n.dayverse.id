// This function fetches HTML content and injects it into an element
async function loadComponent(url, elementId) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
        }
        const text = await response.text();
        document.getElementById(elementId).innerHTML = text;
    } catch (error) {
        console.error(`Error loading component for ${elementId}:`, error);
    }
}

// This function initializes all the interactive UI elements found in the header
function initializeHeaderLogic() {
    // Mobile Menu Toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Mobile Search Toggle
    const headerMainContent = document.getElementById('header-main-content');
    const mobileSearchView = document.getElementById('mobile-search-view');
    const mobileSearchOpenButton = document.getElementById('mobile-search-open-button');
    const mobileSearchCloseButton = document.getElementById('mobile-search-close-button');
    const mobileSearchInput = document.getElementById('mobile-search-input');
    
    if (mobileSearchOpenButton) {
        mobileSearchOpenButton.addEventListener('click', () => {
            if(headerMainContent) headerMainContent.classList.add('hidden');
            if(mobileSearchView) {
                mobileSearchView.classList.remove('hidden');
                mobileSearchView.classList.add('flex');
            }
            if(mobileSearchInput) mobileSearchInput.focus();
        });
    }
    
    if (mobileSearchCloseButton) {
        mobileSearchCloseButton.addEventListener('click', () => {
            if(headerMainContent) headerMainContent.classList.remove('hidden');
            if(mobileSearchView) {
                mobileSearchView.classList.add('hidden');
                mobileSearchView.classList.remove('flex');
            }
        });
    }
    
    // Re-initialize icons after loading components
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Main function to load all shared components
async function initializeSharedComponents() {
    // FIXED: Use absolute paths starting with "/"
    await Promise.all([
        loadComponent('/header.html', 'header-container'),
        loadComponent('/footer.html', 'footer-container')
    ]);

    // After components are loaded, initialize the JavaScript logic for them
    initializeHeaderLogic();
}

// Run the initialization when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeSharedComponents);
