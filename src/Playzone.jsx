import React, { useState, useEffect, useRef } from 'react';

const Playzone = ({ theme }) => {
  const [activeView, setActiveView] = useState('menu'); 

  // --- SNAKE GAME STATE ---
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const [snakeState, setSnakeState] = useState('idle'); 
  const [score, setScore] = useState(0);
  const directionRef = useRef("RIGHT");

  const startSnake = () => {
    setSnakeState('playing');
    setScore(0);
    clearInterval(gameLoopRef.current);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const box = 15;
    const canvasSize = 300; 
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    let snake = [{ x: 9 * box, y: 9 * box }];
    let food = { x: Math.floor(Math.random() * 19) * box, y: Math.floor(Math.random() * 19) * box };
    directionRef.current = "RIGHT";

    const handleKeyDown = (e) => {
      if ([37, 38, 39, 40].includes(e.keyCode)) e.preventDefault();
      if (e.keyCode === 37 && directionRef.current !== "RIGHT") directionRef.current = "LEFT";
      else if (e.keyCode === 38 && directionRef.current !== "DOWN") directionRef.current = "UP";
      else if (e.keyCode === 39 && directionRef.current !== "LEFT") directionRef.current = "RIGHT";
      else if (e.keyCode === 40 && directionRef.current !== "UP") directionRef.current = "DOWN";
    };
    
    document.addEventListener("keydown", handleKeyDown);

    const drawSnake = () => {
      ctx.fillStyle = '#1e1e1e';
      ctx.fillRect(0, 0, canvasSize, canvasSize);
      
      ctx.fillStyle = "#8ae234"; 
      ctx.fillRect(food.x, food.y, box, box);

      snake.forEach((seg, i) => {
        ctx.fillStyle = i === 0 ? "#E95420" : "#ff7b4f"; 
        ctx.fillRect(seg.x, seg.y, box, box);
        ctx.strokeStyle = '#1e1e1e';
        ctx.strokeRect(seg.x, seg.y, box, box);
      });

      let snakeX = snake[0].x;
      let snakeY = snake[0].y;
      let d = directionRef.current;
      
      if (d === "LEFT") snakeX -= box;
      if (d === "UP") snakeY -= box;
      if (d === "RIGHT") snakeX += box;
      if (d === "DOWN") snakeY += box;

      if (snakeX < 0) snakeX = canvasSize - box;
      else if (snakeX >= canvasSize) snakeX = 0;
      
      if (snakeY < 0) snakeY = canvasSize - box;
      else if (snakeY >= canvasSize) snakeY = 0;

      if (snakeX === food.x && snakeY === food.y) {
        setScore(s => s + 1);
        food = { x: Math.floor(Math.random() * 19) * box, y: Math.floor(Math.random() * 19) * box };
      } else {
        snake.pop();
      }

      let newHead = { x: snakeX, y: snakeY };

      if (snake.some(s => s.x === newHead.x && s.y === newHead.y)) {
        clearInterval(gameLoopRef.current);
        setSnakeState('gameover');
        document.removeEventListener("keydown", handleKeyDown);
        return;
      }
      snake.unshift(newHead);
    };

    gameLoopRef.current = setInterval(drawSnake, 100);
  };

  const changeDir = (dir) => {
    if (dir === "LEFT" && directionRef.current !== "RIGHT") directionRef.current = "LEFT";
    if (dir === "UP" && directionRef.current !== "DOWN") directionRef.current = "UP";
    if (dir === "RIGHT" && directionRef.current !== "LEFT") directionRef.current = "RIGHT";
    if (dir === "DOWN" && directionRef.current !== "UP") directionRef.current = "DOWN";
  };

  useEffect(() => {
    if (activeView !== 'snake') {
      clearInterval(gameLoopRef.current);
      setSnakeState('idle');
    }
  }, [activeView]);

  // --- DEV MEMORY MATCH STATE ---
  const techIcons = ['🐍', '🐳', '☁️', '🌐', '🗄️', '🐧'];
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matches, setMatches] = useState(0);

  const startMemoryGame = () => {
    const shuffled = [...techIcons, ...techIcons]
      .sort(() => Math.random() - 0.5)
      .map((emoji, idx) => ({ id: idx, emoji, isFlipped: false, isMatched: false }));
    setCards(shuffled);
    setFlipped([]);
    setMatches(0);
  };

  useEffect(() => {
    if (activeView === 'memory' && cards.length === 0) startMemoryGame();
  }, [activeView]);

  useEffect(() => {
    if (flipped.length === 2) {
      const match = cards[flipped[0]].emoji === cards[flipped[1]].emoji;
      setTimeout(() => {
        setCards(prev => prev.map((c, i) => {
          if (i === flipped[0] || i === flipped[1]) {
            return match ? { ...c, isMatched: true } : { ...c, isFlipped: false };
          }
          return c;
        }));
        setFlipped([]);
        if (match) setMatches(m => m + 1);
      }, 800);
    }
  }, [flipped, cards]);

  const handleCardClick = (index) => {
    if (flipped.length >= 2 || cards[index].isFlipped || cards[index].isMatched) return;
    setCards(prev => prev.map((c, i) => i === index ? { ...c, isFlipped: true } : c));
    setFlipped([...flipped, index]);
  };

  return (
    <div className="playzone-container">
      
      {activeView === 'menu' && (
        <>
          <h2 style={{color: '#E95420', marginBottom: '20px', textAlign: 'center'}}>Games Arcade</h2>
          <div className="game-icons-grid">
            <div className="game-icon-btn" onClick={() => setActiveView('snake')}>
              <div className="icon-box">🐍</div>
              <p>Ubuntu Snake</p>
            </div>
            <div className="game-icon-btn" onClick={() => setActiveView('memory')}>
              <div className="icon-box">🧩</div>
              <p>Dev Memory</p>
            </div>
          </div>
        </>
      )}

      {activeView === 'snake' && (
        <div className="game-screen" style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div className="game-header" style={{width: '100%', maxWidth: '300px'}}>
            <button className="back-btn" onClick={() => setActiveView('menu')}>⬅️ Back</button>
            <h3 style={{color: '#fff'}}>Score: {score}</h3>
          </div>
          
          <div className="canvas-container" style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
            {snakeState !== 'playing' && (
              <div className="game-overlay">
                {snakeState === 'gameover' ? <p style={{color: '#ff4444', marginBottom: '10px', fontSize: '1.2rem', fontWeight: 'bold'}}>Oops! Crashed.</p> : null}
                <button className="play-btn" onClick={startSnake}>Tap to Play</button>
              </div>
            )}
            <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', border: '2px solid #444', borderRadius: '8px', display: 'block', backgroundColor: '#1e1e1e' }}></canvas>
          </div>

          <div className="mobile-dpad">
            <button className="dpad-btn up" onClick={() => changeDir('UP')}>▲</button>
            <div className="dpad-row">
              <button className="dpad-btn left" onClick={() => changeDir('LEFT')}>◀</button>
              <button className="dpad-btn down" onClick={() => changeDir('DOWN')}>▼</button>
              <button className="dpad-btn right" onClick={() => changeDir('RIGHT')}>▶</button>
            </div>
          </div>
        </div>
      )}

      {activeView === 'memory' && (
        <div className="game-screen">
          <div className="game-header">
            <button className="back-btn" onClick={() => setActiveView('menu')}>⬅️ Back</button>
            <h3 style={{color: '#fff'}}>Matches: {matches}/6</h3>
          </div>

          {matches === 6 ? (
            <div className="win-screen" style={{textAlign: 'center', marginTop: '40px'}}>
              <h2 style={{color: '#8ae234', fontSize: '2rem'}}>You Won! 🎉</h2>
              <button className="play-btn" onClick={startMemoryGame} style={{marginTop: '20px'}}>Play Again</button>
            </div>
          ) : (
            <div className="memory-grid">
              {cards.map((card, index) => (
                <div 
                  key={card.id} 
                  className={`memory-card ${card.isFlipped || card.isMatched ? 'flipped' : ''}`}
                  onClick={() => handleCardClick(index)}
                >
                  <div className="memory-card-inner">
                    <div className="memory-card-front">?</div>
                    <div className="memory-card-back">{card.emoji}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default Playzone;