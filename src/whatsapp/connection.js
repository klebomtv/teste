
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

