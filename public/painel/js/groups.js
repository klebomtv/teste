
// caminho: public/painel/js/groups.js

const groupsContainer =
    document.getElementById(
        'groups'
    )


const selectAll =
    document.getElementById(
        'select-all'
    )


let availableGroups =
    []


/*
 * ==========================================
 * RECEBER GRUPOS
 * ==========================================
 */

function setGroups(
    groups
) {

    console.log(
        '[PAINEL GROUPS] Grupos recebidos:',
        groups
    )


    if (
        !Array.isArray(
            groups
        )
    ) {

        console.error(
            '[PAINEL GROUPS] Os grupos recebidos não são um array.'
        )

        availableGroups =
            []

        renderGroups()

        return

    }


    availableGroups =
        groups


    console.log(
        '[PAINEL GROUPS] Total de grupos:',
        availableGroups.length
    )


    renderGroups()

}


/*
 * ==========================================
 * RENDERIZAR GRUPOS
 * ==========================================
 */

function renderGroups() {

    if (
        !groupsContainer
    ) {

        console.error(
            '[PAINEL GROUPS] Container de grupos não encontrado.'
        )

        return

    }


    groupsContainer.innerHTML =
        ''


    if (
        availableGroups.length === 0
    ) {

        const empty =
            document.createElement(
                'p'
            )


        empty.className =
            'groups-empty'


        empty.textContent =
            'Nenhum grupo encontrado.'


        groupsContainer.appendChild(
            empty
        )


        return

    }


    availableGroups.forEach(
        group => {

            if (
                !group ||
                !group.id
            ) {

                return

            }


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

        }
    )

}


/*
 * ==========================================
 * OBTER GRUPOS SELECIONADOS
 * ==========================================
 */

function getSelectedGroups() {

    if (
        selectAll &&
        selectAll.checked
    ) {

        return [
            ...availableGroups
        ]

    }


    const checkboxes =
        document.querySelectorAll(
            '.group-checkbox:checked'
        )


    return Array.from(
        checkboxes
    )
    .map(
        checkbox => {

            return availableGroups.find(
                group =>
                    group.id ===
                    checkbox.value
            )

        }
    )
    .filter(
        Boolean
    )

}


/*
 * ==========================================
 * SELECIONAR TODOS
 * ==========================================
 */

function setAllGroups(
    checked
) {

    const checkboxes =
        document.querySelectorAll(
            '.group-checkbox'
        )


    checkboxes.forEach(
        checkbox => {

            checkbox.checked =
                checked

        }
    )

}


/*
 * ==========================================
 * EVENTO ENVIAR PARA TODOS
 * ==========================================
 */

if (
    selectAll
) {

    selectAll.addEventListener(
        'change',
        () => {

            console.log(
                '[PAINEL GROUPS] Enviar para todos:',
                selectAll.checked
            )


            setAllGroups(
                selectAll.checked
            )

        }
    )

}


/*
 * ==========================================
 * API DO PAINEL
 * ==========================================
 */

window.panelGroups = {

    set:
        setGroups,

    getSelected:
        getSelectedGroups

}


console.log(
    '[PAINEL GROUPS] Módulo de grupos carregado.'
)
