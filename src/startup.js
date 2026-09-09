// caminho: src/startup.js

const fs =
    require('fs')


const path =
    require('path')


const WHATSAPP_AUTH_PATH =
    path.join(
        __dirname,
        '../whatsapp_auth'
    )


function clearWhatsAppAuth() {

    if (
        fs.existsSync(
            WHATSAPP_AUTH_PATH
        )
    ) {

        fs.rmSync(
            WHATSAPP_AUTH_PATH,
            {
                recursive: true,
                force: true
            }
        )


        console.log(
            'Sessão antiga do WhatsApp removida.'
        )
    }


    fs.mkdirSync(
        WHATSAPP_AUTH_PATH,
        {
            recursive: true
        }
    )


    console.log(
        'Pasta whatsapp_auth preparada.'
    )
}


function initializeSystem() {

    clearWhatsAppAuth()
}


module.exports =
    initializeSystem