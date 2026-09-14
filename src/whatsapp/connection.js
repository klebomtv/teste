
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


// Logger exclusivo do Baileys.
// Mantém os logs da aplicação normalmente,
// mas bloqueia os logs internos do Baileys.
const logger =
    pino(
        {
            level:
                'silent'
        }
    )


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


    return sock

}


module.exports = {
    createConnection
}
