import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import HomeScreen from './components/HomeScreen';
import GameLobby from './components/GameLobby';
import GamePlay from './components/GamePlay';
import VotingScreen from './components/VotingScreen';
import ResultsScreen from './components/ResultsScreen';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const GameContainer = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 800px;
  min-height: 600px;
`;

const GAME_PHASES = {
  HOME: 'home',
  LOBBY: 'lobby',
  RESPONSE: 'response',
  VOTING: 'voting',
  RESULTS: 'results',
  ENDED: 'ended'
};

function App() {
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [currentPhase, setCurrentPhase] = useState(GAME_PHASES.HOME);
  const [playerName, setPlayerName] = useState('');
  const [gameId, setGameId] = useState('');
  const [error, setError] = useState('');
  const [responses, setResponses] = useState([]);
  const [currentScenario, setCurrentScenario] = useState('');

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('gameCreated', ({ gameId: newGameId, game }) => {
      setGameId(newGameId);
      setGameState(game);
      setCurrentPhase(GAME_PHASES.LOBBY);
      setError('');
    });

    newSocket.on('gameUpdated', (game) => {
      setGameState(game);
      if (game.phase === 'lobby') {
        setCurrentPhase(GAME_PHASES.LOBBY);
      } else if (game.phase === 'response') {
        setCurrentPhase(GAME_PHASES.RESPONSE);
      } else if (game.phase === 'voting') {
        setCurrentPhase(GAME_PHASES.VOTING);
      }
    });

    newSocket.on('phaseChanged', ({ phase, scenario }) => {
      if (phase === 'response') {
        setCurrentPhase(GAME_PHASES.RESPONSE);
        setCurrentScenario(scenario);
      } else if (phase === 'voting') {
        setCurrentPhase(GAME_PHASES.VOTING);
      }
    });

    newSocket.on('roundResults', (results) => {
      setCurrentPhase(GAME_PHASES.RESULTS);
      setTimeout(() => {
        if (gameState && gameState.round < gameState.maxRounds) {
          setCurrentPhase(GAME_PHASES.RESPONSE);
        }
      }, 5000);
    });

    newSocket.on('gameEnded', (finalScores) => {
      setCurrentPhase(GAME_PHASES.ENDED);
    });

    newSocket.on('responsesData', (responsesData) => {
      setResponses(responsesData);
    });

    newSocket.on('error', ({ message }) => {
      setError(message);
    });

    newSocket.emit('getResponses');

    return () => newSocket.close();
  }, [gameState]);

  const createGame = (name) => {
    setPlayerName(name);
    socket.emit('createGame', name);
  };

  const joinGame = (name, roomCode) => {
    setPlayerName(name);
    setGameId(roomCode);
    socket.emit('joinGame', { gameId: roomCode, playerName: name });
  };

  const startGame = () => {
    socket.emit('startGame');
  };

  const submitResponse = (responseId) => {
    socket.emit('submitResponse', responseId);
  };

  const submitVote = (targetPlayerId) => {
    socket.emit('submitVote', targetPlayerId);
  };

  const goHome = () => {
    setCurrentPhase(GAME_PHASES.HOME);
    setGameState(null);
    setGameId('');
    setPlayerName('');
    setError('');
  };

  const renderCurrentScreen = () => {
    switch (currentPhase) {
      case GAME_PHASES.HOME:
        return (
          <HomeScreen
            onCreateGame={createGame}
            onJoinGame={joinGame}
            error={error}
          />
        );
      case GAME_PHASES.LOBBY:
        return (
          <GameLobby
            gameState={gameState}
            gameId={gameId}
            playerName={playerName}
            onStartGame={startGame}
            onGoHome={goHome}
          />
        );
      case GAME_PHASES.RESPONSE:
        return (
          <GamePlay
            gameState={gameState}
            scenario={currentScenario || gameState?.currentScenario}
            responses={responses}
            onSubmitResponse={submitResponse}
            playerId={socket?.id}
          />
        );
      case GAME_PHASES.VOTING:
        return (
          <VotingScreen
            gameState={gameState}
            responses={responses}
            onSubmitVote={submitVote}
            playerId={socket?.id}
          />
        );
      case GAME_PHASES.RESULTS:
      case GAME_PHASES.ENDED:
        return (
          <ResultsScreen
            gameState={gameState}
            isGameEnded={currentPhase === GAME_PHASES.ENDED}
            onGoHome={goHome}
          />
        );
      default:
        return <HomeScreen onCreateGame={createGame} onJoinGame={joinGame} error={error} />;
    }
  };

  return (
    <AppContainer>
      <GameContainer
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence mode="wait">
          {renderCurrentScreen()}
        </AnimatePresence>
      </GameContainer>
    </AppContainer>
  );
}

export default App;