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
const auth = getAuth(app);
const db = getFirestore(app);

/* UI elements */
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginMsg = document.getElementById('login-msg');
const registerMsg = document.getElementById('register-msg');

function showLogin(){ tabLogin.classList.add('active'); tabRegister.classList.remove('active'); loginForm.style.display='block'; registerForm.style.display='none'; loginForm.setAttribute('aria-hidden','false'); registerForm.setAttribute('aria-hidden','true'); }
function showRegister(){ tabLogin.classList.remove('active'); tabRegister.classList.add('active'); loginForm.style.display='none'; registerForm.style.display='block'; loginForm.setAttribute('aria-hidden','true'); registerForm.setAttribute('aria-hidden','false'); }

tabLogin.addEventListener('click', showLogin);
tabRegister.addEventListener('click', showRegister);
document.getElementById('cancelRegister')?.addEventListener('click', showLogin);

/* Helper */
function showMessage(el, text, isError=false){
  el.textContent = text;
  el.classList.toggle('error', isError);
  setTimeout(()=>{ el.textContent=''; el.classList.remove('error'); }, 6000);
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
    // create auth user
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCred.user;
    const uid = user.uid;

    // set displayName in Auth profile
    try {
      await updateProfile(user, { displayName: name });
    } catch (profileErr) {
      console.warn('Could not set displayName on auth user', profileErr);
      // not fatal — continue to store Firestore profile
    }

    // store profile in Firestore under "users" collection (doc id = uid)
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
    setTimeout(()=> location.href = 'index.html', 1200);
  } catch (err) {
    console.error('Registration error', err);
    // If Firestore write failed after creating Auth user, consider cleanup
    if (err.code && err.message && auth.currentUser) {
      // optional cleanup: delete the auth user if Firestore save fails
      try {
        await deleteUser(auth.currentUser);
        console.warn('Removed auth user due to Firestore error');
      } catch (delErr) {
        console.error('Failed to delete orphan auth user', delErr);
      }
    }
    showMessage(registerMsg, err.message || 'Registration failed', true);
  }
});

/* LOGIN */
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;
  if (!email || !password) return showMessage(loginMsg, 'Enter email and password', true);

  try {
    await signInWithEmailAndPassword(auth, email, password);
    showMessage(loginMsg, 'Login successful — redirecting...');
    setTimeout(()=> location.href = 'index.html', 800);
  } catch (err) {
    console.error(err);
    showMessage(loginMsg, err.message || 'Login failed', true);
  }
});

/* Forgot password link (simple) */
document.getElementById('forgotLink')?.addEventListener('click', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  if (!email) return showMessage(loginMsg, 'Enter your email to reset password', true);
  try {
    await sendPasswordResetEmail(auth, email);
    showMessage(loginMsg, 'Password reset email sent');
  } catch (err) {
    showMessage(loginMsg, err.message || 'Could not send reset email', true);
  }
});