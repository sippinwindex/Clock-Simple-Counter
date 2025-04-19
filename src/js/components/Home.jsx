import React, { useState, useEffect } from 'react';
import SimpleCounter from './SimpleCounter';

const Home = () => {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  function calculateSeconds(aCounter, placeValue) {
    return Math.floor(aCounter / placeValue) % 10;
  }

  return (
    <SimpleCounter
      thousandsDigit={calculateSeconds(counter, 1000)}
      hundredsDigit={calculateSeconds(counter, 100)}
      tensDigit={calculateSeconds(counter, 10)}
      onesDigit={calculateSeconds(counter, 1)}
    />
  );
};

export default Home;