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

// DOM Elements - Top Rated Section
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

// State variables - Top Rated
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
    // Movies section event listeners
    languageSelect.addEventListener('change', handleLanguageChange);
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // Add input event for autocomplete
    searchInput.addEventListener('input', debounce(handleAutocomplete, 300));
    
    // Add keyboard navigation for autocomplete
    searchInput.addEventListener('keydown', handleAutocompleteKeydown);
    
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
        const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=credits`);
        const movie = await response.json();
        
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
                                <img class="provider-logo" src="${IMAGE_BASE_URL}w92${provider.logo_path}" alt="${provider.provider_name}">
                                ${provider.provider_name}
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
                            <img class="provider-logo" src="${IMAGE_BASE_URL}w92${provider.logo_path}" alt="${provider.provider_name}">
                            ${provider.provider_name}
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
function debounce(func, delay) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

// Handle autocomplete
async function handleAutocomplete() {
    const query = searchInput.value.trim();
    
    // Clear autocomplete if query is empty
    if (!query) {
        autocompleteResults.style.display = 'none';
        return;
    }
    
    try {
        // Prepare parameters for API calls
        let params = new URLSearchParams({
            api_key: API_KEY,
            query: query,
            region: 'IN', // India region
            page: 1,
            include_adult: false
        });
        
        // Add language filter if selected
        if (currentLanguage !== 'all') {
            params.append('with_original_language', currentLanguage);
        }
        
        // Fetch movie and TV show suggestions in parallel
        const [movieResponse, tvResponse] = await Promise.all([
            fetch(`${BASE_URL}/search/movie?${params}`),
            fetch(`${BASE_URL}/search/tv?${params}`)
        ]);
        
        const movieData = await movieResponse.json();
        const tvData = await tvResponse.json();
        
        // Combine and process results
        const combinedResults = [
            ...movieData.results.map(item => ({ ...item, content_type: 'movie' })),
            ...tvData.results.map(item => ({ ...item, name: item.name, content_type: 'tv' }))
        ];
        
        // Sort by popularity
        combinedResults.sort((a, b) => b.popularity - a.popularity);
        
        // Display autocomplete results
        displayAutocompleteResults(combinedResults);
    } catch (error) {
        console.error('Error fetching autocomplete suggestions:', error);
    }
}

// Handle keyboard navigation for autocomplete
function handleAutocompleteKeydown(e) {
    // Only process if autocomplete is visible
    if (autocompleteResults.style.display !== 'block') return;
    
    const items = autocompleteResults.querySelectorAll('.autocomplete-item');
    if (items.length === 0) return;
    
    // Find currently selected item
    const currentIndex = Array.from(items).findIndex(item => 
        item.classList.contains('selected'));
    
    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            // Select next item or first if none selected
            if (currentIndex < 0 || currentIndex >= items.length - 1) {
                // Select first item
                if (items[0]) {
                    items.forEach(item => item.classList.remove('selected'));
                    items[0].classList.add('selected');
                    items[0].scrollIntoView({ block: 'nearest' });
                }
            } else {
                // Select next item
                items.forEach(item => item.classList.remove('selected'));
                items[currentIndex + 1].classList.add('selected');
                items[currentIndex + 1].scrollIntoView({ block: 'nearest' });
            }
            break;
            
        case 'ArrowUp':
            e.preventDefault();
            // Select previous item or last if none selected
            if (currentIndex <= 0) {
                // Select last item
                if (items[items.length - 1]) {
                    items.forEach(item => item.classList.remove('selected'));
                    items[items.length - 1].classList.add('selected');
                    items[items.length - 1].scrollIntoView({ block: 'nearest' });
                }
            } else {
                // Select previous item
                items.forEach(item => item.classList.remove('selected'));
                items[currentIndex - 1].classList.add('selected');
                items[currentIndex - 1].scrollIntoView({ block: 'nearest' });
            }
            break;
            
        case 'Enter':
            // If an item is selected, use it
            if (currentIndex >= 0) {
                e.preventDefault();
                const selectedItem = items[currentIndex];
                const title = selectedItem.querySelector('.autocomplete-title').textContent;
                searchInput.value = title;
                autocompleteResults.style.display = 'none';
                handleSearch();
            }
            break;
            
        case 'Escape':
            // Close autocomplete
            autocompleteResults.style.display = 'none';
            break;
    }
}

// Display autocomplete results
function displayAutocompleteResults(results) {
    // Clear previous results
    autocompleteResults.innerHTML = '';
    
    // Filter results to only include those with poster images
    const resultsWithPosters = results.filter(item => item.poster_path).slice(0, 5);
    
    if (resultsWithPosters.length === 0) {
        autocompleteResults.style.display = 'none';
        return;
    }
    
    // Create and append autocomplete items
    resultsWithPosters.forEach((item, index) => {
        const isMovie = item.content_type === 'movie';
        const title = isMovie ? item.title : item.name;
        const releaseDate = isMovie ? item.release_date : item.first_air_date;
        const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : '';
        const contentType = isMovie ? 'Movie' : 'TV Show';
        
        const itemElement = document.createElement('div');
        itemElement.classList.add('autocomplete-item');
        // Select first item by default
        if (index === 0) {
            itemElement.classList.add('selected');
        }
        
        itemElement.innerHTML = `
            <img class="autocomplete-poster" src="${IMAGE_BASE_URL + 'w92' + item.poster_path}" alt="${title}">
            <div class="autocomplete-info">
                <h4 class="autocomplete-title">${title}</h4>
                <span class="autocomplete-year">${releaseYear} ${contentType}</span>
            </div>
        `;
        
        // Add click event to select this item
        itemElement.addEventListener('click', () => {
            searchInput.value = title;
            autocompleteResults.style.display = 'none';
            handleSearch();
        });
        
        autocompleteResults.appendChild(itemElement);
    });
    
    // Show the autocomplete dropdown
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
        
        // Prepare common parameters for all-time top rated
        const allTimeParams = {
            api_key: API_KEY,
            page: 1,
            region: 'IN',
            with_origin_country: 'IN',
            sort_by: 'vote_average.desc',
            'vote_count.gte': 50, // Further lowered to get more results
            'vote_average.gte': 7.0, // Further lowered to get more results
            'include_adult': false
        };
        
        // Prepare common parameters for recent top rated
        const recentParams = {
            api_key: API_KEY,
            page: 1,
            region: 'IN',
            with_origin_country: 'IN',
            sort_by: 'vote_average.desc',
            'vote_count.gte': 20, // Further lowered to get more results
            'vote_average.gte': 6.0, // Further lowered to get more results
            'primary_release_date.gte': sixMonthsAgoStr, // Movies from last 6 months
            'first_air_date.gte': sixMonthsAgoStr, // TV shows from last 6 months
            'include_adult': false
        };
        
        // Create movie and TV parameters for all-time
        let allTimeMovieParams = new URLSearchParams(allTimeParams);
        let allTimeTvParams = new URLSearchParams(allTimeParams);
        
        // Create movie and TV parameters for recent
        let recentMovieParams = new URLSearchParams(recentParams);
        let recentTvParams = new URLSearchParams(recentParams);
        
        // Add language filter if selected
        if (currentLanguage !== 'all') {
            allTimeMovieParams.append('with_original_language', currentLanguage);
            allTimeTvParams.append('with_original_language', currentLanguage);
            recentMovieParams.append('with_original_language', currentLanguage);
            recentTvParams.append('with_original_language', currentLanguage);
        }
        
        // Fetch all-time top rated movies and TV shows
        const [allTimeMovieResponse, allTimeTvResponse, recentMovieResponse, recentTvResponse] = await Promise.all([
            fetch(`${BASE_URL}/discover/movie?${allTimeMovieParams}`),
            fetch(`${BASE_URL}/discover/tv?${allTimeTvParams}`),
            fetch(`${BASE_URL}/discover/movie?${recentMovieParams}`),
            fetch(`${BASE_URL}/discover/tv?${recentTvParams}`)
        ]);
        
        const allTimeMovieData = await allTimeMovieResponse.json();
        const allTimeTvData = await allTimeTvResponse.json();
        const recentMovieData = await recentMovieResponse.json();
        const recentTvData = await recentTvResponse.json();
        
        console.log('API Response - All Time Movies:', allTimeMovieData.results.length);
        console.log('API Response - All Time TV:', allTimeTvData.results.length);
        console.log('API Response - Recent Movies:', recentMovieData.results.length);
        console.log('API Response - Recent TV:', recentTvData.results.length);
        
        // Combine all-time results and add content type and category
        let allTimeResults = [
            ...allTimeMovieData.results.map(item => ({ ...item, content_type: 'movie', category: 'all-time' })),
            ...allTimeTvData.results.map(item => ({ ...item, content_type: 'tv', category: 'all-time' }))
        ];
        
        // Combine recent results and add content type and category
        let recentResults = [
            ...recentMovieData.results.map(item => ({ ...item, content_type: 'movie', category: 'recent' })),
            ...recentTvData.results.map(item => ({ ...item, content_type: 'tv', category: 'recent' }))
        ];
        
        // Sort each category by vote average
        allTimeResults.sort((a, b) => b.vote_average - a.vote_average);
        recentResults.sort((a, b) => b.vote_average - a.vote_average);
        
        console.log('Combined All Time Results:', allTimeResults.length);
        console.log('Combined Recent Results:', recentResults.length);
        
        // Take top 4 from each category
        const topAllTime = allTimeResults.slice(0, 4);
        const topRecent = recentResults.slice(0, 4);
        
        console.log('Top All Time (after slice):', topAllTime.length);
        console.log('Top Recent (after slice):', topRecent.length);
        
        // Combine for final display
        const combinedResults = [...topRecent, ...topAllTime];
        
        if (combinedResults.length > 0) {
            displayTopRatedContent(combinedResults);
        } else {
            showNoTopRatedResults();
        }
    } catch (error) {
        console.error('Error loading top rated content:', error);
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
        // First add a heading for recent top rated
        topRatedGrid.innerHTML = `
            <div class="top-rated-category">
                <h3>Recent Hits <span class="top-rated-subtitle">Top rated from the last 6 months</span></h3>
            </div>
        `;
        
        // Add recent content first
        const recentContent = contentWithPosters.filter(item => item.category === 'recent');
        console.log('Recent content count:', recentContent.length); // Debug log
        
        recentContent.forEach(item => {
            let contentCard;
            if (item.content_type === 'movie') {
                contentCard = createTopRatedCard(item, 'recent');
            } else {
                // Convert TV show data to match the format expected by createOttCard
                const tvItem = {
                    ...item,
                    watch_providers: [] // No watch providers for top rated section
                };
                contentCard = createTopRatedCard(tvItem, 'recent');
            }
            topRatedGrid.appendChild(contentCard);
        });
        
        // Add a heading for all-time classics
        const allTimeHeading = document.createElement('div');
        allTimeHeading.className = 'top-rated-category';
        allTimeHeading.innerHTML = `
            <h3>All-Time Classics <span class="top-rated-subtitle">Highest rated of all time</span></h3>
        `;
        topRatedGrid.appendChild(allTimeHeading);
        
        // Add all-time content
        const allTimeContent = contentWithPosters.filter(item => item.category === 'all-time');
        console.log('All-time content count:', allTimeContent.length); // Debug log
        
        allTimeContent.forEach(item => {
            let contentCard;
            if (item.content_type === 'movie') {
                contentCard = createTopRatedCard(item, 'all-time');
            } else {
                // Convert TV show data to match the format expected by createOttCard
                const tvItem = {
                    ...item,
                    watch_providers: [] // No watch providers for top rated section
                };
                contentCard = createTopRatedCard(tvItem, 'all-time');
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
            <p>Loading top rated content...</p>
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
            <p>No top rated movies or TV shows found. Try a different language filter.</p>
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
            <p>Failed to load top rated content. Please try again later.</p>
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

// Setup Mobile Navigation
function setupMobileNavigation() {
    // Get mobile elements
    const mobileHomeBtn = document.getElementById('mobile-home-btn');
    const mobileSearchBtn = document.getElementById('mobile-search-btn');
    const mobileFilterBtn = document.getElementById('mobile-filter-btn');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');

    const mobileSearchPanel = document.querySelector('.mobile-search-panel');
    const mobileFilterPanel = document.querySelector('.mobile-filter-panel');
    const mobileMenuPanel = document.querySelector('.mobile-menu-panel');

    console.log('Mobile elements:', {
        mobileHomeBtn,
        mobileSearchBtn,
        mobileFilterBtn,
        mobileMenuBtn,
        mobileSearchPanel,
        mobileFilterPanel,
        mobileMenuPanel
    });

    const mobileSearchInput = document.getElementById('mobile-search-input');
    const mobileSearchSubmit = document.getElementById('mobile-search-submit');
    const mobileAutocompleteResults = document.getElementById('mobile-autocomplete-results');

    const mobileLanguageSelect = document.getElementById('mobile-language-select');
    const mobileContentTypeSelect = document.getElementById('mobile-content-type-select');
    const mobileOttProviderSelect = document.getElementById('mobile-ott-provider-select');

    const panelCloseButtons = document.querySelectorAll('.panel-close');
    console.log('Panel close buttons:', panelCloseButtons);

    // Function to close all panels
    function closeAllPanels() {
        console.log('Closing all panels');
        mobileSearchPanel.classList.remove('active');
        mobileFilterPanel.classList.remove('active');
        mobileMenuPanel.classList.remove('active');
        
        // Reset active state on nav items
        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            item.classList.remove('active');
        });
    }
    
    // Home button - close all panels
    if (mobileHomeBtn) {
        mobileHomeBtn.addEventListener('click', () => {
            console.log('Home button clicked');
            closeAllPanels();
            mobileHomeBtn.classList.add('active');
            window.scrollTo(0, 0);
        });
    }
    
    // Search button - toggle search panel
    if (mobileSearchBtn && mobileSearchPanel) {
        mobileSearchBtn.addEventListener('click', () => {
            console.log('Search button clicked');
            closeAllPanels();
            mobileSearchPanel.classList.add('active');
            mobileSearchBtn.classList.add('active');
            mobileSearchInput.focus();
        });
    }
    
    // Filter button - toggle filter panel
    if (mobileFilterBtn && mobileFilterPanel) {
        mobileFilterBtn.addEventListener('click', () => {
            console.log('Filter button clicked');
            closeAllPanels();
            mobileFilterPanel.classList.add('active');
            mobileFilterBtn.classList.add('active');
        });
    }
    
    // Menu button - toggle menu panel
    if (mobileMenuBtn && mobileMenuPanel) {
        mobileMenuBtn.addEventListener('click', () => {
            console.log('Menu button clicked');
            closeAllPanels();
            mobileMenuPanel.classList.add('active');
            mobileMenuBtn.classList.add('active');
        });
    }
    
    // Close buttons for panels
    if (panelCloseButtons) {
        panelCloseButtons.forEach(button => {
            button.addEventListener('click', () => {
                console.log('Close button clicked');
                closeAllPanels();
            });
        });
    }
    
    // Mobile menu items
    const mobileMenuItems = document.querySelectorAll('.mobile-menu-item');
    if (mobileMenuItems) {
        mobileMenuItems.forEach(item => {
            item.addEventListener('click', () => {
                closeAllPanels();
                
                // Update active state
                mobileMenuItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }
    
    // Mobile search functionality
    if (mobileSearchSubmit && mobileSearchInput) {
        mobileSearchSubmit.addEventListener('click', () => {
            const query = mobileSearchInput.value.trim();
            if (query) {
                searchQuery = query;
                isSearching = true;
                currentPage = 1;
                currentOttPage = 1;
                
                // Load both movies and OTT content with the search query
                loadMovies();
                loadOttContent();
                
                // Close panel and scroll to top
                closeAllPanels();
                window.scrollTo(0, 0);
            }
        });
        
        mobileSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                mobileSearchSubmit.click();
            }
        });
        
        // Mobile autocomplete
        mobileSearchInput.addEventListener('input', debounce(() => {
            const query = mobileSearchInput.value.trim();
            if (query.length >= 2) {
                fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=1&include_adult=false&region=IN`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.results && data.results.length > 0) {
                            displayMobileAutocompleteResults(data.results.slice(0, 5));
                        } else {
                            mobileAutocompleteResults.style.display = 'none';
                        }
                    })
                    .catch(error => {
                        console.error('Error with autocomplete:', error);
                        mobileAutocompleteResults.style.display = 'none';
                    });
            } else {
                mobileAutocompleteResults.style.display = 'none';
            }
        }, 300));
    }
    
    // Mobile filter functionality
    if (mobileLanguageSelect) {
        mobileLanguageSelect.addEventListener('change', () => {
            currentLanguage = mobileLanguageSelect.value;
            languageSelect.value = currentLanguage; // Sync with desktop
            currentPage = 1;
            currentOttPage = 1;
            currentComingSoonPage = 1;
            
            // Reload all content sections
            loadMovies();
            loadOttContent();
            loadTopRatedContent();
            loadComingSoonContent();
            
            // Close panel
            closeAllPanels();
        });
    }
    
    if (mobileContentTypeSelect) {
        mobileContentTypeSelect.addEventListener('change', () => {
            currentContentType = mobileContentTypeSelect.value;
            contentTypeSelect.value = currentContentType; // Sync with desktop
            currentOttPage = 1;
            loadOttContent();
            
            // Close panel
            closeAllPanels();
        });
    }
    
    if (mobileOttProviderSelect) {
        mobileOttProviderSelect.addEventListener('change', () => {
            currentOttProvider = mobileOttProviderSelect.value;
            ottProviderSelect.value = currentOttProvider; // Sync with desktop
            currentOttPage = 1;
            loadOttContent();
            
            // Close panel
            closeAllPanels();
        });
    }
}

