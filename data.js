/**
 * Data Management for Sostrattoria Inventory
 */

const STORAGE_KEY = 'sostrattoria_inventory_v1';

export const INITIAL_ITEMS = [
  {
    id: 'trash_small',
    name: 'Saco de Lixo (Pequeno)',
    image: '/images/saco_lixo_pequeno.png',
    icon: 'bi-trash3'
  },
  {
    id: 'trash_large',
    name: 'Saco de Lixo (Grande)',
    image: '/images/saco_lixo_pequeno.png', // Reusing small bag as placeholder if large is missing
    icon: 'bi-trash-fill'
  },
  {
    id: 'detergent_dish',
    name: 'Detergente Pratos',
    image: '/images/detergente_pratos.png',
    icon: 'bi-droplet'
  },
  {
    id: 'detergent_laundry',
    name: 'Detergente Máquina',
    image: '/images/detergente_lava_pratos.png',
    icon: 'bi-water'
  },
  {
    id: 'rinse_machine',
    name: 'Brilhante Máquina',
    image: '/images/brilhante_lava_pratos.png',
    icon: 'bi-stars'
  },
  {
    id: 'cleaner_floor',
    name: 'Limpa Chão',
    image: '/images/detergente_chao.png',
    icon: 'bi-house-heart'
  },
  {
    id: 'cleaner_doors',
    name: 'Spray Limpeza',
    image: '/images/spray_limpeza.png',
    icon: 'bi-magic'
  },
  {
    id: 'cleaner_alum',
    name: 'Spray Alumínio',
    image: '/images/spray_aluminio.png',
    icon: 'bi-stars'
  },
  {
    id: 'sponge_dish',
    name: 'Esponja',
    image: '/images/esponja_lava_prato.png',
    icon: 'bi-layers'
  },
  {
    id: 'steel_wool',
    name: 'Palha de Aço',
    image: '/images/palha_aco.png',
    icon: 'bi-record-circle'
  }
];

// Helper to generate unique IDs or use static ones
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// Initial State load
const loadState = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    items: [] // { id, name, needed: boolean, urgency: 'normal'|'high', createdAt: string }
  };
};

export const store = {
  state: loadState(),
  listeners: [],

  subscribe(listener) {
    this.listeners.push(listener);
  },

  notify() {
    this.listeners.forEach(listener => listener(this.state));
    this.save();
  },

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  },

  // Actions
  toggleItemStatus(itemId) {
    const existingIndex = this.state.items.findIndex(i => i.id === itemId && i.needed);

    if (existingIndex >= 0) {
      // Already needed -> Remove (Mark as purchased/not needed)
      this.state.items.splice(existingIndex, 1);
    } else {
      // Not needed -> Add
      // Find name from INITIAL_ITEMS if possible, or just use ID (refactor needed if totally dynamic)
      // Since we now use static IDs for initial items, we can look them up.
      const baseItem = INITIAL_ITEMS.find(i => i.id === itemId);
      this.state.items.push({
        id: itemId,
        name: baseItem ? baseItem.name : itemId,
        needed: true,
        urgency: 'normal',
        createdAt: new Date().toISOString()
      });
    }
    this.notify();
  },

  isNeeded(itemId) {
    return this.state.items.some(i => i.id === itemId && i.needed);
  }
};
