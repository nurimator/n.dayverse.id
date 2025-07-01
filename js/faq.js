/**
 * This function initializes all the logic for the FAQ page,
 * including the accordion and the search filter.
 */
function initializeFaqPage() {
    // Select all accordion items from the DOM
    const accordionItems = document.querySelectorAll('.accordion-item');
    const searchInput = document.getElementById('faq-search-input');
    const noResultsMessage = document.getElementById('no-results');

    // If there are no accordion items on the page, stop the function.
    if (!accordionItems.length) {
        return;
    }

    // Add a click event listener to each accordion button
    accordionItems.forEach(item => {
        const button = item.querySelector('.accordion-button');
        if (button) {
            button.addEventListener('click', () => {
                // This part makes it a "classic" accordion, where only one item
                // can be open at a time.
                accordionItems.forEach(otherItem => {
                    // If the other item is not the one we clicked and it's open, close it.
                    if (otherItem !== item && otherItem.classList.contains('open')) {
                        otherItem.classList.remove('open');
                    }
                });
                // Toggle the 'open' class on the clicked item.
                item.classList.toggle('open');
            });
        }
    });

    // Add an input event listener to the search bar
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();
            let visibleCount = 0;

            // Loop through each accordion item to see if it matches the search term
            accordionItems.forEach(item => {
                const questionElement = item.querySelector('.accordion-button span');
                const answerElement = item.querySelector('.accordion-content');
                
                if (questionElement && answerElement) {
                    const question = questionElement.textContent.toLowerCase();
                    const answer = answerElement.textContent.toLowerCase();
                    
                    // If the question or answer includes the search term, show the item
                    if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                        item.style.display = 'block';
                        visibleCount++;
                    } else {
                        // Otherwise, hide it
                        item.style.display = 'none';
                    }
                }
            });

            // Show or hide the "no results" message based on how many items are visible
            if (noResultsMessage) {
                noResultsMessage.style.display = visibleCount === 0 ? 'block' : 'none';
            }
        });
    }
}

/**
 * To ensure the script runs after the DOM is fully loaded,
 * we check the document's readyState. The 'defer' attribute on the
 * script tag in the HTML also helps with this.
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFaqPage);
} else {
    // The DOM is already ready, so we can run the function immediately.
    initializeFaqPage();
}
