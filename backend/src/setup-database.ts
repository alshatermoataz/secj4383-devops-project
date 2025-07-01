import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Load service account key
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID,
});

const db = admin.firestore();

async function setupFirebaseDatabase() {
  try {
    console.log('🔥 Setting up Firebase Database...');

    // Create categories collection
    const categories = [
      {
        id: 'electronics',
        name: 'Electronics',
        description: 'Electronic devices and gadgets',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'clothing',
        name: 'Clothing',
        description: 'Fashion and apparel',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'books',
        name: 'Books',
        description: 'Books and literature',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'home-garden',
        name: 'Home & Garden',
        description: 'Home and garden supplies',
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];

    console.log('📂 Creating categories...');
    for (const category of categories) {
      await db.collection('categories').doc(category.id).set(category);
      console.log(`✅ Created category: ${category.name}`);
    }

    // Create sample products
    const products = [
      {
        name: 'iPhone 15 Pro',
        description: 'Latest iPhone model with advanced features',
        price: 999.99,
        category: 'electronics',
        brand: 'Apple',
        stock: 50,
        images: ['iphone15-pro.jpg'],
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        name: 'Samsung Galaxy S24',
        description: 'Latest Samsung flagship smartphone',
        price: 899.99,
        category: 'electronics',
        brand: 'Samsung',
        stock: 30,
        images: ['galaxy-s24.jpg'],
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        name: 'MacBook Air M3',
        description: 'Powerful laptop with M3 chip',
        price: 1299.99,
        category: 'electronics',
        brand: 'Apple',
        stock: 25,
        images: ['macbook-air-m3.jpg'],
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        name: 'Premium Cotton T-Shirt',
        description: 'Comfortable cotton t-shirt for everyday wear',
        price: 29.99,
        category: 'clothing',
        brand: 'ComfortWear',
        stock: 100,
        images: ['cotton-tshirt.jpg'],
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        name: 'JavaScript: The Definitive Guide',
        description: 'Comprehensive guide to JavaScript programming',
        price: 59.99,
        category: 'books',
        brand: "O'Reilly",
        stock: 20,
        images: ['js-definitive-guide.jpg'],
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];

    console.log('🛍️ Creating sample products...');
    for (const product of products) {
      const productRef = await db.collection('products').add(product);
      console.log(`✅ Created product: ${product.name} (ID: ${productRef.id})`);
    }

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminUserId = 'admin-user-' + Date.now();
    const adminUser = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@ecommerce.com',
      role: 'admin',
      addresses: [],
      isActive: true,
      phoneNumber: '+1234567890',
      preferences: {
        newsletter: true,
        notifications: true
      },
      createdAt: new Date().toISOString()
    };

    await db.collection('users').doc(adminUserId).set(adminUser);
    console.log(`✅ Created admin user: ${adminUser.email}`);

    // Create sample customer user
    console.log('👤 Creating sample customer user...');
    const customerUserId = 'customer-user-' + Date.now();
    const customerUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      role: 'customer',
      addresses: [
        {
          id: 'addr-' + Date.now(),
          type: 'home',
          isDefault: true,
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '+1234567890'
        }
      ],
      isActive: true,
      phoneNumber: '+1987654321',
      preferences: {
        newsletter: false,
        notifications: true
      },
      createdAt: new Date().toISOString()
    };

    await db.collection('users').doc(customerUserId).set(customerUser);
    console.log(`✅ Created customer user: ${customerUser.email}`);

    console.log('\n🎉 Firebase Database setup completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Categories: ${categories.length}`);
    console.log(`- Products: ${products.length}`);
    console.log('- Users: 2 (1 admin, 1 customer)');
    console.log('\n🔐 Default Users Created:');
    console.log('Admin: admin@ecommerce.com');
    console.log('Customer: john.doe@example.com');
    console.log('\nNote: You need to create these users in Firebase Authentication manually or use the registration endpoint.');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
  } finally {
    process.exit(0);
  }
}

// Run the setup
setupFirebaseDatabase();
