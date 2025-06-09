// Wikipedia Search Functionality
const WikipediaSearch = {
    init() {
        this.bindEvents();
    },

    bindEvents() {
        const wikiSearchBtn = document.getElementById('wikiSearchBtn');
        const wikiSearchInput = document.getElementById('wikiSearchInput');
        
        if (wikiSearchBtn) {
            wikiSearchBtn.addEventListener('click', () => this.performSearch());
        }
        
        if (wikiSearchInput) {
            wikiSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        }
    },

    async performSearch() {
        const searchInput = document.getElementById('wikiSearchInput');
        const resultsContainer = document.getElementById('wikiResults');
        const searchBtn = document.getElementById('wikiSearchBtn');
        
        if (!searchInput || !resultsContainer) return;
        
        const query = searchInput.value.trim();
        if (!query) {
            this.showError('Please enter a search term');
            return;
        }

        // Show loading state
        searchBtn.textContent = 'Searching...';
        searchBtn.disabled = true;
        resultsContainer.innerHTML = `
            <div class="flex items-center justify-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <span class="ml-2 text-white">Searching Wikipedia...</span>
            </div>
        `;

        try {
            // First, search for pages
            const searchResponse = await fetch(
                `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
            );

            if (searchResponse.ok) {
                const data = await searchResponse.json();
                this.displayResults([data]);
            } else {
                // If direct page not found, try opensearch API
                const opensearchResponse = await fetch(
                    `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=5&namespace=0&format=json&origin=*`
                );
                
                if (opensearchResponse.ok) {
                    const opensearchData = await opensearchResponse.json();
                    if (opensearchData[1].length > 0) {
                        await this.fetchMultiplePages(opensearchData[1]);
                    } else {
                        this.showError('No results found for your search.');
                    }
                } else {
                    this.showError('Search failed. Please try again.');
                }
            }
        } catch (error) {
            console.error('Wikipedia search error:', error);
            this.showError('Network error. Please check your connection and try again.');
        } finally {
            searchBtn.textContent = 'Search';
            searchBtn.disabled = false;
        }
    },

    async fetchMultiplePages(titles) {
        const resultsContainer = document.getElementById('wikiResults');
        const results = [];

        try {
            for (const title of titles.slice(0, 3)) { // Limit to 3 results
                const response = await fetch(
                    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
                );
                
                if (response.ok) {
                    const data = await response.json();
                    results.push(data);
                }
            }
            
            if (results.length > 0) {
                this.displayResults(results);
            } else {
                this.showError('No detailed results found.');
            }
        } catch (error) {
            console.error('Error fetching multiple pages:', error);
            this.showError('Error loading search results.');
        }
    },

    displayResults(results) {
        const resultsContainer = document.getElementById('wikiResults');
        if (!resultsContainer) return;

        let html = '<div class="space-y-6">';
        
        results.forEach((result, index) => {
            if (result.type === 'disambiguation') {
                html += this.createDisambiguationResult(result);
            } else {
                html += this.createStandardResult(result, index);
            }
        });
        
        html += '</div>';
        resultsContainer.innerHTML = html;

        // Add click handlers for "Read More" buttons
        this.bindReadMoreButtons();
    },

    createStandardResult(result, index) {
        const thumbnail = result.thumbnail ? 
            `<img src="${result.thumbnail.source}" alt="${result.title}" class="w-32 h-32 object-cover rounded-lg mr-4 flex-shrink-0">` : 
            '<div class="w-32 h-32 bg-gray-600 rounded-lg mr-4 flex-shrink-0 flex items-center justify-center"><span class="text-gray-400 text-sm">No Image</span></div>';

        return `
            <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div class="flex">
                    ${thumbnail}
                    <div class="flex-1">
                        <h3 class="text-2xl font-bold text-white mb-2">${result.title}</h3>
                        <p class="text-gray-300 mb-4 leading-relaxed">${result.extract || 'No description available.'}</p>
                        <div class="flex space-x-3">
                            <a href="${result.content_urls?.desktop?.page || '#'}" target="_blank" 
                               class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors">
                                Read on Wikipedia
                            </a>
                            <button onclick="WikipediaSearch.readMore('${result.title}', ${index})" 
                                    class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors">
                                Read More
                            </button>
                        </div>
                    </div>
                </div>
                <div id="fullContent-${index}" class="hidden mt-6 pt-6 border-t border-gray-600">
                    <div class="text-center py-4">
                        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
                        <span class="text-sm text-gray-400 mt-2 block">Loading full content...</span>
                    </div>
                </div>
            </div>
        `;
    },

    createDisambiguationResult(result) {
        return `
            <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 class="text-2xl font-bold text-white mb-2">${result.title}</h3>
                <p class="text-gray-300 mb-4">${result.extract}</p>
                <a href="${result.content_urls?.desktop?.page || '#'}" target="_blank" 
                   class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors">
                    View Disambiguation Page
                </a>
            </div>
        `;
    },

    async readMore(title, index) {
        const contentDiv = document.getElementById(`fullContent-${index}`);
        if (!contentDiv) return;

        contentDiv.classList.remove('hidden');

        try {
            // Fetch full page content
            const response = await fetch(
                `https://en.wikipedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(title)}&prop=extracts&exintro=&explaintext=&exsectionformat=plain&origin=*`
            );

            if (response.ok) {
                const data = await response.json();
                const pages = data.query.pages;
                const pageId = Object.keys(pages)[0];
                const fullExtract = pages[pageId].extract;

                if (fullExtract) {
                    // Split into paragraphs and take first few
                    const paragraphs = fullExtract.split('\n').filter(p => p.trim()).slice(0, 5);
                    contentDiv.innerHTML = `
                        <div class="prose prose-invert max-w-none">
                            ${paragraphs.map(p => `<p class="mb-4 text-gray-300 leading-relaxed">${p}</p>`).join('')}
                        </div>
                        <button onclick="this.parentElement.classList.add('hidden')" 
                                class="mt-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors">
                            Hide Details
                        </button>
                    `;
                } else {
                    contentDiv.innerHTML = '<p class="text-gray-400">No additional content available.</p>';
                }
            }
        } catch (error) {
            console.error('Error fetching full content:', error);
            contentDiv.innerHTML = '<p class="text-red-400">Error loading full content.</p>';
        }
    },

    bindReadMoreButtons() {
        // This method is called after results are displayed to ensure event handlers are attached
        // The onclick handlers are already attached via HTML, so this is mainly for future extensibility
    },

    showError(message) {
        const resultsContainer = document.getElementById('wikiResults');
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="bg-red-900 border border-red-700 rounded-lg p-4">
                    <div class="flex items-center">
                        <span class="text-red-300 text-2xl mr-3">⚠️</span>
                        <p class="text-red-100">${message}</p>
                    </div>
                </div>
            `;
        }
    }
};

// Initialize Wikipedia search when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    WikipediaSearch.init();
});

// Also initialize if the script is loaded after DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        WikipediaSearch.init();
    });
} else {
    WikipediaSearch.init();
}
