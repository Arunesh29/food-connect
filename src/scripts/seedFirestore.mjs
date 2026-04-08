/**
 * Complete Project Verification & Seeding Script
 * Usage: node src/scripts/seedFirestore.mjs arunesh@admin.in Arun@321
 */
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCbvq3HpKt0Q4toqkkMq999SSFaZWfwDz0",
  authDomain: "food-connect-7a28f.firebaseapp.com",
  projectId: "food-connect-7a28f",
  storageBucket: "food-connect-7a28f.firebasestorage.app",
  messagingSenderId: "1049715117090",
  appId: "1:1049715117090:web:db76a21cef93fd57fb4e7b",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const foods = [
  {
    name: 'Fresh Vegetable Platter',
    quantity: '5 servings',
    category: 'veg',
    location: 'Downtown Community Center, MG Road',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&h=400&fit=crop',
    status: 'available',
    expiryTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    requestedUsers: [],
    assignedVolunteer: null,
    donorId: 'official_seed_1',
    donorName: 'Green Kitchen Restaurant',
    pickupOption: 'ready'
  },
  {
    name: 'Packed Rice & Curry Meals',
    quantity: '20 boxes',
    category: 'packed',
    location: 'Tech Park Cafeteria, Whitefield',
    imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&h=400&fit=crop',
    status: 'available',
    expiryTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    requestedUsers: [],
    assignedVolunteer: null,
    donorId: 'official_seed_2',
    donorName: 'Spice Junction Catering',
    pickupOption: 'ready'
  },
  {
    name: 'Grilled Chicken Wraps',
    quantity: '12 pieces',
    category: 'non-veg',
    location: 'Central Mall Food Court, Anna Nagar',
    imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&h=400&fit=crop',
    status: 'available',
    expiryTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    requestedUsers: [],
    assignedVolunteer: null,
    donorId: 'official_seed_3',
    donorName: 'The Wrap Co.',
    pickupOption: 'ready'
  },
  {
    name: 'Organic Fruit Bowl',
    quantity: '8 bowls',
    category: 'fresh',
    location: 'Indiranagar Community Park',
    imageUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&h=400&fit=crop',
    status: 'available',
    expiryTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    requestedUsers: [],
    assignedVolunteer: null,
    donorId: 'official_seed_4',
    donorName: 'Harvest Moon Foods',
    pickupOption: 'ready'
  }
];

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error('Usage: node src/scripts/seedFirestore.mjs <email> <password>');
    process.exit(1);
  }

  try {
    console.log('🔐 Authenticating...');
    const result = await signInWithEmailAndPassword(auth, email, password);
    const uid = result.user.uid;
    console.log(`✅ Authenticated UID: ${uid}`);

    console.log('👤 Ensuring admin profile in Firestore...');
    await setDoc(doc(db, 'users', uid), {
      name: 'Arunesh Admin',
      email: email,
      role: 'admin',
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log('✅ Admin profile ready.');

    console.log('🌱 Seeding food items...');
    for (const food of foods) {
      const docRef = await addDoc(collection(db, 'foods'), {
        ...food,
        createdAt: serverTimestamp()
      });
      console.log(`  ➕ Added: ${food.name} (${docRef.id})`);
    }

    console.log('\n🚀 ALL DONE! Project is now fully seeded and ready.');
    process.exit(0);
  } catch (err) {
    console.error(`❌ FAILED: ${err.message}`);
    process.exit(1);
  }
}

main();
