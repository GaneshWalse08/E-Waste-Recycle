// Firebase modular SDK (ES module).
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import {
    getAuth,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';
// import { showMessage, loginMsg, showSpinner, auth, hideSpinner } from './user-auth';

// --- IMPORTANT: Use the same firebaseConfig as your other files ---
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
const auth = getAuth(app);
const db = getFirestore(app);

/* --- UI elements (Same as before) --- */
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginMsg = document.getElementById('login-msg');
const registerMsg = document.getElementById('register-msg');
const spinnerEl = document.getElementById('globalSpinner');
const loginBtnEl = document.querySelector('#login-form button[type="submit"]');
const registerBtnEl = document.querySelector('#register-form button[type="submit"]');


function showLogin() { tabLogin.classList.add('active'); tabRegister.classList.remove('active'); loginForm.style.display = 'block'; registerForm.style.display = 'none'; loginForm.setAttribute('aria-hidden', 'false'); registerForm.setAttribute('aria-hidden', 'true');  }
function showRegister() { tabLogin.classList.remove('active'); tabRegister.classList.add('active'); loginForm.style.display = 'none'; registerForm.style.display = 'block'; loginForm.setAttribute('aria-hidden', 'true'); registerForm.setAttribute('aria-hidden', 'false');  }
tabLogin.addEventListener('click', showLogin);
tabRegister.addEventListener('click', showRegister);
document.getElementById('cancelRegister')?.addEventListener('click', showLogin);

function showMessage(el, text, isError = false) {  el.textContent = text;
    el.classList.toggle('error', isError);
    setTimeout(() => { el.textContent = ''; el.classList.remove('error'); }, 6000);
 }
function showSpinner(message = 'Loading…') { try {
        if (spinnerEl) {
            spinnerEl.querySelector('.spinner-text').textContent = message;
            spinnerEl.classList.add('visible');
            spinnerEl.setAttribute('aria-hidden', 'false');
        }
        if (loginBtnEl) loginBtnEl.disabled = true;
        if (registerBtnEl) registerBtnEl.disabled = true;
    } catch (e) { /* ignore */ }}
function hideSpinner() {  try {
        if (spinnerEl) {
            spinnerEl.classList.remove('visible');
            spinnerEl.setAttribute('aria-hidden', 'true');
        }
        if (loginBtnEl) loginBtnEl.disabled = false;
        if (registerBtnEl) registerBtnEl.disabled = false;
    } catch (e) { /* ignore */ } }

/* ====================================================================
    COMPANY REGISTRATION - NEW LOGIC
    This function saves the application to Firestore for manual review.
====================================================================
*/
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get all form values
    const companyName = document.getElementById('reg-company-name').value.trim();
    const ownerName = document.getElementById('reg-owner-name').value.trim();
    const registrationDate = document.getElementById('reg-date').value;
    const licenseNo = document.getElementById('reg-license').value.trim();
    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const contactNo = document.getElementById('reg-contact-no').value.trim();
    const address = document.getElementById('reg-plant-address').value.trim();
    
    // Basic validation
    if (!companyName || !ownerName || !registrationDate || !licenseNo || !email || !contactNo || !address) {
        return showMessage(registerMsg, 'Please complete all fields', true);
    }

    try {
        showSpinner('Submitting application…');
        
        // Data object to save in Firestore
        const companyApplication = {
            companyName,
            ownerName,
            registrationDate,
            licenseNo,
            email,
            contactNo,
            address,
            status: 'pending', // To track the verification status
            submittedAt: serverTimestamp()
        };

        // Add a new document to the "pending_companies" collection
        const docRef = await addDoc(collection(db, 'pending_companies'), companyApplication);
        
        console.log("Application submitted with ID: ", docRef.id);
        
        showMessage(registerMsg, 'Application submitted! We will review your details and contact you via email.');
        registerForm.reset(); // Clear the form
        
        // Optional: switch back to the login tab after successful submission
        setTimeout(showLogin, 5000);

    } catch (err) {
        console.error('Submission error', err);
        showMessage(registerMsg, err.message || 'Submission failed. Please try again.', true);
    } finally {
        hideSpinner();
    }
});

/* ====================================================================
    COMPANY LOGIN - SAME LOGIC AS USER LOGIN
    This will work once you have MANUALLY created an auth user for an approved company.
====================================================================
*/
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;
    if (!email || !password) return showMessage(loginMsg, 'Enter email and password', true);

    try {
        showSpinner('Signing in…');
        await signInWithEmailAndPassword(auth, email, password);
        showMessage(loginMsg, 'Login successful — redirecting...');
        
        // Redirect logic (same as user-auth.js)
        const params = new URLSearchParams(window.location.search);
        const returnUrl = params.get('returnUrl');
        setTimeout(() => {
            // IMPORTANT: Redirect to a company-specific dashboard if you have one
            // Otherwise, redirect to the homepage.
            location.href = returnUrl || 'index.html'; 
        }, 800);

    } catch (err) {
        console.error(err);
        showMessage(loginMsg, err.message || 'Login failed', true);
    } finally {
        hideSpinner();
    }
});

/* --- Forgot password link (Same as before) --- */
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

// NOTE: I've omitted the functions (showLogin, showSpinner, etc.) that are identical to user-auth.js for brevity. 
// You should have them in your file from the copy-paste step.