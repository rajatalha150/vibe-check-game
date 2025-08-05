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

const Title = styled.h2`
  color: #333;
  margin-bottom: 20px;
`;

const ResponsesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
  margin: 30px 0;
`;

const ResponseCard = styled(motion.div)`
  background: white;
  border: 3px solid ${props => props.selected ? '#667eea' : '#e0e0e0'};
  border-radius: 20px;
  padding: 25px;
  cursor: ${props => props.isOwnResponse ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  opacity: ${props => props.isOwnResponse ? 0.6 : 1};
  position: relative;
  
  &:hover {
    transform: ${props => props.isOwnResponse ? 'none' : 'translateY(-8px)'};
    box-shadow: ${props => props.isOwnResponse ? '0 8px 25px rgba(0, 0, 0, 0.1)' : '0 15px 35px rgba(0, 0, 0, 0.2)'};
    border-color: ${props => props.isOwnResponse ? '#e0e0e0' : '#667eea'};
  }
`;

const ResponseImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 15px;
  margin-bottom: 15px;
`;

const ResponseText = styled.div`
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
  margin-bottom: 10px;
`;

const PlayerName = styled.div`
  color: #667eea;
  font-weight: bold;
  font-size: 0.9rem;
`;

const OwnResponseLabel = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(102, 126, 234, 0.9);
  color: white;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const VotedMessage = styled(motion.div)`
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
  background: ${props => props.hasVoted ? '#27ae60' : '#95a5a6'};
  color: white;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
`;

function VotingScreen({ gameState, responses, onSubmitVote, playerId }) {
  const [selectedVote, setSelectedVote] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);

  useEffect(() => {
    setTimeLeft(45);
    setHasVoted(false);
    setSelectedVote(null);
  }, [gameState?.responses]);

  useEffect(() => {
    if (gameState?.hasVoted?.includes(playerId)) {
      setHasVoted(true);
    }
  }, [gameState, playerId]);

  useEffect(() => {
    if (timeLeft > 0 && !hasVoted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, hasVoted]);

  const handleVote = (targetPlayerId) => {
    if (hasVoted || targetPlayerId === playerId) return;
    
    setSelectedVote(targetPlayerId);
    onSubmitVote(targetPlayerId);
    setHasVoted(true);
  };

  const getResponseById = (responseId) => {
    return responses.find(r => r.id === responseId);
  };

  const getPlayerName = (playerId) => {
    return gameState?.players?.find(p => p.id === playerId)?.name || 'Unknown';
  };

  const votedCount = gameState?.hasVoted?.length || 0;
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
          <strong>Round {gameState?.round || 1}/{gameState?.maxRounds || 3} - Voting</strong>
        </div>
        <Timer timeLeft={timeLeft}>
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </Timer>
      </RoundInfo>

      <Title>Vote for the best response!</Title>
      
      {hasVoted ? (
        <VotedMessage
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          ✅ Vote submitted! Waiting for other players...
        </VotedMessage>
      ) : (
        <p style={{ color: '#666', marginBottom: '30px' }}>
          Choose the funniest or most accurate response (you can't vote for yourself)
        </p>
      )}

      <ResponsesGrid>
        {gameState?.responses?.map((responseData, index) => {
          const response = getResponseById(responseData.response.id);
          const isOwnResponse = responseData.playerId === playerId;
          
          return (
            <ResponseCard
              key={`${responseData.playerId}-${index}`}
              selected={selectedVote === responseData.playerId}
              isOwnResponse={isOwnResponse}
              onClick={() => handleVote(responseData.playerId)}
              whileHover={{ scale: isOwnResponse ? 1 : 1.02 }}
              whileTap={{ scale: isOwnResponse ? 1 : 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {isOwnResponse && <OwnResponseLabel>Your Response</OwnResponseLabel>}
              <ResponseImage src={response?.url} alt={response?.text} />
              <ResponseText>{response?.text}</ResponseText>
              <PlayerName>{getPlayerName(responseData.playerId)}</PlayerName>
            </ResponseCard>
          );
        })}
      </ResponsesGrid>

      <PlayersStatus>
        <StatusText>
          {votedCount}/{totalPlayers} players have voted
        </StatusText>
        <PlayerChips>
          {gameState?.players?.map((player) => (
            <PlayerChip
              key={player.id}
              hasVoted={gameState?.hasVoted?.includes(player.id)}
            >
              {player.name}
            </PlayerChip>
          ))}
        </PlayerChips>
      </PlayersStatus>
    </Container>
  );
}

export default VotingScreen;