// caminho: auth/auth.js

const crypto = require('crypto')

const session =
    require('./session')


const AUTH_USERNAME =
    process.env.AUTH_USERNAME

const AUTH_PASSWORD =
    process.env.AUTH_PASSWORD


function login(
    username,
    password
) {

    if (
        username !== AUTH_USERNAME ||
        password !== AUTH_PASSWORD
    ) {

        return {
            success: false,
            message:
                'Login ou senha incorretos.'
        }
    }


    const sessionId =
        session.createSession()


    return {
        success: true,
        sessionId
    }
}


function createUserSession() {

    return session.createSession()
}


function isSessionValid(
    sessionId
) {

    return session.isSessionValid(
        sessionId
    )
}


function destroySession(
    sessionId
) {

    session.destroySession(
        sessionId
    )
}


function getSessionId(
    req
) {

    const cookies =
        req.headers.cookie


    if (!cookies) {
        return null
    }


    const match =
        cookies.match(
            /(?:^|;\s*)session=([^;]+)/
        )


    if (!match) {
        return null
    }


    return decodeURIComponent(
        match[1]
    )
}


module.exports = {

    login,

    createUserSession,

    isSessionValid,

    destroySession,

    getSessionId
}