// caminho: src/whatsapp/index.js

const state =
require('./state')

const auth =
require('./auth')

const connection =
require('./connection')

const qr =
require('./qr')

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


                console.log(
                    '[WHATSAPP] Sessão QR encerrada após 60 segundos.'
                )

            },
            QR_TIMEOUT
        )

}


async function start() {

    console.log(
        '[WHATSAPP] Iniciando WhatsApp.'
    )


    if (
        state.isStarted()
    ) {

        return {
            success: false,
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


    try {

        const authState =
            await auth.loadAuth()


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
                        qrCode
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
                    connectionState === 'open'
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

                }


                /*
                 * ==================================
                 * DESCONECTADO
                 * ==================================
                 */

                if (
                    connectionState === 'close'
                ) {

                    console.log(
                        '[WHATSAPP] Conexão fechada.'
                    )


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


                    io?.emit(
                        'connected',
                        false
                    )


                    io?.emit(
                        'whatsapp-state',
                        state.getState()
                    )

                }

            }
        )


        console.log(
            '[WHATSAPP] Baileys iniciado.'
        )


        return {
            success: true,
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


        return {
            success: false,
            message:
                'Erro ao iniciar WhatsApp.'
        }

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
    getSocket
}


}

module.exports =
createWhatsApp
