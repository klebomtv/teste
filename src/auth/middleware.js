
// caminho: src/auth/middleware.js


function requireAuth(
    auth
) {

    return function (
        req,
        res,
        next
    ) {

        const sessionId =
            auth.getSessionId(
                req
            )


        if (
            !sessionId
        ) {

            return res.redirect(
                '/login/'
            )

        }


        const valid =
            auth.isSessionValid(
                sessionId
            )


        if (
            !valid
        ) {

            return res.redirect(
                '/login/'
            )

        }


        next()

    }

}


module.exports = {

    requireAuth

}

