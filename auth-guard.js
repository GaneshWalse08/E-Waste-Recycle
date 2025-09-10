// small module: prevent navigation to protected pages unless Firebase user is signed in
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

const auth = getAuth();

// attach click handler to any link with class "protected"
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a.protected').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href') || '';
            const user = auth.currentUser;
            if (!user) {
                // prevent navigation and send to login page with returnUrl
                e.preventDefault();
                const returnUrl = href.startsWith('/') ? href : href; // keep as-is
                location.href = `user-login.html?returnUrl=${encodeURIComponent(returnUrl)}`;
            }
            // if user present, let navigation continue
        });
    });
});