import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const Container = styled(motion.div)`
  text-align: center;
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 40px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-bottom: 30px;
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

const Input = styled.input`
  width: 100%;
  max-width: 300px;
  padding: 15px;
  border: 2px solid #ddd;
  border-radius: 10px;
  font-size: 1rem;
  margin-bottom: 15px;
  text-align: center;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
`;

const Error = styled.div`
  color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
  padding: 10px;
  border-radius: 5px;
  margin-top: 15px;
`;

const ToggleButton = styled(motion.button)`
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  margin-top: 10px;
`;

function HomeScreen({ onCreateGame, onJoinGame, error }) {
  const [playerName, setPlayerName] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);

  const handleCreateGame = () => {
    if (playerName.trim()) {
      onCreateGame(playerName.trim());
    }
  };

  const handleJoinGame = () => {
    if (playerName.trim() && gameCode.trim()) {
      onJoinGame(playerName.trim(), gameCode.trim().toUpperCase());
    }
  };

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Title>🎭 Vibe Check</Title>
      <Subtitle>React to life's moments with the perfect meme</Subtitle>
      
      <Form>
        <Input
          type="text"
          placeholder="Enter your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          maxLength={20}
        />
        
        {!showJoinForm ? (
          <>
            <Button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateGame}
              disabled={!playerName.trim()}
            >
              Create Game
            </Button>
            <ToggleButton
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowJoinForm(true)}
            >
              Join existing game instead
            </ToggleButton>
          </>
        ) : (
          <>
            <Input
              type="text"
              placeholder="Enter game code"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value.toUpperCase())}
              maxLength={6}
            />
            <ButtonGroup>
              <Button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleJoinGame}
                disabled={!playerName.trim() || !gameCode.trim()}
              >
                Join Game
              </Button>
              <ToggleButton
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowJoinForm(false)}
              >
                Create new game instead
              </ToggleButton>
            </ButtonGroup>
          </>
        )}
      </Form>
      
      {error && <Error>{error}</Error>}
    </Container>
  );
}

export default HomeScreen;