import './style.css';
import { store, INITIAL_ITEMS } from './data.js';

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

// AUTHENTICATION LOGIC
function toggleLock() {
  if (isEditingUnlocked) {
    // Lock again immediately
    isEditingUnlocked = false;
    updateLockUI();
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

// Event Listeners for Modal
btnConfirmAuth.addEventListener('click', checkPassword);
btnCancelAuth.addEventListener('click', closeModal);

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
