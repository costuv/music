const clientId = '5cf53a7c64d744318c037135c5f5b6e0';
const clientSecret = 'a848d1fa22484e628e9939749c6ea0c6';

// Get access token using client credentials
async function getAccessToken() {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
        },
        body: 'grant_type=client_credentials'
    });
    const data = await response.json();
    return data.access_token;
}

// Modify the search function to verify track availability
async function searchTracks(query) {
    const token = await getAccessToken();
    try {
        const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        const data = await response.json();
        console.log('Search results:', data); // Debug log
        return data.tracks.items;
    } catch (error) {
        console.error('Search error:', error);
        return [];
    }
}

// Initialize player
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const searchResults = document.getElementById('search-results');

function displaySearchResults(tracks) {
    searchResults.innerHTML = '';
    if (!tracks || tracks.length === 0) {
        searchResults.innerHTML = '<div class="text-center text-gray-400">No songs found</div>';
        return;
    }

    tracks.forEach(track => {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'flex items-center gap-3 p-2 hover:bg-gray-800 rounded cursor-pointer';
        resultDiv.innerHTML = `
            <img src="${track.album.images[2]?.url || 'https://placehold.co/40x40'}" 
                class="w-10 h-10 rounded" alt="Album Art">
            <div>
                <div class="font-medium">${track.name}</div>
                <div class="text-sm text-gray-400">${track.artists[0].name}</div>
            </div>
        `;
        resultDiv.addEventListener('click', () => embedSpotifyTrack(track));
        searchResults.appendChild(resultDiv);
    });
}

function embedSpotifyTrack(track) {
    const searchSection = document.getElementById('search-section');
    const playerSection = document.getElementById('player-section');
    
    playerSection.innerHTML = `
        <div class="max-w-2xl mx-auto">
            <button id="back-button" class="mb-4 text-blue-400 hover:text-blue-300 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Search
            </button>
            <iframe
                src="https://open.spotify.com/embed/track/${track.id}"
                width="100%"
                height="380"
                frameBorder="0"
                allowtransparency="true"
                allow="encrypted-media"
                loading="lazy">
            </iframe>
        </div>
    `;

    // Show player section
    searchSection.classList.add('hidden');
    playerSection.classList.remove('hidden');

    // Add back button handler
    document.getElementById('back-button').addEventListener('click', () => {
        searchSection.classList.remove('hidden');
        playerSection.classList.add('hidden');
        document.getElementById('search-input').value = '';
        document.getElementById('search-results').innerHTML = '';
    });
}

// Handle search
searchButton.addEventListener('click', async () => {
    const query = searchInput.value.trim();
    if (query) {
        searchButton.disabled = true;
        searchButton.textContent = 'Searching...';
        try {
            const tracks = await searchTracks(query);
            displaySearchResults(tracks);
        } catch (error) {
            console.error('Search failed:', error);
            searchResults.innerHTML = '<div class="text-center text-red-500">Search failed. Please try again.</div>';
        } finally {
            searchButton.disabled = false;
            searchButton.textContent = 'Search';
        }
    }
});

// Enter key support for search
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchButton.click();
    }
});
