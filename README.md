# 🏈 QB1 Clone - Play-by-Play Football Prediction Game

A home clone of the classic QB1 play-prediction game, designed for small groups watching live football games together. Players predict the outcome of each offensive play in real time while an admin manages the game flow. Track predictions, score plays, and compete on a live leaderboard!

## 📋 Features

- **Two-Role System**: Admin and Player roles with different capabilities
- **Real-Time Gameplay**: Predict plays as they happen during live games
- **Smart Scoring**: 
  - 100 points for exact predictions
  - 40 points for correct category (run vs pass)
  - 0 points for incorrect predictions
- **Live Leaderboard**: See who's winning in real-time
- **Mobile-Friendly**: Optimized for phones and tablets
- **Simple Setup**: Easy to run on a laptop at home

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (comes with Node.js)

### Installation

1. **Clone or navigate to the repository**
```bash
cd /workspaces/QB1-Clone
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` if you want to customize settings (optional for local development).

4. **Run database migrations**
```bash
npm run migrate
```

5. **Start the development server**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build

To build and run in production:

```bash
npm run build
npm start
```

## 🎮 How to Play

### For Admins

1. **Login** with your name and select "Admin" role
2. **Create a game** (e.g., "Bears vs Packers - Week 5")
3. For each play:
   - Create a **new play** with down, distance, and yard line information
   - Wait for players to submit predictions
   - **Lock predictions** before the snap
   - After the play, select the **actual outcome** to score the play
4. View the **leaderboard** to see standings

### For Players

1. **Login** with your name and select "Player" role
2. **Join a game** from the available games list
3. For each play:
   - View the current down and distance
   - **Submit your prediction** before it's locked
   - See your result and points earned after the play is scored
4. Check the **leaderboard** to see your ranking

## 📁 Project Structure

```
QB1-Clone/
├── src/
│   ├── controllers/       # Request handlers
│   │   ├── AdminController.ts
│   │   ├── AuthController.ts
│   │   └── PlayerController.ts
│   ├── database/          # Database setup and migrations
│   │   ├── connection.ts
│   │   └── migrate.ts
│   ├── models/            # Data models
│   │   ├── User.ts
│   │   ├── Game.ts
│   │   ├── Play.ts
│   │   └── Prediction.ts
│   ├── routes/            # Express routes
│   │   └── index.ts
│   ├── middleware/        # Custom middleware
│   │   └── auth.ts
│   ├── types/             # TypeScript types and enums
│   │   ├── enums.ts
│   │   └── models.ts
│   ├── utils/             # Utility functions
│   │   ├── scoring.ts
│   │   └── __tests__/
│   │       └── scoring.test.ts
│   ├── views/             # EJS templates
│   │   ├── layout.ejs
│   │   ├── auth/
│   │   ├── admin/
│   │   └── player/
│   └── server.ts          # Express server setup
├── public/                # Static assets
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
├── data/                  # SQLite database (created on first run)
├── dist/                  # Compiled JavaScript (created on build)
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## 🧪 Running Tests

The project includes automated tests for the scoring logic:

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch
```

## 🎯 Play Outcomes

### Run Plays
- Run - Short Left/Middle/Right
- Run - Long Left/Middle/Right

### Pass Plays
- Pass - Short Complete
- Pass - Long Complete
- Pass - Incomplete

### Other Outcomes
- Sack
- Interception
- Fumble
- Touchdown
- Penalty - Replay Down

## 📊 Database Schema

### Users
- `id`: Unique identifier
- `name`: Display name
- `role`: admin or player
- `created_at`: Timestamp

### Games
- `id`: Unique identifier
- `name`: Game name/description
- `status`: pending, live, or finished
- `created_at`: Timestamp

### Plays
- `id`: Unique identifier
- `game_id`: Foreign key to games
- `sequence_number`: Play number in game
- `quarter`: 1-4
- `down`: 1-4
- `distance`: Yards to first down
- `yard_line`: Field position
- `status`: open, locked, or scored
- `actual_outcome`: The actual play result
- `created_at`: Timestamp

### Predictions
- `id`: Unique identifier
- `play_id`: Foreign key to plays
- `user_id`: Foreign key to users
- `predicted_outcome`: Player's prediction
- `points_awarded`: Points earned (0, 40, or 100)
- `created_at`: Timestamp

## 🔧 Configuration

Environment variables (in `.env`):

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `SESSION_SECRET`: Secret for session encryption
- `DATABASE_PATH`: Path to SQLite database file

## 📱 Mobile Optimization

The application is optimized for mobile devices:
- Responsive design that adapts to screen size
- Touch-friendly buttons (minimum 48px height)
- Simple polling for updates (auto-refresh every 5 seconds)
- Single-column layout on narrow screens
- Large, clearly labeled interactive elements

## 🔮 Future Enhancements

Ideas for future versions (not implemented in MVP):

- **WebSocket Support**: Real-time updates without polling
- **More Outcomes**: Add safeties, kneel-downs, two-point conversions
- **Player Stats**: Track performance across multiple games
- **Multiple Games**: Support for concurrent games
- **Enhanced Scoring**: Variable points based on outcome rarity
- **Game Archives**: Browse and review past games
- **Player Profiles**: Persistent stats and achievements

## 🛠️ Technology Stack

- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite (easily migrated to PostgreSQL)
- **Views**: EJS templates
- **Styling**: Custom CSS with mobile-first design
- **Session Management**: express-session
- **Testing**: Jest + ts-jest

## 📝 Development Notes

This project is designed to be:
- **Beginner-Friendly**: Clear code structure with comments
- **AI-Pair-Programmer Ready**: Well-documented for AI assistance
- **Maintainable**: Follows MVC pattern with separation of concerns
- **Extensible**: Easy to add new features and outcomes
- **Testable**: Includes test suite with examples

## 🤝 Contributing

This is a home project for personal use. Feel free to fork and customize for your own use!

## 📄 License

MIT License - Feel free to use and modify as needed.

## 🎉 Enjoy the Game!

Have fun predicting plays with your friends and family during the big game! 🏈
