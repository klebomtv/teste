// caminho: public/js/qr.js

const qrContent =
    document.getElementById(
        'qr-content'
    )

const qrStatus =
    document.getElementById(
        'qr-status'
    )

function showQR() {

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

    qrStatus.textContent =
        'Escaneie o QR Code com seu WhatsApp.'
}

function setupQR(
    socket
) {

    socket.on(
        'qr-updated',
        () => {

            console.log(
                '[QR] Novo QR Code recebido.'
            )

            showQR()
        }
    )
}

export {
    setupQR
}