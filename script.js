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
    loadMovies();
    loadOttContent();
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
}

// Handle language filter change
function handleLanguageChange() {
    currentLanguage = languageSelect.value;
    currentPage = 1;
    currentOttPage = 1;
    loadMovies();
    loadOttContent();
}

// Handle search
function handleSearch() {
    const query = searchInput.value.trim();
    if (query) {
        searchQuery = query;
        isSearching = true;
        currentPage = 1;
        loadMovies();
    } else {
        isSearching = false;
        searchQuery = '';
        loadMovies();
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
    
    const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown';
    const languageCode = movie.original_language;
    const languageName = languageNames[languageCode] || languageCode;
    
    // Add content type badge
    const typeBadge = '<span class="content-type movie">Movie</span>';
    
    // Add rating badge
    const ratingBadge = `<div class="rating-badge"><i class="fas fa-star"></i> ${movie.vote_average.toFixed(1)}</div>`;
    
    movieCard.innerHTML = `
        ${typeBadge}
        ${ratingBadge}
        <img class="movie-poster" src="${IMAGE_BASE_URL + POSTER_SIZE + movie.poster_path}" alt="${movie.title}">
        <div class="movie-info">
            <h3 class="movie-title">${movie.title}</h3>
            <p class="movie-year">${releaseYear}</p>
            <span class="movie-language">${languageName}</span>
        </div>
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
            <p>No movies found. Try a different search or language filter.</p>
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
        
        // Prepare parameters for API calls
        let movieParams = new URLSearchParams({
            api_key: API_KEY,
            page: currentOttPage,
            region: 'IN',
            with_origin_country: 'IN',
            'release_date.lte': today,
            sort_by: 'release_date.desc',
            with_watch_monetization_types: 'flatrate', // Only include content available for streaming
            watch_region: 'IN', // Specify India as the watch region
            append_to_response: 'watch/providers' // Include watch provider information
        });
        
        let tvParams = new URLSearchParams({
            api_key: API_KEY,
            page: currentOttPage,
            region: 'IN',
            with_origin_country: 'IN',
            sort_by: 'first_air_date.desc',
            with_watch_monetization_types: 'flatrate', // Only include content available for streaming
            watch_region: 'IN', // Specify India as the watch region
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
    const releaseDate = item.content_type === 'movie' ? item.release_date : item.first_air_date;
    const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : 'Unknown';
    const languageCode = item.original_language;
    const languageName = languageNames[languageCode] || languageCode;
    
    // Add badge to indicate if it's a movie or TV show
    const typeBadge = item.content_type === 'movie' ? 
        '<span class="content-type movie">Digital Release</span>' : 
        '<span class="content-type tv">Web Series</span>';
    
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
        ${typeBadge}
        ${ratingBadge}
        <div class="poster-container">
            <img class="ott-poster" src="${IMAGE_BASE_URL + POSTER_SIZE + item.poster_path}" alt="${title}">
            ${streamingLogosHTML}
        </div>
        <div class="ott-info">
            <h3 class="ott-title">${title}</h3>
            <p class="ott-year">${releaseYear}</p>
            <span class="ott-language">${languageName}</span>
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
            <p>No digital releases found. Try a different filter or language selection.</p>
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