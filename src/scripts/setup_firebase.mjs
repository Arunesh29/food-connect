/**
 * COMPLETE SEED & AUTH SETUP SCRIPT
 * Usage: node src/scripts/setup_firebase.mjs <email> <password>
 */
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

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
    expiryTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    requestedUsers: [],
    assignedVolunteer: null,
    donorId: 'admin_seed',
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
    donorId: 'admin_seed',
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
    donorId: 'admin_seed',
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
    donorId: 'admin_seed',
    donorName: 'Harvest Moon Foods',
    pickupOption: 'ready'
  }
];

async function run() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error('Usage: node src/scripts/setup_firebase.mjs <email> <password>');
    process.exit(1);
  }

  let user = null;
  try {
    console.log(`🔍 Checking if admin exists (${email})...`);
    const signinResult = await signInWithEmailAndPassword(auth, email, password);
    user = signinResult.user;
    console.log('✅ Admin already exists and logged in.');
  } catch (err) {
    if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
      console.log('✨ Creating new admin user account...');
      try {
        const createResult = await createUserWithEmailAndPassword(auth, email, password);
        user = createResult.user;
        console.log('✅ Admin user account created!');
      } catch (createErr) {
        console.error('❌ Failed to create user:', createErr.message);
        process.exit(1);
      }
    } else {
      console.error('❌ Unexpected Auth error:', err.message);
      process.exit(1);
    }
  }

  // Set Firestore profile for the admin
  try {
    console.log(`👤 Syncing admin profile to Firestore (UID: ${user.uid})...`);
    await setDoc(doc(db, 'users', user.uid), {
      name: 'Arunesh Admin',
      email: email,
      role: 'admin',
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log('✅ Firestore profile synced.');
  } catch (dbErr) {
    console.error('❌ Firestore sync failed. Please check the security rules!');
    console.error('Error:', dbErr.message);
    process.exit(1);
  }

  // Seed data
  try {
    console.log('🌱 Adding demo food items to Firestore...');
    for (const food of foods) {
      const docRef = await addDoc(collection(db, 'foods'), {
        ...food,
        createdAt: serverTimestamp()
      });
      console.log(`  🚀 Added: ${food.name}`);
    }
    console.log('\n🌟 SETUP COMPLETE! Your project is now fully working.');
    process.exit(0);
  } catch (seedErr) {
    console.error('❌ Seeding failed:', seedErr.message);
    process.exit(1);
  }
}

run();
