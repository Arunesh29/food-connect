import { addFood } from '../services/foodService';

const SAMPLE_FOODS = [
  {
    name: 'Fresh Garden Salad',
    quantity: '5 portions',
    category: 'veg',
    location: 'Downtown Community Center',
    expiryHours: '4',
    pickupOption: 'ready',
    donorName: 'Green Eats Café'
  },
  {
    name: 'Grilled Chicken Platter',
    quantity: '3 boxes',
    category: 'non-veg',
    location: 'Westside Mall Food Court',
    expiryHours: '2',
    pickupOption: 'ready',
    donorName: 'The Grill House'
  },
  {
    name: 'Assorted Pastries',
    quantity: '12 pieces',
    category: 'packed',
    location: 'Main Street Bakery',
    expiryHours: '24',
    pickupOption: '30min',
    donorName: 'Sweet Tooth Bakery'
  },
  {
    name: 'Organic Apples & Oranges',
    quantity: '10 kg',
    category: 'fresh',
    location: 'Central Market St. 4',
    expiryHours: '48',
    pickupOption: 'ready',
    donorName: 'Farm Fresh Co.'
  }
];

export async function seedSampleData(userId) {
  const finalUserId = userId || 'seed_donor_id';
  console.log('Starting seed...');
  for (const food of SAMPLE_FOODS) {
    try {
      const expiryTime = new Date(Date.now() + parseInt(food.expiryHours) * 60 * 60 * 1000).toISOString();
      await addFood({
        ...food,
        expiryTime,
        donorId: finalUserId,
        createdAt: new Date().toISOString()
      });
      console.log(`Added: ${food.name}`);
    } catch (err) {
      console.error(`Failed to add ${food.name}:`, err);
    }
  }
  console.log('Seed complete!');
}
