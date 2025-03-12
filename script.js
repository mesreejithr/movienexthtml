// TMDB API Configuration
const API_KEY = '14f8ac39fa19f5ca9639b37b3923431b';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';
const POSTER_SIZE = 'w500';
const BACKDROP_SIZE = 'original';

// DOM Elements - Movies Section
const moviesGrid = document.getElementById('movies-grid');
const languageSelect = document.getElementById('language-select');
const searchInput = document.getElementById('search');
const searchBtn = document.getElementById('search-btn');
const autocompleteResults = document.getElementById('autocomplete-results');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const currentPageSpan = document.getElementById('current-page');
const modal = document.getElementById('movie-modal');
const modalDetails = document.getElementById('modal-details');
const closeModal = document.querySelector('.close');

// DOM Elements - OTT Section
const ottGrid = document.getElementById('ott-grid');
const contentTypeSelect = document.getElementById('content-type-select');
const ottProviderSelect = document.getElementById('ott-provider-select');
const ottPrevPageBtn = document.getElementById('ott-prev-page');
const ottNextPageBtn = document.getElementById('ott-next-page');
const ottCurrentPageSpan = document.getElementById('ott-current-page');
const ottModal = document.getElementById('ott-modal');
const ottModalDetails = document.getElementById('ott-modal-details');
const ottCloseModal = document.querySelector('.ott-close');

// DOM Elements - Trending Section
const topRatedGrid = document.getElementById('top-rated-grid');
const topRatedPrevPageBtn = document.getElementById('top-rated-prev-page');
const topRatedNextPageBtn = document.getElementById('top-rated-next-page');
const topRatedCurrentPageSpan = document.getElementById('top-rated-current-page');

// DOM Elements - Coming Soon Section
const comingSoonGrid = document.getElementById('coming-soon-grid');
const comingSoonPrevPageBtn = document.getElementById('coming-soon-prev-page');
const comingSoonNextPageBtn = document.getElementById('coming-soon-next-page');
const comingSoonCurrentPageSpan = document.getElementById('coming-soon-current-page');

// DOM Elements - Tabs
const moviesTab = document.getElementById('movies-tab');
const ottTab = document.getElementById('ott-tab');
const moviesSection = document.getElementById('movies-section');
const ottSection = document.getElementById('ott-section');

// State variables - Movies
let currentPage = 1;
let totalPages = 1;
let currentLanguage = 'all';
let isSearching = false;
let searchQuery = '';

// State variables - OTT
let currentOttPage = 1;
let totalOttPages = 1;
let currentContentType = 'all';
let currentOttProvider = 'all';

// State variables - Trending
let currentTopRatedPage = 1;
let totalTopRatedPages = 1;

// State variables - Coming Soon
let currentComingSoonPage = 1;
let totalComingSoonPages = 1;

// Language codes to full names mapping
const languageNames = {
    'hi': 'Hindi',
    'ta': 'Tamil',
    'te': 'Telugu',
    'ml': 'Malayalam',
    'kn': 'Kannada',
    'bn': 'Bengali',
    'mr': 'Marathi',
    'pa': 'Punjabi',
    'gu': 'Gujarati',
    'or': 'Odia',
    'as': 'Assamese'
};

// OTT Provider mapping
const ottProviders = {
    '8': { name: 'Netflix', class: 'netflix' },
    '119': { name: 'Amazon Prime', class: 'prime' },
    '337': { name: 'Disney+', class: 'disney' },
    '122': { name: 'Hotstar', class: 'hotstar' },
    '2336': { name: 'JioHotstar', class: 'jiohotstar' },
    '237': { name: 'SonyLIV', class: 'sonyliv' },
    '232': { name: 'ZEE5', class: 'zee5' }
};

// Header scroll effect
const header = document.querySelector('.cinematic-header');
let lastScroll = 0;
let scrollTimer = null;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Add scrolled class when user scrolls down past threshold
    if (currentScroll > 50) {
        header.classList.add('scrolled');
        
        // Hide header when scrolling down, show when scrolling up
        if (currentScroll > lastScroll) {
            // Scrolling down
            header.classList.add('hide');
        } else {
            // Scrolling up
            header.classList.remove('hide');
        }
    } else {
        header.classList.remove('scrolled');
        header.classList.remove('hide');
    }
    
    // Update last scroll position
    lastScroll = currentScroll;
    
    // Clear existing timer
    if (scrollTimer !== null) {
        clearTimeout(scrollTimer);
    }
    
    // Set a timer to show header after scrolling stops
    scrollTimer = setTimeout(() => {
        header.classList.remove('hide');
    }, 1500);
});

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadOttContent();
    loadMovies();
    loadTopRatedContent();
    loadComingSoonContent();
    setupEventListeners();
});

