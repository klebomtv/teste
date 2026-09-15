// caminho: public/painel/js/messages.js

import {
    getSelectedGroups
} from './groups.js'


let socket = null

let socketConnected = false

let sending = false


const messageInput =
    document.getElementById(
        'message'
    )


const characterCount =
    document.getElementById(
        'character-count'
    )


const sendButton =
    document.getElementById(
        'send-message'
    )


const cancelButton =
    document.getElementById(
        'cancel-send'
    )


const progressArea =
    document.getElementById(
        'progress-area'
    )


const progressText =
    document.getElementById(
        'progress-text'
    )


const progressFill =
    document.getElementById(
        'progress-fill'
    )


const sendStatus =
    document.getElementById(
        'send-status'
    )


function updateCharacterCount() {

    const length =
        messageInput.value.length


    characterCount.textContent =
        `${length} / 4096`

}


function updateSendButton() {

    const groups =
        getSelectedGroups()


    const message =
        messageInput.value.trim()


    sendButton.disabled =
        !socketConnected ||
        !groups.length ||
        !message ||
        sending


    console.log(
        '[MESSAGES] Botão:',
        {
            conectado:
                socketConnected,

            grupos:
                groups.length,

            mensagem:
                Boolean(message),

            enviando:
                sending,

            disabled:
                sendButton.disabled
        }
    )

}


function sendMessage() {

    const groups =
        getSelectedGroups()


    const message =
        messageInput.value.trim()


    console.log(
        '[MESSAGES] ENVIAR CLICADO'
    )


    console.log(
        '[MESSAGES] Grupos:',
        groups
    )


    console.log(
        '[MESSAGES] Mensagem:',
        message
    )


    if (!socketConnected) {

        console.error(
            '[MESSAGES] Socket desconectado.'
        )

        return

    }


    if (!groups.length) {

        alert(
            'Selecione pelo menos um grupo.'
        )

        return

    }


    if (!message) {

        alert(
            'Digite uma mensagem.'
        )

        return

    }


    sending =
        true


    updateSendButton()


    progressArea.hidden =
        false


    progressText.textContent =
        `0 / ${groups.length}`


    progressFill.style.width =
        '0%'


    sendStatus.textContent =
        'Enviando...'


    cancelButton.hidden =
        false


    const payload = {

        groupIds:
            groups,

        message:
            message

    }


    console.log(
        '[MESSAGES] Enviando para o servidor:',
        payload
    )


    socket.emit(
        'send-message',
        payload
    )


    console.log(
        '[MESSAGES] Evento send-message enviado.'
    )

}


function cancelSend() {

    console.log(
        '[MESSAGES] Cancelando envio.'
    )


    socket.emit(
        'cancel-send'
    )

}


function finishSending(
    data
) {

    console.log(
        '[MESSAGES] Envio finalizado:',
        data
    )


    sending =
        false


    cancelButton.hidden =
        true


    updateSendButton()

}


export function updateMessagesConnection(
    connected
) {

    socketConnected =
        connected


    console.log(
        '[MESSAGES] Socket:',
        connected
    )


    updateSendButton()

}


export function setupMessages(
    socketInstance
) {

    socket =
        socketInstance


    console.log(
        '[MESSAGES] Configurado.'
    )


    socket.on(
        'send-started',
        data => {

            console.log(
                '[MESSAGES] send-started:',
                data
            )

        }
    )


    socket.on(
        'send-progress',
        data => {

            console.log(
                '[MESSAGES] send-progress:',
                data
            )


            if (data) {

                const current =
                    data.current || 0


                const total =
                    data.total || 0


                progressText.textContent =
                    `${current} / ${total}`


                if (total > 0) {

                    progressFill.style.width =
                        `${(
                            current /
                            total
                        ) * 100}%`

                }


                if (data.group) {

                    sendStatus.textContent =
                        `Enviando para ${data.group}...`

                }

            }

        }
    )


    socket.on(
        'send-finished',
        finishSending
    )


    socket.on(
        'send-cancelled',
        data => {

            console.log(
                '[MESSAGES] send-cancelled:',
                data
            )


            sending =
                false


            cancelButton.hidden =
                true


            sendStatus.textContent =
                'Envio cancelado.'


            updateSendButton()

        }
    )


    socket.on(
        'send-result',
        data => {

            console.log(
                '[MESSAGES] send-result:',
                data
            )


            if (
                data &&
                data.success === false
            ) {

                sending =
                    false

                cancelButton.hidden =
                    true

                sendStatus.textContent =
                    data.message ||
                    'Erro ao enviar.'

                updateSendButton()

            }

        }
    )


    socket.on(
        'cancel-result',
        data => {

            console.log(
                '[MESSAGES] cancel-result:',
                data
            )

        }
    )


    messageInput.addEventListener(
        'input',
        () => {

            updateCharacterCount()

            updateSendButton()

        }
    )


    sendButton.addEventListener(
        'click',
        sendMessage
    )


    cancelButton.addEventListener(
        'click',
        cancelSend
    )


    document.addEventListener(
        'groups-selection-changed',
        updateSendButton
    )


    updateCharacterCount()

}