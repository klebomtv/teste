
// caminho: src/socket.js

function setupSocket(
    io,
    whatsapp,
    auth,
    messages
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
                '[SOCKET SERVER] Painel web conectado.'
            )


            /*
             * ======================================
             * ESTADO ATUAL DO WHATSAPP
             * ======================================
             */

            const state =
                whatsapp.getState()


            socket.emit(
                'whatsapp-state',
                state
            )


            /*
             * ======================================
             * ENVIAR GRUPOS AUTOMATICAMENTE
             * ======================================
             *
             * O painel não precisa mais solicitar
             * os grupos para recebê-los.
             *
             * Se o WhatsApp já encontrou os grupos,
             * eles são enviados imediatamente.
             */

            const groups =
                Array.isArray(
                    state.groups
                )
                    ? state.groups
                    : []


            console.log(
                '[SOCKET SERVER] Enviando grupos ao conectar:',
                groups.length
            )


            socket.emit(
                'groups',
                groups
            )


            /*
             * ======================================
             * SOLICITAR GRUPOS
             * ======================================
             *
             * Mantemos este evento para permitir
             * uma nova solicitação manual caso seja
             * necessário no futuro.
             */

            socket.on(
                'request-groups',
                () => {

                    console.log(
                        '[SOCKET SERVER] Painel solicitou os grupos.'
                    )


                    const currentState =
                        whatsapp.getState()


                    const currentGroups =
                        Array.isArray(
                            currentState.groups
                        )
                            ? currentState.groups
                            : []


                    console.log(
                        '[SOCKET SERVER] Enviando grupos para o painel:',
                        currentGroups.length
                    )


                    socket.emit(
                        'groups',
                        currentGroups
                    )

                }
            )


            /*
             * ======================================
             * INICIAR WHATSAPP / GERAR QR CODE
             * ======================================
             */

            socket.on(
                'start-whatsapp',
                async () => {

                    console.log(
                        '[SOCKET SERVER] start-whatsapp recebido.'
                    )


                    try {

                        const result =
                            await whatsapp.start()


                        console.log(
                            '[SOCKET SERVER] Resultado da inicialização:',
                            result
                        )


                        socket.emit(
                            'start-result',
                            result
                        )


                        /*
                         * Atualiza o navegador
                         * com o estado atual.
                         */

                        socket.emit(
                            'whatsapp-state',
                            whatsapp.getState()
                        )

                    } catch (error) {

                        console.error(
                            '[SOCKET SERVER] Erro ao iniciar WhatsApp:',
                            error
                        )


                        socket.emit(
                            'start-result',
                            {
                                success:
                                    false,

                                message:
                                    'Erro ao iniciar WhatsApp.'
                            }
                        )
                    }
                }
            )


            /*
             * ======================================
             * ENVIAR MENSAGEM
             * ======================================
             */

            socket.on(
                'send-message',
                async data => {

                    console.log(
                        '[SOCKET SERVER] send-message recebido.'
                    )


                    if (
                        !messages
                    ) {

                        socket.emit(
                            'send-result',
                            {
                                success:
                                    false,

                                message:
                                    'Sistema de mensagens não disponível.'
                            }
                        )

                        return
                    }


                    try {

                        const result =
                            await messages.sendMessage(
                                data?.message,
                                data?.groups
                            )


                        socket.emit(
                            'send-result',
                            result
                        )

                    } catch (error) {

                        console.error(
                            '[SOCKET SERVER] Erro ao enviar mensagem:',
                            error
                        )


                        socket.emit(
                            'send-result',
                            {
                                success:
                                    false,

                                message:
                                    'Erro ao enviar mensagem.'
                            }
                        )
                    }
                }
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
                        '[SOCKET SERVER] Painel web desconectado.'
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

