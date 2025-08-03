# Vibe Check Game - Complete Architecture Documentation

## Overview

Vibe Check is a real-time multiplayer social party game that combines meme culture with party game mechanics. Players react to relatable scenarios using GIFs and memes, then vote for the funniest responses. The game is built with a React frontend and Node.js backend using Socket.IO for real-time communication.

## System Architecture

### High-Level Architecture

```
┌─────────────────┐     WebSocket/HTTP     ┌─────────────────┐
│                 │ ◄──────────────────── ► │                 │
│   React Client  │                        │  Node.js Server │
│                 │                        │                 │
└─────────────────┘                        └─────────────────┘
        │                                           │
        │                                           │
        ▼                                           ▼
┌─────────────────┐                     ┌─────────────────┐
│  UI Components  │                     │  Game Engine    │
│  State Management│                     │  Socket Manager │
│  Socket Client  │                     │  Data Models    │
└─────────────────┘                     └─────────────────┘
```

## Project Structure

```
vibe-check-game/
├── client/                 # React frontend application
│   ├── public/
│   │   └── index.html     # Main HTML template
│   ├── src/
│   │   ├── App.js         # Main application component & socket management
│   │   ├── index.js       # React DOM render entry point
│   │   └── components/    # UI Components
│   │       ├── HomeScreen.js      # Landing page & game creation/joining
│   │       ├── GameLobby.js       # Pre-game lobby with players
│   │       ├── GamePlay.js        # Response selection phase
│   │       ├── VotingScreen.js    # Voting phase
│   │       └── ResultsScreen.js   # Round/game results display
│   └── package.json       # Client dependencies & scripts
├── server/
│   └── index.js          # Complete backend server with game logic
├── package.json          # Root package with development scripts
└── README.md            # Project overview and setup
```

## Backend Architecture (server/index.js)

### Core Technologies
- **Express.js**: HTTP server framework
- **Socket.IO**: Real-time bidirectional communication
- **UUID**: Unique game ID generation
- **CORS**: Cross-origin resource sharing

### Data Models

#### Game Class
```javascript
class Game {
    id: string              // 6-character uppercase game code
    hostId: string          // Socket ID of game creator
    players: Map            // Player data (id, name, ready status)
    phase: string           // Current game phase
    currentScenario: string // Active scenario text
    responses: Map          // Player responses (playerId -> responseId)
    votes: Map              // Player votes (voterId -> targetPlayerId)
    round: number           // Current round (1-3)
    maxRounds: number       // Total rounds per game (3)
    scores: Map             // Player scores (playerId -> score)
}
```

#### Game Phases
```javascript
GAME_PHASES = {
    LOBBY: 'lobby',         // Pre-game waiting room
    RESPONSE: 'response',   // Players select reactions (60s)
    VOTING: 'voting',       // Players vote for best response (45s)
    RESULTS: 'results'      // Show round results (3s)
}
```

### Static Game Data

#### Scenarios (8 total)
Relatable life situations that players react to:
- "When you see your ex at the grocery store"
- "Your boss says 'we need to talk'"
- "Group project and you did all the work"
- "When the WiFi goes down during an important video call"
- "Trying to look busy when your manager walks by"
- "When someone asks what you do for fun"
- "Your food delivery arrives 2 hours late"
- "When you realize you've been on mute the whole meeting"

#### Responses (6 total)
Pre-defined GIF reactions with Giphy URLs:
- "This is fine" (burning dog meme)
- "Eye roll" 
- "Awkward"
- "Nope"
- "Drama"
- "Confused"

### Socket Event Handlers

#### Connection Management
- `connection`: New player connects, initialize socket
- `disconnect`: Player leaves, cleanup game state

#### Game Lifecycle
- `createGame`: Create new game, generate room code, join as host
- `joinGame`: Join existing game with room code
- `startGame`: Host starts game (min 2 players, max 8)

#### Gameplay Events
- `submitResponse`: Player selects reaction during response phase
- `submitVote`: Player votes for best response during voting phase
- `getResponses`: Client requests available response options

### Game Flow & Timing

#### Phase Transitions
1. **LOBBY** → **RESPONSE** (Host starts)
2. **RESPONSE** → **VOTING** (60 seconds auto-transition)
3. **VOTING** → **RESULTS** (45 seconds auto-transition)
4. **RESULTS** → **RESPONSE** (3 seconds, next round) OR **END** (final round)

