import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/enums';

/**
 * Middleware to check if user is authenticated
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.session.user) {
    return res.redirect('/?error=Please login first');
  }
  next();
}

/**
 * Middleware to check if user is an admin
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.session.user || req.session.user.role !== UserRole.ADMIN) {
    return res.status(403).render('error', {
      title: 'Access Denied',
      message: 'You must be an admin to access this page.',
      user: req.session.user
    });
  }
  next();
}

/**
 * Middleware to check if user is a player
 */
export function requirePlayer(req: Request, res: Response, next: NextFunction): void {
  if (!req.session.user || req.session.user.role !== UserRole.PLAYER) {
    return res.status(403).render('error', {
      title: 'Access Denied',
      message: 'You must be a player to access this page.',
      user: req.session.user
    });
  }
  next();
}
