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


// Logger do Baileys.
// Mantemos silencioso para não poluir
// os logs da aplicação.
const logger =
    pino({
        level: 'silent'
    })


function createConnection(
    auth
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
        update => {

            const {
                connection,
                lastDisconnect,
                qr
            } = update


            if (qr) {

                console.log(
                    '[WHATSAPP CONNECTION] QR recebido pelo Baileys.'
                )
            }


            if (
                connection === 'open'
            ) {

                console.log(
                    '[WHATSAPP CONNECTION] Conexão aberta.'
                )
            }


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