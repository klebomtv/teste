// caminho: auth/session.js

const crypto = require('crypto')


const sessions =
    new Map()


const SESSION_DURATION =
    24 * 60 * 60 * 1000


function createSession() {

    const sessionId =
        crypto.randomBytes(
            32
        ).toString('hex')


    const expiresAt =
        Date.now() +
        SESSION_DURATION


    sessions.set(
        sessionId,
        {
            expiresAt
        }
    )


    return sessionId
}


function isSessionValid(
    sessionId
) {

    if (!sessionId) {
        return false
    }


    const data =
        sessions.get(
            sessionId
        )


    if (!data) {
        return false
    }


    if (
        Date.now() >
        data.expiresAt
    ) {

        sessions.delete(
            sessionId
        )

        return false
    }


    return true
}


function destroySession(
    sessionId
) {

    sessions.delete(
        sessionId
    )
}


function reset() {

    sessions.clear()
}


module.exports = {

    createSession,

    isSessionValid,

    destroySession,

    reset
}