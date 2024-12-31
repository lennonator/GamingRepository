// utils/api-handler.js

class TwitchAPI {
  constructor(clientId, clientSecret) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  async getAccessToken() {
    if (this.accessToken && this.tokenExpiry > Date.now()) {
      return this.accessToken;
    }

    const response = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'client_credentials'
      })
    });

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000);
    return this.accessToken;
  }

  async getTopGames(first = 10) {
    const token = await this.getAccessToken();
    const response = await fetch(`https://api.twitch.tv/helix/games/top?first=${first}`, {
      headers: {
        'Client-ID': this.clientId,
        'Authorization': `Bearer ${token}`
      }
    });
    return await response.json();
  }

  async getStreamsByGame(gameId, first = 100) {
    const token = await this.getAccessToken();
    const response = await fetch(
      `https://api.twitch.tv/helix/streams?game_id=${gameId}&first=${first}`,
      {
        headers: {
          'Client-ID': this.clientId,
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return await response.json();
  }
}

export { TwitchAPI };