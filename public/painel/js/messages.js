// caminho: public/painel/js/messages.js

import {
    getSelectedGroups
} from './groups.js'

import {
    startCooldown,
    isCooldown
} from './cooldown.js'


console.log(
    '[MESSAGES] ===== messages.js CARREGADO ====='
)


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


const cooldownStatus =
    document.getElementById(
        'cooldown-status'
    )


console.log(
    '[MESSAGES] Elementos encontrados:',
    {
        messageInput:
            Boolean(messageInput),

        characterCount:
            Boolean(characterCount),

        sendButton:
            Boolean(sendButton),

        cancelButton:
            Boolean(cancelButton),

        progressArea:
            Boolean(progressArea),

        progressText:
            Boolean(progressText),

        progressFill:
            Boolean(progressFill),

        sendStatus:
            Boolean(sendStatus),

        cooldownStatus:
            Boolean(cooldownStatus)
    }
)


export function updateMessagesConnection(
    connected
) {

    console.log(
        '[MESSAGES] Conexão atualizada:',
        connected
    )


    socketConnected =
        connected


    updateSendButton()

}


function updateCharacterCount() {

    if (!messageInput) {
        return
    }


    const length =
        messageInput.value.length


    if (characterCount) {

        characterCount.textContent =
            `${length} / 4096`

    }

}


function updateSendButton() {

    if (!sendButton) {
        return
    }


    const text =
        messageInput
            ? messageInput.value.trim()
            : ''


    const selectedGroups =
        getSelectedGroups()


    const cooldown =
        isCooldown()


    const disabled =
        !socketConnected ||
        !selectedGroups.length ||
        !text ||
        sending ||
        cooldown


    sendButton.disabled =
        disabled


    console.log(
        '[MESSAGES] Estado do botão enviar:',
        {
            socketConnected,
            grupos:
                selectedGroups.length,
            mensagem:
                Boolean(text),
            sending,
            cooldown,
            disabled
        }
    )

}


function handleSelectionChanged() {

    console.log(
        '[MESSAGES] Seleção de grupos alterada.'
    )


    updateSendButton()

}


function handleSendClick() {

    console.log(
        '[MESSAGES] ============================='
    )

    console.log(
        '[MESSAGES] BOTÃO ENVIAR CLICADO'
    )

    console.log(
        '[MESSAGES] ============================='
    )


    const selectedGroups =
        getSelectedGroups()


    const text =
        messageInput
            ? messageInput.value.trim()
            : ''


    console.log(
        '[MESSAGES] Grupos selecionados:',
        selectedGroups
    )


    console.log(
        '[MESSAGES] Mensagem:',
        text
    )


    console.log(
        '[MESSAGES] Socket conectado:',
        socketConnected
    )


    console.log(
        '[MESSAGES] socket.connected:',
        socket?.connected
    )


    if (!socketConnected) {

        console.error(
            '[MESSAGES] ABORTADO: Socket não conectado.'
        )

        return

    }


    if (!selectedGroups.length) {

        console.error(
            '[MESSAGES] ABORTADO: nenhum grupo selecionado.'
        )

        return

    }


    if (!text) {

        console.error(
            '[MESSAGES] ABORTADO: mensagem vazia.'
        )

        return

    }


    if (sending) {

        console.warn(
            '[MESSAGES] ABORTADO: envio já está em andamento.'
        )

        return

    }


    if (isCooldown()) {

        console.warn(
            '[MESSAGES] ABORTADO: cooldown ativo.'
        )

        return

    }


    sending =
        true


    updateSendButton()


    console.log(
        '[MESSAGES] ENVIANDO EVENTO "send-message"'
    )


    console.log(
        '[MESSAGES] Payload:',
        {
            groupIds:
                selectedGroups,

            message:
                text
        }
    )


    socket.emit(
        'send-message',
        {
            groupIds:
                selectedGroups,

            message:
                text
        }
    )


    console.log(
        '[MESSAGES] Evento "send-message" enviado.'
    )

}


function handleCancelClick() {

    console.log(
        '[MESSAGES] Botão cancelar clicado.'
    )


    if (!socket) {

        console.error(
            '[MESSAGES] Socket não disponível.'
        )

        return

    }


    console.log(
        '[MESSAGES] Enviando "cancel-send".'
    )


    socket.emit(
        'cancel-send'
    )

}


export function setupMessages(
    socketInstance
) {

    console.log(
        '[MESSAGES] ===== setupMessages() ====='
    )


    socket =
        socketInstance


    console.log(
        '[MESSAGES] Socket recebido.'
    )


    socket.on(
        'send-started',
        data => {

            console.log(
                '[MESSAGES] EVENTO send-started:',
                data
            )

        }
    )


    socket.on(
        'send-progress',
        data => {

            console.log(
                '[MESSAGES] EVENTO send-progress:',
                data
            )

        }
    )


    socket.on(
        'send-finished',
        data => {

            console.log(
                '[MESSAGES] EVENTO send-finished:',
                data
            )


            sending =
                false


            startCooldown(
                5
            )


            updateSendButton()

        }
    )


    socket.on(
        'send-cancelled',
        data => {

            console.log(
                '[MESSAGES] EVENTO send-cancelled:',
                data
            )


            sending =
                false


            updateSendButton()

        }
    )


    socket.on(
        'send-result',
        data => {

            console.log(
                '[MESSAGES] EVENTO send-result:',
                data
            )


            if (
                data &&
                data.success === false
            ) {

                sending =
                    false


                updateSendButton()

            }

        }
    )


    socket.on(
        'cancel-result',
        data => {

            console.log(
                '[MESSAGES] EVENTO cancel-result:',
                data
            )

        }
    )


    if (messageInput) {

        messageInput.addEventListener(
            'input',
            () => {

                updateCharacterCount()

                updateSendButton()

            }
        )

    }


    if (sendButton) {

        sendButton.addEventListener(
            'click',
            handleSendClick
        )

    }


    if (cancelButton) {

        cancelButton.addEventListener(
            'click',
            handleCancelClick
        )

    }


    document.addEventListener(
        'groups-selection-changed',
        handleSelectionChanged
    )


    updateCharacterCount()

    updateSendButton()


    console.log(
        '[MESSAGES] ===== setupMessages() FINALIZADO ====='
    )

}