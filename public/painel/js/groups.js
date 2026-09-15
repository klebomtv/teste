// caminho: public/painel/js/groups.js

let availableGroups = []


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
    '[GROUPS] Módulo groups.js carregado.'
)


/*
 * ==========================================
 * CONEXÃO
 * ==========================================
 */

export function updateGroupsConnection(
    connected
) {

    console.log(
        '[GROUPS] Estado da conexão:',
        connected
    )

}


/*
 * ==========================================
 * RENDERIZAR GRUPOS
 * ==========================================
 */

function renderGroups(
    groups
) {

    console.log(
        '[GROUPS] Renderizando grupos:',
        groups
    )


    if (
        !Array.isArray(groups)
    ) {

        console.error(
            '[GROUPS] ERRO: groups não é um array.',
            groups
        )

        return

    }


    availableGroups =
        groups


    /*
     * Atualiza contador.
     */

    if (groupCount) {

        groupCount.textContent =
            availableGroups.length

    }


    /*
     * Limpa lista atual.
     */

    if (groupsContainer) {

        groupsContainer.innerHTML = ''

    }


    /*
     * Nenhum grupo.
     */

    if (
        availableGroups.length === 0
    ) {

        if (groupsContainer) {

            groupsContainer.innerHTML = `

                <div class="loading">
                    Nenhum grupo encontrado.
                </div>

            `

        }


        updateSelection()

        return

    }


    /*
     * Cria cada grupo.
     */

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
                group.id || ''


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


    console.log(
        '[GROUPS] Grupos renderizados:',
        availableGroups.length
    )

}


/*
 * ==========================================
 * WHATSAPP STATE
 * ==========================================
 */

function handleWhatsappState(
    state
) {

    console.log(
        '[GROUPS] WHATSAPP-STATE recebido:',
        state
    )


    if (!state) {

        console.error(
            '[GROUPS] State vazio.'
        )

        return

    }


    console.log(
        '[GROUPS] state.groups:',
        state.groups
    )


    if (
        Array.isArray(
            state.groups
        )
    ) {

        renderGroups(
            state.groups
        )

    } else {

        console.warn(
            '[GROUPS] state.groups não é um array.'
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


    /*
     * Contador principal.
     */

    if (selectedCount) {

        selectedCount.textContent =
            `${selected.length} selected`

    }


    /*
     * Contador da área de envio.
     */

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


    /*
     * Select all.
     */

    if (selectAll) {

        selectAll.checked =
            total > 0 &&
            selected.length === total


        selectAll.indeterminate =
            selected.length > 0 &&
            selected.length < total

    }


    /*
     * Informa o messages.js.
     */

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

if (selectAll) {

    selectAll.addEventListener(
        'change',
        () => {

            console.log(
                '[GROUPS] Select all:',
                selectAll.checked
            )


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

}


/*
 * ==========================================
 * CONFIGURAR MÓDULO
 * ==========================================
 */

export function setupGroups(
    socket
) {

    console.log(
        '[GROUPS] Configurando módulo...'
    )


    if (!socket) {

        console.error(
            '[GROUPS] Socket não recebido.'
        )

        return

    }


    /*
     * O backend atual envia os grupos
     * dentro de whatsapp-state.
     */

    socket.on(
        'whatsapp-state',
        handleWhatsappState
    )


    console.log(
        '[GROUPS] Listener whatsapp-state registrado.'
    )

}