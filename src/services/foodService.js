import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, addDoc, serverTimestamp, arrayUnion, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';

// Set to false to use Firebase (true = demo data only)
const USE_LOCAL = false;

let localFoods = [];

const CATEGORY_IMAGES = {
  veg: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800',
  'non-veg': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800',
  packed: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?auto=format&fit=crop&q=80&w=800',
  fresh: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=800'
};

let listeners = [];
function notifyListeners() {
  listeners.forEach(fn => fn([...localFoods]));
}

export function useFoods(filterFn) {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (USE_LOCAL) {
      const handler = (allFoods) => {
        const now = new Date();
        const processed = allFoods.map(f => {
          if (f.status !== 'delivered' && new Date(f.expiryTime) < now) {
            return { ...f, status: 'expired' };
          }
          return f;
        });
        setFoods(filterFn ? processed.filter(filterFn) : processed);
        setLoading(false);
      };
      listeners.push(handler);
      handler(localFoods);
      return () => { listeners = listeners.filter(l => l !== handler); };
    }

    // Firebase real-time listener
    const q = query(collection(db, 'foods'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const now = new Date();
      const processed = data.map(f => {
        const expiry = f.expiryTime?.toDate ? f.expiryTime.toDate() : new Date(f.expiryTime);
        if (f.status !== 'delivered' && expiry < now) {
          return { ...f, status: 'expired' };
        }
        return f;
      });
      setFoods(filterFn ? processed.filter(filterFn) : processed);
      setLoading(false);
    }, (error) => {
      console.error('Firestore foods listener error:', error);
      setLoading(false);
    });
    return unsub;
  }, [filterFn]); // Re-run if filter logic changes

  return { foods, loading };
}

export async function addFood(data) {
  if (USE_LOCAL) {
    const newFood = {
      id: 'food_' + Date.now(),
      ...data,
      status: 'available',
      requestedUsers: [],
      assignedVolunteer: null,
      createdAt: new Date().toISOString()
    };
    localFoods = [newFood, ...localFoods];
    notifyListeners();
    return newFood.id;
  }

  // Use fallback image if none provided
  const finalImageUrl = data.imageUrl || CATEGORY_IMAGES[data.category] || CATEGORY_IMAGES.veg;

  const docRef = await addDoc(collection(db, 'foods'), {
    ...data,
    imageUrl: finalImageUrl,
    status: 'available',
    requestedUsers: [],
    assignedVolunteer: null,
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

export async function updateFoodStatus(foodId, updates) {
  if (USE_LOCAL) {
    localFoods = localFoods.map(f => f.id === foodId ? { ...f, ...updates } : f);
    notifyListeners();
    return;
  }
  await updateDoc(doc(db, 'foods', foodId), updates);
}

export async function requestFood(foodId, userId) {
  if (USE_LOCAL) {
    localFoods = localFoods.map(f => {
      if (f.id === foodId) {
        const updated = { ...f };
        if (!updated.requestedUsers.includes(userId)) {
          updated.requestedUsers = [...updated.requestedUsers, userId];
        }
        if (updated.status === 'available') {
          updated.status = 'requested';
        }
        return updated;
      }
      return f;
    });
    notifyListeners();
    return;
  }

  // Fixed: proper arrayUnion usage
  const foodRef = doc(db, 'foods', foodId);
  await updateDoc(foodRef, {
    requestedUsers: arrayUnion(userId),
    status: 'requested'
  });
}

export async function acceptDelivery(foodId, volunteerId) {
  if (USE_LOCAL) {
    localFoods = localFoods.map(f => {
      if (f.id === foodId) {
        return { ...f, assignedVolunteer: volunteerId, status: 'assigned' };
      }
      return f;
    });
    notifyListeners();
    return;
  }
  await updateDoc(doc(db, 'foods', foodId), {
    assignedVolunteer: volunteerId,
    status: 'assigned'
  });
}

export async function markDelivered(foodId) {
  if (USE_LOCAL) {
    localFoods = localFoods.map(f => {
      if (f.id === foodId) {
        return { ...f, status: 'delivered' };
      }
      return f;
    });
    notifyListeners();
    return;
  }
  await updateDoc(doc(db, 'foods', foodId), { status: 'delivered' });
}

export async function rateDelivery(foodId, rating, foodRating) {
  if (USE_LOCAL) {
    localFoods = localFoods.map(f => {
      if (f.id === foodId) {
        return { ...f, rating, foodRating };
      }
      return f;
    });
    notifyListeners();
    return;
  }
  await updateDoc(doc(db, 'foods', foodId), { rating, foodRating });
}

export async function deleteFood(foodId) {
  if (USE_LOCAL) {
    localFoods = localFoods.filter(f => f.id !== foodId);
    notifyListeners();
    return;
  }
  await deleteDoc(doc(db, 'foods', foodId));
}

export async function uploadImage(file) {
  if (USE_LOCAL) {
    return URL.createObjectURL(file);
  }
  const storageRef = ref(storage, `food-images/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export function getAllFoodsLocal() {
  return [...localFoods];
}
