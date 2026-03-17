import React, { useState, useEffect, useRef } from 'react';
import Playzone from './Playzone';
import './App.css';

function App() {
  const [isLocked, setIsLocked] = useState(true);
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  
  // NEW: Dock Size State (small, medium, large)
  const [dockSize, setDockSize] = useState('medium');

  // OS Window Management
  const [openWindows, setOpenWindows] = useState([
    { id: 'terminal', minimized: false, maximized: false, zIndex: 10, x: 100, y: 50, w: 700, h: 450 }
  ]);
  const [highestZIndex, setHighestZIndex] = useState(10);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Terminal States
  const [termInput, setTermInput] = useState('');
  const [termHistory, setTermHistory] = useState([
    { type: 'output', text: 'manav@ubuntu:~$ Welcome to Ubuntu 22.04 LTS (GNU/Linux x86_64)' },
    { type: 'output', text: ' * Type "help" to see available commands.' }
  ]);
  const terminalEndRef = useRef(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
      setDate(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    updateTime();
    setInterval(updateTime, 1000);
  }, []);

  useEffect(() => {
    if (terminalEndRef.current) terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [termHistory]);

  const apps = [
    { id: 'terminal', icon: '💻', name: 'Terminal' },
    { id: 'browser', icon: '🌐', name: 'Firefox' },
    { id: 'projects', icon: '📁', name: 'Files' },
    { id: 'vscode', icon: '⌨️', name: 'VS Code' },
    { id: 'experience', icon: '💼', name: 'Experience' }, 
    { id: 'playzone', icon: '🎮', name: 'Arcade' }
  ];

  // --- SIMPLE LOGIN LOGIC ---
  const handleLogin = (e) => {
    e.preventDefault();
    setIsLocked(false); // Seedha login!
  };

  // --- DOCK RESIZE LOGIC ---
  const toggleDockSize = () => {
    setDockSize(prev => prev === 'small' ? 'medium' : prev === 'medium' ? 'large' : 'small');
  };

  // --- CUSTOM REACT DRAG LOGIC ---
  const handleDragStart = (e, id) => {
    if (window.innerWidth <= 768) return; 
    bringToFront(id);
    const win = openWindows.find(w => w.id === id);
    if (win.maximized) return; 
    setDragOffset({ x: e.clientX - win.x, y: e.clientY - win.y });
    setDraggingId(id);
  };

  const handleDragMove = (e) => {
    if (draggingId && window.innerWidth > 768) {
      setOpenWindows(wins => wins.map(w => 
        w.id === draggingId ? { ...w, x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y } : w
      ));
    }
  };

  const handleDragEnd = () => setDraggingId(null);

  // --- WINDOW CONTROLS ---
  const toggleApp = (appId) => {
    const existing = openWindows.find(w => w.id === appId);
    if (existing) {
      setOpenWindows(openWindows.map(w => w.id === appId ? { ...w, minimized: false, zIndex: highestZIndex + 1 } : w));
    } else {
      const offset = openWindows.length * 20; 
      const isMobile = window.innerWidth <= 768;
      setOpenWindows([...openWindows, { 
        id: appId, minimized: false, maximized: isMobile, 
        zIndex: highestZIndex + 1, 
        x: isMobile ? 0 : 150 + offset, 
        y: isMobile ? 0 : 80 + offset, 
        w: isMobile ? '100%' : 800, 
        h: isMobile ? '100%' : 500 
      }]);
    }
    setHighestZIndex(highestZIndex + 1);
  };

  const closeWindow = (appId) => setOpenWindows(openWindows.filter(w => w.id !== appId));
  const minimizeWindow = (appId) => setOpenWindows(openWindows.map(w => w.id === appId ? { ...w, minimized: true } : w));
  const maximizeWindow = (appId) => setOpenWindows(openWindows.map(w => w.id === appId ? { ...w, maximized: !w.maximized, x: !w.maximized ? 65 : 150, y: !w.maximized ? 28 : 80 } : w));
  const bringToFront = (appId) => {
    setOpenWindows(openWindows.map(w => w.id === appId ? { ...w, zIndex: highestZIndex + 1 } : w));
    setHighestZIndex(highestZIndex + 1);
  };

  // --- TERMINAL LOGIC ---
  const handleTerminalCommand = (e) => {
    if (e.key === 'Enter') {
      const cmd = termInput.trim().toLowerCase();
      const newHistory = [...termHistory, { type: 'input', text: `manav@ubuntu:~$ ${termInput}` }];

      if (cmd === 'help') newHistory.push({ type: 'output', text: 'Commands: whoami, skills, experience, contact, clear' });
      else if (cmd === 'whoami') newHistory.push({ type: 'output', text: 'Manav Chauhan. Developer & DevOps Engineer.' });
      else if (cmd === 'skills') newHistory.push({ type: 'output', text: 'Python, Django, Flask, MySQL, Docker, AWS' });
      else if (cmd === 'experience') newHistory.push({ type: 'output', text: 'Backend Dev (2024-Pres) | DevOps Engineer (2022-2024)' });
      else if (cmd === 'contact') newHistory.push({ type: 'output', text: 'Email: manavchauhan616@Gmail.com | Insta: @mnvchauhan' });
      else if (cmd === 'clear') { setTermHistory([]); setTermInput(''); return; }
      else if (cmd !== '') newHistory.push({ type: 'output', text: `${cmd}: command not found` });

      setTermHistory(newHistory);
      setTermInput('');
    }
  };

  const renderContent = (appId) => {
    switch (appId) {
      case 'terminal':
        return (
          <div className="app-content terminal-app" onClick={() => document.getElementById('term-input')?.focus()}>
            <div className="terminal-menubar"><span>File</span><span>Edit</span><span>View</span><span>Search</span><span>Terminal</span><span>Help</span></div>
            <div className="terminal-body">
              {termHistory.map((line, idx) => <div key={idx} className={line.type === 'input' ? 'prompt-line' : 'output-line'}>{line.text}</div>)}
              <div className="prompt-active">
                <span className="user">manav@ubuntu</span>:<span className="dir">~</span>$ 
                <input id="term-input" type="text" value={termInput} onChange={(e) => setTermInput(e.target.value)} onKeyDown={handleTerminalCommand} autoComplete="off" autoFocus />
              </div>
              <div ref={terminalEndRef} />
            </div>
          </div>
        );
      case 'browser':
        return (
          <div className="app-content browser-app">
            <div className="browser-nav">
              <span className="nav-btn">⬅️</span><span className="nav-btn">➡️</span><span className="nav-btn">🔄</span>
              <input type="text" className="url-bar" value="https://google.com/search?q=manav+chauhan" readOnly />
            </div>
            <div className="browser-body">
              <h1 style={{color: '#E95420', fontSize: '2.5rem', textAlign: 'center', marginTop: '40px'}}>Google</h1>
              <div className="search-box">Manav Chauhan Software Engineer</div>
              <div className="search-results">
                <h3><a href="https://github.com/mnvchauhan" target="_blank" rel="noreferrer">GitHub - mnvchauhan</a></h3>
                <p>Backend architectures, Python, Django, Flask, DevOps, Docker...</p>
                <br/>
                <h3><a href="https://linkedin.com/in/mnvchauhan1" target="_blank" rel="noreferrer">LinkedIn - Manav Chauhan</a></h3>
                <p>View professional profile, connections, and work experience.</p>
                <br/>
                <h3><a href="https://instagram.com/mnvchauhan" target="_blank" rel="noreferrer">Instagram - @mnvchauhan</a></h3>
                <p>Follow Manav on Instagram for tech updates and life snippets.</p>
              </div>
            </div>
          </div>
        );
      case 'experience':
        return (
          <div className="app-content experience-app">
            <div className="experience-body">
              <h2 style={{color: '#E95420', marginBottom: '30px', borderBottom: '1px solid #333', paddingBottom: '10px'}}>My Journey</h2>
              <div className="exp-timeline-item">
                <div className="exp-dot"></div>
                <h3>Backend Software Engineer</h3>
                <p className="exp-duration">2024 - Present | Remote</p>
                <p className="exp-desc">Leading backend development, designing RESTful APIs, and optimizing MySQL database queries for faster response times. Mentoring junior developers in Python and Django best practices.</p>
              </div>
              <div className="exp-timeline-item">
                <div className="exp-dot"></div>
                <h3>DevOps & Infrastructure Engineer</h3>
                <p className="exp-duration">2022 - 2024 | Tech Corp</p>
                <p className="exp-desc">Containerized legacy applications using Docker. Set up CI/CD pipelines using Git/GitHub Actions to automate testing and AWS deployments.</p>
              </div>
            </div>
          </div>
        );
      case 'projects':
        return (
          <div className="app-content nautilus-app">
            <div className="nautilus-sidebar">
              <ul><li className="active">🏠 Home</li><li>📄 Documents</li><li>⬇️ Downloads</li></ul>
            </div>
            <div className="nautilus-main">
              <h2>Home / Projects</h2>
              <div className="ubuntu-grid">
                <div className="ubuntu-file" onClick={() => window.open('https://mnvchauhan.pythonanywhere.com/', '_blank')}><span className="file-icon">📁</span><p>MakeMyPDFs</p></div>
                <div className="ubuntu-file"><span className="file-icon">📁</span><p>E_Learning</p></div>
                <div className="ubuntu-file"><span className="file-icon">📄</span><p>QR_Gen.py</p></div>
              </div>
            </div>
          </div>
        );
      case 'vscode':
        return (
          <div className="app-content vscode-app">
            <div className="vscode-sidebar">
              <p>EXPLORER</p>
              <ul><li>📄 App.js</li><li>🎨 App.css</li><li>📦 package.json</li></ul>
            </div>
            <div className="vscode-main">
              <div className="vscode-tabs"><span className="active-tab">App.js</span></div>
              <div className="vscode-code">
                <p style={{color: '#c678dd'}}>import <span style={{color: '#e5c07b'}}>React</span> from <span style={{color: '#98c379'}}>'react'</span>;</p>
                <br/>
                <p style={{color: '#569cd6'}}>const <span style={{color: '#4fc1ff'}}>developer</span> = {'{'}</p>
                <p style={{marginLeft: '20px'}}>name: <span style={{color: '#ce9178'}}>"Manav Chauhan"</span>,</p>
                <p style={{marginLeft: '20px'}}>role: <span style={{color: '#ce9178'}}>"DevOps & Backend Engineer"</span></p>
                <p>{'}'};</p>
              </div>
            </div>
          </div>
        );
      case 'playzone': return <div className="app-content playzone-app"><Playzone theme="dark" /></div>;
      default: return null;
    }
  };

  // --- LOGIN SCREEN ---
  if (isLocked) {
    return (
      <div className="ubuntu-login-screen">
        <div className="top-bar transparent">
          <div className="top-center">{date} {time}</div>
          <div className="top-right"><span>📶</span><span>🔋</span></div>
        </div>
        <div className="login-container">
          <div className="user-avatar"><span>M</span></div>
          <h2 className="user-name">Manav Chauhan</h2>
          <form onSubmit={handleLogin} className="login-form">
            <input type="password" placeholder="Password" autoFocus />
            <button type="submit">→</button>
          </form>
          <p style={{marginTop: '15px', color: '#ccc', fontSize: '0.85rem'}}>Press Enter to unlock</p>
        </div>
      </div>
    );
  }

  // --- MAIN DESKTOP ---
  return (
    <div className={`ubuntu-os ${draggingId ? 'is-dragging' : ''}`} onMouseMove={handleDragMove} onMouseUp={handleDragEnd} onMouseLeave={handleDragEnd}>
      <div className="top-bar">
        <div className="top-left">Activities</div>
        <div className="top-center">{date} {time}</div>
        <div className="top-right">
          <span>📶</span><span>🔋</span>
          {/* Settings Icon to Toggle Dock Size */}
          <span title="Resize Dock" onClick={toggleDockSize} style={{cursor: 'pointer', marginLeft: '10px'}}>⚙️</span>
          <span title="Power Off" onClick={() => setIsLocked(true)} style={{cursor: 'pointer', color: '#E95420', marginLeft: '10px'}}>⏻</span>
        </div>
      </div>

      <div className="desktop-area">
        {/* Dock with dynamic class for resizing */}
        <div className={`dock ${dockSize}`}>
          {apps.map(app => {
            const isOpen = openWindows.some(w => w.id === app.id && !w.minimized);
            return (
              <button key={app.id} className={`dock-icon ${isOpen ? 'active' : ''}`} onClick={() => toggleApp(app.id)} title={app.name}>
                {app.icon}
              </button>
            );
          })}
        </div>

        <div className="window-area">
          {openWindows.map((win) => {
            const app = apps.find(a => a.id === win.id);
            if (!app) return null;

            return (
              <div 
                key={win.id}
                className={`ubuntu-window ${draggingId === win.id ? 'dragging' : 'animated-open'} ${win.maximized ? 'maximized' : ''}`} 
                onMouseDown={() => bringToFront(win.id)}
                style={{ 
                  top: win.maximized ? '0px' : `${win.y}px`, 
                  left: win.maximized ? '0px' : `${win.x}px`, 
                  width: win.maximized ? '100%' : `${win.w}px`,
                  height: win.maximized ? '100%' : `${win.h}px`,
                  zIndex: win.zIndex,
                  transform: win.minimized ? 'scale(0.8) translateY(200px)' : 'scale(1) translateY(0)',
                  opacity: win.minimized ? 0 : 1,
                  visibility: win.minimized ? 'hidden' : 'visible',
                  pointerEvents: win.minimized ? 'none' : 'auto'
                }}
              >
                
                <div className="window-header" onMouseDown={(e) => handleDragStart(e, win.id)} onDoubleClick={() => maximizeWindow(win.id)}>
                  <div className="window-controls">
                    <span className="control close" onMouseDown={(e) => { e.stopPropagation(); closeWindow(win.id); }}></span>
                    <span className="control minimize" onMouseDown={(e) => { e.stopPropagation(); minimizeWindow(win.id); }}></span>
                    <span className="control maximize" onMouseDown={(e) => { e.stopPropagation(); maximizeWindow(win.id); }}></span>
                  </div>
                  <div className="window-title">{app.name}</div>
                </div>
                {renderContent(win.id)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;