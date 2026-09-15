// caminho: public/painel/js/groups.js

let availableGroups = []

let socket = null


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


function renderGroups(
    groups
) {

    console.log(
        '[GROUPS] Recebidos:',
        groups
    )


    if (
        !Array.isArray(groups)
    ) {

        console.error(
            '[GROUPS] Dados inválidos.'
        )

        return

    }


    availableGroups =
        groups


    groupCount.textContent =
        availableGroups.length


    groupsContainer.innerHTML =
        ''


    if (
        availableGroups.length === 0
    ) {

        groupsContainer.innerHTML = `
            <div class="loading">
                Nenhum grupo encontrado.
            </div>
        `

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
                `Grupo ${index + 1}`


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


    console.log(
        '[GROUPS] Renderizados:',
        availableGroups.length
    )

}


function handleWhatsappState(
    state
) {

    console.log(
        '[GROUPS] whatsapp-state:',
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


function handleGroups(
    groups
) {

    console.log(
        '[GROUPS] groups:',
        groups
    )


    renderGroups(
        groups
    )

}


function updateSelection() {

    const selected =
        getSelectedGroups()


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
        availableGroups.length > 0 &&
        selected.length ===
            availableGroups.length


    selectAll.indeterminate =
        selected.length > 0 &&
        selected.length <
            availableGroups.length


    document.dispatchEvent(
        new CustomEvent(
            'groups-selection-changed'
        )
    )

}


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


export function setupGroups(
    socketInstance
) {

    socket =
        socketInstance


    console.log(
        '[GROUPS] Configurando grupos.'
    )


    socket.on(
        'whatsapp-state',
        handleWhatsappState
    )


    socket.on(
        'groups',
        handleGroups
    )


    /*
     * IMPORTANTE:
     *
     * O backend envia whatsapp-state
     * imediatamente quando o socket
     * é autenticado.
     *
     * Portanto, também tentamos
     * obter o estado atual através
     * do evento usado pelo painel.
     */

    console.log(
        '[GROUPS] Listeners registrados.'
    )

}


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