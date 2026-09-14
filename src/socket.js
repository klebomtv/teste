
// caminho: src/socket.js

function setupSocket(
    io,
    auth
) {

    console.log(
        '[SOCKET SERVER] Configurando Socket.IO...'
    )


    /*
     * ==========================================
     * AUTENTICAÇÃO DO SOCKET
     * ==========================================
     */

    io.use(
        (socket, next) => {

            const cookies =
                socket.handshake.headers.cookie


            if (!cookies) {

                console.log(
                    '[SOCKET SERVER] Conexão recusada: sem cookies.'
                )

                return next(
                    new Error(
                        'Não autenticado.'
                    )
                )
            }


            const match =
                cookies.match(
                    /(?:^|;\s*)session=([^;]+)/
                )


            if (!match) {

                console.log(
                    '[SOCKET SERVER] Conexão recusada: sessão não encontrada.'
                )

                return next(
                    new Error(
                        'Não autenticado.'
                    )
                )
            }


            const sessionId =
                decodeURIComponent(
                    match[1]
                )


            const valid =
                auth.isSessionValid(
                    sessionId
                )


            if (!valid) {

                console.log(
                    '[SOCKET SERVER] Conexão recusada: sessão inválida.'
                )

                return next(
                    new Error(
                        'Sessão inválida.'
                    )
                )
            }


            socket.sessionId =
                sessionId


            next()
        }
    )


    /*
     * ==========================================
     * CONEXÃO
     * ==========================================
     */

    io.on(
        'connection',
        socket => {

            console.log(
                '[SOCKET SERVER] Cliente Socket.IO conectado.'
            )


            /*
             * ======================================
             * DESCONEXÃO
             * ======================================
             */

            socket.on(
                'disconnect',
                () => {

                    console.log(
                        '[SOCKET SERVER] Cliente Socket.IO desconectado.'
                    )
                }
            )

        }
    )


    console.log(
        '[SOCKET SERVER] Socket.IO configurado.'
    )
}


module.exports =
    setupSocket

