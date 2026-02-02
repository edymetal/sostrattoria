import './style.css';
import { store, INITIAL_ITEMS } from './data.js';

const gridContainer = document.getElementById('items-grid');

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
      <div class="status-badge">EM FALTA</div>
    `;

    card.addEventListener('click', () => {
      // Toggle logic
      store.toggleItemStatus(item.id);
    });

    gridContainer.appendChild(card);
  });
}

// Subscribe to store changes to re-render (or optimize to specific card)
store.subscribe(() => {
  // For simplicity in this version, we re-render. 
  // Optimization: could just find the card by ID and toggle class.
  renderGrid();
});

// Initial Render
renderGrid();
