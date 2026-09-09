// caminho: auth/code.js

const crypto = require('crypto')

const CODE_EXPIRATION = 5 * 60 * 1000
const MAX_ATTEMPTS = 5

let currentCode = null
let codeExpiresAt = null
let attempts = 0

function generateCode() {

    return crypto
        .randomInt(100000, 1000000)
        .toString()
}

function createCode() {

    const code = generateCode()

    currentCode = code
    codeExpiresAt =
        Date.now() + CODE_EXPIRATION

    attempts = 0

    return {
        code,
        expiresAt: codeExpiresAt
    }
}

function verifyCode(code) {

    if (!currentCode) {

        return {
            success: false,
            message:
                'Nenhum código foi solicitado.'
        }
    }

    if (
        !codeExpiresAt ||
        Date.now() > codeExpiresAt
    ) {

        clearCode()

        return {
            success: false,
            message:
                'O código expirou.'
        }
    }

    if (attempts >= MAX_ATTEMPTS) {

        return {
            success: false,
            message:
                'Número máximo de tentativas excedido.'
        }
    }

    if (
        String(code).trim() !==
        currentCode
    ) {

        attempts++

        return {
            success: false,
            message:
                'Código inválido.',
            attempts,
            remaining:
                MAX_ATTEMPTS - attempts
        }
    }

    clearCode()

    return {
        success: true
    }
}

function clearCode() {

    currentCode = null
    codeExpiresAt = null
    attempts = 0
}

function getCodeStatus() {

    if (!currentCode) {

        return {
            active: false
        }
    }

    if (
        !codeExpiresAt ||
        Date.now() > codeExpiresAt
    ) {

        clearCode()

        return {
            active: false
        }
    }

    return {
        active: true,
        expiresAt: codeExpiresAt,
        attempts,
        remaining:
            MAX_ATTEMPTS - attempts
    }
}

module.exports = {
    createCode,
    verifyCode,
    clearCode,
    getCodeStatus
}