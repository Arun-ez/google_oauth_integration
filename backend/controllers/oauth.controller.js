/*
* **** Processes involved in implementation of Google OAuth ****
*
* Configure consent screen and get Client Id and Client Secret
* Check: https://console.cloud.google.com/apis/credentials
* Blog: https://blog.arunshaw.in/blog/server-side-google-oauth-with-nodejs-and-react
*
* Creating google consent screen url with client id
* Google redirects the provided redirect uri with a code in params
* Getting access_token and id_token form google apis using the code
* Getting user details using the access token and token id
*/

import jwt from 'jsonwebtoken';

const handleGoogleConsentScreen = async (req, res) => {

    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');

    const options = {
        redirect_uri: process.env.REDIRECT_URI,
        client_id: process.env.GOOGLE_CLIENT_ID,
        access_type: 'offline',
        response_type: 'code',
        prompt: 'consent',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
        ].join(' ')
    }

    url.search = new URLSearchParams(options);

    return res.redirect(url);
}

const getGoogleAccessTokens = async (code) => {
    const url = new URL('https://oauth2.googleapis.com/token');

    const tokenExchangeOptions = {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.REDIRECT_URI,
        grant_type: 'authorization_code',
    }

    url.search = new URLSearchParams(tokenExchangeOptions);

    let response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    })

    let data = await response.json();

    return data;
}

const getGoogleUserInfo = async (access_token, id_token) => {

    const url = new URL('https://www.googleapis.com/oauth2/v1/userinfo');

    const options = {
        alt: 'json',
        access_token
    }

    url.search = new URLSearchParams(options);

    let response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${id_token}`,
        },
    })

    let data = await response.json();
    return data;
}

const onSuccessGoogleOAuth = async (req, res) => {

    const { code } = req.query;

    try {
        let { access_token, id_token } = await getGoogleAccessTokens(code);

        let data = await getGoogleUserInfo(access_token, id_token);

        let sessionToken = jwt.sign(data, process.env.JWT_SECRET_KEY);

        const date = new Date();
        date.setDate(date.getDate() + 30);

        res.cookie('session', sessionToken, {
            path: '/',
            expires: date,
            domain: process.env.COOKIE_DOMAIN,
        })

        return res.redirect(process.env.FRONTEND_URL);

    } catch (error) {
        return res.redirect(`${process.env.FRONTEND_URL}?error=Something wen wrong`);
    }
}

const verifyToken = (req, res) => {

    const { token } = req.params;

    try {
        let validation = jwt.verify(token, process.env.JWT_SECRET_KEY);
        return res.send({ validation });
    } catch (error) {
        return res.status(404).send({ validation: null });
    }
}

const signout = (req, res) => {
    res.clearCookie('session', { domain: process.env.COOKIE_DOMAIN });
    return res.redirect(process.env.FRONTEND_URL);
}

export { handleGoogleConsentScreen, onSuccessGoogleOAuth, verifyToken, signout }
