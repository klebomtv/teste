// caminho: public/painel/js/panel.js

const socket =
    io()


const groupSelect =
    document.getElementById(
        'group'
    )


function renderGroups(
    groups
) {

    if (!groupSelect) {
        return
    }


    groupSelect.innerHTML = ''


    if (
        !Array.isArray(groups) ||
        groups.length === 0
    ) {

        const option =
            document.createElement(
                'option'
            )

        option.value = ''

        option.textContent =
            'Nenhum grupo encontrado'

        groupSelect.appendChild(
            option
        )

        return
    }


    groups.forEach(
        group => {

            const option =
                document.createElement(
                    'option'
                )

            option.value =
                group.id

            option.textContent =
                group.name

            groupSelect.appendChild(
                option
            )

        }
    )

}


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


socket.on(
    'whatsapp-state',
    state => {

        if (
            state &&
            Array.isArray(
                state.groups
            )
        ) {

            console.log(
                '[PAINEL] Grupos recebidos pelo estado:',
                state.groups
            )

            renderGroups(
                state.groups
            )

        }

    }
)