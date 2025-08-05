import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const Container = styled(motion.div)`
  text-align: center;
  padding: 20px;
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 30px;
  font-size: ${props => props.isGameEnded ? '2.5rem' : '2rem'};
`;

const Trophy = styled.div`
  font-size: 4rem;
  margin-bottom: 20px;
`;

const ScoreBoard = styled.div`
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 30px;
  margin: 30px 0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const ScoreItem = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  margin: 10px 0;
  background: ${props => props.rank === 1 ? 
    'linear-gradient(45deg, #f39c12, #e67e22)' : 
    props.rank === 2 ? 
    'linear-gradient(45deg, #95a5a6, #7f8c8d)' : 
    props.rank === 3 ? 
    'linear-gradient(45deg, #d4a574, #cd853f)' : 
    'rgba(102, 126, 234, 0.1)'
  };
  color: ${props => props.rank <= 3 ? 'white' : '#333'};
  border-radius: 15px;
  font-weight: 600;
  font-size: 1.1rem;
`;

const PlayerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const Rank = styled.div`
  font-size: 1.3rem;
  font-weight: bold;
  min-width: 40px;
`;

const PlayerName = styled.div`
  font-size: 1.1rem;
`;

const Score = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 40px;
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
  min-width: 150px;
`;

const SecondaryButton = styled(Button)`
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
  box-shadow: none;
`;

const RoundInfo = styled.div`
  background: rgba(102, 126, 234, 0.1);
  padding: 15px 25px;
  border-radius: 15px;
  margin-bottom: 30px;
  color: #666;
`;

const Confetti = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
`;

const ConfettiPiece = styled(motion.div)`
  position: absolute;
  width: 10px;
  height: 10px;
  background: ${props => props.color};
  border-radius: 2px;
`;

const confettiColors = ['#667eea', '#764ba2', '#f39c12', '#e74c3c', '#2ecc71', '#9b59b6'];

function ResultsScreen({ gameState, isGameEnded, onGoHome }) {
  const scores = gameState?.scores || {};
  const players = gameState?.players || [];
  
  const sortedPlayers = players
    .map(player => ({
      ...player,
      score: scores[player.id] || 0
    }))
    .sort((a, b) => b.score - a.score);

  const winner = sortedPlayers[0];
  const getRankEmoji = (rank) => {
    switch(rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${rank}.`;
    }
  };

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {isGameEnded && (
        <>
          <Trophy>🎉</Trophy>
          <Title isGameEnded={true}>
            Game Over!<br/>
            <span style={{ fontSize: '1.5rem', color: '#667eea' }}>
              {winner?.name} wins!
            </span>
          </Title>
          <Confetti>
            {Array.from({ length: 50 }).map((_, i) => (
              <ConfettiPiece
                key={i}
                color={confettiColors[i % confettiColors.length]}
                initial={{
                  x: '50%',
                  y: -10,
                  rotate: 0,
                  scale: 1
                }}
                animate={{
                  x: Math.random() * window.innerWidth,
                  y: window.innerHeight + 10,
                  rotate: 360,
                  scale: 0
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  delay: Math.random() * 2,
                  ease: "easeOut"
                }}
              />
            ))}
          </Confetti>
        </>
      )}
      
      {!isGameEnded && (
        <>
          <RoundInfo>
            Round {gameState?.round || 1} Results
          </RoundInfo>
          <Title>Round Complete!</Title>
        </>
      )}

      <ScoreBoard>
        <h3 style={{ marginTop: 0, color: '#333' }}>
          {isGameEnded ? 'Final Scores' : 'Current Scores'}
        </h3>
        {sortedPlayers.map((player, index) => (
          <ScoreItem
            key={player.id}
            rank={index + 1}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <PlayerInfo>
              <Rank>{getRankEmoji(index + 1)}</Rank>
              <PlayerName>{player.name}</PlayerName>
            </PlayerInfo>
            <Score>{player.score} votes</Score>
          </ScoreItem>
        ))}
      </ScoreBoard>

      {isGameEnded && (
        <ButtonGroup>
          <Button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGoHome}
          >
            Play Again
          </Button>
          <SecondaryButton
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Vibe Check Game Results',
                  text: `I just played Vibe Check and ${winner?.name} won with ${winner?.score} votes!`,
                  url: window.location.href
                });
              }
            }}
          >
            Share Results
          </SecondaryButton>
        </ButtonGroup>
      )}
      
      {!isGameEnded && (
        <div style={{ color: '#666', marginTop: '20px' }}>
          Next round starting soon...
        </div>
      )}
    </Container>
  );
}

export default ResultsScreen;