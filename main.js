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
    await signInWithPopup(auth, googleProvider);
    // Todos podem logar agora. A permissão de edição é checada no onAuthStateChanged e no clique.
    closeModal();
  } catch (error) {
    console.error("Erro na autenticação com Google:", error);
    passwordError.textContent = "Erro ao entrar com Google.";
  }
}

// Observe Auth State
onAuthStateChanged(auth, (user) => {
  const authorizedEmails = ['edneypugliese@gmail.com'];

  // New Elements
  const userTopProfile = document.getElementById('user-top-profile');
  const userTopName = document.getElementById('user-top-name');
  const userTopBadge = document.getElementById('user-top-badge');
  const userTopAvatar = document.getElementById('user-top-avatar');

  if (user) {
    // Se logado, verifica se tem permissão de edição
    isEditingUnlocked = authorizedEmails.includes(user.email);
    updateLockUI();

    // Atualiza Informações do Perfil no Topo
    if (userTopProfile && userTopName && userTopBadge) {
      // Nome
      const displayName = user.displayName || user.email.split('@')[0];
      // Limit name length if too long for header
      const shortName = displayName.split(' ')[0];
      userTopName.textContent = shortName;

      // Tipo de Acesso
      const isAdmin = isEditingUnlocked;
      userTopBadge.textContent = isAdmin ? 'Amministratore' : 'Visitatore';
      userTopBadge.className = `access-badge-small ${isAdmin ? 'admin' : 'visitor'}`;

      // Mostrar o container
      userTopProfile.style.display = 'flex';

      // Atualiza a imagem do avatar
      if (userTopAvatar) {
        userTopAvatar.src = user.photoURL || 'img/gerente.jpg';
        userTopProfile.classList.add('active');
      }
    }
  } else {
    // Se deslogado, tranca tudo
    isEditingUnlocked = false;
    updateLockUI();

    // Esconde o perfil do topo
    if (userTopProfile) {
      userTopProfile.style.display = 'none';
      if (userTopAvatar) {
        userTopAvatar.src = 'img/gerente.jpg'; // Reset
      }
      userTopProfile.classList.remove('active');
    }
  }
});

// Event Listeners for Modal
const authForm = document.getElementById('auth-form');
authForm.addEventListener('submit', (e) => {
  e.preventDefault();
  checkPassword();
});

btnCancelAuth.addEventListener('click', closeModal);
btnGoogleAuth.addEventListener('click', handleGoogleSignIn);

const btnLogout = document.getElementById('btn-logout');
if (btnLogout) {
  btnLogout.addEventListener('click', () => {
    signOut(auth).catch(error => console.error("Erro ao deslogar:", error));
  });
}

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
