// caminho: src/whatsapp/auth.js

const path =
    require('path')

const {
    useMultiFileAuthState
} =
    require(
        '@whiskeysockets/baileys'
    )


const AUTH_PATH =
    path.join(
        __dirname,
        '../../whatsapp_auth'
    )


async function loadAuth() {

    console.log(
        '[WHATSAPP AUTH] Carregando autenticação.'
    )


    const auth =
        await useMultiFileAuthState(
            AUTH_PATH
        )


    return auth
}


function getAuthPath() {

    return AUTH_PATH
}


module.exports = {

    loadAuth,

    getAuthPath
}