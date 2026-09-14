// caminho: public/painel/js/groups.js

let availableGroups = []

let socketConnected = false


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


/*
 * ==========================================
 * CONEXÃO
 * ==========================================
 */

export function updateGroupsConnection(
    connected
) {

    socketConnected =
        connected

}


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
            '<div class="loading">Nenhum grupo encontrado.</div>'


        updateSelection()

        return

    }


    availableGroups.forEach(
        (group, index) => {

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
                'Grupo sem nome'


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
 * GRUPOS RECEBIDOS
 * ==========================================
 */

function handleGroups(
    groups
) {

    console.log(
        '[GROUPS] Grupos recebidos:',
        groups
    )


    renderGroups(
        groups
    )

}


/*
 * ==========================================
 * ESTADO DO WHATSAPP
 * ==========================================
 */

function handleWhatsappState(
    state
) {

    console.log(
        '[GROUPS] Estado recebido:',
        state
    )


    if (
        state &&
        Array.isArray(state.groups)
    ) {

        renderGroups(
            state.groups
        )

    }

}


/*
 * ==========================================
 * GRUPOS SELECIONADOS
 * ==========================================
 */

export function getSelectedGroups() {

    return [
        ...document.querySelectorAll(
            '.group-checkbox:checked'
        )
    ].map(
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


    const sendTargetCount =
        document.getElementById(
            'send-target-count'
        )


    if (sendTargetCount) {

        sendTargetCount.textContent =
            `${selected.length} ${
                selected.length === 1
                    ? 'group'
                    : 'groups'
            }`

    }


    selectAll.checked =
        total > 0 &&
        selected.length === total


    selectAll.indeterminate =
        selected.length > 0 &&
        selected.length < total


    document.dispatchEvent(
        new CustomEvent(
            'groups-selection-changed'
        )
    )

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
 * CONFIGURAR MÓDULO
 * ==========================================
 */

export function setupGroups(
    socket
) {

    socket.on(
        'groups',
        handleGroups
    )


    socket.on(
        'whatsapp-state',
        handleWhatsappState
    )

}