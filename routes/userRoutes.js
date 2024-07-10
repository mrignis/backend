import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';  // Додано імпорти
import { getCurrentUser, updateUser, refreshTokens, logoutUser } from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Публічні ендпоінти
router.post('/register', registerUser);
router.post('/login', loginUser);

// Приватні ендпоінти, захищені authMiddleware
router.get('/current', authMiddleware, getCurrentUser);
router.put('/update', authMiddleware, updateUser);
router.post('/refresh-tokens', authMiddleware, refreshTokens);
router.post('/logout', authMiddleware, logoutUser);

export default router;
