// caminho: auth/email.js

const nodemailer = require('nodemailer')

const transporter =
    nodemailer.createTransport({
        host:
            process.env.EMAIL_HOST,

        port:
            Number(
                process.env.EMAIL_PORT || 587
            ),

        secure:
            process.env.EMAIL_SECURE === 'true',

        auth: {
            user:
                process.env.EMAIL_USER,

            pass:
                process.env.EMAIL_PASSWORD
        }
    })

async function sendCode(email, code) {

    await transporter.sendMail({

        from:
            process.env.EMAIL_FROM ||
            process.env.EMAIL_USER,

        to: email,

        subject:
            'Código de acesso - WhatsApp Bot',

        text:
            `Seu código de acesso é: ${code}\n\n` +
            `Este código expira em 5 minutos.\n\n` +
            `Se você não solicitou este código, ignore este e-mail.`,

        html: `
            <div style="font-family: Arial, sans-serif;">
                <h2>WhatsApp Bot</h2>

                <p>
                    Seu código de acesso é:
                </p>

                <h1
                    style="
                        letter-spacing: 6px;
                        font-size: 32px;
                    "
                >
                    ${code}
                </h1>

                <p>
                    Este código expira em 5 minutos.
                </p>

                <p>
                    Se você não solicitou este código,
                    ignore este e-mail.
                </p>
            </div>
        `
    })
}

async function verifyConnection() {

    await transporter.verify()

    console.log(
        'Servidor de e-mail conectado.'
    )
}

module.exports = {
    sendCode,
    verifyConnection
}