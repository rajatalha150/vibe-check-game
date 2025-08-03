import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const Container = styled(motion.div)`
  text-align: center;
  padding: 20px;
`;

const RoundInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: rgba(102, 126, 234, 0.1);
  padding: 15px 25px;
  border-radius: 15px;
`;

const Timer = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.timeLeft < 10 ? '#e74c3c' : '#667eea'};
`;

const Scenario = styled.div`
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  padding: 30px;
  border-radius: 20px;
  font-size: 1.3rem;
  margin: 30px 0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
`;

const ResponseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 30px 0;
`;

const ResponseCard = styled(motion.div)`
  background: white;
  border: 3px solid ${props => props.selected ? '#667eea' : '#e0e0e0'};
  border-radius: 15px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    border-color: #667eea;
  }
`;

const ResponseImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 10px;
`;

const ResponseText = styled.div`
  font-weight: 600;
  color: #333;
`;

const SubmittedMessage = styled(motion.div)`
  background: rgba(46, 204, 113, 0.1);
  color: #27ae60;
  padding: 20px;
  border-radius: 15px;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 30px 0;
`;

const PlayersStatus = styled.div`
  margin-top: 30px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 15px;
`;

const StatusText = styled.div`
  color: #666;
  margin-bottom: 10px;
`;

const PlayerChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
`;

const PlayerChip = styled.div`
  background: ${props => props.hasResponded ? '#27ae60' : '#95a5a6'};
  color: white;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
`;

function GamePlay({ gameState, scenario, responses, onSubmitResponse, playerId }) {
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    setTimeLeft(60);
    setHasSubmitted(false);
    setSelectedResponse(null);
  }, [scenario]);

  useEffect(() => {
    if (gameState?.hasResponded?.includes(playerId)) {
      setHasSubmitted(true);
    }
  }, [gameState, playerId]);

  useEffect(() => {
    if (timeLeft > 0 && !hasSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, hasSubmitted]);

  const handleResponseSelect = (responseId) => {
    if (hasSubmitted) return;
    
    setSelectedResponse(responseId);
    onSubmitResponse(responseId);
    setHasSubmitted(true);
  };

  const respondedCount = gameState?.hasResponded?.length || 0;
  const totalPlayers = gameState?.players?.length || 0;

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <RoundInfo>
        <div>
          <strong>Round {gameState?.round || 1}/{gameState?.maxRounds || 3}</strong>
        </div>
        <Timer timeLeft={timeLeft}>
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </Timer>
      </RoundInfo>

      <Scenario>
        "{scenario}"
      </Scenario>

      {hasSubmitted ? (
        <SubmittedMessage
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          ✅ Response submitted! Waiting for other players...
        </SubmittedMessage>
      ) : (
        <>
          <h3>Choose your reaction:</h3>
          <ResponseGrid>
            {responses.map((response) => (
              <ResponseCard
                key={response.id}
                selected={selectedResponse === response.id}
                onClick={() => handleResponseSelect(response.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ResponseImage src={response.url} alt={response.text} />
                <ResponseText>{response.text}</ResponseText>
              </ResponseCard>
            ))}
          </ResponseGrid>
        </>
      )}

      <PlayersStatus>
        <StatusText>
          {respondedCount}/{totalPlayers} players have responded
        </StatusText>
        <PlayerChips>
          {gameState?.players?.map((player) => (
            <PlayerChip
              key={player.id}
              hasResponded={gameState?.hasResponded?.includes(player.id)}
            >
              {player.name}
            </PlayerChip>
          ))}
        </PlayerChips>
      </PlayersStatus>
    </Container>
  );
}

export default GamePlay;