// caminho: src/socket.js

function setupSocket(
    io,
    whatsapp,
    auth
) {

    console.log(
        '[SOCKET SERVER] Configurando Socket.IO...'
    )


    /*
     * Middleware de autenticação.
     */

    io.use(
        (socket, next) => {

            console.log(
                '[SOCKET SERVER] Tentativa de conexão recebida.'
            )

            console.log(
                '[SOCKET SERVER] Socket ID:',
                socket.id
            )

            console.log(
                '[SOCKET SERVER] Headers:',
                socket.handshake.headers
            )


            const cookies =
                socket.handshake.headers.cookie


            console.log(
                '[SOCKET SERVER] Cookie recebido:',
                cookies || '(nenhum)'
            )


            if (!cookies) {

                console.error(
                    '[SOCKET SERVER] ERRO: nenhum cookie recebido.'
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

                console.error(
                    '[SOCKET SERVER] ERRO: cookie session não encontrado.'
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


            console.log(
                '[SOCKET SERVER] Session ID recebido:',
                sessionId
            )


            const valid =
                auth.isSessionValid(
                    sessionId
                )


            console.log(
                '[SOCKET SERVER] Sessão válida:',
                valid
            )


            if (!valid) {

                console.error(
                    '[SOCKET SERVER] ERRO: sessão inválida.'
                )

                return next(
                    new Error(
                        'Sessão inválida.'
                    )
                )
            }


            socket.sessionId =
                sessionId


            console.log(
                '[SOCKET SERVER] Sessão validada com sucesso.'
            )


            next()
        }
    )


    /*
     * Conexão.
     */

    io.on(
        'connection',
        socket => {

            console.log(
                '========================================'
            )

            console.log(
                '[SOCKET SERVER] PAINEL WEB CONECTADO'
            )

            console.log(
                '[SOCKET SERVER] Socket ID:',
                socket.id
            )

            console.log(
                '[SOCKET SERVER] Session ID:',
                socket.sessionId
            )

            console.log(
                '========================================'
            )


            emitState(
                socket,
                whatsapp
            )


            /*
             * Iniciar WhatsApp.
             */

            socket.on(
                'start-whatsapp',
                async () => {

                    console.log(
                        '========================================'
                    )

                    console.log(
                        '[SOCKET SERVER] EVENTO start-whatsapp RECEBIDO'
                    )

                    console.log(
                        '[SOCKET SERVER] Socket ID:',
                        socket.id
                    )

                    console.log(
                        '========================================'
                    )


                    try {

                        await startWhatsApp(
                            socket,
                            whatsapp
                        )

                    } catch (error) {

                        console.error(
                            '[SOCKET SERVER] ERRO em startWhatsApp():',
                            error
                        )


                        socket.emit(
                            'start-result',
                            {
                                success: false,
                                message:
                                    error.message ||
                                    'Erro ao iniciar o WhatsApp.'
                            }
                        )
                    }
                }
            )


            /*
             * Envio de mensagem.
             */

            socket.on(
                'send-message',
                async data => {

                    console.log(
                        '[SOCKET SERVER] Evento send-message recebido.'
                    )


                    try {

                        await handleSendMessage(
                            socket,
                            data,
                            whatsapp
                        )

                    } catch (error) {

                        console.error(
                            '[SOCKET SERVER] Erro ao enviar mensagem:',
                            error
                        )
                    }
                }
            )


            /*
             * Cancelamento.
             */

            socket.on(
                'cancel-send',
                () => {

                    console.log(
                        '[SOCKET SERVER] Evento cancel-send recebido.'
                    )


                    try {

                        const result =
                            whatsapp.cancelSendToAll()


                        socket.emit(
                            'cancel-result',
                            result
                        )

                    } catch (error) {

                        console.error(
                            '[SOCKET SERVER] Erro no cancelamento:',
                            error
                        )
                    }
                }
            )


            /*
             * Logout.
             */

            socket.on(
                'logout',
                async () => {

                    console.log(
                        '[SOCKET SERVER] Evento logout recebido.'
                    )


                    try {

                        const result =
                            await whatsapp.logout()


                        if (
                            socket.sessionId &&
                            typeof auth.destroySession ===
                                'function'
                        ) {

                            auth.destroySession(
                                socket.sessionId
                            )
                        }


                        socket.emit(
                            'logout-result',
                            result
                        )


                        setTimeout(
                            () => {

                                socket.disconnect(
                                    true
                                )

                            },
                            100
                        )

                    } catch (error) {

                        console.error(
                            '[SOCKET SERVER] Erro no logout:',
                            error
                        )
                    }
                }
            )


            socket.on(
                'disconnect',
                reason => {

                    console.log(
                        '[SOCKET SERVER] Painel desconectado:',
                        reason
                    )
                }
            )
        }
    )


    console.log(
        '[SOCKET SERVER] Socket.IO configurado.'
    )
}


/*
 * Estado atual.
 */

function emitState(
    socket,
    whatsapp
) {

    console.log(
        '[SOCKET SERVER] Enviando estado atual.'
    )


    const state =
        whatsapp.getState()


    console.log(
        '[SOCKET SERVER] Estado:',
        state
    )


    socket.emit(
        'whatsapp-state',
        state
    )


    if (
        state.qr
    ) {

        socket.emit(
            'qr-updated'
        )
    }


    if (
        state.connected
    ) {

        socket.emit(
            'connected',
            true
        )


        socket.emit(
            'groups',
            state.groups
        )
    }
}


/*
 * Início do WhatsApp.
 */

async function startWhatsApp(
    socket,
    whatsapp
) {

    console.log(
        '[START] startWhatsApp() começou.'
    )


    const state =
        whatsapp.getState()


    console.log(
        '[START] Estado antes do início:',
        state
    )


    if (
        state.started
    ) {

        console.warn(
            '[START] WhatsApp já está iniciado.'
        )


        socket.emit(
            'start-result',
            {
                success: false,
                message:
                    'WhatsApp já foi iniciado.'
            }
        )

        return
    }


    console.log(
        '[START] Enviando starting-whatsapp.'
    )


    socket.emit(
        'starting-whatsapp'
    )


    try {

        console.log(
            '[START] Chamando whatsapp.start()...'
        )


        const result =
            await whatsapp.start()


        console.log(
            '[START] whatsapp.start() terminou.'
        )


        console.log(
            '[START] Resultado:',
            result
        )


        socket.emit(
            'start-result',
            result
        )


        emitState(
            socket,
            whatsapp
        )

    } catch (error) {

        console.error(
            '========================================'
        )

        console.error(
            '[START] ERRO AO INICIAR WHATSAPP'
        )

        console.error(
            error
        )

        console.error(
            '========================================'
        )


        socket.emit(
            'start-result',
            {
                success: false,
                message:
                    error.message ||
                    'Erro ao iniciar o WhatsApp.'
            }
        )
    }
}


/*
 * Envio de mensagens.
 */

async function handleSendMessage(
    socket,
    data,
    whatsapp
) {

    const {
        target,
        message
    } = data || {}


    const state =
        whatsapp.getState()


    if (
        !state.connected
    ) {

        socket.emit(
            'send-result',
            {
                success: false,
                message:
                    'WhatsApp não está conectado.'
            }
        )

        return
    }


    if (
        !message ||
        !message.trim()
    ) {

        socket.emit(
            'send-result',
            {
                success: false,
                message:
                    'Digite uma mensagem.'
            }
        )

        return
    }


    try {

        if (
            target === 'all'
        ) {

            const result =
                await whatsapp.sendToAll(
                    message
                )


            socket.emit(
                'send-result',
                result
            )

            return
        }


        const group =
            whatsapp.getGroup(
                target
            )


        if (!group) {

            socket.emit(
                'send-result',
                {
                    success: false,
                    message:
                        'Grupo não encontrado.'
                }
            )

            return
        }


        await whatsapp.sendMessage(
            group.id,
            message
        )


        socket.emit(
            'send-result',
            {
                success: true,
                message:
                    `Mensagem enviada para ${group.name}.`
            }
        )

    } catch (error) {

        console.error(
            '[SEND] Erro:',
            error
        )


        socket.emit(
            'send-result',
            {
                success: false,
                message:
                    error.message ||
                    'Erro ao enviar a mensagem.'
            }
        )
    }
}


module.exports =
    setupSocket