// caminho: src/whatsapp/index.js

const state =
    require('./state')


const auth =
    require('./auth')


const connection =
    require('./connection')


const qr =
    require('./qr')


const groups =
    require('./groups')


const messages =
    require('./message')


const QR_TIMEOUT =
    60 * 1000


function createWhatsApp(
    io
) {

    let qrTimeout =
        null


    function clearQRTimeout() {

        if (qrTimeout) {

            clearTimeout(
                qrTimeout
            )

            qrTimeout =
                null
        }
    }


    function startQRTimeout(
        sock
    ) {

        clearQRTimeout()

        console.log(
            '[WHATSAPP] Tempo para conexão: 60 segundos.'
        )

        qrTimeout =
            setTimeout(
                () => {

                    console.log(
                        '[WHATSAPP] Tempo de conexão expirado.'
                    )


                    if (
                        state.isConnected()
                    ) {

                        return
                    }


                    try {

                        if (sock) {

                            sock.ws?.close()
                        }

                    } catch (error) {

                        console.error(
                            '[WHATSAPP] Erro ao encerrar conexão expirada:',
                            error
                        )
                    }


                    state.reset()


                    io?.emit(
                        'whatsapp-state',
                        state.getState()
                    )


                    console.log(
                        '[WHATSAPP] Sessão QR encerrada após 60 segundos.'
                    )

                },
                QR_TIMEOUT
            )
    }


    async function loadGroups() {

        const sock =
            state.getSocket()


        if (
            !sock ||
            !state.isConnected()
        ) {

            return []
        }


        try {

            console.log(
                '[WHATSAPP] Carregando grupos...'
            )


            const list =
                await groups.loadGroups(
                    sock
                )


            state.setGroups(
                list
            )


            console.log(
                `[WHATSAPP] ${list.length} grupos encontrados.`
            )


            io?.emit(
                'groups',
                list
            )


            io?.emit(
                'whatsapp-state',
                state.getState()
            )


            return list

        } catch (error) {

            console.error(
                '[WHATSAPP] Erro ao carregar grupos:',
                error
            )


            state.setGroups(
                []
            )


            io?.emit(
                'groups',
                []
            )


            return []
        }
    }


    async function start() {

        console.log(
            '[WHATSAPP] Iniciando WhatsApp.'
        )


        if (
            state.isStarted()
        ) {

            return {

                success:
                    false,

                message:
                    'WhatsApp já foi iniciado.'
            }
        }


        state.setStarted(
            true
        )


        state.setConnected(
            false
        )


        state.setQR(
            false
        )


        state.setStatus(
            'Iniciando WhatsApp...'
        )


        io?.emit(
            'whatsapp-state',
            state.getState()
        )


        try {

            const authState =
                await auth.loadAuth()


            /*
             * Cria o socket.
             *
             * Essa função fica separada porque o Baileys
             * pode solicitar um restart através do código 515.
             */

            async function createSocket() {

                console.log(
                    '[WHATSAPP] Criando socket WhatsApp.'
                )


                const sock =
                    connection.createConnection(
                        authState
                    )


                state.setSocket(
                    sock
                )


                sock.ev.on(
                    'creds.update',
                    authState.saveCreds
                )


                startQRTimeout(
                    sock
                )


                sock.ev.on(
                    'connection.update',
                    async update => {

                        const {

                            connection:
                                connectionState,

                            qr:
                                qrCode,

                            lastDisconnect

                        } =
                            update


                        /*
                         * ==================================
                         * QR CODE
                         * ==================================
                         */

                        if (
                            qrCode
                        ) {

                            console.log(
                                '[WHATSAPP] QR Code recebido.'
                            )


                            state.setQR(
                                true
                            )


                            state.setStatus(
                                'Aguardando leitura do QR Code...'
                            )


                            await qr.generateQR(
                                qrCode
                            )


                            io?.emit(
                                'qr-updated'
                            )


                            io?.emit(
                                'whatsapp-state',
                                state.getState()
                            )
                        }


                        /*
                         * ==================================
                         * CONECTADO
                         * ==================================
                         */

                        if (
                            connectionState ===
                            'open'
                        ) {

                            console.log(
                                '[WHATSAPP] WhatsApp conectado!'
                            )


                            clearQRTimeout()


                            state.setConnected(
                                true
                            )


                            state.setQR(
                                false
                            )


                            state.setStatus(
                                'WhatsApp conectado.'
                            )


                            io?.emit(
                                'connected',
                                true
                            )


                            io?.emit(
                                'whatsapp-state',
                                state.getState()
                            )


                            /*
                             * Carrega os grupos
                             * depois da conexão.
                             */

                            await loadGroups()
                        }


                        /*
                         * ==================================
                         * DESCONECTADO
                         * ==================================
                         */

                        if (
                            connectionState ===
                            'close'
                        ) {

                            const statusCode =
                                lastDisconnect
                                    ?.error
                                    ?.output
                                    ?.statusCode


                            console.log(
                                '[WHATSAPP] Conexão fechada.'
                            )


                            console.log(
                                '[WHATSAPP] Status da desconexão:',
                                statusCode
                            )


                            /*
                             * ==================================
                             * RESTART 515
                             * ==================================
                             *
                             * O Baileys está solicitando
                             * que o socket seja reiniciado.
                             *
                             * NÃO apagamos a autenticação.
                             * NÃO resetamos o estado.
                             */

                            if (
                                statusCode ===
                                515
                            ) {

                                console.log(
                                    '[WHATSAPP] Baileys solicitou restart (515).'
                                )


                                clearQRTimeout()


                                state.setConnected(
                                    false
                                )


                                state.setStatus(
                                    'Reiniciando conexão WhatsApp...'
                                )


                                io?.emit(
                                    'whatsapp-state',
                                    state.getState()
                                )


                                try {

                                    await createSocket()

                                } catch (error) {

                                    console.error(
                                        '[WHATSAPP] Erro ao reiniciar socket:',
                                        error
                                    )


                                    state.reset()


                                    io?.emit(
                                        'whatsapp-state',
                                        state.getState()
                                    )
                                }


                                return
                            }


                            /*
                             * ==================================
                             * OUTRAS DESCONEXÕES
                             * ==================================
                             */

                            clearQRTimeout()


                            state.setConnected(
                                false
                            )


                            state.setQR(
                                false
                            )


                            state.setStatus(
                                'WhatsApp desconectado.'
                            )


                            state.setGroups(
                                []
                            )


                            io?.emit(
                                'connected',
                                false
                            )


                            io?.emit(
                                'groups',
                                []
                            )


                            io?.emit(
                                'whatsapp-state',
                                state.getState()
                            )
                        }

                    }
                )


                console.log(
                    '[WHATSAPP] Socket WhatsApp criado.'
                )


                return sock
            }


            await createSocket()


            console.log(
                '[WHATSAPP] Baileys iniciado.'
            )


            return {

                success:
                    true,

                message:
                    'WhatsApp iniciado.'
            }

        } catch (error) {

            console.error(
                '[WHATSAPP] Erro ao iniciar:',
                error
            )


            clearQRTimeout()


            state.reset()


            io?.emit(
                'whatsapp-state',
                state.getState()
            )


            return {

                success:
                    false,

                message:
                    error.message ||
                    'Erro ao iniciar WhatsApp.'
            }
        }
    }


    async function sendMessage(
        target,
        message
    ) {

        const sock =
            state.getSocket()


        if (
            !state.isConnected()
        ) {

            throw new Error(
                'WhatsApp não está conectado.'
            )
        }


        return messages.sendMessage(
            sock,
            target,
            message
        )
    }


    async function sendToAll(
        message
    ) {

        const sock =
            state.getSocket()


        if (
            !state.isConnected()
        ) {

            throw new Error(
                'WhatsApp não está conectado.'
            )
        }


        if (
            state.isSending()
        ) {

            throw new Error(
                'Já existe um envio em andamento.'
            )
        }


        const list =
            state.getGroups()


        if (
            !list.length
        ) {

            throw new Error(
                'Nenhum grupo disponível.'
            )
        }


        state.setSending(
            true
        )


        state.setCancelSending(
            false
        )


        io?.emit(
            'send-started',
            {
                total:
                    list.length
            }
        )


        try {

            const result =
                await messages.sendToGroups(
                    sock,
                    list,
                    message,
                    () =>
                        state.shouldCancelSending(),

                    progress => {

                        io?.emit(
                            'send-progress',
                            progress
                        )
                    }
                )


            if (
                result.cancelled
            ) {

                io?.emit(
                    'send-cancelled',
                    result
                )

            } else {

                io?.emit(
                    'send-finished',
                    result
                )
            }


            return result

        } finally {

            state.setSending(
                false
            )


            state.setCancelSending(
                false
            )


            io?.emit(
                'whatsapp-state',
                state.getState()
            )
        }
    }


    function cancelSending() {

        if (
            !state.isSending()
        ) {

            return {

                success:
                    false,

                message:
                    'Nenhum envio em andamento.'
            }
        }


        state.setCancelSending(
            true
        )


        return {

            success:
                true,

            message:
                'Cancelamento solicitado.'
        }
    }


    function getState() {

        return state.getState()
    }


    function getSocket() {

        return state.getSocket()
    }


    return {

        start,

        getState,

        getSocket,

        loadGroups,

        sendMessage,

        sendToAll,

        cancelSending
    }
}


module.exports =
    createWhatsApp