// caminho: public/app.js

const socket =
    io()


const startPage =
    document.getElementById(
        'start-page'
    )


const qrPage =
    document.getElementById(
        'qr-page'
    )


const startButton =
    document.getElementById(
        'start-whatsapp'
    )


function showStartPage() {

    startPage.style.display =
        'flex'

    qrPage.style.display =
        'none'

}


function showQRPage() {

    startPage.style.display =
        'none'

    qrPage.style.display =
        'flex'

}


if (
    startButton
) {

    startButton.addEventListener(
        'click',
        () => {

            console.log(
                '[APP] Gerando QR Code.'
            )


            showQRPage()


            startButton.disabled =
                true


            socket.emit(
                'start-whatsapp'
            )

        }
    )

}


socket.on(
    'start-result',
    result => {

        console.log(
            '[APP] Resultado:',
            result
        )


        if (
            !result.success
        ) {

            startButton.disabled =
                false


            showStartPage()

        }

    }
)


/*
 * ==========================================
 * QR CODE
 * ==========================================
 */

socket.on(
    'qr-updated',
    () => {

        console.log(
            '[APP] QR Code atualizado.'
        )


        const qrContent =
            document.getElementById(
                'qr-content'
            )


        const qrStatus =
            document.getElementById(
                'qr-status'
            )


        if (
            !qrContent
        ) {

            return

        }


        const image =
            document.createElement(
                'img'
            )


        image.src =
            `/qr.png?t=${Date.now()}`


        image.alt =
            'QR Code do WhatsApp'


        qrContent.innerHTML =
            ''


        qrContent.appendChild(
            image
        )


        if (
            qrStatus
        ) {

            qrStatus.textContent =
                'Escaneie o QR Code com seu WhatsApp.'

        }

    }
)


/*
 * ==========================================
 * WHATSAPP CONECTADO
 * ==========================================
 */

socket.on(
    'connected',
    connected => {

        console.log(
            '[APP] Estado de conexão:',
            connected
        )


        if (
            connected
        ) {

            console.log(
                '[APP] WhatsApp conectado. Abrindo painel.'
            )


            window.location.href =
                '/painel/'

        }

    }
)


/*
 * ==========================================
 * ESTADO ATUAL
 * ==========================================
 */

socket.on(
    'whatsapp-state',
    state => {

        console.log(
            '[APP] Estado WhatsApp:',
            state
        )


        if (
            !state
        ) {

            return

        }


        if (
            state.connected
        ) {

            window.location.href =
                '/painel/'


            return

        }


        if (
            state.started
        ) {

            showQRPage()


            return

        }


        showStartPage()

    }
)


showStartPage()