import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getProducts as fetchProductsFromFirestore } from '../firebase/firestore';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';

// One-time fetch (used on initial load)
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async () => {
    const products = await fetchProductsFromFirestore();
    return products;
  }
);

/**
 * Subscribe to real-time Firestore product updates.
 * Call this once in App.jsx — it dispatches setProducts on every change.
 * Returns an unsubscribe function.
 */
export const subscribeToProducts = (dispatch) => {
  const q = query(collection(db, 'products')); // Removed orderBy to support old items
  const unsubscribe = onSnapshot(q, (snapshot) => {
    // Sort client-side instead
    const products = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    
    dispatch(productsSlice.actions.setProducts(products));
  });
  return unsubscribe;
};

export const subscribeToCategories = (dispatch) => {
  const q = query(collection(db, 'categories'));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    // Spread doc.data() first, then overwrite id with doc.id so real document ID is never masked
    const categories = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    dispatch(productsSlice.actions.setCategories(categories));
  });
  return unsubscribe;
};

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    filteredItems: [],
    categories: [],
    activeCategory: 'all',
    searchQuery: '',
    sortBy: 'default',
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null
  },
  reducers: {
    // Used by the real-time Firestore listener
    setProducts(state, action) {
      state.status = 'succeeded';
      state.items = action.payload;
      state.filteredItems = applyFilters({ ...state, items: action.payload });
    },
    setCategories(state, action) {
      state.categories = action.payload;
    },
    setCategory(state, action) {
      state.activeCategory = action.payload;
      state.filteredItems = applyFilters(state);
    },
    setSearchQuery(state, action) {
      state.searchQuery = action.payload;
      state.filteredItems = applyFilters(state);
    },
    setSortBy(state, action) {
      state.sortBy = action.payload;
      state.filteredItems = applyFilters(state);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.filteredItems = applyFilters({ ...state, items: action.payload });
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

function applyFilters(state) {
  let result = [...state.items];

  // Category filter
  if (state.activeCategory !== 'all') {
    result = result.filter(p => p.category === state.activeCategory);
  }

  // Search filter
  if (state.searchQuery.trim()) {
    const q = state.searchQuery.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }

  // Sort
  switch (state.sortBy) {
    case 'price-low':
      result.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      result.sort((a, b) => b.price - a.price);
      break;
    case 'popular':
      result.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
      break;
    case 'newest':
      result = result.filter(p => p.isNew).concat(result.filter(p => !p.isNew));
      break;
    default:
      break;
  }

  return result;
}

export const { setProducts, setCategories, setCategory, setSearchQuery, setSortBy } = productsSlice.actions;
export default productsSlice.reducer;
