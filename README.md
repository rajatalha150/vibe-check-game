# 🎭 Vibe Check Game

A social party game that combines meme culture with party game mechanics, allowing players to express creativity through viral content while competing for social validation.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd vibe-check-game
   ```

2. **Install dependencies:**
   ```bash
   npm install
   cd client && npm install && cd ..
   ```

3. **Start the development servers:**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on `http://localhost:3001`
   - React client on `http://localhost:3000`

## 🎮 How to Play

1. **Create or Join Game**: One player creates a game and shares the room code
2. **Lobby**: Wait for 2-8 players to join
3. **Response Phase**: Choose the perfect GIF/meme reaction to the scenario (60 seconds)
4. **Voting Phase**: Vote for the funniest response, except your own (45 seconds)
5. **Results**: See who got the most votes and current scores
6. **Repeat**: Play 3 rounds total, highest score wins!

## 🏗️ Project Structure

```
vibe-check-game/
├── server/                 # Node.js backend
│   └── index.js           # Socket.io server with game logic
├── client/                # React frontend
│   ├── public/
│   └── src/
│       ├── components/    # Game UI components
│       └── App.js         # Main application
├── package.json           # Root dependencies
└── README.md
```

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **Socket.io** for real-time multiplayer
- **UUID** for game ID generation

### Frontend
- **React** 18 with hooks
- **Emotion** for styled components
- **Framer Motion** for animations
- **Socket.io Client** for real-time communication

## 🎯 Game Features

### ✅ Implemented
- Real-time multiplayer (2-8 players)
- Game lobby with room codes
- Timed response and voting phases
- Scoring system with vote counting
- 3-round tournament structure
- Responsive UI with animations
- Player status tracking
- Game state synchronization

### 🔄 Phase System
- **Lobby**: Player joining and game setup
- **Response**: Players choose reactions to scenarios
- **Voting**: Players vote on best responses
- **Results**: Round scores and winner announcement

## 🎨 UI Components

- **HomeScreen**: Game creation and joining
- **GameLobby**: Player waiting room
- **GamePlay**: Scenario presentation and response selection
- **VotingScreen**: Response voting interface
- **ResultsScreen**: Score display and game completion

## 🚀 Development Commands

```bash
# Start both server and client
npm run dev

# Start server only
npm run server

# Start client only (from client directory)
cd client && npm start

# Build for production
npm run build
```

## 🎮 Game Content

### Sample Scenarios
- "When you see your ex at the grocery store"
- "Your boss says 'we need to talk'"
- "Group project and you did all the work"
- "When the WiFi goes down during an important video call"

### Response Library
- Curated GIF collection from Giphy
- Popular meme formats
- Reaction images with text overlays

## 🔧 Configuration

### Server Port
Default: `3001` (configurable via `PORT` environment variable)

### Client Proxy
Configured to proxy API requests to `http://localhost:3001`

## 🎯 Future Roadmap

### Short Term
- [ ] Mobile responsive improvements
- [ ] Sound effects and music
- [ ] Player avatars
- [ ] Custom scenarios

### Medium Term
- [ ] User accounts and profiles
- [ ] Battle pass system
- [ ] Tournament mode
- [ ] Social sharing

### Long Term
- [ ] Content moderation system
- [ ] Creator tools for user-generated content
- [ ] Cross-platform mobile apps
- [ ] AI-powered content suggestions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 🎉 Credits

Built with React, Node.js, and Socket.io. Inspired by party games like Cards Against Humanity and Jackbox Games.

---

**Ready to check your vibe?** 🎭✨