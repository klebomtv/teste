
// caminho: public/painel/js/messages.js

import {
    startCooldown,
    isCooldown
} from './cooldown.js'


export function setupMessages(
    socket
) {

    const groupSelect =
        document.getElementById(
            'group'
        )


    const messageInput =
        document.getElementById(
            'message'
        )


    const sendButton =
        document.getElementById(
            'send'
        )


    const cancelButton =
        document.getElementById(
            'cancel-send'
        )


    const result =
        document.getElementById(
            'result'
        )


    if (
        !groupSelect ||
        !messageInput ||
        !sendButton
    ) {

        console.warn(
            '[MESSAGES] Elementos do formulário não encontrados.'
        )

        return

    }


    /*
     * ==========================================
     * ENVIO
     * ==========================================
     */

    sendButton.addEventListener(
        'click',
        () => {

            if (
                isCooldown()
            ) {

                return

            }


            const target =
                groupSelect.value


            const text =
                messageInput.value.trim()


            if (!target) {

                result.textContent =
                    'Selecione um grupo.'

                return

            }


            if (!text) {

                result.textContent =
                    'Digite uma mensagem.'

                return

            }


            sendButton.disabled =
                true


            result.textContent =
                'Enviando...'


            socket.emit(
                'send-message',
                {
                    target,
                    message:
                        text
                }
            )

        }
    )


    /*
     * ==========================================
     * CANCELAR ENVIO EM MASSA
     * ==========================================
     */

    if (cancelButton) {

        cancelButton.addEventListener(
            'click',
            () => {

                socket.emit(
                    'cancel-send'
                )

            }
        )

    }


    /*
     * ==========================================
     * RESULTADO
     * ==========================================
     */

    socket.on(
        'send-result',
        data => {

            sendButton.disabled =
                false


            if (
                data &&
                data.success
            ) {

                result.textContent =
                    data.message ||
                    'Mensagem enviada.'

                startCooldown(
                    data.cooldown ||
                    5,
                    sendButton
                )

                return

            }


            result.textContent =
                data?.message ||
                'Não foi possível enviar a mensagem.'

        }
    )


    /*
     * ==========================================
     * ENVIO INICIADO
     * ==========================================
     */

    socket.on(
        'send-started',
        data => {

            if (!result) {
                return
            }


            result.textContent =
                `Enviando para ${data.total} grupos...`


            if (cancelButton) {

                cancelButton.disabled =
                    false

            }

        }
    )


    /*
     * ==========================================
     * PROGRESSO
     * ==========================================
     */

    socket.on(
        'send-progress',
        data => {

            if (!result) {
                return
            }


            result.textContent =
                `Enviando ${data.current}/${data.total} — ${data.group}`

        }
    )


    /*
     * ==========================================
     * ENVIO FINALIZADO
     * ==========================================
     */

    socket.on(
        'send-finished',
        data => {

            sendButton.disabled =
                false


            if (cancelButton) {

                cancelButton.disabled =
                    true

            }


            result.textContent =
                `Envio concluído. Enviadas: ${data.sent}. Falhas: ${data.failed}.`


            startCooldown(
                5,
                sendButton
            )

        }
    )


    /*
     * ==========================================
     * ENVIO CANCELADO
     * ==========================================
     */

    socket.on(
        'send-cancelled',
        data => {

            sendButton.disabled =
                false


            if (cancelButton) {

                cancelButton.disabled =
                    true

            }


            result.textContent =
                `Envio cancelado. Enviadas: ${data.sent}. Falhas: ${data.failed}.`

        }
    )

}

