import { db } from './config';
import { 
  collection, 
  getDocs, 
  getDoc,
  doc, 
  addDoc,
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  where
} from 'firebase/firestore';

// ========================
// USERS / VENDORS
// ========================
export const getVendors = async () => {
  const q = query(collection(db, 'users'), where('role', '==', 'vendor'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// ========================
// CATEGORIES
// ========================
export const getCategories = async () => {
  const q = query(collection(db, 'categories'), orderBy('name'));
  const querySnapshot = await getDocs(q);
  // Spread doc.data() first, then overwrite id with doc.id so real document ID is never masked
  return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
};

export const addCategory = async (categoryData) => {
  // Use setDoc instead of addDoc to make the document ID the actual slug
  const docRef = doc(db, 'categories', categoryData.id);
  return await setDoc(docRef, {
    name: categoryData.name,
    image: categoryData.image,
    createdAt: new Date().toISOString()
  });
};

export const updateCategory = async (id, categoryData) => {
  const docRef = doc(db, 'categories', id);
  return await updateDoc(docRef, {
    ...categoryData,
    updatedAt: new Date().toISOString()
  });
};

export const deleteCategory = async (id) => {
  const docRef = doc(db, 'categories', id);
  return await deleteDoc(docRef);
};


// ========================
// PRODUCTS
// ========================
export const getProducts = async () => {
  const q = query(collection(db, 'products'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
};

export const getVendorProducts = async (vendorId) => {
  const q = query(collection(db, 'products'), where('vendorId', '==', vendorId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
};

export const addProduct = async (productData) => {
  return await addDoc(collection(db, 'products'), {
    ...productData,
    createdAt: new Date().toISOString()
  });
};

export const updateProduct = async (id, productData) => {
  const docRef = doc(db, 'products', id);
  return await updateDoc(docRef, {
    ...productData,
    updatedAt: new Date().toISOString()
  });
};

export const deleteProduct = async (id) => {
  const docRef = doc(db, 'products', id);
  return await deleteDoc(docRef);
};

// ========================
// BANNERS
// ========================
export const getBanners = async () => {
  const q = query(collection(db, 'banners'), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addBanner = async (bannerData) => {
  return await addDoc(collection(db, 'banners'), {
    ...bannerData,
    createdAt: new Date().toISOString()
  });
};

export const deleteBanner = async (id) => {
  const docRef = doc(db, 'banners', id);
  return await deleteDoc(docRef);
};
