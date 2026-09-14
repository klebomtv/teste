// caminho: public/painel/js/panel.js

import {
    startCooldown,
    isCooldown
} from './cooldown.js'


const socket =
    io()


const groupsContainer =
    document.getElementById(
        'groups'
    )


const selectAll =
    document.getElementById(
        'select-all'
    )


const selectedCount =
    document.getElementById(
        'selected-count'
    )


const messageInput =
    document.getElementById(
        'message'
    )


const sendButton =
    document.getElementById(
        'send-message'
    )


const cancelButton =
    document.getElementById(
        'cancel-send'
    )


const progress =
    document.getElementById(
        'progress'
    )


const status =
    document.getElementById(
        'status'
    )


let groups =
    []


let sending =
    false


function renderGroups(
    list
) {

    if (
        !groupsContainer
    ) {

        console.warn(
            '[PAINEL] Container de grupos não encontrado.'
        )

        return
    }


    groupsContainer.innerHTML =
        ''


    if (
        !Array.isArray(list) ||
        !list.length
    ) {

        groupsContainer.innerHTML =
            '<p>Nenhum grupo encontrado.</p>'

        updateSelectedCount()

        return
    }


    list.forEach(
        group => {

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


            checkbox.dataset.groupId =
                group.id


            checkbox.dataset.groupName =
                group.name


            checkbox.addEventListener(
                'change',
                () => {

                    updateSelectedCount()

                }
            )


            const name =
                document.createElement(
                    'span'
                )


            name.textContent =
                group.name


            label.appendChild(
                checkbox
            )


            label.appendChild(
                name
            )


            groupsContainer.appendChild(
                label
            )
        }
    )


    updateSelectedCount()
}


function getSelectedIds() {

    if (
        !groupsContainer
    ) {

        return []
    }


    const checkboxes =
        groupsContainer.querySelectorAll(
            '.group-checkbox:checked'
        )


    return Array.from(
        checkboxes
    ).map(
        checkbox =>
            checkbox.value
    )
}


function updateSelectedCount() {

    const selectedIds =
        getSelectedIds()


    if (
        selectedCount
    ) {

        selectedCount.textContent =
            selectedIds.length
    }


    if (
        selectAll &&
        groupsContainer
    ) {

        const checkboxes =
            groupsContainer.querySelectorAll(
                '.group-checkbox'
            )


        selectAll.checked =
            checkboxes.length > 0 &&
            selectedIds.length ===
                checkboxes.length
    }
}


function setSendingState(
    value
) {

    sending =
        Boolean(value)


    if (
        sendButton
    ) {

        sendButton.disabled =
            sending
    }


    if (
        cancelButton
    ) {

        cancelButton.disabled =
            !sending
    }
}


function showProgress(
    data
) {

    if (
        !progress
    ) {

        return
    }


    const current =
        Number(
            data?.current || 0
        )


    const total =
        Number(
            data?.total || 0
        )


    const sent =
        Number(
            data?.sent || 0
        )


    const failed =
        Number(
            data?.failed || 0
        )


    const group =
        data?.group ||
        ''


    progress.textContent =
        `Enviando ${current}/${total} — ` +
        `Enviadas: ${sent} — ` +
        `Falhas: ${failed}` +
        (
            group
                ? ` — ${group}`
                : ''
        )
}


function getMessage() {

    if (
        !messageInput
    ) {

        return ''
    }


    return messageInput.value.trim()
}


function validateSend() {

    if (
        !socket.connected
    ) {

        return 'Conexão com o servidor não está disponível.'
    }


    if (
        sending
    ) {

        return 'Já existe um envio em andamento.'
    }


    if (
        isCooldown()
    ) {

        return 'Aguarde o tempo de cooldown terminar.'
    }


    const selectedIds =
        getSelectedIds()


    if (
        !selectedIds.length
    ) {

        return 'Selecione pelo menos um grupo.'
    }


    const message =
        getMessage()


    if (
        !message
    ) {

        return 'Digite uma mensagem.'
    }


    return null
}


function sendMessage() {

    const error =
        validateSend()


    if (
        error
    ) {

        if (
            status
        ) {

            status.textContent =
                error
        }

        return
    }


    const selectedIds =
        getSelectedIds()


    const message =
        getMessage()


    console.log(
        '[PAINEL] Enviando mensagem.'
    )


    console.log(
        '[PAINEL] Grupos selecionados:',
        selectedIds
    )


    setSendingState(
        true
    )


    if (
        status
    ) {

        status.textContent =
            'Iniciando envio...'
    }


    if (
        progress
    ) {

        progress.textContent =
            'Preparando envio...'
    }


    socket.emit(
        'send-message',
        {
            groupIds:
                selectedIds,

            message:
                message
        }
    )
}


