const API_KEY = 'fce2ccd9-3605-445d-b734-65b795bf2794';
const API_URL = 'https://kinopoiskapiunofficial.tech/api/v2.2/films/top?type=TOP_250_BEST_FILMS';

let currentPage = 1;
let totalPages = 1;

const outputDiv = document.getElementById('output');
const loadBtn = document.getElementById('loadBtn');
const loadMoreBtn = document.getElementById('loadMoreBtn');

async function loadFirstPage() {
    currentPage = 1;
    outputDiv.innerHTML = '<div class="loading">⏳ Загрузка...</div>';
    loadMoreBtn.style.display = 'none';
    loadBtn.disabled = true;
    await fetchMovies(currentPage);
    loadBtn.disabled = false;
}

async function loadMore() {
    currentPage++;
    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = 'Загрузка...';
    await fetchMovies(currentPage);
    loadMoreBtn.disabled = false;
    loadMoreBtn.textContent = 'Загрузить ещё';
}

async function fetchMovies(page) {
    try {
        const response = await fetch(`${API_URL}&page=${page}`, {
            method: 'GET',
            headers: {
                'X-API-Key': API_KEY,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const movies = data.films;
        totalPages = data.pagesCount || 1;

        if (!movies || !Array.isArray(movies) || movies.length === 0) {
            if (page === 1) {
                outputDiv.innerHTML = '<div class="error">⚠️ Фильмы не найдены или пустой список.</div>';
            }
            loadMoreBtn.style.display = 'none';
            return;
        }
        let cardsHtml = '';
        movies.forEach(movie => {
            const title = movie.nameRu || movie.nameEn || 'Без названия';
            const year = movie.year || '';
            const rating = movie.rating || '';
            const genres = (movie.genres && movie.genres.length > 0)
                ? movie.genres.map(g => g.genre).join(', ')
                : '';
            const countries = (movie.countries && movie.countries.length > 0)
                ? movie.countries.map(c => c.country).join(', ')
                : '';
            const length = movie.filmLength ? `${movie.filmLength} мин.` : '';
            const posterUrl = movie.posterUrlPreview || movie.posterUrl || '';

            cardsHtml += `
                        <div class="movie-card">
                            <div class="movie-poster">
                                ${posterUrl
                    ? `<img src="${posterUrl}" alt="${title}" loading="lazy">`
                    : 'Нет постера'}
                            </div>
                            <div class="movie-info">
                                <div class="movie-title">${title}</div>
                                ${year ? `<div class="movie-details">📅 Год: ${year}</div>` : ''}
                                ${genres ? `<div class="movie-details">🎭 Жанр: ${genres}</div>` : ''}
                                ${countries ? `<div class="movie-details">🌍 Страна: ${countries}</div>` : ''}
                                ${length ? `<div class="movie-details">⏱️ Длительность: ${length}</div>` : ''}
                                ${rating ? `<div><span class="movie-rating">⭐ ${rating}</span></div>` : ''}
                            </div>
                        </div>
                    `;
        });

        if (page === 1) {
            outputDiv.innerHTML = `<div class="movies-grid">${cardsHtml}</div>`;
        } else {
            const grid = document.querySelector('.movies-grid');
            if (grid) {
                grid.insertAdjacentHTML('beforeend', cardsHtml);
            } else {
                outputDiv.innerHTML = `<div class="movies-grid">${cardsHtml}</div>`;
            }
        }
        if (currentPage < totalPages) {
            loadMoreBtn.style.display = 'inline-block';
        } else {
            loadMoreBtn.style.display = 'none';
        }

    } catch (error) {
        if (page === 1) {
            outputDiv.innerHTML = `<div class="error">❌ Ошибка: ${error.message}</div>`;
        } else {
            alert(`Не удалось загрузить страницу ${page}: ${error.message}`);
            currentPage--;
            loadMoreBtn.style.display = 'none';
            console.error('Ошибка при получении фильмов:', error);
        }
    }
}

loadBtn.addEventListener('click', loadFirstPage);
loadMoreBtn.addEventListener('click', loadMore);