// Set up event listeners
function setupEventListeners() {
    // Language pills event listeners
    const languagePills = document.querySelectorAll('.language-pill');
    languagePills.forEach(pill => {
        pill.addEventListener('click', () => {
            // Remove active class from all pills
            languagePills.forEach(p => p.classList.remove('active'));
            // Add active class to clicked pill
            pill.classList.add('active');
            // Update current language
            currentLanguage = pill.dataset.language;
            // Reload content
            currentPage = 1;
            currentOttPage = 1;
            currentComingSoonPage = 1;
            loadMovies();
            loadOttContent();
            loadTopRatedContent();
            loadComingSoonContent();
        });
    });

    // Search functionality
    const searchInput = document.getElementById('search');
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // Add input event for autocomplete
    searchInput.addEventListener('input', debounce(handleAutocomplete, 300));
    
    // Close autocomplete when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !autocompleteResults.contains(e.target)) {
            autocompleteResults.style.display = 'none';
        }
    });
    
    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            document.body.classList.toggle('mobile-menu-open');
        });
        
        // Close mobile menu when a category is clicked
        const categoryLinks = document.querySelectorAll('.category-link');
        categoryLinks.forEach(link => {
            link.addEventListener('click', () => {
                document.body.classList.remove('mobile-menu-open');
            });
        });
    }
    
    // Mobile bottom navigation
    setupMobileNavigation();
    
    // Category links
    const categoryLinks = document.querySelectorAll('.category-link');
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // If it's a placeholder link (Coming Soon or Top Rated)
            if (this.getAttribute('href') === '#') {
                e.preventDefault();
                alert('This feature will be available soon!');
                return;
            }
            
            // Update active state
            categoryLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Smooth scroll to section
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    prevPageBtn.addEventListener('click', goToPrevPage);
    nextPageBtn.addEventListener('click', goToNextPage);
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // OTT section event listeners
    contentTypeSelect.addEventListener('change', handleContentTypeChange);
    ottProviderSelect.addEventListener('change', handleOttProviderChange);
    ottPrevPageBtn.addEventListener('click', goToOttPrevPage);
    ottNextPageBtn.addEventListener('click', goToOttNextPage);
    ottCloseModal.addEventListener('click', () => {
        ottModal.style.display = 'none';
    });
    window.addEventListener('click', (e) => {
        if (e.target === ottModal) {
            ottModal.style.display = 'none';
        }
    });
    
    // Coming Soon section event listeners
    comingSoonPrevPageBtn.addEventListener('click', goToComingSoonPrevPage);
    comingSoonNextPageBtn.addEventListener('click', goToComingSoonNextPage);
}

// Handle language filter change
function handleLanguageChange() {
    currentLanguage = languageSelect.value;
    currentPage = 1;
    currentOttPage = 1;
    currentComingSoonPage = 1; // Reset Coming Soon page to 1
    
    // Reload all content sections with the new language filter
    loadMovies();
    loadOttContent();
    loadTopRatedContent();
    loadComingSoonContent();
}

// Handle search
function handleSearch() {
    const query = searchInput.value.trim();
    if (query) {
        searchQuery = query;
        isSearching = true;
        currentPage = 1;
        currentOttPage = 1;
        
        // Load both movies and OTT content with the search query
        loadMovies();
        loadOttContent();
        
        // Scroll to top of the page
        window.scrollTo(0, 0);
    } else {
        isSearching = false;
        searchQuery = '';
        
        // Reset and load both sections
        loadMovies();
        loadOttContent();
    }
}

// Go to previous page
function goToPrevPage() {
    if (currentPage > 1) {
        currentPage--;
        loadMovies();
        window.scrollTo(0, 0);
    }
}

// Go to next page
function goToNextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        loadMovies();
        window.scrollTo(0, 0);
    }
}

// Get today's date in YYYY-MM-DD format for API
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Load movies based on current state
async function loadMovies() {
    showLoading();
    
    try {
        let url;
        const today = getTodayDate();
        
        let params = new URLSearchParams({
            api_key: API_KEY,
            page: currentPage,
            region: 'IN', // India region
        });

        if (isSearching) {
            // Search for movies
            url = `${BASE_URL}/search/movie`;
            params.append('query', searchQuery);
            // Add release date filter to only show released movies
            params.append('release_date.lte', today);
            
            if (currentLanguage !== 'all') {
                params.append('with_original_language', currentLanguage);
            }
        } else {
            // Get discover movies
            url = `${BASE_URL}/discover/movie`;
            params.append('sort_by', 'release_date.desc');
            params.append('with_origin_country', 'IN'); // Indian movies
            // Add release date filter to only show released movies
            params.append('release_date.lte', today);
            
            if (currentLanguage !== 'all') {
                params.append('with_original_language', currentLanguage);
            }
        }

        const response = await fetch(`${url}?${params}`);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            displayMovies(data.results);
            totalPages = Math.min(data.total_pages, 500); // TMDB API limits to 500 pages
            updatePagination();
        } else {
            showNoResults();
        }
    } catch (error) {
        console.error('Error loading movies:', error);
        showError();
    }
}

// Display movies in the grid
function displayMovies(movies) {
    moviesGrid.innerHTML = '';
    
    // Get today's date for comparison
    const today = new Date();
    
    // Filter movies to only include released ones with poster images
    const releasedMovies = movies.filter(movie => {
        if (!movie.release_date || !movie.poster_path) return false;
        const releaseDate = new Date(movie.release_date);
        return releaseDate <= today;
    });
    
    releasedMovies.forEach(movie => {
        // Check if it's an Indian movie (has Indian language or produced in India)
        const isIndianMovie = movie.original_language in languageNames || 
                             (movie.production_countries && 
                              movie.production_countries.some(country => country.iso_3166_1 === 'IN'));
        
        if (isIndianMovie) {
            const movieCard = createMovieCard(movie);
            moviesGrid.appendChild(movieCard);
        }
    });
    
    // If no Indian movies were found after filtering
    if (moviesGrid.children.length === 0) {
        showNoResults();
    }
}

// Create a movie card element
function createMovieCard(movie) {
    const movieCard = document.createElement('div');
    movieCard.classList.add('movie-card');
    movieCard.dataset.id = movie.id;
    
    // Add rating badge
    const ratingBadge = `<div class="rating-badge"><i class="fas fa-star"></i> ${movie.vote_average.toFixed(1)}</div>`;
    
    movieCard.innerHTML = `
        ${ratingBadge}
        <img class="movie-poster" src="${IMAGE_BASE_URL + POSTER_SIZE + movie.poster_path}" alt="${movie.title}">
    `;
    
    movieCard.addEventListener('click', () => {
        openMovieDetails(movie.id);
    });
    
    return movieCard;
}

