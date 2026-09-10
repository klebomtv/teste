// caminho: src/whatsapp/qr.js

const path =
    require('path')

const QRCode =
    require('qrcode')

const QR_PATH =
    path.join(
        __dirname,
        '../../public/qr.png'
    )

async function generateQR(
    qr
) {

    if (!qr) {

        return {
            success: false,
            message:
                'QR Code inválido.'
        }
    }

    try {

        await QRCode.toFile(
            QR_PATH,
            qr,
            {
                width: 400,
                margin: 2
            }
        )

        console.log(
            '[WHATSAPP QR] QR Code criado.'
        )

        return {
            success: true,
            path: QR_PATH
        }

    } catch (error) {

        console.error(
            '[WHATSAPP QR] Erro ao criar QR Code:',
            error
        )

        return {
            success: false,
            message:
                'Erro ao gerar QR Code.'
        }
    }
}

function getQRPath() {
    return QR_PATH
}

module.exports = {
    generateQR,
    getQRPath
}