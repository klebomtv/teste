// caminho: auth/routes.js

const path =
    require('path')


const auth =
    require('./auth')


function setupAuthRoutes(
    app
) {

    /*
     * Página de login.
     */

    app.get(
        '/',
        (req, res) => {

            const sessionId =
                auth.getSessionId(
                    req
                )


            if (
                sessionId &&
                auth.isSessionValid(
                    sessionId
                )
            ) {

                return res.sendFile(
                    path.join(
                        __dirname,
                        '../public/index.html'
                    )
                )
            }


            res.sendFile(
                path.join(
                    __dirname,
                    '../public/login/index.html'
                )
            )
        }
    )


    /*
     * Login.
     */

    app.post(
        '/auth/login',
        (req, res) => {

            const {
                username,
                password
            } = req.body || {}


            const result =
                auth.login(
                    username,
                    password
                )


            if (!result.success) {

                return res.status(
                    401
                ).json(
                    result
                )
            }


            res.cookie(
                'session',
                result.sessionId,
                {
                    httpOnly: true,
                    sameSite: 'strict',
                    secure:
                        process.env.NODE_ENV ===
                        'production',
                    path: '/',
                    maxAge:
                        24 * 60 * 60 * 1000
                }
            )


            res.json({
                success: true
            })
        }
    )


    /*
     * Logout pelo navegador.
     *
     * Este endpoint continua existindo
     * como alternativa ao logout pelo
     * Socket.IO.
     */

    app.post(
        '/auth/logout',
        (req, res) => {

            const sessionId =
                auth.getSessionId(
                    req
                )


            if (sessionId) {

                auth.destroySession(
                    sessionId
                )
            }


            res.clearCookie(
                'session',
                {
                    httpOnly: true,
                    sameSite: 'strict',
                    secure:
                        process.env.NODE_ENV ===
                        'production',
                    path: '/'
                }
            )


            res.json({
                success: true
            })
        }
    )


    /*
     * Verifica se o usuário
     * está autenticado.
     */

    app.get(
        '/auth/status',
        (req, res) => {

            const sessionId =
                auth.getSessionId(
                    req
                )


            const authenticated =
                !!(
                    sessionId &&
                    auth.isSessionValid(
                        sessionId
                    )
                )


            res.json({
                authenticated
            })
        }
    )


    /*
     * O socket.js precisa acessar
     * diretamente essas funções.
     */

    return {

        isSessionValid:
            auth.isSessionValid,

        destroySession:
            auth.destroySession

    }
}


module.exports =
    setupAuthRoutes