// caminho: public/login/login.js

const form = document.getElementById('login-form')
const usernameInput = document.getElementById('username')
const passwordInput = document.getElementById('password')
const button = document.getElementById('login-button')
const result = document.getElementById('result')

form.addEventListener('submit', async (event) => {
    event.preventDefault()

    const username = usernameInput.value.trim()
    const password = passwordInput.value

    if (!username || !password) {
        result.textContent = 'Preencha login e senha.'
        return
    }

    button.disabled = true
    result.textContent = 'Entrando...'

    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify({
                username,
                password
            })
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
            result.textContent = data.message || 'Login ou senha incorretos.'
            return
        }

        window.location.href = '/'
    } catch (error) {
        console.error('[LOGIN] Erro:', error)
        result.textContent = 'Não foi possível conectar ao servidor.'
    } finally {
        button.disabled = false
    }
})