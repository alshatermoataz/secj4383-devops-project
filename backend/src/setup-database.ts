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
        description: 'Latest iPhone model with advanced features, titanium design, and powerful A17 Pro chip. Perfect for photography and professional use.',
        price: 999.99,
        compareAtPrice: 1099.99,
        category: 'electronics',
        brand: 'Apple',
        sku: 'IPH15PRO-128',
        stock: 50,
        images: ['iphone15-pro-1.jpg', 'iphone15-pro-2.jpg', 'iphone15-pro-3.jpg'],
        thumbnail: 'iphone15-pro-thumb.jpg',
        isActive: true,
        isFeatured: true,
        tags: ['smartphone', 'mobile', 'apple', 'premium', 'camera'],
        specifications: {
          display: '6.1-inch Super Retina XDR',
          storage: '128GB',
          camera: '48MP Main + 12MP Ultra Wide',
          battery: 'Up to 23 hours video playback',
          color: 'Natural Titanium'
        },
        rating: {
          average: 4.8,
          count: 1247
        },
        dimensions: {
          weight: 187,
          length: 146.6,
          width: 70.6,
          height: 8.25
        },
        createdAt: new Date().toISOString()
      },
      {
        name: 'Samsung Galaxy S24 Ultra',
        description: 'Ultimate Samsung flagship with S Pen, incredible camera system, and AI-powered features. Built for productivity and creativity.',
        price: 1199.99,
        compareAtPrice: 1299.99,
        category: 'electronics',
        brand: 'Samsung',
        sku: 'SGS24U-256',
        stock: 30,
        images: ['galaxy-s24-ultra-1.jpg', 'galaxy-s24-ultra-2.jpg'],
        thumbnail: 'galaxy-s24-ultra-thumb.jpg',
        isActive: true,
        isFeatured: true,
        tags: ['smartphone', 'android', 'samsung', 's-pen', 'camera'],
        specifications: {
          display: '6.8-inch Dynamic AMOLED 2X',
          storage: '256GB',
          camera: '200MP Main + 50MP Periscope Telephoto',
          battery: '5000mAh',
          color: 'Titanium Gray'
        },
        rating: {
          average: 4.7,
          count: 892
        },
        dimensions: {
          weight: 232,
          length: 162.3,
          width: 79.0,
          height: 8.6
        },
        createdAt: new Date().toISOString()
      },
      {
        name: 'MacBook Air M3',
        description: 'Incredibly thin and light laptop with the powerful M3 chip. Perfect for students, professionals, and creative work.',
        price: 1299.99,
        category: 'electronics',
        brand: 'Apple',
        sku: 'MBA13-M3-256',
        stock: 25,
        images: ['macbook-air-m3-1.jpg', 'macbook-air-m3-2.jpg'],
        thumbnail: 'macbook-air-m3-thumb.jpg',
        isActive: true,
        isFeatured: true,
        tags: ['laptop', 'apple', 'macbook', 'portable', 'student'],
        specifications: {
          processor: 'Apple M3 chip',
          memory: '8GB unified memory',
          storage: '256GB SSD',
          display: '13.6-inch Liquid Retina',
          color: 'Midnight'
        },
        rating: {
          average: 4.9,
          count: 567
        },
        dimensions: {
          weight: 1240,
          length: 304,
          width: 215,
          height: 11.3
        },
        createdAt: new Date().toISOString()
      },
      {
        name: 'Sony WH-1000XM5 Headphones',
        description: 'Industry-leading noise canceling headphones with exceptional sound quality and all-day comfort.',
        price: 399.99,
        compareAtPrice: 449.99,
        category: 'electronics',
        brand: 'Sony',
        sku: 'SONYWH1000XM5',
        stock: 75,
        images: ['sony-wh1000xm5-1.jpg', 'sony-wh1000xm5-2.jpg'],
        thumbnail: 'sony-wh1000xm5-thumb.jpg',
        isActive: true,
        isFeatured: false,
        tags: ['headphones', 'wireless', 'noise-canceling', 'audio', 'travel'],
        specifications: {
          type: 'Over-ear wireless',
          batteryLife: '30 hours',
          connectivity: 'Bluetooth 5.2',
          noiseCanceling: 'Yes',
          color: 'Black'
        },
        rating: {
          average: 4.6,
          count: 2103
        },
        dimensions: {
          weight: 250
        },
        createdAt: new Date().toISOString()
      },
      {
        name: 'Premium Cotton T-Shirt',
        description: 'Comfortable, breathable 100% organic cotton t-shirt. Perfect for everyday wear with a modern fit.',
        price: 29.99,
        category: 'clothing',
        brand: 'ComfortWear',
        sku: 'CW-TSHIRT-M-BLK',
        stock: 100,
        images: ['cotton-tshirt-1.jpg', 'cotton-tshirt-2.jpg'],
        thumbnail: 'cotton-tshirt-thumb.jpg',
        isActive: true,
        isFeatured: false,
        tags: ['t-shirt', 'cotton', 'casual', 'basic', 'comfortable'],
        specifications: {
          material: '100% Organic Cotton',
          fit: 'Regular',
          size: 'Medium',
          color: 'Black',
          care: 'Machine washable'
        },
        rating: {
          average: 4.3,
          count: 456
        },
        createdAt: new Date().toISOString()
      },
      {
        name: 'Wireless Gaming Mouse',
        description: 'High-performance wireless gaming mouse with RGB lighting, programmable buttons, and precision sensor.',
        price: 79.99,
        category: 'electronics',
        brand: 'GamePro',
        sku: 'GP-MOUSE-WL-RGB',
        stock: 60,
        images: ['gaming-mouse-1.jpg', 'gaming-mouse-2.jpg'],
        thumbnail: 'gaming-mouse-thumb.jpg',
        isActive: true,
        isFeatured: false,
        tags: ['gaming', 'mouse', 'wireless', 'rgb', 'precision'],
        specifications: {
          connectivity: 'Wireless 2.4GHz',
          sensor: 'Optical',
          dpi: '16000 DPI',
          buttons: '7 programmable buttons',
          battery: '70 hours'
        },
        rating: {
          average: 4.4,
          count: 823
        },
        dimensions: {
          weight: 85,
          length: 126,
          width: 68,
          height: 43
        },
        createdAt: new Date().toISOString()
      },
      {
        name: "JavaScript: The Definitive Guide",
        description: 'Comprehensive guide to JavaScript programming. Master the world\'s most popular programming language.',
        price: 59.99,
        category: 'books',
        brand: "O'Reilly Media",
        sku: 'OREILLY-JS-DEF-7ED',
        stock: 40,
        images: ['js-definitive-guide-1.jpg'],
        thumbnail: 'js-definitive-guide-thumb.jpg',
        isActive: true,
        isFeatured: false,
        tags: ['programming', 'javascript', 'web-development', 'reference', 'oreilly'],
        specifications: {
          pages: 704,
          edition: '7th Edition',
          language: 'English',
          format: 'Paperback',
          isbn: '978-1491952023'
        },
        rating: {
          average: 4.5,
          count: 234
        },
        dimensions: {
          weight: 1200,
          length: 233,
          width: 178,
          height: 38
        },
        createdAt: new Date().toISOString()
      },
      {
        name: 'Stainless Steel Water Bottle',
        description: 'Durable, insulated stainless steel water bottle. Keeps drinks cold for 24 hours or hot for 12 hours.',
        price: 24.99,
        category: 'home-garden',
        brand: 'HydroFlask',
        sku: 'HF-BOTTLE-32OZ-BLU',
        stock: 120,
        images: ['water-bottle-1.jpg', 'water-bottle-2.jpg'],
        thumbnail: 'water-bottle-thumb.jpg',
        isActive: true,
        isFeatured: false,
        tags: ['water-bottle', 'insulated', 'stainless-steel', 'eco-friendly', 'sports'],
        specifications: {
          capacity: '32 oz',
          material: 'Stainless Steel',
          insulation: 'Double-wall vacuum',
          color: 'Pacific Blue',
          dishwasher: 'Top rack safe'
        },
        rating: {
          average: 4.7,
          count: 1567
        },
        dimensions: {
          weight: 345,
          height: 257
        },
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
    console.log(`- Products: ${products.length} (with advanced search capabilities)`);
    console.log('- Users: 2 (1 admin, 1 customer)');
    console.log('\n🔐 Default Users Created:');
    console.log('Admin: admin@ecommerce.com');
    console.log('Customer: john.doe@example.com');
    console.log('\n🛍️ Features Available:');
    console.log('- Product search and filtering');
    console.log('- Category browsing');
    console.log('- Brand filtering');
    console.log('- Price range filtering');
    console.log('- Featured products');
    console.log('- Related products');
    console.log('\nNote: You need to create these users in Firebase Authentication manually or use the registration endpoint.');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
  } finally {
    process.exit(0);
  }
}

// Run the setup
setupFirebaseDatabase();
