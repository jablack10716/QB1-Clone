import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import path from 'path';
import dotenv from 'dotenv';
import { runMigrations } from './database/migrate';
import routes from './routes';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'qb1-clone-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}));

// Custom middleware to make user available in all templates
app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.user = req.session.user || null;
  next();
});

// Custom view rendering with layout support
app.use((req: Request, res: Response, next: NextFunction) => {
  const originalRender = res.render.bind(res);
  res.render = (view: string, options?: any, callback?: (err: Error, html: string) => void) => {
    // Check if this is a view that should use layout
    if (view !== 'layout' && !view.includes('layout')) {
      // Render the view first
      originalRender(view, options, (err: Error | null, html: string) => {
        if (err) {
          if (callback) {
            callback(err, '');
          } else {
            next(err);
          }
          return;
        }
        
        // Then render it within the layout
        originalRender('layout', { 
          ...options, 
          body: html,
          title: options?.title || 'QB1 Clone'
        }, callback);
      });
    } else {
      // Render without layout (for error cases or if explicitly set)
      originalRender(view, options, callback);
    }
  };
  next();
});

// Routes
app.use('/', routes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).render('error', {
    title: '404 - Page Not Found',
    message: 'The page you are looking for does not exist.',
    user: req.session.user
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).render('error', {
    title: 'Server Error',
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'An unexpected error occurred. Please try again.',
    user: req.session.user
  });
});

// Run database migrations before starting the server
console.log('Initializing database...');
try {
  runMigrations();
  console.log('Database initialized successfully!');
} catch (error) {
  console.error('Failed to initialize database:', error);
  process.exit(1);
}

// Start server
app.listen(PORT, () => {
  console.log(`\n🏈 QB1 Clone is running!`);
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`🎮 Ready to play!\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});