// Open movie details modal
async function openMovieDetails(movieId) {
    showModalLoading();
    modal.style.display = 'block';
    
    try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=credits,watch/providers`);
        const movie = await response.json();
        
        // Add content_type property to match the format used in OTT content
        movie.content_type = 'movie';
        
        displayMovieDetails(movie);
    } catch (error) {
        console.error('Error loading movie details:', error);
        modalDetails.innerHTML = '<p class="error">Failed to load movie details. Please try again.</p>';
    }
}

// Display movie details in the modal
function displayMovieDetails(movie) {
    const releaseDate = movie.release_date ? new Date(movie.release_date).toLocaleDateString() : 'Unknown';
    const languageCode = movie.original_language;
    const languageName = languageNames[languageCode] || languageCode;
    
    let genresHTML = '';
    if (movie.genres && movie.genres.length > 0) {
        genresHTML = movie.genres.map(genre => `<span class="genre-tag">${genre.name}</span>`).join('');
    }
    
    let castHTML = '';
    if (movie.credits && movie.credits.cast && movie.credits.cast.length > 0) {
        // Filter out cast members without profile images
        const castWithImages = movie.credits.cast.filter(person => person.profile_path).slice(0, 10); // Get top 10 cast members with images
        
        if (castWithImages.length > 0) {
            castHTML = castWithImages.map(person => `
                <div class="cast-item">
                    <img src="${IMAGE_BASE_URL + 'w185' + person.profile_path}" alt="${person.name}">
                    <p class="cast-name">${person.name}</p>
                    <p class="cast-character">${person.character}</p>
                </div>
            `).join('');
        }
    }
    
    // Watch providers
    let watchProvidersHTML = '';
    if (movie['watch/providers'] && movie['watch/providers'].results && movie['watch/providers'].results.IN) {
        const providers = movie['watch/providers'].results.IN;
        
        if (providers.flatrate && providers.flatrate.length > 0) {
            watchProvidersHTML = `
                <div class="watch-providers">
                    <h3>Available on</h3>
                    <div class="providers-list">
                        ${providers.flatrate.map(provider => `
                            <div class="provider-item">
                                <a href="https://www.themoviedb.org/movie/${movie.id}/watch" target="_blank" rel="noopener noreferrer" title="Watch on ${provider.provider_name}">
                                    <img class="provider-logo" src="${IMAGE_BASE_URL}w92${provider.logo_path}" alt="${provider.provider_name}">
                                    ${provider.provider_name}
                                </a>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    }
    
    modalDetails.innerHTML = `
        <div class="modal-poster">
            <img src="${IMAGE_BASE_URL + POSTER_SIZE + movie.poster_path}" alt="${movie.title}">
        </div>
        <div class="modal-info">
            <h2 class="modal-title">${movie.title}</h2>
            <div class="modal-meta">
                <span><i class="far fa-calendar-alt"></i> ${releaseDate}</span>
                <span><i class="fas fa-language"></i> ${languageName}</span>
                <span><i class="fas fa-star"></i> ${movie.vote_average.toFixed(1)}/10</span>
                <span><i class="fas fa-clock"></i> ${movie.runtime ? movie.runtime + ' min' : 'N/A'}</span>
            </div>
            <div class="modal-overview">
                <h3>Overview</h3>
                <p>${movie.overview || 'No overview available.'}</p>
            </div>
            <div class="modal-genres">
                ${genresHTML}
            </div>
            ${watchProvidersHTML}
            ${movie.credits && movie.credits.cast && movie.credits.cast.length > 0 ? `
                <div class="modal-cast">
                    <h3>Cast</h3>
                    <div class="cast-list">
                        ${castHTML}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

// Update pagination buttons and current page display
function updatePagination() {
    currentPageSpan.textContent = `Page ${currentPage} of ${totalPages}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
}

// Show loading state
function showLoading() {
    moviesGrid.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading movies...</p>
        </div>
    `;
}

// Show modal loading state
function showModalLoading() {
    modalDetails.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading movie details...</p>
        </div>
    `;
}

// Show no results message
function showNoResults() {
    moviesGrid.innerHTML = `
        <div class="no-results">
            <i class="fas fa-film"></i>
            <p>${isSearching ? 'No theatre movies found matching your search. Try different keywords or filters.' : 'No theatre movies found. Try a different language filter.'}</p>
        </div>
    `;
}

// Show error message
function showError() {
    moviesGrid.innerHTML = `
        <div class="error">
            <i class="fas fa-exclamation-circle"></i>
            <p>Failed to load movies. Please try again later.</p>
        </div>
    `;
}

// Handle content type filter change
function handleContentTypeChange() {
    currentContentType = contentTypeSelect.value;
    currentOttPage = 1;
    loadOttContent();
}

// Handle OTT provider filter change
function handleOttProviderChange() {
    currentOttProvider = ottProviderSelect.value;
    currentOttPage = 1;
    loadOttContent();
}

// Go to previous OTT page
function goToOttPrevPage() {
    if (currentOttPage > 1) {
        currentOttPage--;
        loadOttContent();
        window.scrollTo(0, 0);
    }
}

// Go to next OTT page
function goToOttNextPage() {
    if (currentOttPage < totalOttPages) {
        currentOttPage++;
        loadOttContent();
        window.scrollTo(0, 0);
    }
}

// Load OTT content based on current state
async function loadOttContent() {
    showOttLoading();
    
    try {
        const today = getTodayDate();
        let movieUrl, tvUrl;
        
        // Prepare common parameters
        let commonParams = {
            api_key: API_KEY,
            page: currentOttPage,
            region: 'IN',
            watch_region: 'IN'
        };
        
        // If searching, use search endpoints
        if (isSearching) {
            movieUrl = `${BASE_URL}/search/movie`;
            tvUrl = `${BASE_URL}/search/tv`;
            
            // Add search query
            let movieParams = new URLSearchParams({
                ...commonParams,
                query: searchQuery,
                include_adult: false
            });
            
            let tvParams = new URLSearchParams({
                ...commonParams,
                query: searchQuery,
                include_adult: false
            });
            
            // Add language filter if selected
            if (currentLanguage !== 'all') {
                movieParams.append('with_original_language', currentLanguage);
                tvParams.append('with_original_language', currentLanguage);
            }
            
            // Fetch search results
            let movieData = { results: [] };
            let tvData = { results: [] };
            
            if (currentContentType === 'all' || currentContentType === 'movie') {
                const movieResponse = await fetch(`${movieUrl}?${movieParams}`);
                movieData = await movieResponse.json();
            }
            
            if (currentContentType === 'all' || currentContentType === 'tv') {
                const tvResponse = await fetch(`${tvUrl}?${tvParams}`);
                tvData = await tvResponse.json();
            }
            
            // Combine results
            let combinedResults = [
                ...movieData.results.map(item => ({ ...item, content_type: 'movie' })),
                ...tvData.results.map(item => ({ ...item, content_type: 'tv' }))
            ];
            
            // Filter for OTT content by fetching watch providers
            const resultsWithProviders = await Promise.all(
                combinedResults.map(async (item) => {
                    try {
                        const contentType = item.content_type;
                        const endpoint = contentType === 'movie' ? 'movie' : 'tv';
                        const response = await fetch(`${BASE_URL}/${endpoint}/${item.id}/watch/providers?api_key=${API_KEY}`);
                        const data = await response.json();
                        
                        // Add watch providers to the item if available for India
                        if (data.results && data.results.IN && data.results.IN.flatrate) {
                            return { ...item, watch_providers: data.results.IN.flatrate };
                        }
                        return { ...item, watch_providers: [] };
                    } catch (error) {
                        console.error(`Error fetching watch providers for ${item.id}:`, error);
                        return { ...item, watch_providers: [] };
                    }
                })
            );
            
            // Filter to only include items with OTT providers
            const ottContent = resultsWithProviders.filter(item => 
                item.watch_providers && item.watch_providers.length > 0
            );
            
            // Sort by release/air date (newest first)
            ottContent.sort((a, b) => {
                const dateA = new Date(a.release_date || a.first_air_date || '2000-01-01');
                const dateB = new Date(b.release_date || b.first_air_date || '2000-01-01');
                return dateB - dateA;
            });
            
            if (ottContent.length > 0) {
                displayOttContent(ottContent);
                
                // Calculate total pages based on results
                totalOttPages = Math.ceil(ottContent.length / 20); // Assuming 20 items per page
                totalOttPages = Math.max(totalOttPages, 1); // At least 1 page
                
                updateOttPagination();
            } else {
                showNoOttResults();
            }
        } else {
            // Use discover endpoints for normal browsing
            // Prepare parameters for API calls
            let movieParams = new URLSearchParams({
                ...commonParams,
                with_origin_country: 'IN',
                'release_date.lte': today,
                sort_by: 'release_date.desc',
                with_watch_monetization_types: 'flatrate', // Only include content available for streaming
                append_to_response: 'watch/providers' // Include watch provider information
            });
            
            let tvParams = new URLSearchParams({
                ...commonParams,
                with_origin_country: 'IN',
                sort_by: 'first_air_date.desc',
                with_watch_monetization_types: 'flatrate', // Only include content available for streaming
                append_to_response: 'watch/providers' // Include watch provider information
            });
            
            // Add OTT provider filter if selected
            if (currentOttProvider !== 'all') {
                movieParams.append('with_watch_providers', currentOttProvider);
                tvParams.append('with_watch_providers', currentOttProvider);
            } else {
                // If no specific provider is selected, include all major OTT providers
                const allProviders = Object.keys(ottProviders).join('|');
                movieParams.append('with_watch_providers', allProviders);
                tvParams.append('with_watch_providers', allProviders);
            }
            
            // Add language filter if selected
            if (currentLanguage !== 'all') {
                movieParams.append('with_original_language', currentLanguage);
                tvParams.append('with_original_language', currentLanguage);
            }
            
            // Fetch data based on content type
            let movieData = { results: [] };
            let tvData = { results: [] };
            
            if (currentContentType === 'all' || currentContentType === 'movie') {
                const movieResponse = await fetch(`${BASE_URL}/discover/movie?${movieParams}`);
                movieData = await movieResponse.json();
            }
            
            if (currentContentType === 'all' || currentContentType === 'tv') {
                const tvResponse = await fetch(`${BASE_URL}/discover/tv?${tvParams}`);
                tvData = await tvResponse.json();
            }
            
            // Combine results
            let combinedResults = [
                ...movieData.results.map(item => ({ ...item, content_type: 'movie' })),
                ...tvData.results.map(item => ({ ...item, content_type: 'tv' }))
            ];
            
            // Fetch watch providers for each item
            const resultsWithProviders = await Promise.all(
                combinedResults.map(async (item) => {
                    try {
                        const contentType = item.content_type;
                        const endpoint = contentType === 'movie' ? 'movie' : 'tv';
                        const response = await fetch(`${BASE_URL}/${endpoint}/${item.id}/watch/providers?api_key=${API_KEY}`);
                        const data = await response.json();
                        
                        // Add watch providers to the item if available for India
                        if (data.results && data.results.IN && data.results.IN.flatrate) {
                            return { ...item, watch_providers: data.results.IN.flatrate };
                        }
                        return item;
                    } catch (error) {
                        console.error(`Error fetching watch providers for ${item.id}:`, error);
                        return item;
                    }
                })
            );
            
            // Sort by release/air date (newest first)
            resultsWithProviders.sort((a, b) => {
                const dateA = new Date(a.release_date || a.first_air_date || '2000-01-01');
                const dateB = new Date(b.release_date || b.first_air_date || '2000-01-01');
                return dateB - dateA;
            });
            
            if (resultsWithProviders.length > 0) {
                displayOttContent(resultsWithProviders);
                
                // Calculate total pages (use the max of both responses)
                const movieTotalPages = movieData.total_pages || 0;
                const tvTotalPages = tvData.total_pages || 0;
                totalOttPages = Math.min(Math.max(movieTotalPages, tvTotalPages), 500);
                
                updateOttPagination();
            } else {
                showNoOttResults();
            }
        }
    } catch (error) {
        console.error('Error loading OTT content:', error);
        showOttError();
    }
}

// Display OTT content in the grid
function displayOttContent(content) {
    ottGrid.innerHTML = '';
    
    // Filter content to ensure it's available on OTT platforms and has poster images
    const ottContent = content.filter(item => {
        // Check if it's Indian content and has a poster image
        const isIndianContent = item.original_language in languageNames;
        const hasPoster = item.poster_path !== null && item.poster_path !== undefined;
        
        // For additional verification, we could check if the item has watch providers
        // but the API call already filters for this with with_watch_monetization_types
        
        return isIndianContent && hasPoster;
    });
    
    if (ottContent.length > 0) {
        ottContent.forEach(item => {
            const ottCard = createOttCard(item);
            ottGrid.appendChild(ottCard);
        });
    } else {
        showNoOttResults();
    }
}

// Create an OTT content card element
function createOttCard(item) {
    const ottCard = document.createElement('div');
    ottCard.classList.add('ott-card');
    ottCard.dataset.id = item.id;
    ottCard.dataset.type = item.content_type;
    
    const title = item.content_type === 'movie' ? item.title : item.name;
    
    // Add rating badge
    const ratingBadge = `<div class="rating-badge"><i class="fas fa-star"></i> ${item.vote_average.toFixed(1)}</div>`;
    
    // Create streaming platform logos HTML
    let streamingLogosHTML = '';
    if (item.watch_providers && item.watch_providers.length > 0) {
        streamingLogosHTML = `
            <div class="streaming-platforms">
                ${item.watch_providers.slice(0, 3).map(provider => 
                    `<img class="platform-logo" src="${IMAGE_BASE_URL}w92${provider.logo_path}" 
                     alt="${provider.provider_name}" title="${provider.provider_name}">`
                ).join('')}
                ${item.watch_providers.length > 3 ? '<span class="more-platforms">+</span>' : ''}
            </div>
        `;
    }
    
    ottCard.innerHTML = `
        ${ratingBadge}
        <div class="poster-container">
            <img class="ott-poster" src="${IMAGE_BASE_URL + POSTER_SIZE + item.poster_path}" alt="${title}">
            ${streamingLogosHTML}
        </div>
    `;
    
    ottCard.addEventListener('click', () => {
        openOttDetails(item.id, item.content_type);
    });
    
    return ottCard;
}

// Open OTT content details modal
async function openOttDetails(id, contentType) {
    showOttModalLoading();
    ottModal.style.display = 'block';
    
    try {
        // Different endpoint based on content type
        const endpoint = contentType === 'movie' ? 'movie' : 'tv';
        const response = await fetch(`${BASE_URL}/${endpoint}/${id}?api_key=${API_KEY}&append_to_response=credits,watch/providers`);
        const content = await response.json();
        
        // Add content type to the data
        content.content_type = contentType;
        
        displayOttDetails(content);
    } catch (error) {
        console.error(`Error loading ${contentType} details:`, error);
        ottModalDetails.innerHTML = '<p class="error">Failed to load content details. Please try again.</p>';
    }
}

// Display OTT content details in the modal
function displayOttDetails(content) {
    const isMovie = content.content_type === 'movie';
    
    // Common data
    const title = isMovie ? content.title : content.name;
    const releaseDate = isMovie ? content.release_date : content.first_air_date;
    const formattedDate = releaseDate ? new Date(releaseDate).toLocaleDateString() : 'Unknown';
    const languageCode = content.original_language;
    const languageName = languageNames[languageCode] || languageCode;
    
    // Genres
    let genresHTML = '';
    if (content.genres && content.genres.length > 0) {
        genresHTML = content.genres.map(genre => `<span class="genre-tag">${genre.name}</span>`).join('');
    }
    
    // Cast
    let castHTML = '';
    if (content.credits && content.credits.cast && content.credits.cast.length > 0) {
        // Filter out cast members without profile images
        const castWithImages = content.credits.cast.filter(person => person.profile_path).slice(0, 10); // Get top 10 cast members with images
        
        if (castWithImages.length > 0) {
            castHTML = castWithImages.map(person => `
                <div class="cast-item">
                    <img src="${IMAGE_BASE_URL + 'w185' + person.profile_path}" alt="${person.name}">
                    <p class="cast-name">${person.name}</p>
                    <p class="cast-character">${person.character}</p>
                </div>
            `).join('');
        }
    }
    
    // Watch providers
    let watchProvidersHTML = '';
    if (content['watch/providers'] && content['watch/providers'].results && content['watch/providers'].results.IN) {
        const providers = content['watch/providers'].results.IN;
        
        if (providers.flatrate && providers.flatrate.length > 0) {
            watchProvidersHTML = `
                <div class="watch-providers">
                    <h3>Available on</h3>
                    <div class="providers-list">
                        ${providers.flatrate.map(provider => `
                            <div class="provider-item">
                                <a href="https://www.themoviedb.org/${content.content_type === 'movie' ? 'movie' : 'tv'}/${content.id}/watch" target="_blank" rel="noopener noreferrer" title="Watch on ${provider.provider_name}">
                                    <img class="provider-logo" src="${IMAGE_BASE_URL}w92${provider.logo_path}" alt="${provider.provider_name}">
                                    ${provider.provider_name}
                                </a>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    } else if (content.watch_providers && content.watch_providers.length > 0) {
        // Use the watch providers we fetched earlier
        watchProvidersHTML = `
            <div class="watch-providers">
                <h3>Available on</h3>
                <div class="providers-list">
                    ${content.watch_providers.map(provider => `
                        <div class="provider-item">
                            <a href="https://www.themoviedb.org/${content.content_type === 'movie' ? 'movie' : 'tv'}/${content.id}/watch" target="_blank" rel="noopener noreferrer" title="Watch on ${provider.provider_name}">
                                <img class="provider-logo" src="${IMAGE_BASE_URL}w92${provider.logo_path}" alt="${provider.provider_name}">
                                ${provider.provider_name}
                            </a>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // TV show specific content
    let seasonsHTML = '';
    if (!isMovie && content.seasons && content.seasons.length > 0) {
        // Filter out seasons without poster images
        const seasonsWithPosters = content.seasons.filter(season => season.poster_path);
        
        if (seasonsWithPosters.length > 0) {
            seasonsHTML = `
                <div class="seasons-info">
                    <h3>Seasons</h3>
                    <div class="seasons-list">
                        ${seasonsWithPosters.map(season => `
                            <div class="season-item">
                                <img class="season-poster" src="${IMAGE_BASE_URL + 'w185' + season.poster_path}" alt="${season.name}">
                                <p class="season-name">${season.name}</p>
                                <p class="episode-count">${season.episode_count} episodes</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    }
    
    // Build the modal content
    ottModalDetails.innerHTML = `
        <div class="modal-poster">
            <img src="${IMAGE_BASE_URL + POSTER_SIZE + content.poster_path}" alt="${title}">
        </div>
        <div class="modal-info">
            <h2 class="modal-title">${title}</h2>
            <div class="modal-meta">
                <span><i class="far fa-calendar-alt"></i> ${formattedDate}</span>
                <span><i class="fas fa-language"></i> ${languageName}</span>
                <span><i class="fas fa-star"></i> ${content.vote_average.toFixed(1)}/10</span>
                ${isMovie ? `<span><i class="fas fa-clock"></i> ${content.runtime ? content.runtime + ' min' : 'N/A'}</span>` : ''}
                <span><i class="fas ${isMovie ? 'fa-film' : 'fa-tv'}"></i> ${isMovie ? 'Digital Release' : 'Web Series'}</span>
            </div>
            <div class="modal-overview">
                <h3>Overview</h3>
                <p>${content.overview || 'No overview available.'}</p>
            </div>
            <div class="modal-genres">
                ${genresHTML}
            </div>
            ${watchProvidersHTML}
            ${seasonsHTML}
            ${content.credits && content.credits.cast && content.credits.cast.length > 0 ? `
                <div class="modal-cast">
                    <h3>Cast</h3>
                    <div class="cast-list">
                        ${castHTML}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

// Show OTT loading state
function showOttLoading() {
    ottGrid.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading OTT content...</p>
        </div>
    `;
}

// Show OTT no results message
function showNoOttResults() {
    ottGrid.innerHTML = `
        <div class="no-results">
            <i class="fas fa-film"></i>
            <p>${isSearching ? 'No streaming content found matching your search. Try different keywords or filters.' : 'No streaming content found. Try different filters or language selection.'}</p>
        </div>
    `;
}

// Show OTT error message
function showOttError() {
    ottGrid.innerHTML = `
        <div class="error">
            <i class="fas fa-exclamation-circle"></i>
            <p>Failed to load content. Please try again later.</p>
        </div>
    `;
}

// Show OTT modal loading state
function showOttModalLoading() {
    ottModalDetails.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading content details...</p>
        </div>
    `;
}

// Update OTT pagination buttons and current page display
function updateOttPagination() {
    ottCurrentPageSpan.textContent = `Page ${currentOttPage} of ${totalOttPages}`;
    ottPrevPageBtn.disabled = currentOttPage === 1;
    ottNextPageBtn.disabled = currentOttPage === totalOttPages;
}

// Debounce function to limit API calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
        clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle autocomplete
async function handleAutocomplete(event) {
    const query = event.target.value.trim();
    
    if (query.length < 2) {
        autocompleteResults.style.display = 'none';
        return;
    }
    
    try {
        const response = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false&region=IN`);
        const data = await response.json();
        
        // Filter results to only include movies and TV shows
        const results = data.results
            .filter(item => (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path)
            .slice(0, 6);

        if (results.length > 0) {
            displayAutocompleteResults(results);
            } else {
                autocompleteResults.style.display = 'none';
        }
    } catch (error) {
        console.error('Error fetching autocomplete results:', error);
            autocompleteResults.style.display = 'none';
    }
}

// Display autocomplete results
function displayAutocompleteResults(results) {
    autocompleteResults.innerHTML = '';
    
    results.forEach(item => {
        const year = item.release_date || item.first_air_date;
        const yearText = year ? new Date(year).getFullYear() : '';
        
        const resultItem = document.createElement('div');
        resultItem.className = 'autocomplete-item';
        resultItem.innerHTML = `
            <img src="${IMAGE_BASE_URL}${POSTER_SIZE}${item.poster_path}" 
                 alt="${item.title || item.name}" 
                 class="autocomplete-poster"
                 onerror="this.src='placeholder-image.jpg'">
            <div class="autocomplete-info">
                <div class="autocomplete-title">${item.title || item.name}</div>
                <div class="autocomplete-meta">
                    ${yearText ? `
                        <div class="autocomplete-year">
                            <i class="fas fa-calendar-alt"></i>
                            ${yearText}
                        </div>
                    ` : ''}
                    <div class="autocomplete-language">
                        <i class="fas fa-film"></i>
                        ${item.media_type === 'movie' ? 'Movie' : 'TV Show'}
                    </div>
                </div>
            </div>
        `;
        
        resultItem.addEventListener('click', () => {
            searchInput.value = item.title || item.name;
            autocompleteResults.style.display = 'none';
            handleSearch();
        });
        
        autocompleteResults.appendChild(resultItem);
    });
    
    autocompleteResults.style.display = 'block';
}

// Go to previous Coming Soon page
function goToComingSoonPrevPage() {
    if (currentComingSoonPage > 1) {
        currentComingSoonPage--;
        loadComingSoonContent();
        window.scrollTo(0, 0);
    }
}

// Go to next Coming Soon page
function goToComingSoonNextPage() {
    if (currentComingSoonPage < totalComingSoonPages) {
        currentComingSoonPage++;
        loadComingSoonContent();
        window.scrollTo(0, 0);
    }
}

// Load Top Rated content
async function loadTopRatedContent() {
    showTopRatedLoading();
    
    try {
        // Calculate date 6 months ago for recent content
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const sixMonthsAgoStr = sixMonthsAgo.toISOString().split('T')[0];
        
        // Prepare parameters for trending content
        const trendingParams = {
            api_key: API_KEY,
            page: 1,
            region: 'IN',
            with_origin_country: 'IN',
            sort_by: 'vote_average.desc',
            'vote_count.gte': 20,
            'vote_average.gte': 6.0,
            'primary_release_date.gte': sixMonthsAgoStr,
            'first_air_date.gte': sixMonthsAgoStr,
            'include_adult': false
        };
        
        // Create movie and TV parameters for trending
        let trendingMovieParams = new URLSearchParams(trendingParams);
        let trendingTvParams = new URLSearchParams(trendingParams);
        
        // Add language filter if selected
        if (currentLanguage !== 'all') {
            trendingMovieParams.append('with_original_language', currentLanguage);
            trendingTvParams.append('with_original_language', currentLanguage);
        }
        
        // Fetch trending movies and TV shows
        const [movieResponse, tvResponse] = await Promise.all([
            fetch(`${BASE_URL}/discover/movie?${trendingMovieParams}`),
            fetch(`${BASE_URL}/discover/tv?${trendingTvParams}`)
        ]);
        
        const movieData = await movieResponse.json();
        const tvData = await tvResponse.json();
        
        // Combine results and add content type
        let trendingResults = [
            ...movieData.results.map(item => ({ ...item, content_type: 'movie' })),
            ...tvData.results.map(item => ({ ...item, content_type: 'tv' }))
        ];
        
        // Sort by vote average
        trendingResults.sort((a, b) => b.vote_average - a.vote_average);
        
        // Take top 8 trending items
        const topTrending = trendingResults.slice(0, 8);
        
        if (topTrending.length > 0) {
            displayTopRatedContent(topTrending);
        } else {
            showNoTopRatedResults();
        }
    } catch (error) {
        console.error('Error loading trending content:', error);
        showTopRatedError();
    }
}

// Display Top Rated content
function displayTopRatedContent(content) {
    topRatedGrid.innerHTML = '';
    
    // Get today's date for comparison
    const today = new Date();
    
    // Filter content to only include those with poster images
    const contentWithPosters = content.filter(item => {
        if (!item.poster_path) return false;
        
        // Check release date for movies
        if (item.content_type === 'movie') {
            const releaseDate = item.release_date ? new Date(item.release_date) : null;
            return releaseDate && releaseDate <= today;
        }
        
        // Check first air date for TV shows
        if (item.content_type === 'tv') {
            const firstAirDate = item.first_air_date ? new Date(item.first_air_date) : null;
            return firstAirDate && firstAirDate <= today;
        }
        
        return false;
    });
    
    if (contentWithPosters.length > 0) {
        // Initialize the grid
        topRatedGrid.innerHTML = '';
        
        // Add trending content
        contentWithPosters.forEach(item => {
            let contentCard;
            if (item.content_type === 'movie') {
                contentCard = createTopRatedCard(item, 'trending');
            } else {
                const tvItem = {
                    ...item,
                    watch_providers: []
                };
                contentCard = createTopRatedCard(tvItem, 'trending');
            }
            topRatedGrid.appendChild(contentCard);
        });
    } else {
        showNoTopRatedResults();
    }
}

// Create a Top Rated card element
function createTopRatedCard(item, category) {
    const isMovie = item.content_type === 'movie';
    const card = document.createElement('div');
    card.classList.add('movie-card');
    card.dataset.id = item.id;
    card.dataset.type = isMovie ? 'movie' : 'tv';
    
    const title = isMovie ? item.title : item.name;
    
    // Add rating badge
    const ratingBadge = `<div class="rating-badge"><i class="fas fa-star"></i> ${item.vote_average.toFixed(1)}</div>`;
    
    card.innerHTML = `
        ${ratingBadge}
        <img class="movie-poster" src="${IMAGE_BASE_URL + POSTER_SIZE + item.poster_path}" alt="${title}">
    `;
    
    card.addEventListener('click', () => {
        if (isMovie) {
            openMovieDetails(item.id);
        } else {
            openOttDetails(item.id, 'tv');
        }
    });
    
    return card;
}

// Load Coming Soon content
async function loadComingSoonContent() {
    showComingSoonLoading();
    
    try {
        // Get today's date and future date (3 months from now)
        const today = getTodayDate();
        const futureDate = new Date();
        futureDate.setMonth(futureDate.getMonth() + 3);
        const futureDateStr = futureDate.toISOString().split('T')[0];
        
        // Prepare parameters for API call
        let params = new URLSearchParams({
            api_key: API_KEY,
            page: currentComingSoonPage,
            region: 'IN',
            with_origin_country: 'IN',
            'release_date.gte': today,
            'release_date.lte': futureDateStr,
            sort_by: 'release_date.asc',
            'include_adult': false
        });
        
        // Add language filter if selected
        if (currentLanguage !== 'all') {
            params.append('with_original_language', currentLanguage);
            console.log('Applying language filter to Coming Soon section:', currentLanguage);
        }
        
        // Fetch upcoming movies
        const response = await fetch(`${BASE_URL}/discover/movie?${params}`);
        const data = await response.json();
        
        console.log('Coming Soon API Response:', data.results ? data.results.length : 0, 'movies found');
        
        if (data.results && data.results.length > 0) {
            displayComingSoonContent(data.results);
            totalComingSoonPages = Math.min(data.total_pages, 500); // TMDB API limits to 500 pages
            updateComingSoonPagination();
        } else {
            showNoComingSoonResults();
        }
    } catch (error) {
        console.error('Error loading upcoming movies:', error);
        showComingSoonError();
    }
}

// Display Coming Soon content
function displayComingSoonContent(movies) {
    comingSoonGrid.innerHTML = '';
    
    // Filter movies to only include those with poster images
    const moviesWithPosters = movies.filter(movie => movie.poster_path);
    
    if (moviesWithPosters.length > 0) {
        moviesWithPosters.forEach(movie => {
            const movieCard = createComingSoonCard(movie);
            comingSoonGrid.appendChild(movieCard);
        });
    } else {
        showNoComingSoonResults();
    }
}

// Create a Coming Soon card element
function createComingSoonCard(movie) {
    const movieCard = document.createElement('div');
    movieCard.classList.add('movie-card');
    movieCard.dataset.id = movie.id;
    
    movieCard.innerHTML = `
        <img class="movie-poster" src="${IMAGE_BASE_URL + POSTER_SIZE + movie.poster_path}" alt="${movie.title}">
    `;
    
    movieCard.addEventListener('click', () => {
        openMovieDetails(movie.id);
    });
    
    return movieCard;
}

// Update Coming Soon pagination buttons and current page display
function updateComingSoonPagination() {
    comingSoonCurrentPageSpan.textContent = `Page ${currentComingSoonPage} of ${totalComingSoonPages}`;
    comingSoonPrevPageBtn.disabled = currentComingSoonPage === 1;
    comingSoonNextPageBtn.disabled = currentComingSoonPage === totalComingSoonPages;
}

// Show Top Rated loading state
function showTopRatedLoading() {
    topRatedGrid.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading trending content...</p>
        </div>
    `;
}

// Show Coming Soon loading state
function showComingSoonLoading() {
    comingSoonGrid.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading upcoming releases...</p>
        </div>
    `;
}

// Show no Top Rated results message
function showNoTopRatedResults() {
    topRatedGrid.innerHTML = `
        <div class="no-results">
            <i class="fas fa-film"></i>
            <p>No trending content found. Try a different language filter.</p>
        </div>
    `;
}

// Show no Coming Soon results message
function showNoComingSoonResults() {
    comingSoonGrid.innerHTML = `
        <div class="no-results">
            <i class="fas fa-film"></i>
            <p>No upcoming releases found. Try a different language filter.</p>
        </div>
    `;
}

// Show Top Rated error message
function showTopRatedError() {
    topRatedGrid.innerHTML = `
        <div class="error">
            <i class="fas fa-exclamation-circle"></i>
            <p>Failed to load trending content. Please try again later.</p>
        </div>
    `;
}

// Show Coming Soon error message
function showComingSoonError() {
    comingSoonGrid.innerHTML = `
        <div class="error">
            <i class="fas fa-exclamation-circle"></i>
            <p>Failed to load upcoming releases. Please try again later.</p>
        </div>
    `;
}

// Set up mobile navigation
function setupMobileNavigation() {
    const navItems = document.querySelectorAll('.mobile-nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Handle home button click
            if (item.id === 'mobile-home-btn') {
                e.preventDefault();
                
                // Reset all filters and states
                currentLanguage = 'all';
                currentPage = 1;
                currentOttPage = 1;
                currentComingSoonPage = 1;
                isSearching = false;
                searchQuery = '';
                
                // Reset language pills
                const languagePills = document.querySelectorAll('.language-pill');
                languagePills.forEach(pill => {
                    pill.classList.remove('active');
                    if (pill.dataset.language === 'all') {
                        pill.classList.add('active');
                    }
                });
                
                // Clear search input
                const searchInput = document.getElementById('search');
                if (searchInput) {
                    searchInput.value = '';
                }
                
                // Reset content type and provider filters
                if (contentTypeSelect) contentTypeSelect.value = 'all';
                if (ottProviderSelect) ottProviderSelect.value = 'all';
                
                // Reload all content
                loadOttContent();
                loadMovies();
                loadTopRatedContent();
                loadComingSoonContent();
                
                // Scroll to top
                window.scrollTo(0, 0);
                return;
            }
            
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active class to clicked item
            item.classList.add('active');
            
            // Smooth scroll to section if it has a hash link
            if (item.getAttribute('href') && item.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetId = item.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 70,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}