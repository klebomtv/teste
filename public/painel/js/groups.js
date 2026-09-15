// caminho: public/painel/js/groups.js

console.log(
    '[GROUPS] ===== groups.js CARREGADO ====='
)


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


console.log(
    '[GROUPS] Elementos encontrados:',
    {
        groupsContainer:
            Boolean(
                groupsContainer
            ),

        groupCount:
            Boolean(
                groupCount
            ),

        selectedCount:
            Boolean(
                selectedCount
            ),

        selectAll:
            Boolean(
                selectAll
            )
    }
)


export function updateGroupsConnection(
    connected
) {

    console.log(
        '[GROUPS] updateGroupsConnection:',
        connected
    )


    socketConnected =
        connected

}


function renderGroups(
    groups
) {

    console.log(
        '[GROUPS] ===== RENDERIZANDO GRUPOS ====='
    )


    console.log(
        '[GROUPS] Dados recebidos:',
        groups
    )


    console.log(
        '[GROUPS] É array:',
        Array.isArray(groups)
    )


    console.log(
        '[GROUPS] Quantidade:',
        Array.isArray(groups)
            ? groups.length
            : 0
    )


    availableGroups =
        Array.isArray(groups)
            ? groups
            : []


    if (!groupsContainer) {

        console.error(
            '[GROUPS] ERRO: #groups não existe no HTML.'
        )

        return

    }


    if (groupCount) {

        groupCount.textContent =
            availableGroups.length

    }


    groupsContainer.innerHTML =
        ''


    if (
        availableGroups.length === 0
    ) {

        console.warn(
            '[GROUPS] Nenhum grupo para renderizar.'
        )


        groupsContainer.innerHTML =
            '<div class="loading">Nenhum grupo encontrado.</div>'


        updateSelection()


        return

    }


    availableGroups.forEach(
        (
            group,
            index
        ) => {

            console.log(
                `[GROUPS] Criando grupo ${index + 1}:`,
                group
            )


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
                group?.id || ''


            checkbox.dataset.index =
                index


            const name =
                document.createElement(
                    'span'
                )


            name.textContent =
                group?.name ||
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
                () => {

                    console.log(
                        '[GROUPS] Checkbox alterado:',
                        {
                            id:
                                checkbox.value,

                            name:
                                name.textContent,

                            checked:
                                checkbox.checked
                        }
                    )


                    updateSelection()

                }
            )

        }
    )


    console.log(
        '[GROUPS] Grupos adicionados ao DOM:',
        groupsContainer.children.length
    )


    updateSelection()


    console.log(
        '[GROUPS] ===== FIM DO RENDER ====='
    )

}


function handleGroups(
    groups
) {

    console.log(
        '[GROUPS] ============================='
    )

    console.log(
        '[GROUPS] EVENTO "groups" RECEBIDO'
    )

    console.log(
        '[GROUPS] Dados:',
        groups
    )

    console.log(
        '[GROUPS] ============================='
    )


    renderGroups(
        groups
    )

}


function handleWhatsappState(
    state
) {

    console.log(
        '[GROUPS] ============================='
    )

    console.log(
        '[GROUPS] EVENTO "whatsapp-state" RECEBIDO'
    )

    console.log(
        '[GROUPS] Estado completo:',
        state
    )

    console.log(
        '[GROUPS] groups:',
        state?.groups
    )

    console.log(
        '[GROUPS] Quantidade:',
        Array.isArray(
            state?.groups
        )
            ? state.groups.length
            : 0
    )

    console.log(
        '[GROUPS] ============================='
    )


    if (
        state &&
        Array.isArray(
            state.groups
        )
    ) {

        console.log(
            '[GROUPS] Renderizando grupos vindos do whatsapp-state.'
        )


        renderGroups(
            state.groups
        )

    } else {

        console.warn(
            '[GROUPS] whatsapp-state não possui groups válido.'
        )

    }

}


export function getSelectedGroups() {

    const checkboxes =
        document.querySelectorAll(
            '.group-checkbox:checked'
        )


    const selected =
        [
            ...checkboxes
        ].map(
            checkbox =>
                checkbox.value
        )


    console.log(
        '[GROUPS] Grupos selecionados:',
        selected
    )


    return selected

}


function updateSelection() {

    const selected =
        getSelectedGroups()


    const total =
        availableGroups.length


    console.log(
        '[GROUPS] Atualizando seleção:',
        {
            total,
            selected:
                selected.length
        }
    )


    if (selectedCount) {

        selectedCount.textContent =
            `${selected.length} selected`

    }


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


    if (selectAll) {

        selectAll.checked =
            total > 0 &&
            selected.length === total


        selectAll.indeterminate =
            selected.length > 0 &&
            selected.length < total

    }


    document.dispatchEvent(
        new CustomEvent(
            'groups-selection-changed'
        )
    )


    console.log(
        '[GROUPS] Evento groups-selection-changed disparado.'
    )

}


if (selectAll) {

    selectAll.addEventListener(
        'change',
        () => {

            console.log(
                '[GROUPS] SELECT ALL alterado:',
                selectAll.checked
            )


            const checkboxes =
                document.querySelectorAll(
                    '.group-checkbox'
                )


            console.log(
                '[GROUPS] Checkboxes encontrados:',
                checkboxes.length
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

}


export function setupGroups(
    socket
) {

    console.log(
        '[GROUPS] ===== setupGroups() ====='
    )


    console.log(
        '[GROUPS] Socket recebido:',
        socket
    )


    console.log(
        '[GROUPS] socket.connected:',
        socket?.connected
    )


    socket.on(
        'groups',
        handleGroups
    )


    console.log(
        '[GROUPS] Listener "groups" registrado.'
    )


    socket.on(
        'whatsapp-state',
        handleWhatsappState
    )


    console.log(
        '[GROUPS] Listener "whatsapp-state" registrado.'
    )


    console.log(
        '[GROUPS] ===== setupGroups() FINALIZADO ====='
    )

}