js
// caminho: public/js/messages.js

import {
    startCooldown,
    isCooldown
} from './cooldown.js'


export function setupMessages(socket) {

    const groupSelect =
        document.getElementById('group')


    const messageInput =
        document.getElementById('message')


    const sendButton =
        document.getElementById('send')


    const cancelButton =
        document.getElementById('cancel-send')


    const result =
        document.getElementById('result')


    let sending = false


    /*
     * Envia a mensagem.
     */

    sendButton.addEventListener(
        'click',
        () => {

            /*
             * Impede dois envios
             * ao mesmo tempo.
             */

            if (sending) {
                return
            }


            /*
             * Impede envio durante
             * o cooldown.
             */

            if (isCooldown()) {
                return
            }


            const target =
                groupSelect.value


            const message =
                messageInput.value.trim()


            /*
             * Verifica mensagem vazia.
             */

            if (!message) {

                result.textContent =
                    'Digite uma mensagem.'

                return
            }


            /*
             * Verifica grupo.
             */

            if (!target) {

                result.textContent =
                    'Selecione um grupo.'

                return
            }


            /*
             * Marca como enviando.
             */

            sending = true


            sendButton.disabled =
                true


            sendButton.textContent =
                'Enviando...'


            result.textContent =
                ''


            /*
             * Envia para o servidor.
             */

            socket.emit(
                'send-message',
                {
                    target,
                    message
                }
            )
        }
    )


    /*
     * Botão para cancelar o envio
     * para todos os grupos.
     */

    cancelButton.addEventListener(
        'click',
        () => {

            if (!sending) {
                return
            }


            /*
             * Impede vários pedidos
             * de cancelamento.
             */

            cancelButton.disabled =
                true


            cancelButton.textContent =
                'Cancelando...'


            result.textContent =
                'Cancelando envio...'


            socket.emit(
                'cancel-send'
            )
        }
    )


    /*
     * Envio para todos os grupos
     * começou.
     */

    socket.on(
        'all-groups-started',
        data => {

            console.log(
                'Envio para todos iniciado:',
                data
            )


            sending = true


            sendButton.disabled =
                true


            sendButton.textContent =
                'Enviando...'


            cancelButton.style.display =
                'block'


            cancelButton.disabled =
                false


            cancelButton.textContent =
                'Cancelar envio'


            result.textContent =
                `Enviando para ${data.total} grupos...`
        }
    )


    /*
     * O servidor recebeu o pedido
     * de cancelamento.
     */

    socket.on(
        'all-groups-cancel-requested',
        () => {

            console.log(
                'Cancelamento solicitado.'
            )


            cancelButton.disabled =
                true


            cancelButton.textContent =
                'Cancelando...'


            result.textContent =
                'Cancelando envio...'
        }
    )


    /*
     * Atualiza o progresso
     * do envio para todos.
     */

    socket.on(
        'all-groups-progress',
        data => {

            console.log(
                'Progresso:',
                data
            )


            sending = true


            sendButton.disabled =
                true


            sendButton.textContent =
                `${data.current}/${data.total}`


            /*
             * Mantém o botão de cancelamento
             * visível durante o envio.
             */

            cancelButton.style.display =
                'block'


            if (data.error) {

                result.textContent =
                    `Erro em ${data.group}: ${data.error}`

                return
            }


            result.textContent =
                `Enviando para: ${data.group} ` +
                `(${data.current}/${data.total})`
        }
    )


    /*
     * Envio para todos terminou
     * normalmente.
     */

    socket.on(
        'all-groups-finished',
        data => {

            console.log(
                'Envio finalizado:',
                data
            )


            sending = false


            cancelButton.style.display =
                'none'


            cancelButton.disabled =
                false


            cancelButton.textContent =
                'Cancelar envio'


            result.textContent =
                `Envio finalizado: ` +
                `${data.sent} de ${data.total} grupos receberam a mensagem.`


            /*
             * Limpa a mensagem depois
             * de um envio concluído.
             */

            if (
                data.sent > 0
            ) {

                messageInput.value = ''
            }


            /*
             * Inicia o cooldown usando
             * a duração calculada pelo servidor.
             */

            if (
                data.cooldownDuration
            ) {

                startCooldown(
                    data.cooldownDuration,
                    sendButton
                )

                return
            }


            sendButton.disabled =
                false


            sendButton.textContent =
                'Enviar mensagem'
        }
    )


    /*
     * Envio para todos foi cancelado.
     */

    socket.on(
        'all-groups-cancelled',
        data => {

            console.log(
                'Envio cancelado:',
                data
            )


            sending = false


            cancelButton.style.display =
                'none'


            cancelButton.disabled =
                false


            cancelButton.textContent =
                'Cancelar envio'


            sendButton.disabled =
                false


            sendButton.textContent =
                'Enviar mensagem'


            result.textContent =
                `Envio cancelado. ` +
                `${data.sent} de ${data.total} grupos receberam a mensagem.`
        }
    )


    /*
     * Resultado do pedido de cancelamento.
     */

    socket.on(
        'cancel-result',
        data => {

            console.log(
                'Resultado do cancelamento:',
                data
            )


            if (
                data.success
            ) {

                cancelButton.disabled =
                    true

                cancelButton.textContent =
                    'Cancelando...'

                result.textContent =
                    data.message

                return
            }


            /*
             * Se não existe mais envio,
             * o botão volta ao estado normal.
             */

            if (
                !sending
            ) {

                cancelButton.style.display =
                    'none'

                cancelButton.disabled =
                    false

                cancelButton.textContent =
                    'Cancelar envio'

                return
            }


            cancelButton.disabled =
                false

            cancelButton.textContent =
                'Cancelar envio'


            result.textContent =
                data.message
        }
    )


    /*
     * Resultado de um envio individual
     * ou resposta imediata do servidor.
     */

    socket.on(
        'send-result',
        data => {

            console.log(
                'Resultado:',
                data
            )


            /*
             * Se o envio para todos
             * ainda está acontecendo,
             * não libera o botão aqui.
             */

            if (
                data.success &&
                data.total &&
                data.cooldownDuration
            ) {

                return
            }


            /*
             * Caso seja um envio individual
             * para um único grupo.
             */

            if (
                data.success
            ) {

                sending = false


                cancelButton.style.display =
                    'none'


                cancelButton.disabled =
                    false


                cancelButton.textContent =
                    'Cancelar envio'


                result.textContent =
                    data.message


                messageInput.value = ''


                sendButton.disabled =
                    false


                sendButton.textContent =
                    'Enviar mensagem'


                return
            }


            /*
             * O servidor informou que
             * existe cooldown.
             */

            if (
                data.cooldown &&
                data.remaining
            ) {

                sending = false


                cancelButton.style.display =
                    'none'


                cancelButton.disabled =
                    false


                cancelButton.textContent =
                    'Cancelar envio'


                result.textContent =
                    data.message


                startCooldown(
                    data.remaining,
                    sendButton
                )


                return
            }


            /*
             * Algum erro ocorreu.
             */

            sending = false


            cancelButton.style.display =
                'none'


            cancelButton.disabled =
                false


            cancelButton.textContent =
                'Cancelar envio'


            result.textContent =
                data.message


            sendButton.disabled =
                false


            sendButton.textContent =
                'Enviar mensagem'
        }
    )
}

