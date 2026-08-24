const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const categories = [
  { id: 'slides', name: 'Slides', createdAt: new Date().toISOString() },
  { id: 'sandals', name: 'Sandals', createdAt: new Date().toISOString() },
  { id: 'flip-flops', name: 'Flip-Flops', createdAt: new Date().toISOString() },
  { id: 'luxury', name: 'Luxury', createdAt: new Date().toISOString() }
];

const banners = [
  { title: 'Summer Collection', link: '/?category=slides', image: '/assets/images/banners/Q.jpg', createdAt: new Date().toISOString() },
  { title: 'Luxury Series', link: '/?category=luxury', image: '/assets/images/banners/ab09a300-4e3d-46a8-8d38-7b5e14957ba0.jpg', createdAt: new Date().toISOString() },
  { title: 'Everyday Wear', link: '/?category=sandals', image: '/assets/images/banners/b8f417e9-8ee9-4b69-9090-03481915ba77.jpg', createdAt: new Date().toISOString() }
];

const products = [
  { name: 'Classic Slide', price: 150, category: 'slides', description: 'Comfortable classic slide.', image: '/assets/images/products/P1.jpg', trending: true, isNew: false, sizes: [38, 39, 40], soldCount: 45, createdAt: new Date().toISOString() },
  { name: 'Leather Sandal', price: 200, category: 'sandals', description: 'Premium leather sandal.', image: '/assets/images/products/P2.jpg', trending: false, isNew: true, sizes: [40, 41, 42], soldCount: 12, createdAt: new Date().toISOString() },
  { name: 'Beach Flip-Flop', price: 80, category: 'flip-flops', description: 'Perfect for the beach.', image: '/assets/images/products/P3.jpg', trending: true, isNew: true, sizes: [37, 38, 39], soldCount: 120, createdAt: new Date().toISOString() },
  { name: 'Luxury Slide X', price: 450, category: 'luxury', description: 'Designer luxury slide.', image: '/assets/images/products/P4.jpg', trending: false, isNew: true, sizes: [41, 42, 43], soldCount: 5, createdAt: new Date().toISOString() },
  { name: 'Sport Sandal', price: 180, category: 'sandals', description: 'Durable sport sandal.', image: '/assets/images/products/P5.jpg', trending: true, isNew: false, sizes: [39, 40, 41, 42], soldCount: 89, createdAt: new Date().toISOString() },
  { name: 'Minimalist Slide', price: 120, category: 'slides', description: 'Clean, minimalist design.', image: '/assets/images/products/P6.jpg', trending: false, isNew: false, sizes: [36, 37, 38], soldCount: 34, createdAt: new Date().toISOString() },
  { name: 'Premium Leather Flip', price: 220, category: 'luxury', description: 'Leather flip flop.', image: '/assets/images/products/P7.jpg', trending: true, isNew: true, sizes: [40, 41], soldCount: 18, createdAt: new Date().toISOString() },
  { name: 'Comfort Plus', price: 160, category: 'slides', description: 'Extra comfort for daily wear.', image: '/assets/images/products/P8.jpg', trending: false, isNew: true, sizes: [38, 39, 40, 41], soldCount: 22, createdAt: new Date().toISOString() },
  { name: 'Urban Sandal', price: 190, category: 'sandals', description: 'City street style.', image: '/assets/images/products/P9.jpg', trending: true, isNew: false, sizes: [39, 40, 42], soldCount: 76, createdAt: new Date().toISOString() },
  { name: 'Velvet Slide', price: 300, category: 'luxury', description: 'Luxurious velvet material.', image: '/assets/images/products/P10.jpg', trending: false, isNew: true, sizes: [37, 38, 39], soldCount: 8, createdAt: new Date().toISOString() },
  { name: 'Poolside Classic', price: 95, category: 'flip-flops', description: 'Water resistant classic.', image: '/assets/images/products/P11.jpg', trending: true, isNew: false, sizes: [38, 39, 40, 41], soldCount: 150, createdAt: new Date().toISOString() },
  { name: 'Platform Sandal', price: 210, category: 'sandals', description: 'Elevated platform design.', image: '/assets/images/products/P12.jpg', trending: false, isNew: true, sizes: [36, 37, 38], soldCount: 15, createdAt: new Date().toISOString() },
  { name: 'Cloud Slide', price: 140, category: 'slides', description: 'Like walking on clouds.', image: '/assets/images/products/P13.jpg', trending: true, isNew: true, sizes: [39, 40, 41], soldCount: 200, createdAt: new Date().toISOString() }
];

async function seed() {
  console.log('Starting seed process...');

  try {
    // 1. Seed Categories
    console.log('Seeding Categories...');
    for (const cat of categories) {
      // Create document with specific ID so it matches 'id' in our list
      await db.collection('categories').doc(cat.id).set({
        name: cat.name,
        createdAt: cat.createdAt
      });
      console.log(`Added category: ${cat.name}`);
    }

    // 2. Seed Banners
    console.log('Seeding Banners...');
    for (const banner of banners) {
      await db.collection('banners').add(banner);
      console.log(`Added banner: ${banner.title}`);
    }

    // 3. Seed Products
    console.log('Seeding Products...');
    for (const prod of products) {
      await db.collection('products').add(prod);
      console.log(`Added product: ${prod.name}`);
    }

    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
