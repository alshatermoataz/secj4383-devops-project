# User Account Management Backend Setup

## Overview
This backend provides complete user account management for your e-commerce platform with:
- User registration and authentication
- Profile management
- Address management
- Role-based access control (Customer, Admin, Guest)

## Firebase Setup Required

### 1. Firebase Authentication Setup
In your Firebase Console (`https://console.firebase.google.com/u/0/project/devops-faf26`):

1. **Enable Authentication**:
   - Go to Authentication → Sign-in method
   - Enable "Email/Password"
   - Optional: Enable "Google" for social login

2. **Set up Security Rules**:
   - Go to Firestore Database → Rules
   - Copy and paste the rules from the section below

### 2. Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Products - customers can read, admins can write
    match /products/{productId} {
      allow read: if true; // Public read access
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Orders - users can read their own orders, admins can read all
    match /orders/{orderId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Categories - public read, admin write
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Installation & Setup

### 1. Install Dependencies
```bash
cd backend
npm install uuid @types/uuid
```

### 2. Environment Setup
Your `.env` file should have:
```env
NODE_ENV=development
PORT=3001
FIREBASE_DATABASE_URL=https://devops-faf26-default-rtdb.firebaseio.com/
FIREBASE_PROJECT_ID=devops-faf26
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Service Account Key
- Download `serviceAccountKey.json` from Firebase Console
- Place it in the `backend/` folder
- Add to `.gitignore`

### 4. Initialize Database
```bash
npm run setup-db
```

Or manually run:
```bash
npx ts-node src/setup-database.ts
```

### 5. Start the Server
```bash
npm run dev
```

## API Endpoints

### Authentication Routes (`/api/auth`)

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phoneNumber": "+1234567890"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer YOUR_ID_TOKEN
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer YOUR_ID_TOKEN
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "phoneNumber": "+1987654321",
  "preferences": {
    "newsletter": true,
    "notifications": false
  }
}
```

#### Change Password
```http
PUT /api/auth/change-password
Authorization: Bearer YOUR_ID_TOKEN
Content-Type: application/json

{
  "newPassword": "newpassword123"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer YOUR_ID_TOKEN
```

### Address Management Routes (`/api/addresses`)

#### Get All Addresses
```http
GET /api/addresses
Authorization: Bearer YOUR_ID_TOKEN
```

#### Add Address
```http
POST /api/addresses
Authorization: Bearer YOUR_ID_TOKEN
Content-Type: application/json

{
  "type": "home",
  "street": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "isDefault": true
}
```

#### Update Address
```http
PUT /api/addresses/:addressId
Authorization: Bearer YOUR_ID_TOKEN
Content-Type: application/json

{
  "street": "456 Oak Ave",
  "isDefault": true
}
```

#### Delete Address
```http
DELETE /api/addresses/:addressId
Authorization: Bearer YOUR_ID_TOKEN
```

#### Set Default Address
```http
PATCH /api/addresses/:addressId/default
Authorization: Bearer YOUR_ID_TOKEN
```

## User Roles

### Customer
- Can register, login, manage profile
- Can manage their own addresses
- Can place orders and view order history

### Admin
- All customer permissions
- Can manage all users
- Can manage products and inventory
- Can view and manage all orders

### Guest
- Can browse products
- Must register to make purchases

## Database Schema

### Users Collection
```typescript
{
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'customer' | 'admin' | 'guest';
  phoneNumber?: string;
  addresses: Address[];
  isActive: boolean;
  profilePicture?: string;
  preferences: {
    newsletter: boolean;
    notifications: boolean;
  };
  createdAt: string;
  updatedAt?: string;
}
```

### Address Schema
```typescript
{
  id: string;
  type: 'home' | 'work' | 'other';
  isDefault: boolean;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}
```

## Testing the Setup

### 1. Health Check
```bash
curl http://localhost:3001/health
```

### 2. Register Test User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Login Test User
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Error Handling

The API returns standardized error responses:
```json
{
  "error": "Error message",
  "details": [/* validation errors if applicable */]
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

## Security Features

1. **JWT Token Authentication**: Uses Firebase ID tokens
2. **Input Validation**: All inputs are validated and sanitized
3. **Rate Limiting**: Configurable rate limiting
4. **CORS Protection**: Configured for your frontend
5. **Helmet**: Security headers
6. **Role-based Access Control**: Different permissions for different user roles

## Next Steps

1. ✅ User Account Management - **COMPLETED**
2. 🔄 Product Browsing and Search - **NEXT**
3. 🔄 Shopping Cart and Checkout
4. 🔄 Order Tracking and History
5. 🔄 Admin Product & Inventory Management
