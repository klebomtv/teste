
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
        socket => {

            console.log(
                '[SOCKET SERVER] Cliente Socket.IO conectado.'
            )

            console.log(
                '[SOCKET SERVER] Socket ID:',
                socket.id
            )

            console.log(
                '[SOCKET SERVER] Transport:',
                socket.conn.transport.name
            )


            /*
             * ==========================================
             * DIAGNÓSTICO ENGINE.IO
             * ==========================================
             */

            socket.conn.on(
                'upgrade',
                () => {

                    console.log(
                        '[SOCKET SERVER] Transport atualizado para:',
                        socket.conn.transport.name
                    )

                }
            )


            socket.conn.on(
                'close',
                reason => {

                    console.error(
                        '[SOCKET SERVER] ENGINE.IO CLOSE:',
                        reason
                    )

                }
            )


            socket.conn.on(
                'error',
                error => {

                    console.error(
                        '[SOCKET SERVER] ENGINE.IO ERROR:',
                        error
                    )

                }
            )


            /*
             * ==========================================
             * AUTENTICAÇÃO DA SESSÃO
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


            console.log(
                '[SOCKET SERVER] Session encontrada:',
                Boolean(sessionId)
            )


            if (
                !sessionId ||
                !auth.isSessionValid(
                    sessionId
                )
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


            console.log(
                '[SOCKET SERVER] Socket autenticado.'
            )


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


                    } catch (
                        error
                    ) {

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
             * DESCONEXÃO SOCKET.IO
             * ==========================================
             */

            socket.on(
                'disconnect',
                reason => {

                    console.log(
                        '======================================'
                    )

                    console.log(
                        '[SOCKET SERVER] CLIENTE DESCONECTADO'
                    )

                    console.log(
                        '[SOCKET SERVER] Socket ID:',
                        socket.id
                    )

                    console.log(
                        '[SOCKET SERVER] Motivo:',
                        reason
                    )

                    console.log(
                        '[SOCKET SERVER] Connected:',
                        socket.connected
                    )

                    console.log(
                        '[SOCKET SERVER] Transport:',
                        socket.conn?.transport?.name
                    )

                    console.log(
                        '[SOCKET SERVER] Handshake URL:',
                        socket.handshake?.url
                    )

                    console.log(
                        '[SOCKET SERVER] User-Agent:',
                        socket.handshake?.headers?.['user-agent']
                    )

                    console.log(
                        '======================================'
                    )

                }
            )


            /*
             * ==========================================
             * ERRO DE DESCONEXÃO
             * ==========================================
             */

            socket.on(
                'disconnect_error',
                error => {

                    console.error(
                        '[SOCKET SERVER] Erro de desconexão:',
                        error
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
