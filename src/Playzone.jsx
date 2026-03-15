import React, { useState, useEffect, useRef } from 'react';

const Playzone = ({ theme }) => {
  // --- TYPING TEST STATE ---
  const snippets = ["from flask import Flask", "SELECT * FROM users;", "def analyze_traffic(data):", "docker build -t webapp .", "git commit -m 'Fixed CSS'"];
  const [quote, setQuote] = useState(snippets[0]);
  const [typedText, setTypedText] = useState('');
  const [time, setTime] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const startTypingTest = () => {
    setQuote(snippets[Math.floor(Math.random() * snippets.length)]);
    setTypedText('');
    setTime(0);
    setWpm(0);
    setIsTyping(false);
    clearInterval(timerRef.current);
  };

  const handleTyping = (e) => {
    const val = e.target.value;
    setTypedText(val);

    if (!isTyping) {
      setIsTyping(true);
      startTimeRef.current = new Date();
      timerRef.current = setInterval(() => {
        setTime(Math.floor((new Date() - startTimeRef.current) / 1000));
      }, 1000);
    }

    if (val === quote) {
      clearInterval(timerRef.current);
      const timeTakenMinutes = (new Date() - startTimeRef.current) / 1000 / 60;
      const words = quote.split(' ').length;
      setWpm(Math.round(words / timeTakenMinutes));
      setIsTyping(false); // Disable input logic handled via state if needed
    }
  };

  // --- SNAKE GAME STATE & REF ---
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);

  const startSnake = () => {
    clearInterval(gameLoopRef.current);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const box = 10;
    let snake = [{ x: 10 * box, y: 10 * box }];
    let food = { x: Math.floor(Math.random() * 24 + 1) * box, y: Math.floor(Math.random() * 24 + 1) * box };
    let d = "RIGHT";

    const handleKeyDown = (e) => {
      if ([37, 38, 39, 40].includes(e.keyCode)) e.preventDefault();
      if (e.keyCode === 37 && d !== "RIGHT") d = "LEFT";
      else if (e.keyCode === 38 && d !== "DOWN") d = "UP";
      else if (e.keyCode === 39 && d !== "LEFT") d = "RIGHT";
      else if (e.keyCode === 40 && d !== "UP") d = "DOWN";
    };
    document.addEventListener("keydown", handleKeyDown);

    const drawSnake = () => {
      ctx.fillStyle = theme === 'dark' ? '#020617' : '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      snake.forEach((seg, i) => {
        ctx.fillStyle = i === 0 ? "#0ea5e9" : "#38bdf8";
        ctx.fillRect(seg.x, seg.y, box, box);
      });
      ctx.fillStyle = "#6366f1";
      ctx.fillRect(food.x, food.y, box, box);

      let snakeX = snake[0].x;
      let snakeY = snake[0].y;
      
      if (d === "LEFT") snakeX -= box;
      if (d === "UP") snakeY -= box;
      if (d === "RIGHT") snakeX += box;
      if (d === "DOWN") snakeY += box;

      if (snakeX === food.x && snakeY === food.y) {
        food = { x: Math.floor(Math.random() * 24 + 1) * box, y: Math.floor(Math.random() * 24 + 1) * box };
      } else {
        snake.pop();
      }

      let newHead = { x: snakeX, y: snakeY };

      if (snakeX < 0 || snakeX >= canvas.width || snakeY < 0 || snakeY >= canvas.height || snake.some(s => s.x === newHead.x && s.y === newHead.y)) {
        clearInterval(gameLoopRef.current);
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#0ea5e9";
        ctx.font = "20px Arial";
        ctx.fillText("Game Over", 70, 130);
        document.removeEventListener("keydown", handleKeyDown);
        return;
      }
      snake.unshift(newHead);
    };

    gameLoopRef.current = setInterval(drawSnake, 100);
  };

  return (
    <section id="playzone">
      <h2 className="section-title">The Dev Arcade</h2>
      <div className="games-wrapper">
        
        {/* Typing Game */}
        <div className="glass-card game-container">
          <h3>Dev Typing Speed</h3>
          <div className="typing-area">
            <span id="code-quote">{quote}</span>
            <input 
              type="text" 
              id="typing-input" 
              placeholder="Type the code here..." 
              autoComplete="off"
              value={typedText}
              onChange={handleTyping}
              disabled={typedText === quote && typedText !== ''}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '20px', fontWeight: 'bold' }}>
            <div>Time: <span style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>{time}</span>s</div>
            <div>WPM: <span style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>{wpm}</span></div>
          </div>
          <button className="btn" onClick={startTypingTest} style={{ width: '100%' }}>Next Snippet</button>
        </div>

        {/* Snake Game */}
        <div className="glass-card game-container">
          <h3>Neon Snake</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '15px' }}>Use Arrow Keys to Play</p>
          <canvas ref={canvasRef} id="snake-canvas" width="250" height="250"></canvas>
          <button className="btn" onClick={startSnake} style={{ width: '100%' }}>Play Snake</button>
        </div>

      </div>
    </section>
  );
};

export default Playzone;