import React, { useState } from 'react';

const CalculatorApp = () => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const handleNum = (num) => {
    if (display === '0') setDisplay(num.toString());
    else setDisplay(display + num);
  };

  const handleOp = (op) => {
    if (['+', '-', '*', '/'].includes(display.slice(-1))) return;
    setEquation(equation + display + op);
    setDisplay('0');
  };

  const calculate = () => {
    try {
      const result = eval(equation + display);
      setDisplay(String(result));
      setEquation('');
    } catch {
      setDisplay('Error');
    }
  };

  const clear = () => {
    setDisplay('0');
    setEquation('');
  };

  return (
    <div style={{ backgroundColor: '#242424', height: '100%', display: 'flex', flexDirection: 'column', color: 'white', fontFamily: 'Ubuntu, sans-serif' }}>
      <div style={{ flex: 1, backgroundColor: '#1e1e1e', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-end', borderBottom: '1px solid #333' }}>
        <div style={{ fontSize: '1.2rem', color: '#888', minHeight: '20px' }}>{equation}</div>
        <div style={{ fontSize: '3rem', fontWeight: '300' }}>{display}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', backgroundColor: '#333', padding: '1px' }}>
        <button className="calc-btn" onClick={clear} style={{ gridColumn: 'span 3', ...btnStyle, backgroundColor: '#E95420' }}>Clear</button>
        <button className="calc-btn" onClick={() => handleOp('/')} style={{ ...btnStyle, backgroundColor: '#444' }}>÷</button>
        
        <button className="calc-btn" onClick={() => handleNum(7)} style={btnStyle}>7</button>
        <button className="calc-btn" onClick={() => handleNum(8)} style={btnStyle}>8</button>
        <button className="calc-btn" onClick={() => handleNum(9)} style={btnStyle}>9</button>
        <button className="calc-btn" onClick={() => handleOp('*')} style={{ ...btnStyle, backgroundColor: '#444' }}>×</button>

        <button className="calc-btn" onClick={() => handleNum(4)} style={btnStyle}>4</button>
        <button className="calc-btn" onClick={() => handleNum(5)} style={btnStyle}>5</button>
        <button className="calc-btn" onClick={() => handleNum(6)} style={btnStyle}>6</button>
        <button className="calc-btn" onClick={() => handleOp('-')} style={{ ...btnStyle, backgroundColor: '#444' }}>-</button>

        <button className="calc-btn" onClick={() => handleNum(1)} style={btnStyle}>1</button>
        <button className="calc-btn" onClick={() => handleNum(2)} style={btnStyle}>2</button>
        <button className="calc-btn" onClick={() => handleNum(3)} style={btnStyle}>3</button>
        <button className="calc-btn" onClick={() => handleOp('+')} style={{ ...btnStyle, backgroundColor: '#444' }}>+</button>

        <button className="calc-btn" onClick={() => handleNum(0)} style={{ gridColumn: 'span 2', ...btnStyle }}>0</button>
        <button className="calc-btn" onClick={() => handleNum('.')} style={btnStyle}>.</button>
        <button className="calc-btn" onClick={calculate} style={{ ...btnStyle, backgroundColor: '#27C93F', color: '#000', fontWeight: 'bold' }}>=</button>
      </div>
    </div>
  );
};

const btnStyle = {
  padding: '20px',
  fontSize: '1.5rem',
  border: 'none',
  backgroundColor: '#3a3a3a',
  color: 'white',
  cursor: 'pointer',
  transition: '0.1s',
};

export default CalculatorApp;
