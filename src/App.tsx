import React, { useEffect } from 'react';

const App = () => {
  const [userId, setUserId] = React.useState<string | null>(null);
  const [selectedNickname, setSelectedNickname] = React.useState<string | null>(null);

  const joinGame = () => {
    if (!userId) {
      // Set selected nickname and login without waiting for userId state update
      setSelectedNickname('nickname'); // Replace 'nickname' with the actual nickname
      loginWithGoogle();
    }
  };

  const addPlayerToGame = () => {
    // Logic for adding player to the game goes here
  };

  useEffect(() => {
    if (userId && selectedNickname) {
      addPlayerToGame();
    }
  }, [userId, selectedNickname]);

  return <div>Your App</div>;
};

const loginWithGoogle = () => {
  // Logic for logging in with Google goes here
};

export default App;