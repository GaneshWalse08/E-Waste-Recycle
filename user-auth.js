// Firebase modular SDK (ES module). Replace firebaseConfig with your project values.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    updateProfile,
    deleteUser
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';
import { getFirestore, doc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyCJMUt8y4TlsnuQJHqcAORiEdbcJh5whQg",
    authDomain: "e-waste-recycle-d7388.firebaseapp.com",
    projectId: "e-waste-recycle-d7388",
    storageBucket: "e-waste-recycle-d7388.firebasestorage.app",
    messagingSenderId: "105557834489",
    appId: "1:105557834489:web:cbb3dd44a09a10e97f8028",
    measurementId: "G-BHPJN3H6Q8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const db = getFirestore(app);

/* UI elements */
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
export const loginMsg = document.getElementById('login-msg');
const registerMsg = document.getElementById('register-msg');

function showLogin() { tabLogin.classList.add('active'); tabRegister.classList.remove('active'); loginForm.style.display = 'block'; registerForm.style.display = 'none'; loginForm.setAttribute('aria-hidden', 'false'); registerForm.setAttribute('aria-hidden', 'true'); }
function showRegister() { tabLogin.classList.remove('active'); tabRegister.classList.add('active'); loginForm.style.display = 'none'; registerForm.style.display = 'block'; loginForm.setAttribute('aria-hidden', 'true'); registerForm.setAttribute('aria-hidden', 'false'); }

tabLogin.addEventListener('click', showLogin);
tabRegister.addEventListener('click', showRegister);
document.getElementById('cancelRegister')?.addEventListener('click', showLogin);

/* Helper */
export function showMessage(el, text, isError = false) {
    el.textContent = text;
    el.classList.toggle('error', isError);
    setTimeout(() => { el.textContent = ''; el.classList.remove('error'); }, 6000);
}

// add helpers near top after DOM refs
const spinnerEl = document.getElementById ? document.getElementById('globalSpinner') : null;
const loginBtnEl = document.querySelector('#login-form button[type="submit"]');
const registerBtnEl = document.querySelector('#register-form button[type="submit"]');

export function showSpinner(message = 'Loading…') {
    try {
        if (spinnerEl) {
            spinnerEl.querySelector('.spinner-text').textContent = message;
            spinnerEl.classList.add('visible');
            spinnerEl.setAttribute('aria-hidden', 'false');
        }
        if (loginBtnEl) loginBtnEl.disabled = true;
        if (registerBtnEl) registerBtnEl.disabled = true;
    } catch (e) { /* ignore */ }
}
export function hideSpinner() {
    try {
        if (spinnerEl) {
            spinnerEl.classList.remove('visible');
            spinnerEl.setAttribute('aria-hidden', 'true');
        }
        if (loginBtnEl) loginBtnEl.disabled = false;
        if (registerBtnEl) registerBtnEl.disabled = false;
    } catch (e) { /* ignore */ }
}

/* REGISTER */
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const mobile = document.getElementById('reg-mobile').value.trim();
    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const address = document.getElementById('reg-address').value.trim();
    const pincode = document.getElementById('reg-pincode').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-password-confirm').value;

    if (!name || !mobile || !email || !address || !pincode || !password || !confirm) {
        return showMessage(registerMsg, 'Please complete all fields', true);
    }
    if (password !== confirm) {
        return showMessage(registerMsg, 'Passwords do not match', true);
    }
    // Basic input checks (adjust per your needs)
    if (password.length < 6) {
        return showMessage(registerMsg, 'Password must be at least 6 characters', true);
    }
    if (!/^\d{4,8}$/.test(pincode)) {
        return showMessage(registerMsg, 'Enter a valid pin code', true);
    }
    if (!/^\+?\d{7,15}$/.test(mobile)) {
        return showMessage(registerMsg, 'Enter a valid mobile number', true);
    }

    try {
        showSpinner('Creating account…');
        // create auth user
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCred.user;
        const uid = user.uid;

        try {
            await updateProfile(user, { displayName: name });
        } catch (profileErr) {
            console.warn('Could not set displayName on auth user', profileErr);
        }

        const userDoc = {
            uid,
            name,
            mobile,
            email,
            address,
            pincode,
            role: 'user',
            createdAt: serverTimestamp()
        };

        await setDoc(doc(db, 'users', uid), userDoc);

        showMessage(registerMsg, 'Account created — redirecting...');
        setTimeout(() => location.href = 'index.html', 1200);
    } catch (err) {
        console.error('Registration error', err);
        // cleanup omitted for brevity
        showMessage(registerMsg, err.message || 'Registration failed', true);
    } finally {
        hideSpinner();
    }
});

/* LOGIN */
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;
    if (!email || !password) return showMessage(loginMsg, 'Enter email and password', true);

    try {
        showSpinner('Signing in…');
        await signInWithEmailAndPassword(auth, email, password);
        showMessage(loginMsg, 'Login successful — redirecting...');
        const params = new URLSearchParams(window.location.search);
        const returnUrl = params.get('returnUrl');
        setTimeout(() => {
            if (returnUrl) {
                try {
                    const u = new URL(returnUrl, location.href);
                    if (u.origin === location.origin) location.href = returnUrl;
                    else location.href = 'index.html';
                } catch {
                    location.href = 'index.html';
                }
            } else {
                location.href = 'index.html';
            }
        }, 800);
    } catch (err) {
        console.error(err);
        showMessage(loginMsg, err.message || 'Login failed', true);
    } finally {
        hideSpinner();
    }
});

/* Forgot password link (simple) */
document.getElementById('forgotLink')?.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    if (!email) return showMessage(loginMsg, 'Enter your email to reset password', true);
    try {
        showSpinner('Sending reset email…');
        await sendPasswordResetEmail(auth, email);
        showMessage(loginMsg, 'Password reset email sent');
    } catch (err) {
        showMessage(loginMsg, err.message || 'Could not send reset email', true);
    } finally {
        hideSpinner();
    }
});