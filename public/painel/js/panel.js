// caminho: public/painel/js/panel.js

import {
    startCooldown,
    isCooldown
} from './cooldown.js'


const socket =
    io()


const connectionStatus =
    document.getElementById(
        'connection-status'
    )


const connectionDot =
    document.getElementById(
        'connection-dot'
    )


const groupsContainer =
    document.getElementById(
        'groups'
    )


const groupCount =
    document.getElementById(
        'group-count'
    )


const selectedCount =
    document.getElementById(
        'selected-count'
    )


const selectAll =
    document.getElementById(
        'select-all'
    )


const message =
    document.getElementById(
        'message'
    )


const characterCount =
    document.getElementById(
        'character-count'
    )


const sendTargetCount =
    document.getElementById(
        'send-target-count'
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


let availableGroups =
    []


let sending =
    false


/*
 * ==========================================
 * CONEXÃO
 * ==========================================
 */

function setConnectionStatus(
    connected
) {

    if (
        connected
    ) {

        connectionStatus.textContent =
            'Connected'


        connectionDot.classList.add(
            'connected'
        )

    } else {

        connectionStatus.textContent =
            'Disconnected'


        connectionDot.classList.remove(
            'connected'
        )

    }


    updateSendButton()
}


/*
 * ==========================================
 * SOCKET CONECTADO
 * ==========================================
 */

socket.on(
    'connect',
    () => {

        console.log(
            '[PAINEL] Socket conectado:',
            socket.id
        )


        console.log(
            '[PAINEL] Transport:',
            socket.io.engine.transport.name
        )


        setConnectionStatus(
            true
        )

    }
)


/*
 * ==========================================
 * SOCKET DESCONECTADO
 * ==========================================
 */

socket.on(
    'disconnect',
    reason => {

        console.error(
            '[PAINEL] Socket desconectado:',
            reason
        )


        setConnectionStatus(
            false
        )


        sending =
            false


        updateSendButton()

    }
)


/*
 * ==========================================
 * ERRO DE CONEXÃO
 * ==========================================
 */

socket.on(
    'connect_error',
    error => {

        console.error(
            '[PAINEL] Erro Socket.IO:',
            error
        )

    }
)


/*
 * ==========================================
 * AUTENTICAÇÃO
 * ==========================================
 */

socket.on(
    'auth-error',
    data => {

        console.error(
            '[PAINEL] Erro de autenticação:',
            data
        )


        connectionStatus.textContent =
            'Authentication error'

    }
)


/*
 * ==========================================
 * RENDERIZAR GRUPOS
 * ==========================================
 */

function renderGroups(
    groups
) {

    availableGroups =
        Array.isArray(groups)
            ? groups
            : []


    groupCount.textContent =
        availableGroups.length


    groupsContainer.innerHTML =
        ''


    if (
        availableGroups.length === 0
    ) {

        groupsContainer.innerHTML =
            '<div class="loading">No groups found.</div>'


        updateSelection()

        return
    }


    availableGroups.forEach(
        (
            group,
            index
        ) => {

            const label =
                document.createElement(
                    'label'
                )


            label.className =
                'group-item'


            const checkbox =
                document.createElement(
                    'input'
                )


            checkbox.type =
                'checkbox'


            checkbox.className =
                'group-checkbox'


            checkbox.value =
                group.id


            checkbox.dataset.index =
                index


            const name =
                document.createElement(
                    'span'
                )


            name.textContent =
                group.name ||
                'Unnamed group'


            label.appendChild(
                checkbox
            )


            label.appendChild(
                name
            )


            groupsContainer.appendChild(
                label
            )


            checkbox.addEventListener(
                'change',
                updateSelection
            )

        }
    )


    updateSelection()
}


/*
 * ==========================================
 * EVENTO GROUPS
 * ==========================================
 */

socket.on(
    'groups',
    groups => {

        console.log(
            '[PAINEL] Grupos recebidos:',
            groups
        )


        renderGroups(
            groups
        )

    }
)


/*
 * ==========================================
 * ESTADO WHATSAPP
 * ==========================================
 */

socket.on(
    'whatsapp-state',
    state => {

        console.log(
            '[PAINEL] Estado recebido:',
            state
        )


        if (
            state &&
            Array.isArray(
                state.groups
            )
        ) {

            renderGroups(
                state.groups
            )

        }

    }
)


/*
 * ==========================================
 * GRUPOS SELECIONADOS
 * ==========================================
 */

function getSelectedGroups() {

    return [
        ...document.querySelectorAll(
            '.group-checkbox:checked'
        )
    ]
    .map(
        checkbox =>
            checkbox.value
    )
}


/*
 * ==========================================
 * ATUALIZAR SELEÇÃO
 * ==========================================
 */

function updateSelection() {

    const selected =
        getSelectedGroups()


    const total =
        availableGroups.length


    selectedCount.textContent =
        `${selected.length} selected`


    sendTargetCount.textContent =
        `${selected.length} ${
            selected.length === 1
                ? 'group'
                : 'groups'
        }`


    selectAll.checked =
        total > 0 &&
        selected.length === total


    selectAll.indeterminate =
        selected.length > 0 &&
        selected.length < total


    updateSendButton()
}


/*
 * ==========================================
 * SELECIONAR TODOS
 * ==========================================
 */

selectAll.addEventListener(
    'change',
    () => {

        const checkboxes =
            document.querySelectorAll(
                '.group-checkbox'
            )


        checkboxes.forEach(
            checkbox => {

                checkbox.checked =
                    selectAll.checked

            }
        )


        updateSelection()

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
 * ATUALIZAR BOTÃO
 * ==========================================
 */

function updateSendButton() {

    if (
        !sendButton
    ) {

        return
    }


    const hasGroups =
        getSelectedGroups().length > 0


    const hasMessage =
        message.value.trim().length > 0


    sendButton.disabled =
        !hasGroups ||
        !hasMessage ||
        !socket.connected ||
        sending ||
        isCooldown()

}


/*
 * ==========================================
 * INICIAR ENVIO
 * ==========================================
 */

function sendMessage() {

    console.log(
        '[PAINEL] Botão Send message clicado.'
    )


    console.log(
        '[PAINEL] Socket conectado:',
        socket.connected
    )


    const selectedGroups =
        getSelectedGroups()


    const text =
        message.value.trim()


    console.log(
        '[PAINEL] Grupos selecionados:',
        selectedGroups
    )


    console.log(
        '[PAINEL] Mensagem:',
        text
    )


    if (
        !socket.connected
    ) {

        sendStatus.textContent =
            'Servidor não conectado.'

        return
    }


    if (
        isCooldown()
    ) {

        sendStatus.textContent =
            'Aguarde o cooldown.'

        return
    }


    if (
        !selectedGroups.length
    ) {

        sendStatus.textContent =
            'Selecione pelo menos um grupo.'

        return
    }


    if (
        !text
    ) {

        sendStatus.textContent =
            'Digite uma mensagem.'

        return
    }


    sending =
        true


    sendButton.disabled =
        true


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
        'Preparing delivery...'


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
            '[PAINEL] Cancelamento solicitado.'
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

socket.on(
    'send-started',
    data => {

        console.log(
            '[PAINEL] Envio iniciado:',
            data
        )


        sending =
            true


        sendButton.disabled =
            true


        cancelButton.hidden =
            false


        cancelButton.disabled =
            false


        progressArea.hidden =
            false


        progressText.textContent =
            `0 / ${data?.total || 0}`


        progressFill.style.width =
            '0%'


        sendStatus.textContent =
            `Enviando para ${data?.total || 0} grupos...`

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

        console.log(
            '[PAINEL] Progresso:',
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
                ? (
                    current /
                    total
                ) * 100
                : 0


        progressText.textContent =
            `${current} / ${total}`


        progressFill.style.width =
            `${percent}%`


        sendStatus.textContent =
            `Enviando: ${data?.group || ''}`

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

        console.log(
            '[PAINEL] Envio finalizado:',
            data
        )


        sending =
            false


        cancelButton.hidden =
            true


        cancelButton.disabled =
            true


        progressFill.style.width =
            '100%'


        progressText.textContent =
            `${data?.sent || 0} / ${
                data?.total ||
                data?.sent ||
                0
            }`


        sendStatus.textContent =
            `Envio concluído. Enviadas: ${
                data?.sent || 0
            }. Falhas: ${
                data?.failed || 0
            }.`


        startCooldown(
            5,
            sendButton
        )


        cooldownStatus.textContent =
            'Cooldown'


        setTimeout(
            () => {

                cooldownStatus.textContent =
                    'Ready'

                updateSendButton()

            },
            5000
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

        console.log(
            '[PAINEL] Envio cancelado:',
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
)


/*
 * ==========================================
 * ERRO DE ENVIO
 * ==========================================
 */

socket.on(
    'send-result',
    data => {

        console.log(
            '[PAINEL] Resultado do envio:',
            data
        )


        if (
            data?.success
        ) {

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
)


/*
 * ==========================================
 * RESULTADO DO CANCELAMENTO
 * ==========================================
 */

socket.on(
    'cancel-result',
    data => {

        console.log(
            '[PAINEL] Resultado do cancelamento:',
            data
        )


        if (
            data?.success
        ) {

            sendStatus.textContent =
                'Cancelamento solicitado.'

        } else {

            sendStatus.textContent =
                data?.message ||
                'Nenhum envio em andamento.'

        }

    }
)


/*
 * ==========================================
 * ESTADO INICIAL
 * ==========================================
 */

cooldownStatus.textContent =
    'Ready'


updateSelection()