// Function to display mobile autocomplete results
function displayMobileAutocompleteResults(results) {
    mobileAutocompleteResults.innerHTML = '';
    mobileAutocompleteResults.style.display = 'block';
    
    results.forEach(result => {
        if ((result.media_type === 'movie' || result.media_type === 'tv') && result.poster_path) {
            const resultItem = document.createElement('div');
            resultItem.className = 'autocomplete-item';
            
            const title = result.media_type === 'movie' ? result.title : result.name;
            const year = result.media_type === 'movie' 
                ? (result.release_date ? new Date(result.release_date).getFullYear() : 'Unknown')
                : (result.first_air_date ? new Date(result.first_air_date).getFullYear() : 'Unknown');
            
            resultItem.innerHTML = `
                <img src="${IMAGE_BASE_URL}w92${result.poster_path}" alt="${title}">
                <div>
                    <div class="autocomplete-title">${title}</div>
                    <div class="autocomplete-info">${year} • ${result.media_type === 'movie' ? 'Movie' : 'TV Show'}</div>
                </div>
            `;
            
            resultItem.addEventListener('click', () => {
                mobileSearchInput.value = title;
                mobileAutocompleteResults.style.display = 'none';
                
                if (result.media_type === 'movie') {
                    openMovieDetails(result.id);
                } else {
                    openOttDetails(result.id, 'tv');
                }
                
                closeAllPanels();
            });
            
            mobileAutocompleteResults.appendChild(resultItem);
        }
    });
}