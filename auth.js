(function () {
    const AUTH_KEY = 'hermesPocAuthenticated';
    const USERNAME = 'ds';
    const PASSWORD = 'ds12';

    const path = window.location.pathname;
    const isIndexPage = path.endsWith('/index.html') || path.endsWith('/');
    const isAuthenticated = localStorage.getItem(AUTH_KEY) === 'true';

    function getRootPath() {
        const script = document.currentScript;
        if (!script) return '.';
        const src = script.getAttribute('src') || '';
        return src.replace(/auth\.js.*$/, '').replace(/\/$/, '') || '.';
    }

    function redirectToLogin() {
        window.location.replace(`${getRootPath()}/index.html`);
    }

    function showLoginPopup() {
        const overlay = document.createElement('div');
        overlay.className = 'auth-overlay';
        overlay.innerHTML = `
            <form class="auth-modal" id="authForm">
                <h2>Login</h2>
                <p>Enter credentials to continue.</p>
                <label for="authUsername">Username</label>
                <input type="text" id="authUsername" autocomplete="username" autofocus>
                <label for="authPassword">Password</label>
                <input type="password" id="authPassword" autocomplete="current-password">
                <div id="authError" class="auth-error" role="alert"></div>
                <button type="submit" class="btn-primary">Continue</button>
            </form>
        `;

        document.body.appendChild(overlay);

        document.getElementById('authForm').addEventListener('submit', event => {
            event.preventDefault();

            const username = document.getElementById('authUsername').value;
            const password = document.getElementById('authPassword').value;

            if (username === USERNAME && password === PASSWORD) {
                localStorage.setItem(AUTH_KEY, 'true');
                overlay.remove();
                return;
            }

            document.getElementById('authError').textContent = 'Invalid username or password.';
        });
    }

    if (!isIndexPage && !isAuthenticated) {
        redirectToLogin();
        return;
    }

    if (isIndexPage && !isAuthenticated) {
        document.addEventListener('DOMContentLoaded', showLoginPopup);
    }
})();
