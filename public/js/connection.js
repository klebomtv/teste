// caminho: public/js/connection.js

export function setupConnection() {

    console.log(
        '[CONNECTION] Configurando botão.'
    )


    const connectionPage =
        document.getElementById(
            'connection-page'
        )


    const qrPage =
        document.getElementById(
            'qr-page'
        )


    const startButton =
        document.getElementById(
            'start-whatsapp'
        )


    if (
        !connectionPage ||
        !qrPage ||
        !startButton
    ) {

        console.error(
            '[CONNECTION] Elementos não encontrados.'
        )

        return
    }


    startButton.addEventListener(
        'click',
        () => {

            console.log(
                '[CONNECTION] Botão clicado.'
            )


            /*
             * Esconde a tela inicial.
             */

            connectionPage.style.display =
                'none'


            /*
             * Mostra a tela do QR Code.
             */

            qrPage.style.display =
                'flex'


            console.log(
                '[CONNECTION] Tela do QR Code exibida.'
            )
        }
    )


    console.log(
        '[CONNECTION] Botão configurado.'
    )
}