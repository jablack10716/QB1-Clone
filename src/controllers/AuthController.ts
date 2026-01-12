import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { UserRole } from '../types/enums';

/**
 * Auth Controller - handles login/authentication
 */
export class AuthController {
  /**
   * Show login page
   */
  static showLogin(req: Request, res: Response): void {
    res.render('auth/login', { 
      title: 'QB1 Clone - Login',
      error: req.query.error 
    });
  }
  
  /**
   * Handle login submission
   */
  static login(req: Request, res: Response): void {
    const { name, role } = req.body;
    
    // Validate input
    if (!name || !role) {
      return res.redirect('/?error=Please enter a name and select a role');
    }
    
    if (!Object.values(UserRole).includes(role)) {
      return res.redirect('/?error=Invalid role selected');
    }
    
    // Create or find user
    const user = UserModel.findOrCreate(name.trim(), role as UserRole);
    
    // Store user in session
    req.session.user = {
      id: user.id,
      name: user.name,
      role: user.role
    };
    
    // Redirect based on role
    if (role === UserRole.ADMIN) {
      res.redirect('/admin/games');
    } else {
      res.redirect('/games/join');
    }
  }
  
  /**
   * Handle logout
   */
  static logout(req: Request, res: Response): void {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
      res.redirect('/');
    });
  }
}