#### Automatic Progression
```javascript
startGame() {
    // 60 seconds for responses
    setTimeout(() => {
        phase = VOTING
        // 45 seconds for voting
        setTimeout(() => {
            calculateResults()
            // 3 seconds to show results
            setTimeout(() => {
                if (hasMoreRounds) nextRound()
                else endGame()
            }, 3000)
        }, 45000)
    }, 60000)
}
```

### Data Storage
- **In-Memory Storage**: All game data stored in memory using Maps
- **games**: Map of gameId → Game instances
- **players**: Map of socketId → player metadata

## Frontend Architecture (client/)

### Core Technologies
- **React 18**: Component-based UI framework
- **Socket.IO Client**: Real-time server communication
- **Emotion/Styled**: CSS-in-JS styling
- **Framer Motion**: Animation library

### Main Application Component (App.js)

#### State Management
```javascript
const [socket, setSocket] = useState(null)           // Socket connection
const [gameState, setGameState] = useState(null)     // Current game data
const [currentPhase, setCurrentPhase] = useState(HOME) // UI phase
const [playerName, setPlayerName] = useState('')     // Player identity
const [gameId, setGameId] = useState('')            // Room code
const [error, setError] = useState('')              // Error messages
const [responses, setResponses] = useState([])       // Available reactions
const [currentScenario, setCurrentScenario] = useState('') // Active scenario
```

#### Socket Event Listeners
- `gameCreated`: Game created successfully, enter lobby
- `gameUpdated`: Game state changed, update UI
- `phaseChanged`: Game phase transition with new data
- `roundResults`: Round completed, show results
- `gameEnded`: Game finished, show final scores
- `responsesData`: Receive available response options
- `error`: Handle server-side errors

#### Phase-Based Rendering
```javascript
const renderCurrentScreen = () => {
    switch (currentPhase) {
        case HOME: return <HomeScreen />
        case LOBBY: return <GameLobby />
        case RESPONSE: return <GamePlay />
        case VOTING: return <VotingScreen />
        case RESULTS/ENDED: return <ResultsScreen />
    }
}
```

### UI Components

#### HomeScreen.js
**Purpose**: Landing page, game creation/joining
**Features**:
- Player name input
- Create new game button
- Join existing game with room code
- Toggle between create/join modes
- Error display

#### GameLobby.js
**Purpose**: Pre-game waiting room
**Features**:
- Display 6-character room code
- Show connected players (up to 8)
- Game rules explanation
- Host controls (start game)
- Player status indicators
- Leave game option

#### GamePlay.js
**Purpose**: Response selection phase (60 seconds)
**Features**:
- Display current scenario
- Show round info (1/3, 2/3, 3/3)
- 60-second countdown timer
- Grid of 6 response options (GIFs)
- Response selection with visual feedback
- Player status tracking (who has responded)
- Auto-disable after submission

#### VotingScreen.js
**Purpose**: Voting phase (45 seconds)
**Features**:
- Display all player responses
- Show GIF + player name for each response
- 45-second countdown timer
- Disable voting for own response
- Vote submission with confirmation
- Player voting status tracking

#### ResultsScreen.js
**Purpose**: Round/game results display
**Features**:
- Podium-style ranking (1st, 2nd, 3rd places)
- Score display with vote counts
- Confetti animation for game end
- Winner announcement
- Social sharing functionality
- Navigation (play again/home)

### Styling System

