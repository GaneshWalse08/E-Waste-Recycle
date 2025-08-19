import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

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

function createUserMenu(name, user) {
  const li = document.createElement('li');
  li.className = 'nav-item user-menu';

  const display = document.createElement('span');
  display.className = 'nav-link';
  display.textContent = name || user.displayName || user.email || 'Account';
  display.style.cursor = 'default';
  display.style.fontWeight = '600';
  display.style.marginRight = '8px';

  const logoutBtn = document.createElement('button');
  logoutBtn.className = 'btn btn-secondary';
  logoutBtn.textContent = 'Logout';
  logoutBtn.addEventListener('click', async () => {
    try {
      await signOut(auth);
      location.reload();
    } catch (err) {
      console.error('Logout error', err);
      alert('Could not log out. See console.');
    }
  });

  li.appendChild(display);
  li.appendChild(logoutBtn);
  return li;
}

onAuthStateChanged(auth, async (user) => {
  const loginDropdown = document.querySelector('.login-dropdown');
  const navMenu = document.querySelector('.nav-menu');

  const existing = document.querySelector('.user-menu');
  if (existing) existing.remove();

  if (user) {
    // hide login button/dropdown
    if (loginDropdown) loginDropdown.style.display = 'none';

    // try to use Auth displayName, otherwise fetch from Firestore users collection
    let name = user.displayName || '';
    if (!name) {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          const data = snap.data();
          name = data?.name || '';
        }
      } catch (err) {
        console.warn('Failed to fetch user profile from Firestore', err);
      }
    }

    if (navMenu) navMenu.appendChild(createUserMenu(name, user));
  } else {
    // show login button if no user
    if (loginDropdown) loginDropdown.style.display = '';
  }
});