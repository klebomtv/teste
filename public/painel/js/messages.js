// caminho: public/painel/js/messages.js

import {
    getSelectedGroups
} from './groups.js'

import {
    startCooldown,
    isCooldown
} from './cooldown.js'


let socket = null

let socketConnected = false

let sending = false


const message =
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


/*
 * ==========================================
 * CONEXÃO
 * ==========================================
 */

export function updateMessagesConnection(
    connected
) {

    socketConnected =
        connected


    updateSendButton()

}


/*
 * ==========================================
 * ATUALIZAR BOTÃO
 * ==========================================
 */

function updateSendButton() {

    if (!sendButton) {
        return
    }


    const hasGroups =
        getSelectedGroups().length > 0


    const hasMessage =
        message.value.trim().length > 0


    sendButton.disabled =
        !hasGroups ||
        !hasMessage ||
        !socketConnected ||
        sending ||
        isCooldown()

}


/*
 * ==========================================
 * ALTERAÇÃO NA SELEÇÃO DOS GRUPOS
 * ==========================================
 */

document.addEventListener(
    'groups-selection-changed',
    () => {

        updateSendButton()

    }
)


/*
 * ==========================================
 * CONTADOR DE CARACTERES
 * ==========================================
 */

message.addEventListener(
    'input',
    () => {

        characterCount.textContent =
            `${message.value.length} / 4096`


        updateSendButton()

    }
)


/*
 * ==========================================
 * ENVIAR MENSAGEM
 * ==========================================
 */

function sendMessage() {

    console.log(
        '[MESSAGES] Botão de envio clicado.'
    )


    console.log(
        '[MESSAGES] Socket conectado:',
        socketConnected
    )


    const selectedGroups =
        getSelectedGroups()


    const text =
        message.value.trim()


    console.log(
        '[MESSAGES] Grupos selecionados:',
        selectedGroups
    )


    console.log(
        '[MESSAGES] Mensagem:',
        text
    )


    if (!socketConnected) {

        sendStatus.textContent =
            'Servidor não conectado.'

        return

    }


    if (isCooldown()) {

        sendStatus.textContent =
            'Aguarde o cooldown.'

        return

    }


    if (!selectedGroups.length) {

        sendStatus.textContent =
            'Selecione pelo menos um grupo.'

        return

    }


    if (!text) {

        sendStatus.textContent =
            'Digite uma mensagem.'

        return

    }


    sending =
        true


    updateSendButton()


    cancelButton.hidden =
        false


    cancelButton.disabled =
        false


    progressArea.hidden =
        false


    progressText.textContent =
        `0 / ${selectedGroups.length}`


    progressFill.style.width =
        '0%'


    sendStatus.textContent =
        'Preparando envio...'


    cooldownStatus.textContent =
        'Sending'


    socket.emit(
        'send-message',
        {
            groupIds:
                selectedGroups,

            message:
                text
        }
    )

}


/*
 * ==========================================
 * BOTÃO ENVIAR
 * ==========================================
 */

sendButton.addEventListener(
    'click',
    sendMessage
)


/*
 * ==========================================
 * CANCELAR
 * ==========================================
 */

cancelButton.addEventListener(
    'click',
    () => {

        console.log(
            '[MESSAGES] Cancelamento solicitado.'
        )


        socket.emit(
            'cancel-send'
        )


        sendStatus.textContent =
            'Cancelamento solicitado...'


        cancelButton.disabled =
            true

    }
)


/*
 * ==========================================
 * ENVIO INICIADO
 * ==========================================
 */

function handleSendStarted(
    data
) {

    console.log(
        '[MESSAGES] Envio iniciado:',
        data
    )


    sending =
        true


    updateSendButton()


    cancelButton.hidden =
        false


    cancelButton.disabled =
        false


    progressArea.hidden =
        false


    const total =
        Number(
            data?.total || 0
        )


    progressText.textContent =
        `0 / ${total}`


    progressFill.style.width =
        '0%'


    sendStatus.textContent =
        `Enviando para ${total} grupos...`

}


/*
 * ==========================================
 * PROGRESSO
 * ==========================================
 */

function handleSendProgress(
    data
) {

    console.log(
        '[MESSAGES] Progresso:',
        data
    )


    const current =
        Number(
            data?.current || 0
        )


    const total =
        Number(
            data?.total || 0
        )


    const percent =
        total > 0
            ? (current / total) * 100
            : 0


    progressText.textContent =
        `${current} / ${total}`


    progressFill.style.width =
        `${percent}%`


    sendStatus.textContent =
        `Enviando: ${
            data?.group || ''
        }`

}


/*
 * ==========================================
 * ENVIO FINALIZADO
 * ==========================================
 */

function handleSendFinished(
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


    cancelButton.disabled =
        true


    const sent =
        Number(
            data?.sent || 0
        )


    const failed =
        Number(
            data?.failed || 0
        )


    const total =
        Number(
            data?.total ||
            sent + failed
        )


    progressFill.style.width =
        '100%'


    progressText.textContent =
        `${sent} / ${total}`


    sendStatus.textContent =
        `Envio concluído. Enviadas: ${sent}. Falhas: ${failed}.`


    cooldownStatus.textContent =
        'Cooldown'


    startCooldown(
        5,
        sendButton
    )


    setTimeout(
        () => {

            cooldownStatus.textContent =
                'Ready'


            updateSendButton()

        },
        5000
    )

}


/*
 * ==========================================
 * ENVIO CANCELADO
 * ==========================================
 */

function handleSendCancelled(
    data
) {

    console.log(
        '[MESSAGES] Envio cancelado:',
        data
    )


    sending =
        false


    cancelButton.hidden =
        true


    cancelButton.disabled =
        true


    sendStatus.textContent =
        `Envio cancelado. Enviadas: ${
            data?.sent || 0
        }. Falhas: ${
            data?.failed || 0
        }.`


    cooldownStatus.textContent =
        'Ready'


    updateSendButton()

}


/*
 * ==========================================
 * RESULTADO DO ENVIO
 * ==========================================
 */

function handleSendResult(
    data
) {

    console.log(
        '[MESSAGES] Resultado do envio:',
        data
    )


    if (data?.success) {
        return
    }


    sending =
        false


    cancelButton.hidden =
        true


    cancelButton.disabled =
        true


    sendStatus.textContent =
        data?.message ||
        'Não foi possível enviar a mensagem.'


    cooldownStatus.textContent =
        'Ready'


    updateSendButton()

}


/*
 * ==========================================
 * RESULTADO DO CANCELAMENTO
 * ==========================================
 */

function handleCancelResult(
    data
) {

    console.log(
        '[MESSAGES] Resultado do cancelamento:',
        data
    )


    if (data?.success) {

        sendStatus.textContent =
            'Cancelamento solicitado.'

    } else {

        sendStatus.textContent =
            data?.message ||
            'Nenhum envio em andamento.'

    }

}


/*
 * ==========================================
 * CONFIGURAR MÓDULO
 * ==========================================
 */

export function setupMessages(
    socketInstance
) {

    socket =
        socketInstance


    socket.on(
        'send-started',
        handleSendStarted
    )


    socket.on(
        'send-progress',
        handleSendProgress
    )


    socket.on(
        'send-finished',
        handleSendFinished
    )


    socket.on(
        'send-cancelled',
        handleSendCancelled
    )


    socket.on(
        'send-result',
        handleSendResult
    )


    socket.on(
        'cancel-result',
        handleCancelResult
    )


    cooldownStatus.textContent =
        'Ready'


    updateSendButton()

}