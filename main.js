import './style.css';
import { store, INITIAL_ITEMS } from './data.js';
import { auth, googleProvider } from './firebase-config.js';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';

const gridContainer = document.getElementById('items-grid');
const btnLock = document.getElementById('btn-lock');
const lockIcon = document.getElementById('lock-icon');

// STATE
let isEditingUnlocked = false;

// MODAL ELEMENTS
const passwordModal = document.getElementById('password-modal');
const passwordInput = document.getElementById('password-input');
const passwordError = document.getElementById('password-error');
const btnConfirmAuth = document.getElementById('btn-confirm-auth');
const btnCancelAuth = document.getElementById('btn-cancel-auth');
const btnGoogleAuth = document.getElementById('btn-google-auth');

// AUTHENTICATION LOGIC
function toggleLock() {
  if (isEditingUnlocked) {
    // If it was a password unlock, just lock. If it's a Google unlock, maybe sign out?
    // For now, let's just toggle the local state.
    isEditingUnlocked = false;
    updateLockUI();
    
    // If signed in with Firebase, sign out
    if (auth.currentUser) {
      signOut(auth).catch(error => console.error("Erro ao sair:", error));
    }
  } else {
    // Open Modal
    openModal();
  }
}

function openModal() {
  passwordModal.classList.add('active');
  passwordInput.value = '';
  passwordError.textContent = '';
  setTimeout(() => passwordInput.focus(), 100);
}

function closeModal() {
  passwordModal.classList.remove('active');
}

function checkPassword() {
  const password = passwordInput.value;
  if (password === "Edy") {
    isEditingUnlocked = true;
    updateLockUI();
    closeModal();
  } else {
    passwordError.textContent = "Password errata. Riprova.";
    passwordInput.value = '';
    passwordInput.focus();

    // Shake animation on input
    passwordInput.classList.add('shake');
    setTimeout(() => passwordInput.classList.remove('shake'), 400);
  }
}

async function handleGoogleSignIn() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // You can check user email here if you want to restrict access
    // const user = result.user;
    // if (user.email === "allowed@email.com") ...
    
    isEditingUnlocked = true;
    updateLockUI();
    closeModal();
  } catch (error) {
    console.error("Erro na autenticação com Google:", error);
    passwordError.textContent = "Erro ao entrar com Google.";
  }
}

// Observe Auth State
onAuthStateChanged(auth, (user) => {
  if (user) {
    isEditingUnlocked = true;
    updateLockUI();
    
    // Mostra o nome do usuário no subtítulo se logado
    const subtitle = document.querySelector('.subtitle');
    if (subtitle) {
      subtitle.textContent = `Ciao, ${user.displayName || user.email}`;
    }
  } else {
    // Restaura o subtítulo original se deslogado
    const subtitle = document.querySelector('.subtitle');
    if (subtitle) {
      subtitle.textContent = 'Controllo Inventario';
    }
  }
});

// Event Listeners for Modal
btnConfirmAuth.addEventListener('click', checkPassword);
btnCancelAuth.addEventListener('click', closeModal);
btnGoogleAuth.addEventListener('click', handleGoogleSignIn);

passwordInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') checkPassword();
});

// Close verify if clicked outside
passwordModal.addEventListener('click', (e) => {
  if (e.target === passwordModal) closeModal();
});

btnLock.addEventListener('click', toggleLock);

function updateLockUI() {
  if (isEditingUnlocked) {
    btnLock.classList.add('unlocked');
    lockIcon.classList.remove('bi-lock-fill');
    lockIcon.classList.add('bi-unlock-fill');
  } else {
    btnLock.classList.remove('unlocked');
    lockIcon.classList.remove('bi-unlock-fill');
    lockIcon.classList.add('bi-lock-fill');
  }
}

// RENDER LOGIC
function renderGrid() {
  gridContainer.innerHTML = '';

  INITIAL_ITEMS.forEach(item => {
    const isNeeded = store.isNeeded(item.id);

    const card = document.createElement('div');
    card.className = `product-card ${isNeeded ? 'missing' : ''}`;

    card.innerHTML = `
      <div class="card-image-container">
        <img src="${item.image}" alt="${item.name}" class="card-image" loading="lazy">
      </div>
      <div class="card-overlay">
        <div class="card-title-container">
          <i class="bi ${item.icon}" style="color: var(--accent-gold); font-size: 1rem;"></i>
          <div class="card-title">${item.name}</div>
        </div>
      </div>
      <div class="status-badge">MANCANTE</div>
    `;

    card.addEventListener('click', () => {
      if (!isEditingUnlocked) {
        // Locked feedback
        card.classList.add('shake');
        setTimeout(() => card.classList.remove('shake'), 400);
        return;
      }

      // Normal toggle logic if unlocked
      store.toggleItemStatus(item.id);
    });

    gridContainer.appendChild(card);
  });
}

// Subscribe to store changes to re-render (or optimize to specific card)
store.subscribe(() => {
  renderGrid();
});

// Initial Render
renderGrid();
updateLockUI();