#### Emotion/Styled Components
- **Consistent Design Language**: Purple gradient theme (#667eea to #764ba2)
- **Responsive Design**: CSS Grid and Flexbox layouts
- **Component-Based Styling**: Each component has dedicated styled components
- **Interactive Elements**: Hover and tap animations
- **Accessibility**: Color contrast and focus states

#### Framer Motion Animations
- **Page Transitions**: Fade and slide animations between screens
- **Loading States**: Scale and opacity transitions
- **Interactive Feedback**: Button press animations
- **Confetti Effect**: Particle animation on game completion
- **Staggered Lists**: Progressive item animations

## Communication Patterns

### Real-Time Data Flow

#### Client to Server Events
```javascript
// Game Management
socket.emit('createGame', playerName)
socket.emit('joinGame', { gameId, playerName })
socket.emit('startGame')

// Gameplay
socket.emit('submitResponse', responseId)
socket.emit('submitVote', targetPlayerId)
socket.emit('getResponses')
```

#### Server to Client Events
```javascript
// Game Updates
socket.emit('gameCreated', { gameId, game })
socket.emit('gameUpdated', gameState)
socket.emit('phaseChanged', { phase, scenario })

// Results
socket.emit('roundResults', results)
socket.emit('gameEnded', finalScores)
socket.emit('responsesData', responses)

// Error Handling
socket.emit('error', { message })
```

### State Synchronization

#### Game State Broadcasting
- **Room-Based**: All game updates broadcast to all players in room
- **Event-Driven**: State changes trigger immediate updates
- **Optimistic Updates**: Client updates UI immediately, server confirms

#### Connection Management
- **Automatic Reconnection**: Socket.IO handles connection drops
- **Player Cleanup**: Disconnect handler removes players from games
- **Game Cleanup**: Empty games automatically deleted

## Game Logic & Rules

### Game Flow
1. **Game Creation**: Host creates game, receives 6-character code
2. **Player Joining**: Up to 8 players join using room code
3. **Game Start**: Host starts when 2+ players ready
4. **Round Play**: 3 rounds of Response → Voting → Results
5. **Scoring**: Players earn points based on votes received
6. **Winner**: Player with most total votes wins

### Scoring System
- **Vote-Based**: Players earn 1 point per vote received
- **No Self-Voting**: Players cannot vote for their own responses
- **Cumulative**: Scores accumulate across all 3 rounds
- **Tie-Breaking**: First player to reach tied score wins

### Validation Rules
- **Minimum Players**: 2 players required to start
- **Maximum Players**: 8 players maximum per game
- **Response Timeout**: 60 seconds to select response
- **Voting Timeout**: 45 seconds to submit vote
- **Anti-Cheat**: Server validates all player actions

## Technical Specifications

### Performance Considerations
- **Memory Management**: In-memory game storage (suitable for moderate concurrent games)
- **Real-Time Updates**: Socket.IO ensures low-latency communication
- **Client-Side Optimization**: React state management minimizes re-renders
- **Asset Loading**: GIFs loaded from external CDN (Giphy)

### Scalability Limitations
- **Single Server**: No clustering or load balancing
- **Memory Storage**: Games lost on server restart
- **No Persistence**: No database integration
- **CDN Dependency**: Relies on external Giphy URLs

### Browser Compatibility
- **Modern Browsers**: Requires ES6+ support
- **Mobile Responsive**: Touch-friendly interface
- **WebSocket Support**: Required for real-time features
- **Local Storage**: None used (stateless client)

## Development & Deployment

### Development Setup
```bash
# Install dependencies
npm install
cd client && npm install

# Development mode (concurrent client & server)
npm run dev

# Production build
npm run build
npm start
```

### Environment Configuration
- **Development**: Client runs on :3000, Server on :3001
- **CORS**: Configured for localhost development
- **Socket.IO**: Auto-detects connection protocol
- **Port Configuration**: SERVER_PORT env variable supported

### Deployment Considerations
- **Static Hosting**: Client build can be deployed to CDN
- **Server Hosting**: Node.js server requires persistent connection
- **Environment Variables**: PORT configuration for production
- **SSL/HTTPS**: Required for production Socket.IO connections

## Security Considerations

### Input Validation
- **Player Names**: 20 character limit, trimmed input
- **Game Codes**: 6 character alphanumeric, uppercase
- **Response Selection**: Validated against available options
- **Vote Validation**: Prevents self-voting and duplicate votes

### Data Protection
- **No Authentication**: No user accounts or personal data stored
- **Temporary Sessions**: All data cleared on disconnect
- **Rate Limiting**: None implemented (potential DoS vulnerability)
- **Input Sanitization**: Basic validation only

## Future Enhancement Opportunities

### Technical Improvements
- **Database Integration**: Persistent game storage
- **User Authentication**: Player accounts and statistics
- **Clustering**: Multi-server deployment
- **Caching**: Redis for session management
- **API Rate Limiting**: Prevent abuse

### Feature Enhancements
- **Custom Scenarios**: User-generated content
- **Custom GIFs**: Upload custom reactions
- **Spectator Mode**: Watch games without playing
- **Tournament Mode**: Bracket-style competitions
- **Chat System**: Text communication during games
- **Game Replay**: Review past games
- **Leaderboards**: Global player rankings

### Mobile Improvements
- **PWA Support**: Installable web app
- **Offline Mode**: Cached gameplay
- **Push Notifications**: Game status updates
- **Native Apps**: iOS/Android development

This architecture provides a solid foundation for a real-time multiplayer party game while maintaining simplicity and extensibility for future enhancements.