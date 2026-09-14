
// caminho: src/socket.js

function setupSocket(
    io,
    whatsapp,
    auth
) {

    console.log(
        '[SOCKET SERVER] Configurando Socket.IO...'
    )

    io.on(
        'connection',
        (socket) => {

            console.log(
                '[SOCKET SERVER] Cliente Socket.IO conectado.'
            )

            /*
             * ==========================================
             * AUTENTICAÇÃO DO SOCKET
             * ==========================================
             */

            const cookies =
                socket.handshake.headers.cookie || ''

            const sessionMatch =
                cookies.match(
                    /(?:^|;\s*)session=([^;]+)/
                )

            const sessionId =
                sessionMatch
                    ? sessionMatch[1]
                    : null

            if (
                !sessionId ||
                !auth.isSessionValid(sessionId)
            ) {

                console.log(
                    '[SOCKET SERVER] Socket não autenticado.'
                )

                socket.emit(
                    'auth-error',
                    {
                        message:
                            'Sessão inválida ou expirada.'
                    }
                )

                socket.disconnect()

                return
            }

            /*
             * ==========================================
             * ESTADO INICIAL DO WHATSAPP
             * ==========================================
             */

            socket.emit(
                'whatsapp-state',
                whatsapp.getState()
            )

            /*
             * ==========================================
             * INICIAR WHATSAPP
             * ==========================================
             */

            socket.on(
                'start-whatsapp',
                async () => {

                    console.log(
                        '[SOCKET SERVER] start-whatsapp recebido.'
                    )

                    try {

                        socket.emit(
                            'starting-whatsapp'
                        )

                        await whatsapp.start()

                        socket.emit(
                            'start-result',
                            {
                                success: true
                            }
                        )

                    } catch (error) {

                        console.error(
                            '[SOCKET SERVER] Erro ao iniciar WhatsApp:',
                            error
                        )

                        socket.emit(
                            'start-result',
                            {
                                success: false,
                                message:
                                    error.message ||
                                    'Não foi possível iniciar o WhatsApp.'
                            }
                        )

                    }

                }
            )

            /*
             * ==========================================
             * DESCONECTAR
             * ==========================================
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

