import express from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../index';
import { Address } from '../types/express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

// Simple UUID generator function
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

const router = express.Router();

// Get all addresses for current user
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    const addresses = userData?.addresses || [];

    res.json(addresses);

  } catch (error) {
    console.error('Address fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
});

// Add new address
router.post('/',
  authenticateToken,
  [
    body('type').isIn(['home', 'work', 'other']).withMessage('Type must be home, work, or other'),
    body('street').notEmpty().trim().withMessage('Street address is required'),
    body('city').notEmpty().trim().withMessage('City is required'),
    body('state').notEmpty().trim().withMessage('State is required'),
    body('zipCode').notEmpty().trim().withMessage('ZIP code is required'),
    body('country').notEmpty().trim().withMessage('Country is required'),
    body('firstName').notEmpty().trim().withMessage('First name is required'),
    body('lastName').notEmpty().trim().withMessage('Last name is required'),
    body('phoneNumber').optional().isMobilePhone('any'),
    body('isDefault').optional().isBoolean(),
  ],
  async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed',
          details: errors.array() 
        });
      }

      const userId = req.user?.uid;
      
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userData = userDoc.data();
      const currentAddresses = userData?.addresses || [];

      const newAddress: Address = {
        id: generateId(),
        type: req.body.type,
        isDefault: req.body.isDefault || false,
        street: req.body.street,
        city: req.body.city,
        state: req.body.state,
        zipCode: req.body.zipCode,
        country: req.body.country,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phoneNumber: req.body.phoneNumber,
      };

      // If this is set as default, make all other addresses non-default
      if (newAddress.isDefault) {
        currentAddresses.forEach((addr: Address) => {
          addr.isDefault = false;
        });
      }

      // If this is the first address, make it default
      if (currentAddresses.length === 0) {
        newAddress.isDefault = true;
      }

      const updatedAddresses = [...currentAddresses, newAddress];

      await db.collection('users').doc(userId).update({
        addresses: updatedAddresses,
        updatedAt: new Date().toISOString()
      });

      res.status(201).json({
        message: 'Address added successfully',
        address: newAddress
      });

    } catch (error) {
      console.error('Address creation error:', error);
      res.status(500).json({ error: 'Failed to add address' });
    }
  }
);

// Update address
router.put('/:addressId',
  authenticateToken,
  [
    body('type').optional().isIn(['home', 'work', 'other']),
    body('street').optional().notEmpty().trim(),
    body('city').optional().notEmpty().trim(),
    body('state').optional().notEmpty().trim(),
    body('zipCode').optional().notEmpty().trim(),
    body('country').optional().notEmpty().trim(),
    body('firstName').optional().notEmpty().trim(),
    body('lastName').optional().notEmpty().trim(),
    body('phoneNumber').optional().isMobilePhone('any'),
    body('isDefault').optional().isBoolean(),
  ],
  async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed',
          details: errors.array() 
        });
      }

      const userId = req.user?.uid;
      const addressId = req.params.addressId;
      
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userData = userDoc.data();
      const addresses = userData?.addresses || [];

      const addressIndex = addresses.findIndex((addr: Address) => addr.id === addressId);
      
      if (addressIndex === -1) {
        return res.status(404).json({ error: 'Address not found' });
      }

      // Update the address
      const updatedAddress = {
        ...addresses[addressIndex],
        ...req.body
      };

      // If setting as default, make all others non-default
      if (req.body.isDefault === true) {
        addresses.forEach((addr: Address, index: number) => {
          if (index !== addressIndex) {
            addr.isDefault = false;
          }
        });
      }

      addresses[addressIndex] = updatedAddress;

      await db.collection('users').doc(userId).update({
        addresses: addresses,
        updatedAt: new Date().toISOString()
      });

      res.json({
        message: 'Address updated successfully',
        address: updatedAddress
      });

    } catch (error) {
      console.error('Address update error:', error);
      res.status(500).json({ error: 'Failed to update address' });
    }
  }
);

// Delete address
router.delete('/:addressId', authenticateToken, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user?.uid;
    const addressId = req.params.addressId;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    const addresses = userData?.addresses || [];

    const addressIndex = addresses.findIndex((addr: Address) => addr.id === addressId);
    
    if (addressIndex === -1) {
      return res.status(404).json({ error: 'Address not found' });
    }

    const wasDefault = addresses[addressIndex].isDefault;
    
    // Remove the address
    addresses.splice(addressIndex, 1);

    // If the deleted address was default and there are remaining addresses,
    // make the first one default
    if (wasDefault && addresses.length > 0) {
      addresses[0].isDefault = true;
    }

    await db.collection('users').doc(userId).update({
      addresses: addresses,
      updatedAt: new Date().toISOString()
    });

    res.json({ message: 'Address deleted successfully' });

  } catch (error) {
    console.error('Address deletion error:', error);
    res.status(500).json({ error: 'Failed to delete address' });
  }
});

// Set default address
router.patch('/:addressId/default', authenticateToken, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user?.uid;
    const addressId = req.params.addressId;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    const addresses = userData?.addresses || [];

    const addressIndex = addresses.findIndex((addr: Address) => addr.id === addressId);
    
    if (addressIndex === -1) {
      return res.status(404).json({ error: 'Address not found' });
    }

    // Make all addresses non-default
    addresses.forEach((addr: Address) => {
      addr.isDefault = false;
    });

    // Set the selected address as default
    addresses[addressIndex].isDefault = true;

    await db.collection('users').doc(userId).update({
      addresses: addresses,
      updatedAt: new Date().toISOString()
    });

    res.json({
      message: 'Default address updated successfully',
      address: addresses[addressIndex]
    });

  } catch (error) {
    console.error('Default address update error:', error);
    res.status(500).json({ error: 'Failed to update default address' });
  }
});

export default router;
