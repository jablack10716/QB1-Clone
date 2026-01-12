import express from 'express';
import { AuthController } from '../controllers/AuthController';
import { AdminController } from '../controllers/AdminController';
import { PlayerController } from '../controllers/PlayerController';
import { requireAuth, requireAdmin, requirePlayer } from '../middleware/auth';

const router = express.Router();

// Auth routes
router.get('/', AuthController.showLogin);
router.post('/login', AuthController.login);
router.get('/logout', AuthController.logout);

// Admin routes
router.get('/admin/games', requireAuth, requireAdmin, AdminController.listGames);
router.post('/admin/games', requireAuth, requireAdmin, AdminController.createGame);
router.get('/admin/games/:id', requireAuth, requireAdmin, AdminController.showGameConsole);
router.post('/admin/games/:id/plays', requireAuth, requireAdmin, AdminController.createPlay);
router.post('/admin/games/:id/plays/:playId/lock', requireAuth, requireAdmin, AdminController.lockPlay);
router.post('/admin/games/:id/plays/:playId/score', requireAuth, requireAdmin, AdminController.scorePlay);
router.post('/admin/games/:id/status', requireAuth, requireAdmin, AdminController.updateGameStatus);

// Player routes
router.get('/games/join', requireAuth, requirePlayer, PlayerController.showJoinGame);
router.get('/games/:id/play', requireAuth, requirePlayer, PlayerController.showPlayScreen);
router.post('/games/:id/plays/:playId/predict', requireAuth, requirePlayer, PlayerController.submitPrediction);
router.get('/games/:id/leaderboard', requireAuth, PlayerController.showLeaderboard);

// API routes for polling
router.get('/api/games/:id/play-status', requireAuth, requirePlayer, PlayerController.getPlayStatus);

export default router;
