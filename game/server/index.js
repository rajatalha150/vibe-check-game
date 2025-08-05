const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const games = new Map();
const players = new Map();

const GAME_PHASES = {
  LOBBY: 'lobby',
  RESPONSE: 'response',
  VOTING: 'voting',
  RESULTS: 'results'
};

const scenarios = [
  "When you see your ex at the grocery store",
  "Your boss says 'we need to talk'",
  "Group project and you did all the work",
  "When the WiFi goes down during an important video call",
  "Trying to look busy when your manager walks by",
  "When someone asks what you do for fun",
  "Your food delivery arrives 2 hours late",
  "When you realize you've been on mute the whole meeting"
];

const responses = [
  { id: 1, type: 'gif', url: 'https://media.giphy.com/media/3o7TKTDn976rzVgky4/giphy.gif', text: 'This is fine' },
  { id: 2, type: 'gif', url: 'https://media.giphy.com/media/13d2jHlSlxklVe/giphy.gif', text: 'Eye roll' },
  { id: 3, type: 'gif', url: 'https://media.giphy.com/media/1X7lCRp8iE0yrdZvwd/giphy.gif', text: 'Awkward' },
  { id: 4, type: 'gif', url: 'https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif', text: 'Nope' },
  { id: 5, type: 'gif', url: 'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif', text: 'Drama' },
  { id: 6, type: 'gif', url: 'https://media.giphy.com/media/3oz8xLd9DJq2l2VFtu/giphy.gif', text: 'Confused' },
  { id: 7, type: 'gif', url: 'https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif', text: 'Nope' },
  { id: 8, type: 'gif', url: 'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif', text: 'Drama' },
  { id: 9, type: 'gif', url: 'https://media.giphy.com/media/3oz8xLd9DJq2l2VFtu/giphy.gif', text: 'Confused' },
  { id: 10, type: 'gif', url: 'https://media.giphy.com/media/3o7TKTDn976rzVgky4/giphy.gif', text: 'This is fine' },
  { id: 11, type: 'gif', url: 'https://media.giphy.com/media/13d2jHlSlxklVe/giphy.gif', text: 'Eye roll' },
  { id: 12, type: 'gif', url: 'https://media.giphy.com/media/1X7lCRp8iE0yrdZvwd/giphy.gif', text: 'Awkward' }
];

const powerUps = [
  { id: 'double_points', name: 'Double Points', description: 'Double your points for this round.' },
  { id: 'anonymous_response', name: 'Anonymous Response', description: 'Submit your response anonymously.' }
];

class Game {
  constructor(id, hostId) {
    this.id = id;
    this.hostId = hostId;
    this.players = new Map();
    this.phase = GAME_PHASES.LOBBY;
    this.currentScenario = null;
    this.responses = new Map();
    this.votes = new Map();
    this.round = 0;
    this.maxRounds = 3;
    this.scores = new Map();
    this.powerUps = new Map();
  }

  addPlayer(playerId, playerName) {
    this.players.set(playerId, {
      id: playerId,
      name: playerName,
      ready: false
    });
    this.scores.set(playerId, 0);
  }

  removePlayer(playerId) {
    this.players.delete(playerId);
    this.scores.delete(playerId);
    this.responses.delete(playerId);
    this.votes.delete(playerId);
    this.powerUps.delete(playerId);
  }

  assignPowerUps() {
    for (const playerId of this.players.keys()) {
      const randomPowerUp = powerUps[Math.floor(Math.random() * powerUps.length)];
      this.powerUps.set(playerId, { ...randomPowerUp, used: false });
    }
  }

  usePowerUp(playerId, powerUpId) {
    const powerUp = this.powerUps.get(playerId);
    if (powerUp && powerUp.id === powerUpId && !powerUp.used) {
      powerUp.used = true;
      this.powerUps.set(playerId, powerUp);
      return true;
    }
    return false;
  }

  startGame() {
    if (this.players.size < 2) return false;
    this.phase = GAME_PHASES.RESPONSE;
    this.round = 1;
    this.currentScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    this.assignPowerUps();
    return true;
  }

  submitResponse(playerId, responseId) {
    this.responses.set(playerId, responseId);
  }

  submitVote(voterId, targetPlayerId) {
    if (voterId === targetPlayerId) return false;
    this.votes.set(voterId, targetPlayerId);
    return true;
  }

  calculateResults() {
    const voteCount = new Map();
    
    for (const [voter, target] of this.votes) {
      voteCount.set(target, (voteCount.get(target) || 0) + 1);
    }

    for (const [playerId, votes] of voteCount) {
      let roundScore = votes;
      const powerUp = this.powerUps.get(playerId);
      if (powerUp && powerUp.id === 'double_points' && powerUp.used) {
        roundScore *= 2;
      }
      const currentScore = this.scores.get(playerId) || 0;
      this.scores.set(playerId, currentScore + roundScore);
    }

    return Array.from(voteCount.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([playerId, votes]) => ({
        playerId,
        playerName: this.players.get(playerId)?.name,
        votes,
        totalScore: this.scores.get(playerId)
      }));
  }

  nextRound() {
    this.responses.clear();
    this.votes.clear();
    this.powerUps.clear();
    
    if (this.round < this.maxRounds) {
      this.round++;
      this.phase = GAME_PHASES.RESPONSE;
      this.currentScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
      this.assignPowerUps();
      return true;
    } else {
      this.phase = GAME_PHASES.RESULTS;
      return false;
    }
  }

