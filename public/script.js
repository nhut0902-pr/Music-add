// public/app.js
document.addEventListener('DOMContentLoaded', () => {
    const loginView = document.getElementById('login-view');
    const mainView = document.getElementById('main-view');

    let accessToken = null;
    let deviceId = null;
    
    // Hàm trợ giúp để gọi API của Spotify
    async function fetchWebApi(endpoint, method, body) {
        const res = await fetch(`https://api.spotify.com/${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            method,
            body: JSON.stringify(body)
        });
        // Đối với phương thức PUT không trả về nội dung, trả về response
        if (res.status === 204) return res;
        return await res.json();
    }

    // Hàm tìm kiếm bài hát
    async function searchTracks(query) {
        const response = await fetchWebApi(`v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, 'GET');
        displayResults(response.tracks.items);
    }
    
    // Hàm hiển thị kết quả tìm kiếm
    function displayResults(tracks) {
        const resultsList = document.getElementById('search-results');
        resultsList.innerHTML = '';
        tracks.forEach(track => {
            const li = document.createElement('li');
            li.innerHTML = `
                <img src="${track.album.images[2]?.url || 'placeholder.png'}" alt="${track.album.name}">
                <div>
                    <div>${track.name}</div>
                    <div style="color: #b3b3b3;">${track.artists.map(artist => artist.name).join(', ')}</div>
                </div>
            `;
            li.addEventListener('click', () => playTrack(track.uri));
            resultsList.appendChild(li);
        });
    }

    // Hàm phát một bài hát
    async function playTrack(trackUri) {
        if (!deviceId) {
            alert("Trình phát chưa sẵn sàng. Vui lòng thử lại.");
            return;
        }
        await fetchWebApi(
            `v1/me/player/play?device_id=${deviceId}`,
            'PUT',
            { uris: [trackUri] }
        );
    }
    
    // Hàm lấy thông tin người dùng
    async function getUserProfile() {
        const profile = await fetchWebApi('v1/me', 'GET');
        const profileDiv = document.getElementById('user-profile');
        profileDiv.textContent = `Chào, ${profile.display_name}`;
    }

    // Khởi tạo Spotify Player SDK
    window.onSpotifyWebPlaybackSDKReady = () => {
        const player = new Spotify.Player({
            name: 'My Web Player',
            getOAuthToken: cb => { cb(accessToken); },
            volume: 0.5
        });

        player.addListener('ready', ({ device_id }) => {
            console.log('Ready with Device ID', device_id);
            deviceId = device_id;
        });

        player.addListener('not_ready', ({ device_id }) => {
            console.log('Device ID has gone offline', device_id);
        });
        
        player.addListener('player_state_changed', (state) => {
            if (!state) {
                return;
            }
            const currentTrack = state.track_window.current_track;
            document.getElementById('track-name').textContent = currentTrack.name;
            document.getElementById('artist-name').textContent = currentTrack.artists.map(artist => artist.name).join(', ');
            document.getElementById('album-art').src = currentTrack.album.images[0].url;
        });

        player.connect();
    };


    // Xử lý logic khi trang tải xong
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');

    if (tokenFromUrl) {
        accessToken = tokenFromUrl;
        // Xóa token khỏi URL để trông sạch sẽ hơn
        window.history.replaceState({}, document.title, "/");
        
        loginView.style.display = 'none';
        mainView.style.display = 'block';

        getUserProfile();
    } else {
        loginView.style.display = 'block';
        mainView.style.display = 'none';
    }
    
    // Thêm sự kiện cho form tìm kiếm
    const searchForm = document.getElementById('search-form');
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = document.getElementById('search-input').value;
        if (query) {
            searchTracks(query);
        }
    });
});
