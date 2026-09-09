// caminho: src/whatsapp.js

const path =
    require('path')


const fs =
    require('fs')


const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} =
    require('@whiskeysockets/baileys')


const QRCode =
    require('qrcode')


function createWhatsApp(
    io
) {

    let sock = null

    let started = false

    let connected = false

    let currentStatus =
        'WhatsApp está parado.'

    let currentQR = false

    let groups = []


    /*
     * Controle do envio para todos
     * os grupos.
     */

    let sendingToAll = false

    let cancelSendingToAll = false

    let allGroupsCooldownUntil = 0


    /*
     * Impede que uma tentativa de
     * reconexão aconteça depois
     * de um logout.
     */

    let manualLogout = false


    /*
     * Intervalo entre os grupos.
     */

    const SEND_INTERVAL =
        15 * 1000


    /*
     * Credenciais exclusivas
     * do WhatsApp.
     */

    const AUTH_PATH =
        path.join(
            __dirname,
            '../whatsapp_auth'
        )


    /*
     * QR Code.
     */

    const QR_PATH =
        path.join(
            __dirname,
            '../public/qr.png'
        )


    /*
     * Garante que a pasta de
     * credenciais exista.
     */

    function ensureAuthDirectory() {

        if (
            !fs.existsSync(
                AUTH_PATH
            )
        ) {

            fs.mkdirSync(
                AUTH_PATH,
                {
                    recursive: true
                }
            )
        }
    }


    /*
     * Carrega os grupos do WhatsApp.
     */

    async function loadGroups() {

        if (!sock) {
            return
        }


        if (!connected) {
            return
        }


        try {

            const chats =
                await sock.groupFetchAllParticipating()


            groups =
                Object.values(chats)
                    .map(
                        group => ({
                            id:
                                group.id,

                            name:
                                group.subject ||
                                'Grupo sem nome'
                        })
                    )
                    .sort(
                        (a, b) =>
                            a.name.localeCompare(
                                b.name
                            )
                    )


            console.log(
                `Grupos encontrados: ${groups.length}`
            )


            io.emit(
                'groups',
                groups
            )

        } catch (error) {

            console.error(
                'Erro ao carregar grupos:',
                error
            )
        }
    }


    /*
     * Inicia o WhatsApp.
     */

    async function start() {

        /*
         * Evita duas inicializações
         * simultâneas.
         */

        if (started) {

            return {
                success: false,
                message:
                    'WhatsApp já foi iniciado.'
            }
        }


        /*
         * Uma nova inicialização
         * não é logout.
         */

        manualLogout = false


        started = true

        connected = false

        currentQR = false

        groups = []


        currentStatus =
            'Iniciando WhatsApp...'


        io.emit(
            'status',
            currentStatus
        )


        console.log(
            'Iniciando WhatsApp...'
        )


        try {

            ensureAuthDirectory()


            /*
             * Carrega ou cria a sessão
             * do WhatsApp.
             */

            const {
                state,
                saveCreds
            } =
                await useMultiFileAuthState(
                    AUTH_PATH
                )


            /*
             * Cria o socket.
             */

            const newSocket =
                makeWASocket({
                    auth: state,
                    printQRInTerminal: false
                })


            /*
             * Guarda o socket antes
             * de registrar os eventos.
             */

            sock =
                newSocket


            /*
             * Salva alterações das
             * credenciais.
             */

            newSocket.ev.on(
                'creds.update',
                saveCreds
            )


            /*
             * Registra o evento de conexão
             * imediatamente após criar
             * o socket.
             */

            newSocket.ev.on(
                'connection.update',
                update =>
                    handleConnection(
                        update,
                        newSocket
                    )
            )


            /*
             * Mensagens recebidas.
             */

            newSocket.ev.on(
                'messages.upsert',
                handleMessages
            )


            console.log(
                'Socket do WhatsApp criado.'
            )


            return {
                success: true,
                message:
                    'WhatsApp iniciado.'
            }

        } catch (error) {

            console.error(
                'Erro ao iniciar WhatsApp:',
                error
            )


            sock = null

            started = false

            connected = false

            currentQR = false

            currentStatus =
                'Erro ao iniciar WhatsApp.'


            io.emit(
                'status',
                currentStatus
            )


            return {
                success: false,
                message:
                    error.message ||
                    'Erro ao iniciar o WhatsApp.'
            }
        }
    }


    /*
     * Controla os eventos de conexão.
     */

    async function handleConnection(
        update,
        socketInstance
    ) {

        const {
            connection,
            lastDisconnect,
            qr
        } = update


        /*
         * Ignora eventos de um socket
         * antigo que já não é o atual.
         */

        if (
            sock &&
            socketInstance !== sock &&
            !manualLogout
        ) {

            return
        }


        /*
         * Novo QR Code.
         */

        if (qr) {

            connected = false

            currentQR = false

            currentStatus =
                'Aguardando leitura do QR Code...'


            console.log(
                'Novo QR Code recebido.'
            )


            await handleQR(
                qr
            )
        }


        /*
         * Conexão estabelecida.
         */

        if (
            connection === 'open'
        ) {

            console.log(
                'WhatsApp conectado!'
            )


            sock =
                socketInstance


            started = true

            connected = true

            currentQR = false

            currentStatus =
                'Conectado'


            /*
             * QR antigo não é mais
             * necessário.
             */

            removeQR()


            io.emit(
                'status',
                currentStatus
            )


            io.emit(
                'connected',
                true
            )


            /*
             * Carrega os grupos
             * somente depois da conexão.
             */

            await loadGroups()

            return
        }


        /*
         * Conexão fechada.
         */

        if (
            connection === 'close'
        ) {

            console.log(
                'WhatsApp desconectado.'
            )


            /*
             * Só altera o socket atual
             * se o evento pertence a ele.
             */

            if (
                sock === socketInstance
            ) {

                sock = null
            }


            connected = false

            groups = []

            currentQR = false


            /*
             * Cancela qualquer envio.
             */

            cancelSendingToAll = true

            sendingToAll = false


            io.emit(
                'connected',
                false
            )


            io.emit(
                'groups',
                []
            )


            /*
             * Se foi logout manual,
             * não reconecta.
             */

            if (
                manualLogout
            ) {

                started = false

                currentStatus =
                    'WhatsApp encerrado.'


                io.emit(
                    'status',
                    currentStatus
                )


                io.emit(
                    'whatsapp-logged-out'
                )


                return
            }


            /*
             * Verifica se o Baileys
             * considera a sessão deslogada.
             */

            const statusCode =
                lastDisconnect
                    ?.error
                    ?.output
                    ?.statusCode


            const shouldReconnect =
                statusCode !==
                DisconnectReason.loggedOut


            /*
             * Reconecta automaticamente
             * quando for uma queda temporária.
             */

            if (
                shouldReconnect &&
                started
            ) {

                currentStatus =
                    'Reconectando...'


                io.emit(
                    'status',
                    currentStatus
                )


                setTimeout(
                    () => {

                        /*
                         * Não reconecta se houve
                         * logout durante a espera.
                         */

                        if (
                            manualLogout
                        ) {

                            return
                        }


                        /*
                         * Não inicia outra conexão
                         * se uma já estiver ativa.
                         */

                        if (
                            started &&
                            connected
                        ) {

                            return
                        }


                        started = false


                        start()

                    },
                    3000
                )


                return
            }


            /*
             * Não deve reconectar.
             */

            started = false

            currentStatus =
                'Desconectado'


            io.emit(
                'status',
                currentStatus
            )
        }
    }


    /*
     * Gera e salva o QR Code.
     */

    async function handleQR(
        qr
    ) {

        try {

            console.log(
                'Gerando QR Code...'
            )


            await QRCode.toFile(
                QR_PATH,
                qr,
                {
                    width: 400,
                    margin: 2
                }
            )


            currentQR = true

            connected = false

            currentStatus =
                'Aguardando leitura do QR Code...'


            console.log(
                'QR Code salvo em:',
                QR_PATH
            )


            io.emit(
                'qr-updated'
            )


            io.emit(
                'status',
                currentStatus
            )

        } catch (error) {

            console.error(
                'Erro ao gerar QR Code:',
                error
            )
        }
    }


    /*
     * Remove o QR Code.
     */

    function removeQR() {

        try {

            if (
                fs.existsSync(
                    QR_PATH
                )
            ) {

                fs.unlinkSync(
                    QR_PATH
                )
            }

        } catch (error) {

            console.error(
                'Erro ao remover QR Code:',
                error
            )
        }
    }


    /*
     * Recebe mensagens.
     */

    async function handleMessages({
        messages
    }) {

        const msg =
            messages[0]


        if (!msg) {
            return
        }


        if (!msg.message) {
            return
        }


        if (msg.key.fromMe) {
            return
        }


        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text


        if (!text) {
            return
        }


        console.log(
            'Mensagem:',
            text
        )


        /*
         * Comando de teste.
         */

        if (
            text === '!teste123'
        ) {

            try {

                await sendMessage(
                    msg.key.remoteJid,
                    'Funcionou! O bot está conectado.'
                )

            } catch (error) {

                console.error(
                    'Erro ao responder comando:',
                    error
                )
            }
        }
    }


    /*
     * Envia uma mensagem.
     */

    async function sendMessage(
        target,
        message
    ) {

        if (
            !sock ||
            !connected
        ) {

            throw new Error(
                'WhatsApp não está conectado.'
            )
        }


        if (
            !target
        ) {

            throw new Error(
                'Destino da mensagem não informado.'
            )
        }


        if (
            !message ||
            !message.trim()
        ) {

            throw new Error(
                'Mensagem vazia.'
            )
        }


        await sock.sendMessage(
            target,
            {
                text:
                    message
            }
        )
    }


    /*
     * Envia uma mensagem para
     * todos os grupos.
     */

    async function sendToAll(
        message
    ) {

        /*
         * Verifica conexão.
         */

        if (
            !sock ||
            !connected
        ) {

            return {
                success: false,
                sent: 0,
                total:
                    groups.length,
                message:
                    'WhatsApp não está conectado.'
            }
        }


        /*
         * Verifica envio existente.
         */

        if (
            sendingToAll
        ) {

            return {
                success: false,
                sent: 0,
                total:
                    groups.length,
                message:
                    'Já existe um envio para todos os grupos em andamento.'
            }
        }


        /*
         * Verifica cooldown.
         */

        const now =
            Date.now()


        if (
            now <
            allGroupsCooldownUntil
        ) {

            const remaining =
                allGroupsCooldownUntil -
                now


            return {
                success: false,
                sent: 0,
                total:
                    groups.length,
                cooldown: true,
                remaining,
                message:
                    `Aguarde ${formatDuration(remaining)} para usar esta função novamente.`
            }
        }


        /*
         * Verifica grupos.
         */

        if (
            groups.length === 0
        ) {

            return {
                success: false,
                sent: 0,
                total: 0,
                message:
                    'Nenhum grupo encontrado.'
            }
        }


        /*
         * Verifica mensagem.
         */

        if (
            !message ||
            !message.trim()
        ) {

            return {
                success: false,
                sent: 0,
                total:
                    groups.length,
                message:
                    'Digite uma mensagem.'
            }
        }


        /*
         * Ativa o envio.
         */

        sendingToAll = true

        cancelSendingToAll = false


        const total =
            groups.length


        const cooldownDuration =
            total *
            SEND_INTERVAL


        let sent = 0

        let failed = 0

        let cancelled = false


        console.log(
            `Iniciando envio para ${total} grupos.`
        )


        console.log(
            `Cooldown após conclusão: ${formatDuration(cooldownDuration)}`
        )


        io.emit(
            'all-groups-started',
            {
                total,
                cooldownDuration
            }
        )


        try {

            for (
                let index = 0;
                index < total;
                index++
            ) {

                /*
                 * Verifica cancelamento.
                 */

                if (
                    cancelSendingToAll
                ) {

                    cancelled = true

                    console.log(
                        'Envio para todos cancelado.'
                    )

                    break
                }


                /*
                 * Verifica conexão.
                 */

                if (
                    !sock ||
                    !connected
                ) {

                    cancelled = true

                    console.log(
                        'WhatsApp desconectado durante o envio.'
                    )

                    break
                }


                const group =
                    groups[index]


                try {

                    await sendMessage(
                        group.id,
                        message
                    )


                    sent++


                    console.log(
                        `[${index + 1}/${total}] Mensagem enviada para: ${group.name}`
                    )


                    io.emit(
                        'all-groups-progress',
                        {
                            current:
                                index + 1,

                            total,

                            sent,

                            failed,

                            group:
                                group.name
                        }
                    )

                } catch (error) {

                    failed++


                    console.error(
                        `Erro ao enviar para ${group.name}:`,
                        error
                    )


                    io.emit(
                        'all-groups-progress',
                        {
                            current:
                                index + 1,

                            total,

                            sent,

                            failed,

                            group:
                                group.name,

                            error:
                                error.message ||
                                'Erro ao enviar.'
                        }
                    )
                }


                /*
                 * Espera antes do próximo grupo.
                 */

                if (
                    index <
                    total - 1
                ) {

                    const completedWait =
                        await delay(
                            SEND_INTERVAL,
                            () =>
                                cancelSendingToAll
                        )


                    if (
                        !completedWait
                    ) {

                        cancelled = true

                        console.log(
                            'Espera interrompida. Envio cancelado.'
                        )

                        break
                    }
                }
            }

        } finally {

            sendingToAll = false
        }


        /*
         * Só cria cooldown quando
         * todos os grupos foram processados
         * sem cancelamento.
         */

        if (
            !cancelled &&
            sent + failed === total
        ) {

            allGroupsCooldownUntil =
                Date.now() +
                cooldownDuration
        }


        /*
         * Cancelamento não gera cooldown.
         */

        if (
            cancelled
        ) {

            allGroupsCooldownUntil = 0
        }


        console.log(
            `Envio finalizado. Enviadas: ${sent}. Falhas: ${failed}.`
        )


        /*
         * Resultado de cancelamento.
         */

        if (
            cancelled
        ) {

            io.emit(
                'all-groups-cancelled',
                {
                    total,
                    sent,
                    failed
                }
            )


            return {
                success: false,
                cancelled: true,
                sent,
                failed,
                total,
                message:
                    `Envio cancelado. ${sent} de ${total} grupos receberam a mensagem.`
            }
        }


        /*
         * Resultado de envio completo.
         */

        io.emit(
            'all-groups-finished',
            {
                total,
                sent,
                failed,
                cooldownDuration
            }
        )


        return {
            success: true,
            sent,
            failed,
            total,
            cooldownDuration,
            message:
                `Envio finalizado. ${sent} de ${total} grupos receberam a mensagem.`
        }
    }


    /*
     * Cancela o envio para todos.
     */

    function cancelSendToAll() {

        if (
            !sendingToAll
        ) {

            return {
                success: false,
                message:
                    'Não existe um envio em andamento.'
            }
        }


        console.log(
            'Cancelamento do envio solicitado.'
        )


        cancelSendingToAll = true


        io.emit(
            'all-groups-cancel-requested'
        )


        return {
            success: true,
            message:
                'Cancelamento solicitado.'
        }
    }


    /*
     * Logout completo.
     *
     * - Cancela envio.
     * - Impede reconexão.
     * - Desconecta WhatsApp.
     * - Apaga credenciais.
     * - Remove QR Code.
     */

    async function logout() {

        console.log(
            'Logout do WhatsApp solicitado.'
        )


        /*
         * Impede reconexão automática.
         */

        manualLogout = true


        /*
         * Cancela envio.
         */

        cancelSendingToAll = true

        sendingToAll = false


        /*
         * Remove cooldown.
         */

        allGroupsCooldownUntil = 0


        /*
         * Guarda o socket atual.
         */

        const currentSocket =
            sock


        /*
         * Limpa o estado.
         */

        sock = null

        started = false

        connected = false

        currentQR = false

        groups = []


        currentStatus =
            'WhatsApp encerrado.'


        io.emit(
            'connected',
            false
        )


        io.emit(
            'groups',
            []
        )


        io.emit(
            'status',
            currentStatus
        )


        /*
         * Faz logout da sessão atual.
         */

        if (
            currentSocket
        ) {

            try {

                await currentSocket.logout()

                console.log(
                    'Logout do WhatsApp executado.'
                )

            } catch (error) {

                console.error(
                    'Erro ao executar logout do WhatsApp:',
                    error
                )
            }
        }


        /*
         * Remove as credenciais.
         */

        try {

            if (
                fs.existsSync(
                    AUTH_PATH
                )
            ) {

                fs.rmSync(
                    AUTH_PATH,
                    {
                        recursive: true,
                        force: true
                    }
                )


                console.log(
                    'Credenciais do WhatsApp removidas.'
                )
            }

        } catch (error) {

            console.error(
                'Erro ao remover credenciais do WhatsApp:',
                error
            )


            return {
                success: false,
                message:
                    'WhatsApp encerrado, mas não foi possível remover as credenciais.'
            }
        }


        /*
         * Remove QR Code.
         */

        removeQR()


        /*
         * Mantém manualLogout como true
         * até o final da operação.
         */

        io.emit(
            'whatsapp-logged-out'
        )


        console.log(
            'Logout do WhatsApp concluído.'
        )


        return {
            success: true,
            message:
                'WhatsApp encerrado e sessão removida.'
        }
    }


    /*
     * Espera determinada quantidade
     * de milissegundos.
     */

    function delay(
        milliseconds,
        shouldCancel
    ) {

        return new Promise(
            resolve => {

                const startTime =
                    Date.now()


                const timer =
                    setInterval(
                        () => {

                            /*
                             * Permite cancelar
                             * a espera.
                             */

                            if (
                                shouldCancel &&
                                shouldCancel()
                            ) {

                                clearInterval(
                                    timer
                                )


                                resolve(
                                    false
                                )


                                return
                            }


                            const elapsed =
                                Date.now() -
                                startTime


                            if (
                                elapsed >=
                                milliseconds
                            ) {

                                clearInterval(
                                    timer
                                )


                                resolve(
                                    true
                                )
                            }

                        },
                        250
                    )
            }
        )
    }


    /*
     * Converte milissegundos
     * para uma apresentação simples.
     */

    function formatDuration(
        milliseconds
    ) {

        const totalSeconds =
            Math.ceil(
                milliseconds / 1000
            )


        const hours =
            Math.floor(
                totalSeconds / 3600
            )


        const minutes =
            Math.floor(
                (totalSeconds % 3600) /
                60
            )


        const seconds =
            totalSeconds % 60


        if (
            hours > 0
        ) {

            return (
                `${hours}h ` +
                `${minutes}min ` +
                `${seconds}s`
            )
        }


        if (
            minutes > 0
        ) {

            return (
                `${minutes}min ` +
                `${seconds}s`
            )
        }


        return (
            `${seconds}s`
        )
    }


    /*
     * Estado do envio para todos.
     */

    function getAllGroupsState() {

        const now =
            Date.now()


        const remaining =
            Math.max(
                0,
                allGroupsCooldownUntil -
                now
            )


        return {

            sending:
                sendingToAll,

            cooldown:
                remaining > 0,

            remaining,

            totalGroups:
                groups.length
        }
    }


    /*
     * Procura um grupo pelo ID.
     */

    function getGroup(
        id
    ) {

        return groups.find(
            group =>
                group.id === id
        )
    }


    /*
     * Estado atual do WhatsApp.
     */

    function getState() {

        return {

            started,

            connected,

            status:
                currentStatus,

            qr:
                currentQR,

            groups,

            allGroups:
                getAllGroupsState()
        }
    }


    /*
     * Funções públicas.
     */

    return {

        start,

        logout,

        sendMessage,

        sendToAll,

        cancelSendToAll,

        getGroup,

        getState,

        getAllGroupsState
    }
}


module.exports =
    createWhatsApp