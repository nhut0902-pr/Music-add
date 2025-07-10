// netlify/functions/login.js
const querystring = require('querystring');

exports.handler = async (event, context) => {
  // In tất cả các biến môi trường ra log để kiểm tra
  console.log("CLIENT ID:", process.env.SPOTIFY_CLIENT_ID);
  console.log("REDIRECT URI:", process.env.SPOTIFY_REDIRECT_URI_NETLIFY);
  
  const {
    SPOTIFY_CLIENT_ID,
    SPOTIFY_REDIRECT_URI_NETLIFY
  } = process.env;

  // Nếu một trong các biến không tồn tại, trả về lỗi
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_REDIRECT_URI_NETLIFY) {
    return {
      statusCode: 500,
      body: "Lỗi: Biến môi trường SPOTIFY_CLIENT_ID hoặc SPOTIFY_REDIRECT_URI_NETLIFY không được thiết lập trên Netlify. Vui lòng kiểm tra và deploy lại."
    }
  }

  const scope = 'streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state';

  const authUrl = 'https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: SPOTIFY_CLIENT_ID,
      scope: scope,
      redirect_uri: SPOTIFY_REDIRECT_URI_NETLIFY,
    });

  return {
    statusCode: 302,
    headers: {
      Location: authUrl,
    },
  };
};
