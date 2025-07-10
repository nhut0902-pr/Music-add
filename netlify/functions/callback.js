// netlify/functions/callback.js
const axios = require('axios');
const querystring = require('querystring');

const {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_REDIRECT_URI_NETLIFY
} = process.env;

exports.handler = async (event, context) => {
  const code = event.queryStringParameters.code || null;

  try {
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: querystring.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: SPOTIFY_REDIRECT_URI_NETLIFY,
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + (Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')),
      },
    });

    const accessToken = response.data.access_token;
    const refreshToken = response.data.refresh_token;

    // Chuyển hướng người dùng trở lại trang chủ với token
    // Dấu # giúp truyền dữ liệu mà không tải lại trang
    const redirectUrl = `/?token=${accessToken}&refresh=${refreshToken}`;

    return {
      statusCode: 302,
      headers: {
        Location: redirectUrl,
      },
    };

  } catch (error) {
    console.error("Error in callback function", error.response ? error.response.data : error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
