import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Firebase Admin initialization
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID,
});

const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

async function createInitialAdmin() {
  try {
    const adminEmail = 'admin@ecommerce.com';
    const adminPassword = 'admin123456';
    
    console.log('Creating initial admin user...');

    // Check if admin already exists
    const existingAdmin = await db.collection('users')
      .where('email', '==', adminEmail)
      .get();

    if (!existingAdmin.empty) {
      console.log('Admin user already exists!');
      const adminData = existingAdmin.docs[0].data();
      console.log(`Admin: ${adminData.firstName} ${adminData.lastName} (${adminData.email})`);
      return;
    }

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: adminEmail,
      password: adminPassword,
      displayName: 'System Administrator',
    });

    // Create admin profile in Firestore
    const adminData = {
      firstName: 'System',
      lastName: 'Administrator',
      email: adminEmail,
      role: 'admin',
      addresses: [],
      isActive: true,
      phoneNumber: '+1234567890',
      preferences: {
        newsletter: false,
        notifications: true
      },
      createdAt: new Date().toISOString(),
      createdBy: 'system'
    };

    await db.collection('users').doc(userRecord.uid).set(adminData);

    console.log('✅ Initial admin user created successfully!');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log(`👤 Name: ${adminData.firstName} ${adminData.lastName}`);
    console.log('\n⚠️  IMPORTANT: Change the admin password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
createInitialAdmin();
