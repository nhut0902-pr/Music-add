// netlify/functions/login.js
const querystring = require('querystring');

const {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_REDIRECT_URI_NETLIFY
} = process.env;

exports.handler = async (event, context) => {
  const scope = 'streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state';

  const authUrl = 'https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: SPOTIFY_CLIENT_ID,
      scope: scope,
      redirect_uri: SPOTIFY_REDIRECT_URI_NETLIFY,
    });

  return {
    statusCode: 302, // 302 là mã cho việc chuyển hướng tạm thời
    headers: {
      Location: authUrl,
    },
  };
};