function cancelSend() {

    if (
        !sending
    ) {

        return
    }


    console.log(
        '[PAINEL] Solicitando cancelamento.'
    )


    if (
        status
    ) {

        status.textContent =
            'Solicitando cancelamento...'
    }


    socket.emit(
        'cancel-send'
    )
}


if (
    selectAll
) {

    selectAll.addEventListener(
        'change',
        () => {

            if (
                !groupsContainer
            ) {

                return
            }


            const checkboxes =
                groupsContainer.querySelectorAll(
                    '.group-checkbox'
                )


            checkboxes.forEach(
                checkbox => {

                    checkbox.checked =
                        selectAll.checked
                }
            )


            updateSelectedCount()
        }
    )
}


if (
    sendButton
) {

    sendButton.addEventListener(
        'click',
        sendMessage
    )
}


if (
    cancelButton
) {

    cancelButton.addEventListener(
        'click',
        cancelSend
    )
}


/*
 * ==========================================
 * GRUPOS
 * ==========================================
 */

socket.on(
    'groups',
    list => {

        console.log(
            '[PAINEL] Grupos recebidos:',
            list
        )


        groups =
            Array.isArray(list)
                ? list
                : []


        renderGroups(
            groups
        )
    }
)


socket.on(
    'whatsapp-state',
    stateData => {

        console.log(
            '[PAINEL] Estado recebido:',
            stateData
        )


        if (
            stateData &&
            Array.isArray(
                stateData.groups
            )
        ) {

            groups =
                stateData.groups


            renderGroups(
                groups
            )
        }


        if (
            stateData?.sending !== undefined
        ) {

            setSendingState(
                stateData.sending
            )
        }
    }
)


/*
 * ==========================================
 * INÍCIO DO ENVIO
 * ==========================================
 */

socket.on(
    'send-started',
    data => {

        console.log(
            '[PAINEL] Envio iniciado:',
            data
        )


        setSendingState(
            true
        )


        if (
            status
        ) {

            status.textContent =
                'Enviando mensagens...'
        }


        if (
            progress
        ) {

            progress.textContent =
                `0/${data?.total || 0}`
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

        console.log(
            '[PAINEL] Progresso:',
            data
        )


        showProgress(
            data
        )


        if (
            status
        ) {

            status.textContent =
                `Enviando: ${data?.group || ''}`
        }
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


        setSendingState(
            false
        )


        if (
            status
        ) {

            status.textContent =
                'Envio finalizado.'
        }


        if (
            progress
        ) {

            progress.textContent =
                `Enviadas: ${data?.sent || 0} — ` +
                `Falhas: ${data?.failed || 0}`
        }


        /*
         * O cooldown continua sendo controlado
         * pelo frontend.
         */

        if (
            sendButton
        ) {

            startCooldown(
                10,
                sendButton
            )
        }
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


        setSendingState(
            false
        )


        if (
            status
        ) {

            status.textContent =
                'Envio cancelado.'
        }


        if (
            progress
        ) {

            progress.textContent =
                `Enviadas: ${data?.sent || 0} — ` +
                `Falhas: ${data?.failed || 0}`
        }
    }
)


/*
 * ==========================================
 * RESULTADO DE ERRO
 * ==========================================
 */

socket.on(
    'send-result',
    data => {

        if (
            data?.success
        ) {

            return
        }


        setSendingState(
            false
        )


        if (
            status
        ) {

            status.textContent =
                data?.message ||
                'Erro ao enviar mensagem.'
        }
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

            if (
                status
            ) {

                status.textContent =
                    'Cancelamento solicitado.'
            }

        } else {

            if (
                status
            ) {

                status.textContent =
                    data?.message ||
                    'Nenhum envio em andamento.'
            }
        }
    }
)


/*
 * ==========================================
 * SOCKET.IO
 * ==========================================
 */

socket.on(
    'connect',
    () => {

        console.log(
            '[PAINEL] Socket.IO conectado:',
            socket.id
        )
    }
)


socket.on(
    'disconnect',
    reason => {

        console.log(
            '[PAINEL] Socket.IO desconectado:',
            reason
        )


        setSendingState(
            false
        )


        if (
            status
        ) {

            status.textContent =
                'Conexão com o servidor perdida.'
        }
    }
)


socket.on(
    'connect_error',
    error => {

        console.error(
            '[PAINEL] Erro Socket.IO:',
            error
        )


        if (
            status
        ) {

            status.textContent =
                'Erro na conexão com o servidor.'
        }
    }
)