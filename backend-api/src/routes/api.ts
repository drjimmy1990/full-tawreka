import { Router } from 'express';
// Import the new controller
import { checkCoverage, getAvailableZones } from '../controllers/geoController';
import { createOrder, getOrder, updateOrderStatus, requestModification } from '../controllers/orderController';
import { getBranchMenu, getSiteSettings } from '../controllers/menuController';
import { verifyApiKey } from '../middleware/auth';

const router = Router();

// ==========================================
// 🔐 PROTECTED ROUTES (Bots / Admin / n8n)
// Requires 'x-api-key'
// ==========================================
router.post('/orders', verifyApiKey, createOrder); // Creating order directly via API
router.patch('/orders/:id', verifyApiKey, updateOrderStatus);
router.post('/orders/:id/modify', verifyApiKey, requestModification);
router.patch('/orders/:id/status', verifyApiKey, updateOrderStatus);


// ==========================================
// 🌍 PUBLIC ROUTES (Consumer Website)
// No Key Required (Protected by CORS in index.ts)
// ==========================================

// 1. Branding & Settings
router.get('/settings', getSiteSettings);

// 2. Location Logic
router.post('/geo/check-coverage', checkCoverage); // <--- Moved to Public
router.get('/geo/zones', getAvailableZones);       // <--- NEW

// 3. Menu & Tracking
router.get('/branches/:id/menu', getBranchMenu);
router.get('/orders/:id', getOrder); // "Track my Order" should be public (with UUID usually, but ID ok for now)

export default router;