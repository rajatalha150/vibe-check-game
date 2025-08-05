import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const Container = styled(motion.div)`
  text-align: center;
  padding: 20px;
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 10px;
`;

const GameCode = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 15px 30px;
  border-radius: 15px;
  margin: 20px auto;
  display: inline-block;
  letter-spacing: 3px;
`;

const PlayerList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin: 30px 0;
`;

const PlayerCard = styled(motion.div)`
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  padding: 20px;
  border-radius: 15px;
  font-weight: 600;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(255,255,255,0.1), transparent);
    pointer-events: none;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
  flex-wrap: wrap;
`;

const Button = styled(motion.button)`
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(Button)`
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
  box-shadow: none;
`;

const Instructions = styled.div`
  background: rgba(102, 126, 234, 0.1);
  padding: 20px;
  border-radius: 15px;
  margin: 20px 0;
  color: #555;
  line-height: 1.6;
`;

const WaitingText = styled.div`
  color: #666;
  font-style: italic;
  margin-top: 20px;
`;

function GameLobby({ gameState, gameId, playerName, onStartGame, onGoHome }) {
  const isHost = gameState?.players?.find(p => p.name === playerName)?.id === gameState?.players?.[0]?.id;
  const canStart = gameState?.players?.length >= 2;

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Title>Game Lobby</Title>
      
      <GameCode>{gameId}</GameCode>
      
      <Instructions>
        <h3>How to Play:</h3>
        <p>
          1. Each round, you'll see a relatable scenario<br/>
          2. Choose the perfect GIF/meme reaction in 60 seconds<br/>
          3. Vote for the funniest response (can't vote for yourself)<br/>
          4. Get points based on votes received<br/>
          5. Highest score after 3 rounds wins!
        </p>
      </Instructions>
      
      <h3>Players ({gameState?.players?.length || 0}/8)</h3>
      <PlayerList>
        {gameState?.players?.map((player, index) => (
          <PlayerCard
            key={player.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            {player.name}
            {index === 0 && <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>👑 Host</div>}
          </PlayerCard>
        ))}
      </PlayerList>
      
      {isHost ? (
        <ButtonGroup>
          <Button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStartGame}
            disabled={!canStart}
          >
            {canStart ? 'Start Game' : 'Need at least 2 players'}
          </Button>
          <SecondaryButton
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGoHome}
          >
            Leave Game
          </SecondaryButton>
        </ButtonGroup>
      ) : (
        <>
          <WaitingText>Waiting for host to start the game...</WaitingText>
          <ButtonGroup>
            <SecondaryButton
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGoHome}
            >
              Leave Game
            </SecondaryButton>
          </ButtonGroup>
        </>
      )}
    </Container>
  );
}

export default GameLobby;