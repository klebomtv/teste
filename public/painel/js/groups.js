
// caminho: public/painel/js/groups.js

export function setupGroups(
    socket
) {

    const groupSelect =
        document.getElementById(
            'group'
        )


    if (!groupSelect) {

        console.warn(
            '[GROUPS] Elemento #group não encontrado.'
        )

        return

    }


    socket.on(
        'groups',
        groups => {

            groupSelect.innerHTML = ''


            const defaultOption =
                document.createElement(
                    'option'
                )


            defaultOption.value =
                ''

            defaultOption.textContent =
                'Selecione um grupo'


            groupSelect.appendChild(
                defaultOption
            )


            if (
                !Array.isArray(groups) ||
                groups.length === 0
            ) {

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
                        group.name ||
                        'Grupo sem nome'


                    groupSelect.appendChild(
                        option
                    )

                }
            )

        }
    )

}

