# 🏈 QB1 Clone - Play-by-Play Football Prediction Game

A home clone of the classic QB1 play-prediction game, designed for small groups watching live football games together. Players predict the outcome of each offensive play in real time while an admin manages the game flow. Track predictions, score plays, and compete on a live leaderboard!

## 📋 Features

- **Two-Role System**: Admin and Player roles with different capabilities
- **Real-Time Gameplay**: Predict plays as they happen during live games with automatic page refresh
- **Interactive Button UI**: Select play outcomes using intuitive button interface
- **Game Breaker Power-Up**: Use once per drive (resets at 1st down) to multiply your points for a single play
- **Flexible Predictions**: 
  - RUN plays: Select direction (LEFT, CENTER, RIGHT)
  - PASS plays: Select any combination of depth (BACK, SHORT, LONG) and/or direction (LEFT, CENTER, RIGHT)
- **Auto-Save Predictions**: Predictions are saved automatically without requiring a submit button
- **Prediction Lockout**: Buttons disable after prediction is submitted to prevent changes
- **Smart Scoring**: 
  - 100 points for exact predictions
  - 40 points for correct category (run vs pass)
  - 0 points for incorrect predictions
- **Score Popup Modal**: Players see their score immediately after play is scored with animated popup
- **Play History Editing**: Admins can edit previously scored plays and automatically recalculate all affected scores
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
   - Create a **new play** with quarter and down information
   - Wait for players to submit predictions
   - **Lock predictions** when the snap occurs
   - Select the **actual outcome** using interactive buttons to score the play:
     - **RUN**: Select direction (LEFT, CENTER, RIGHT)
     - **PASS**: Select depth (BACK, SHORT, LONG) and/or direction (LEFT, CENTER, RIGHT)
   - **View play history**: See all plays and their results
   - **Edit scored plays**: Change the outcome of a previous play - all prediction scores recalculate automatically
4. View the **leaderboard** to see standings

### For Players

1. **Login** with your name and select "Player" role
2. **Join a game** from the available games list
3. For each play:
   - View the current down and quarter
   - **Submit your prediction** by selecting play type, then options:
     - **RUN**: Pick one direction (LEFT, CENTER, or RIGHT)
     - **PASS**: Pick any combination of depth and/or direction (at least one required)
   - Once submitted, your prediction is automatically saved and buttons disable to prevent changes
   - See your result and points earned in a popup after the play is scored
   - **Use Game Breaker wisely**: You have one Game Breaker per drive (resets when 1st down is achieved). Click the ⚡ button to activate for extra points on that play.
4. Check the **leaderboard** to see your ranking

## ⚡ Game Breaker Feature

The **Game Breaker** is a power-up that allows you to multiply your points for a single play:

- **When to use it**: Available once per drive (resets at 1st down)
- **How to activate**: Click the ⚡ GAME BREAKER button before submitting your prediction
- **Effect**: When activated, your points for that play will be multiplied
- **Strategy**: Save it for plays where you're most confident in your prediction!
- **Visual Feedback**: The button glows green when activated and shows "⚡ ACTIVATED ⚡"

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
Players predict the direction of the run:
- **LEFT** - Run goes to the left side
- **CENTER** - Run up the middle
- **RIGHT** - Run goes to the right side

### Pass Plays
Players can select any combination of depth and/or direction:

**Depth options:**
- **BACK** - Screen pass or checkdown
- **SHORT** - Short passing route
- **LONG** - Deep passing route

**Direction options:**
- **LEFT** - Pass goes to the left side
- **CENTER** - Pass goes up the middle
- **RIGHT** - Pass goes to the right side

**Examples of valid predictions:**
- `PASS_BACK` (screen pass, any direction)
- `PASS_LEFT` (pass to left side, any depth)
- `PASS_SHORT_CENTER` (short pass up the middle)
- `PASS_LONG_RIGHT` (deep pass to the right)
- `PASS_BACK_LEFT` (screen pass to the left)

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
- `distance`: Yards to first down (may be 0 in simplified version)
- `yard_line`: Field position (optional)
- `status`: open, locked, or scored
- `actual_outcome`: The actual play result
- `created_at`: Timestamp

### Predictions
- `id`: Unique identifier
- `play_id`: Foreign key to plays
- `user_id`: Foreign key to users
- `predicted_outcome`: Player's prediction
- `game_breaker`: Boolean flag (1/0) indicating if Game Breaker was used
- `points_awarded`: Points earned (0, 40, or 100; will be multiplied if game_breaker was used)
- `created_at`: Timestamp
- `updated_at`: Timestamp

## 🔧 Configuration

Environment variables (in `.env`):

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `SESSION_SECRET`: Secret for session encryption
- `DATABASE_PATH`: Path to SQLite database file

## 🐛 Debugging & Logging

The application includes comprehensive logging to help debug issues:

**Server Console Logs:**
- `[Admin] Scoring play X with outcome: Y` - When admin scores a play
- `Play X updated to status: scored, outcome: Y` - Confirmation of database update
- `Found N predictions for play X` - How many predictions were scored
- `[Player] Current play for game X: ID=Y, status=Z` - Player view state tracking
- `[Player] User X prediction: outcome, points=Y` - Player prediction details

**Browser Console:**
- Modal display logs: `Displaying score modal for play X - points: Y`
- Auto-refresh calculations

These logs help verify that:
1. Admin scoring requests are being processed
2. Database updates are succeeding
3. Player screens are fetching correct data
4. Predictions are being scored correctly

## 📱 Mobile Optimization

The application is optimized for mobile devices:
- **Interactive Button UI**: All predictions made with easy-to-tap buttons instead of dropdowns
- **Auto-Save Predictions**: Predictions save automatically on selection without page reload
- **Button State Management**: Buttons disable after save to prevent accidental changes
- **Disabled Button Styling**: Clear visual feedback (grayed out) for disabled buttons
- **Auto-Refresh Logic**: Smart refresh that adapts to play status (2s for locked/scored, 3s for open)
- **Score Modal Popup**: Animated popup shows your score and results immediately
- **Single-Column Layout**: Vertical button groups on narrow screens
- **Clear Prediction States**: Visual indicators showing:
  - Pending selection: Light gray buttons
  - Selected: Blue highlighting
  - Saved: Green checkmark with confirmation message
  - Game Breaker active: Green glowing button with animation
- **Responsive Design**: Adapts perfectly to screen size

## 🔮 Future Enhancements

Ideas for future versions (not yet implemented):

- **Game Breaker Scoring Multiplier**: Currently Game Breaker flag is tracked, multiplier implementation pending
- **WebSocket Support**: Real-time updates without polling
- **Additional Outcomes**: Safeties, kneel-downs, two-point conversions, pass completions, incompletions
- **More Granular Depth Options**: Add SCREEN, INTERMEDIATE categories
- **Player Stats**: Track performance across multiple games
- **Multiple Concurrent Games**: Admin dashboard to manage many games at once
- **Enhanced Scoring**: Variable points based on outcome rarity or difficulty
- **Game Archives**: Browse and review past games
- **Player Profiles**: Persistent stats and achievements across games
- **Admin Dashboard**: Comprehensive view of all games and player statistics
- **Network Mode**: Support for multiple devices (currently single-machine friendly)

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
