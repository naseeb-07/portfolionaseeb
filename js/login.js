document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const password = document.getElementById('password').value;
    const statusMessage = document.getElementById('loginStatus');
    statusMessage.textContent = 'Verifying...';

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('adminToken', data.token);
            window.location.href = 'admin.html';
        } else {
            statusMessage.textContent = data.message || 'Invalid password';
        }
    } catch (error) {
        statusMessage.textContent = 'Error: ' + error.message;
    }
});

// Check if already logged in
if (localStorage.getItem('adminToken')) {
    // Optional: verify token validity with backend, but redirecting for UX is fine
    // window.location.href = 'admin.html'; 
}
