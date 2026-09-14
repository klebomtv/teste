
// caminho: src/whatsapp/state.js

let sock = null

let started = false

let connected = false

let currentStatus =
    'WhatsApp está parado.'

let currentQR = false

let groups = []

let sending = false

let cancelSending = false


function setSocket(
    value
) {

    sock =
        value

}


function getSocket() {

    return sock

}


function setStarted(
    value
) {

    started =
        value

}


function isStarted() {

    return started

}


function setConnected(
    value
) {

    connected =
        value

}


function isConnected() {

    return connected

}


function setStatus(
    value
) {

    currentStatus =
        value

}


function setQR(
    value
) {

    currentQR =
        value

}


function setGroups(
    value
) {

    groups =
        Array.isArray(value)
            ? value
            : []

}


function getGroups() {

    return groups

}


function setSending(
    value
) {

    sending =
        value

}


function isSending() {

    return sending

}


function setCancelSending(
    value
) {

    cancelSending =
        value

}


function shouldCancelSending() {

    return cancelSending

}


function reset() {

    sock =
        null

    started =
        false

    connected =
        false

    currentStatus =
        'WhatsApp está parado.'

    currentQR =
        false

    groups =
        []

    sending =
        false

    cancelSending =
        false

}


function getState() {

    return {

        started,

        connected,

        status:
            currentStatus,

        qr:
            currentQR,

        groups:
            groups,

        sending

    }

}


module.exports = {

    setSocket,
    getSocket,

    setStarted,
    isStarted,

    setConnected,
    isConnected,

    setStatus,

    setQR,

    setGroups,
    getGroups,

    setSending,
    isSending,

    setCancelSending,
    shouldCancelSending,

    reset,

    getState

}

