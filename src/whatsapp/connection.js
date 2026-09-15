// caminho: src/whatsapp/connection.js

const {
    makeWASocket
} =
    require(
        '@whiskeysockets/baileys'
    )

const pino =
    require(
        'pino'
    )

const {
    generateQR
} =
    require(
        './qr'
    )


// Logger do Baileys.
const logger =
    pino({
        level: 'silent'
    })


function createConnection(
    auth,
    onQR
) {

    console.log(
        '[WHATSAPP CONNECTION] Criando conexão Baileys.'
    )


    const sock =
        makeWASocket({

            auth:
                auth.state,

            printQRInTerminal:
                false,

            logger:
                logger
        })


    sock.ev.on(
        'connection.update',
        async update => {

            const {
                connection,
                lastDisconnect,
                qr
            } = update


            /*
             * QR CODE
             */

            if (qr) {

                console.log(
                    '[WHATSAPP CONNECTION] QR recebido pelo Baileys.'
                )


                const result =
                    await generateQR(
                        qr
                    )


                if (
                    result.success
                ) {

                    console.log(
                        '[WHATSAPP CONNECTION] QR Code gerado.'
                    )


                    if (
                        onQR
                    ) {

                        onQR()

                    }

                } else {

                    console.error(
                        '[WHATSAPP CONNECTION] Falha ao gerar QR:',
                        result.message
                    )

                }

            }


            /*
             * CONECTADO
             */

            if (
                connection === 'open'
            ) {

                console.log(
                    '[WHATSAPP CONNECTION] Conexão aberta.'
                )

            }


            /*
             * DESCONECTADO
             */

            if (
                connection === 'close'
            ) {

                console.error(
                    '[WHATSAPP CONNECTION] Conexão fechada.'
                )


                console.error(
                    '[WHATSAPP CONNECTION] Motivo:',
                    lastDisconnect?.error
                )


                console.error(
                    '[WHATSAPP CONNECTION] Status:',
                    lastDisconnect?.error?.output?.statusCode
                )

            }

        }
    )


    return sock

}


module.exports = {
    createConnection
}