  getGameState() {
    return {
      id: this.id,
      phase: this.phase,
      round: this.round,
      maxRounds: this.maxRounds,
      currentScenario: this.currentScenario,
      players: Array.from(this.players.values()).map(p => ({ ...p, powerUp: this.powerUps.get(p.id) })),
      scores: Object.fromEntries(this.scores),
      hasResponded: Array.from(this.responses.keys()),
      hasVoted: Array.from(this.votes.keys()),
      responses: this.phase === GAME_PHASES.VOTING ? 
        Array.from(this.responses.entries()).map(([playerId, responseId]) => {
          const powerUp = this.powerUps.get(playerId);
          const isAnonymous = powerUp && powerUp.id === 'anonymous_response' && powerUp.used;
          return {
            playerId,
            playerName: isAnonymous ? 'Anonymous' : this.players.get(playerId)?.name,
            response: responses.find(r => r.id === responseId)
          };
        }) : []
    };
  }
}

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('createGame', (playerName) => {
    const gameId = uuidv4().substring(0, 6).toUpperCase();
    const game = new Game(gameId, socket.id);
    game.addPlayer(socket.id, playerName);
    
    games.set(gameId, game);
    players.set(socket.id, { gameId, playerName });
    
    socket.join(gameId);
    socket.emit('gameCreated', { gameId, game: game.getGameState() });
    
    console.log(`Game ${gameId} created by ${playerName}`);
  });

  socket.on('joinGame', ({ gameId, playerName }) => {
    const game = games.get(gameId);
    
    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }
    
    if (game.phase !== GAME_PHASES.LOBBY) {
      socket.emit('error', { message: 'Game already in progress' });
      return;
    }
    
    if (game.players.size >= 8) {
      socket.emit('error', { message: 'Game is full' });
      return;
    }
    
    game.addPlayer(socket.id, playerName);
    players.set(socket.id, { gameId, playerName });
    
    socket.join(gameId);
    io.to(gameId).emit('gameUpdated', game.getGameState());
    
    console.log(`${playerName} joined game ${gameId}`);
  });

  socket.on('startGame', () => {
    const playerData = players.get(socket.id);
    if (!playerData) return;
    
    const game = games.get(playerData.gameId);
    if (!game || game.hostId !== socket.id) return;
    
    if (game.startGame()) {
      io.to(playerData.gameId).emit('gameUpdated', game.getGameState());
      io.to(playerData.gameId).emit('phaseChanged', { phase: GAME_PHASES.RESPONSE, scenario: game.currentScenario });
      
      setTimeout(() => {
        game.phase = GAME_PHASES.VOTING;
        io.to(playerData.gameId).emit('gameUpdated', game.getGameState());
        io.to(playerData.gameId).emit('phaseChanged', { phase: GAME_PHASES.VOTING });
        
        setTimeout(() => {
          const results = game.calculateResults();
          io.to(playerData.gameId).emit('roundResults', results);
          
          setTimeout(() => {
            if (game.nextRound()) {
              io.to(playerData.gameId).emit('gameUpdated', game.getGameState());
              io.to(playerData.gameId).emit('phaseChanged', { phase: GAME_PHASES.RESPONSE, scenario: game.currentScenario });
            } else {
              const finalScores = Array.from(game.scores.entries())
                .sort((a, b) => b[1] - a[1])
                .map(([playerId, score]) => ({
                  playerId,
                  playerName: game.players.get(playerId)?.name,
                  score
                }));
              io.to(playerData.gameId).emit('gameEnded', finalScores);
            }
          }, 3000);
        }, 45000);
      }, 60000);
    }
  });

  socket.on('usePowerUp', (powerUpId) => {
    const playerData = players.get(socket.id);
    if (!playerData) return;

    const game = games.get(playerData.gameId);
    if (!game) return;

    if (game.usePowerUp(socket.id, powerUpId)) {
      io.to(playerData.gameId).emit('gameUpdated', game.getGameState());
    }
  });

  socket.on('submitResponse', (responseId) => {
    const playerData = players.get(socket.id);
    if (!playerData) return;
    
    const game = games.get(playerData.gameId);
    if (!game || game.phase !== GAME_PHASES.RESPONSE) return;
    
    game.submitResponse(socket.id, responseId);
    io.to(playerData.gameId).emit('gameUpdated', game.getGameState());
  });

  socket.on('submitVote', (targetPlayerId) => {
    const playerData = players.get(socket.id);
    if (!playerData) return;
    
    const game = games.get(playerData.gameId);
    if (!game || game.phase !== GAME_PHASES.VOTING) return;
    
    if (game.submitVote(socket.id, targetPlayerId)) {
      io.to(playerData.gameId).emit('gameUpdated', game.getGameState());
    }
  });

  socket.on('getResponses', () => {
    socket.emit('responsesData', responses);
  });

  socket.on('disconnect', () => {
    const playerData = players.get(socket.id);
    if (playerData) {
      const game = games.get(playerData.gameId);
      if (game) {
        game.removePlayer(socket.id);
        if (game.players.size === 0) {
          games.delete(playerData.gameId);
        } else {
          io.to(playerData.gameId).emit('gameUpdated', game.getGameState());
        }
      }
      players.delete(socket.id);
    }
    console.log('Player disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Vibe Check server running on port ${PORT}`);
});