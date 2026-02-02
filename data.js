import { db } from './firebase-config.js';
import { doc, onSnapshot, updateDoc, setDoc } from "firebase/firestore";

// Helper to check if config is valid
const apiKey = db.app.options.apiKey;
const isFirebaseConfigured = apiKey && !apiKey.includes("SUA_API_KEY");

const collectionName = "sostrattoria";
const docId = "inventory_list";
const STORAGE_KEY = 'sostrattoria_inventory_v1';

export const INITIAL_ITEMS = [
  {
    id: 'trash_small',
    name: 'Sacchetto Spazzatura (Piccolo)',
    image: '/images/saco_lixo_pequeno.png',
    icon: 'bi-trash3'
  },
  {
    id: 'trash_large',
    name: 'Sacchetto Spazzatura (Grande)',
    image: '/images/saco_lixo_pequeno.png',
    icon: 'bi-trash-fill'
  },
  {
    id: 'detergent_dish',
    name: 'Detersivo Piatti',
    image: '/images/detergente_pratos.png',
    icon: 'bi-droplet'
  },
  {
    id: 'detergent_laundry',
    name: 'Detersivo Lavastoviglie',
    image: '/images/detergente_lava_pratos.png',
    icon: 'bi-water'
  },
  {
    id: 'rinse_machine',
    name: 'Brillantante',
    image: '/images/brilhante_lava_pratos.png',
    icon: 'bi-stars'
  },
  {
    id: 'cleaner_floor',
    name: 'Detersivo Pavimenti',
    image: '/images/detergente_chao.png',
    icon: 'bi-house-heart'
  },
  {
    id: 'cleaner_doors',
    name: 'Spray Pulizia',
    image: '/images/spray_limpeza.png',
    icon: 'bi-magic'
  },
  {
    id: 'cleaner_alum',
    name: 'Spray Alluminio',
    image: '/images/spray_aluminio.png',
    icon: 'bi-stars'
  },
  {
    id: 'sponge_dish',
    name: 'Spugna',
    image: '/images/esponja_lava_prato.png',
    icon: 'bi-layers'
  },
  {
    id: 'steel_wool',
    name: 'Paglietta',
    image: '/images/palha_aco.png',
    icon: 'bi-record-circle'
  }
];

export const store = {
  state: {},
  listeners: [],
  unsubscribe: null,

  init() {
    if (isFirebaseConfigured) {
      console.log("🔥 Firebase Attivo: Sincronizzazione con il cloud...", apiKey.slice(0, 5) + "...");
      // Initialize Firebase Listeners
      const docRef = doc(db, collectionName, docId);

      this.unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          this.state = docSnap.data();
          this.notify();
        } else {
          // If doc doesn't exist, create it with empty state
          setDoc(docRef, {});
        }
      }, (error) => {
        console.error("Erro no Firebase (verifique regras de segurança):", error);
        // Fallback silently or alert user once
      });
    } else {
      console.warn("⚠️ Firebase non configurato. Utilizzo di LocalStorage (Modalità Offline).");
      // Fallback to LocalStorage
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.state = JSON.parse(saved);
      }
    }
  },

  isNeeded(itemId) {
    return !!this.state[itemId];
  },

  async toggleItemStatus(itemId) {
    const newState = !this.state[itemId];

    if (isFirebaseConfigured) {
      // Update Cloud
      const docRef = doc(db, collectionName, docId);
      // We use object notation to update specific field
      try {
        await updateDoc(docRef, {
          [itemId]: newState
        });
        // Optimistic update logic is handled by onSnapshot usually, 
        // but for immediate feedback we can set it locally if needed.
      } catch (e) {
        // If document doesn't exist yet (first run), setDoc
        if (e.code === 'not-found' || e.message && e.message.includes("No document")) {
          await setDoc(docRef, { [itemId]: newState }, { merge: true });
        } else {
          console.error("Erro ao salvar:", e);
          alert("Errore durante il salvataggio nel database. Controlla la tua connessione.");
        }
      }
    } else {
      // Local Storage Fallback
      if (newState) {
        this.state[itemId] = true;
      } else {
        delete this.state[itemId];
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      this.notify();
    }
  },

  subscribe(callback) {
    this.listeners.push(callback);
    // Call immediately with current state
    callback();
  },

  notify() {
    this.listeners.forEach(cb => cb());
  }
};

// Initialize the store
store.init();
