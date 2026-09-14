// caminho: public/painel/js/groups.js

export function setupGroups(socket) {

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


    function renderGroups(
        groups
    ) {

        groupSelect.innerHTML = ''


        const defaultOption =
            document.createElement(
                'option'
            )


        defaultOption.value = ''

        defaultOption.textContent =
            'Selecione um grupo'


        groupSelect.appendChild(
            defaultOption
        )


        if (
            !Array.isArray(groups) ||
            groups.length === 0
        ) {

            console.log(
                '[GROUPS] Nenhum grupo recebido.'
            )

            return
        }


        console.log(
            `[GROUPS] Renderizando ${groups.length} grupos.`
        )


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


    /*
     * ==========================================
     * GRUPOS
     * ==========================================
     *
     * Usado quando o servidor envia
     * a lista diretamente.
     */

    socket.on(
        'groups',
        groups => {

            console.log(
                '[GROUPS] Evento groups recebido:',
                groups
            )


            renderGroups(
                groups
            )

        }
    )


    /*
     * ==========================================
     * ESTADO DO WHATSAPP
     * ==========================================
     *
     * Quando o painel entra depois que
     * os grupos já foram carregados,
     * eles vêm dentro de whatsapp-state.
     */

    socket.on(
        'whatsapp-state',
        state => {

            console.log(
                '[GROUPS] Estado recebido:',
                state
            )


            if (
                !state ||
                !Array.isArray(
                    state.groups
                )
            ) {

                return
            }


            renderGroups(
                state.groups
            )

        }
    )

}