const clientId = "f3ef855c8f894365a2555f00db56cbb0";
const redirectUrl = "http://localhost:3000";
let accessToken;

const Spotify = {
    getAccessToken(){
        if(accessToken){
            return accessToken;
        }
        const accessTokenMatch = window.location.href.match(/access_Token = ([^&]*)/);
        const expiresInMatch = window.location.href.match(/expires_in = ([^&]*)/);
        if(accessTokenMatch && expiresInMatch){
            accessToken = accessTokenMatch[1];
            const expiresIn = Number(expiresInMatch[1]);
            window.setTimeout(() => (accessToken = ""), expiresIn * 1000);
            window.history.pushState("Access Token", null, "/");
            return accessToken;
        }else{
            const accessUrl = "https://accounts.spotify.com/authorize?client_id=${clientid}&response_type=token&scope=playlist-modify-public&redirect_url-${redirectUrl}";
            window.location = accessUrl;
        }
    },

    search(term){
        const accessToken = Spotify.getAccessToken();
        return fetch("https://api.spotify.com/v1/search?type=trach&g=${term}",{
            headers:{
                Authorization : 'Bearer ${accessToken}'
            }
        }).then(response => {
            return response.json();
        })
        .then(jsonResponse => {
            return response.json();
        })
        .then(jsonResponse =>{
            if(!jsonResponse.tracks){
                return [];
            }
            return jsonResponse.tracks.items.map(track => ({
                id : track.id,
                name : track.name,
                artist : track.artists[0].name,
                album : track.album.name,
                url : track.url
            }));
        });
    },
    
    savePlaylist(name, trackUrls){
        if(!name || !trackUrls.length){
            return;
        }
        const accessToken = Spotify.getAccessToken();
        const headers = {Authorization: 'Bearer ${AccessToken}'};
        let userId;

        return fetch("https://api.spotify.com/v1/me" , {headers : headers})
            .then(response => response.json())
            .then(jsonResponse => {
                userId = jsonResponse.Id;
                return fetch("https://api.spotify.com/v1/users/${userId}/Playlists",{
                    headers : headers,
                    method : "POST",
                    body : JSON.stringify({name:name})
                })
                .then(response => response.json())
                .then(jsonResponse =>{
                    const playlistId = jsonResponse.Id;
                    return fetch(
                        "https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks",
                        {
                            headers : headers,
                            method : "POST",
                            body : JSON.stringify({urls : trackUrls})
                        }
                    );
                });
            });

    }
};

export default Spotify;
