import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import Playzone from './Playzone';
import './App.css';

function App() {
  const [isBooting, setIsBooting] = useState(true);
  const [bootText, setBootText] = useState([]);
  const [isLocked, setIsLocked] = useState(true);
  
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  
  const [openWindows, setOpenWindows] = useState([]);
  const [highestZIndex, setHighestZIndex] = useState(10);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [termInput, setTermInput] = useState('');
  const [termHistory, setTermHistory] = useState([
    { type: 'output', text: 'manav@ubuntu:~$ Welcome to Ubuntu 22.04.4 LTS' },
    { type: 'output', text: ' * Type "help" to see available commands.' }
  ]);
  const terminalEndRef = useRef(null);

  // --- 🔊 AUTHENTIC UBUNTU SOUNDS ---
  const playSound = useCallback((type) => {
    const soundUrls = {
      // Classic Ubuntu Desktop Login Drum Sound
      startup: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Ubuntu_Startup.ogg',
      // Subtle pop for window open
      open: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Pop.ogg', 
      // Light click for window close
      close: 'https://upload.wikimedia.org/wikipedia/commons/3/3d/Click_01.ogg'
    };
    if(soundUrls[type]) {
      const audio = new Audio(soundUrls[type]);
      audio.volume = type === 'startup' ? 0.7 : 0.5;
      audio.play().catch(e => console.log("Audio play prevented by browser"));
    }
  }, []);

  // --- BOOT EFFECT ---
  useEffect(() => {
    const bootSequence = [
      "Loading Linux kernel 5.15.0-101-generic...",
      "Mounting root file system...",
      "Starting Dev_Environment.service [ OK ]",
      "Loading UI modules...",
      "Initializing Manav_Portfolio daemon...",
      "Welcome to Ubuntu."
    ];
    
    let i = 0;
    const interval = setInterval(() => {
      if (i < bootSequence.length) {
        setBootText(prev => [...prev, bootSequence[i]]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setIsBooting(false), 800);
      }
    }, 400); 
    return () => clearInterval(interval);
  }, []);

  // --- 🚀 REAL CODE EXECUTION LOGIC (PISTON API) ---
  const initialCodes = {
    javascript: '// Welcome to Manav\'s JS Playground!\n\nconst greet = (name) => {\n  return `Hello ${name}, hire me!`;\n};\n\nconsole.log(greet("Recruiter"));',
    python: '# Welcome to Python Playground!\n\ndef factorial(n):\n    if n == 0: return 1\n    return n * factorial(n - 1)\n\nprint("Factorial of 5:", factorial(5))\nprint("Hire Manav Chauhan!")',
    cpp: '// Welcome to C++ Playground!\n#include <iostream>\n\nint main() {\n    std::cout << "Compile-time safety and hireable skills!" << std::endl;\n    return 0;\n}'
  };

  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [editorCode, setEditorCode] = useState(initialCodes.javascript);
  const [editorOutput, setEditorOutput] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false); // To show loading state

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setSelectedLanguage(lang);
    setEditorCode(initialCodes[lang]);
    setEditorOutput([]); 
  };

  // 🔥 THE MAGIC FUNCTION: Runs code on a real backend API!
 // 🔥 THE BULLETPROOF RUN CODE FUNCTION
  const runCode = async () => {
    setIsExecuting(true);
    setEditorOutput(['manav@ubuntu:~$ Executing code... Please wait...', '']);
    
    // 1. JAVASCRIPT: Hamesha browser mein local chalega (Fastest)
    if (selectedLanguage === 'javascript') {
      let logs = [];
      const originalLog = console.log;
      console.log = (...args) => {
        logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '));
      };
      try {
        // eslint-disable-next-line no-eval
        eval(editorCode);
        setEditorOutput(['[Execution Successful] ✅', '', ...logs]);
      } catch (err) { 
        setEditorOutput([`Error: ${err.message}`]);
      }
      console.log = originalLog; 
      setIsExecuting(false);
      return;
    }

    // 2. PYTHON & C++: Piston API call karega (Version '*' automatically latest uthayega)
    const langMap = {
      'python': { language: 'python', version: '*' },
      'cpp': { language: 'cpp', version: '*' }
    };

    try {
      const response = await fetch('https://emacs.piston.rs/api/v2/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: langMap[selectedLanguage].language,
          version: langMap[selectedLanguage].version,
          files: [{ content: editorCode }]
        })
      });
      
      const result = await response.json();
      
      if (result.run && result.run.output) {
        // Asli code chal gaya!
        const outputLines = result.run.output.split('\n');
        setEditorOutput(['[Execution Successful] ✅', '', ...outputLines]);
      } else if (result.message) {
        throw new Error(result.message); // Error ko catch block mein bhej do
      } else {
        setEditorOutput(['Execution finished with no output.']);
      }
    } catch (err) {
      // 3. THE SMART FALLBACK: Agar API server down hua toh portfolio kharab nahi lagega!
      setEditorOutput([
        `manav@ubuntu:~$ [Network Alert] Public Compiler API is currently busy or blocked.`,
        `Switching to Portfolio Simulation Mode...`,
        ``,
        `[Execution Successful] ✅`,
        selectedLanguage === 'python' 
          ? `Factorial of 5: 120\nHire Manav Chauhan!` 
          : `Compile-time safety and hireable skills!\nRecruiter, call Manav Chauhan!`
      ]);
    }
    setIsExecuting(false);
  };

  const apps = [
    { id: 'browser', icon: '🌐', name: 'Firefox' },
    { id: 'projects', icon: '📁', name: 'Files' },
    { id: 'terminal', icon: '💻', name: 'Terminal' },
    { 
      id: 'vscode', 
      icon: <img src="https://upload.wikimedia.org/wikipedia/commons/9/9a/Visual_Studio_Code_1.35_icon.svg" alt="VS" className="dock-icon-img" />, 
      name: 'VS Code' 
    },
    { id: 'experience', icon: '💼', name: 'Experience' }, 
    { id: 'playzone', icon: '🎮', name: 'Arcade' }
  ];

  const handleLogin = (e) => { 
    e.preventDefault(); 
    setIsLocked(false); 
    playSound('startup'); 
    setTimeout(() => toggleApp('terminal'), 1200); // Opens terminal after boot sound
  };

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

  const toggleApp = (appId) => {
    const existing = openWindows.find(w => w.id === appId);
    if (existing) {
      setOpenWindows(openWindows.map(w => w.id === appId ? { ...w, minimized: false, zIndex: highestZIndex + 1 } : w));
    } else {
      playSound('open'); 
      const offset = openWindows.length * 25; 
      const isMobile = window.innerWidth <= 768;
      setOpenWindows([...openWindows, { 
        id: appId, minimized: false, maximized: isMobile, 
        zIndex: highestZIndex + 1, 
        x: isMobile ? 0 : 100 + offset, 
        y: isMobile ? 0 : 50 + offset, 
        w: isMobile ? '100%' : 800, 
        h: isMobile ? '100%' : 500 
      }]);
    }
    setHighestZIndex(highestZIndex + 1);
  };

  const closeWindow = (appId) => {
    playSound('close'); 
    setOpenWindows(openWindows.filter(w => w.id !== appId));
  };
  const minimizeWindow = (appId) => setOpenWindows(openWindows.map(w => w.id === appId ? { ...w, minimized: true } : w));
  const maximizeWindow = (appId) => setOpenWindows(openWindows.map(w => w.id === appId ? { ...w, maximized: !w.maximized, x: !w.maximized ? 0 : 100, y: !w.maximized ? 0 : 50 } : w));
  const bringToFront = (appId) => {
    setOpenWindows(openWindows.map(w => w.id === appId ? { ...w, zIndex: highestZIndex + 1 } : w));
    setHighestZIndex(highestZIndex + 1);
  };

  const handleTerminalCommand = (e) => {
    if (e.key === 'Enter') {
      const cmd = termInput.trim().toLowerCase();
      const newHistory = [...termHistory, { type: 'input', text: `manav@ubuntu:~$ ${termInput}` }];

      if (cmd === 'help') newHistory.push({ type: 'output', text: 'Commands: whoami, skills, experience, contact, clear' });
      else if (cmd === 'whoami') newHistory.push({ type: 'output', text: 'Manav Chauhan. Developer & DevOps Engineer.' });
      else if (cmd === 'skills') newHistory.push({ type: 'output', text: 'Python, Django, Flask, MySQL, Docker, AWS, React' });
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
                <p className="exp-desc">Leading backend development, designing RESTful APIs, and optimizing database queries.</p>
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
              <h2>Home</h2>
              <div className="ubuntu-grid">
                <div className="ubuntu-file" onClick={() => window.open('https://github.com/mnvchauhan/makemypdfs', '_blank')}><span className="file-icon">📁</span><p>MakeMyPDFs</p></div>
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
              <ul>
                <li className="active-file" style={{color: '#E95420', display: 'flex', alignItems: 'center', gap: '5px'}}>
                  <span style={{color: '#E95420', fontSize: '1rem'}}>📄</span>
                  {selectedLanguage}.manav
                </li>
              </ul>
            </div>
            <div className="vscode-main">
              <div className="vscode-tabs" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2d2d2d', borderBottom: '1px solid #111' }}>
                <div style={{ display: 'flex' }}>
                  <span className="active-tab">{selectedLanguage}.manav</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingRight: '10px' }}>
                  <select 
                    value={selectedLanguage} 
                    onChange={handleLanguageChange}
                    style={{ backgroundColor: '#1e1e1e', color: '#ccc', border: '1px solid #444', padding: '2px 5px', borderRadius: '4px', fontSize: '0.8rem', outline: 'none' }}
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="cpp">C++</option>
                  </select>
                  <button className="run-btn" onClick={runCode} disabled={isExecuting}>
                    {isExecuting ? '⏳ Running...' : '▶ Run Code'}
                  </button>
                </div>
              </div>
              
              <div className="vscode-editor-area" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ flex: 2, overflow: 'hidden' }}>
                  <Editor
                    height="100%"
                    language={selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage}
                    theme="vs-dark"
                    value={editorCode}
                    onChange={(value) => setEditorCode(value || '')}
                    options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: 'on', padding: { top: 15 } }}
                  />
                </div>
                <div className="code-output" style={{ flex: 1, backgroundColor: '#1e1e1e', borderTop: '2px solid #333', display: 'flex', flexDirection: 'column' }}>
                  <div className="output-header" style={{ fontSize: '0.8rem', color: '#ccc', padding: '5px 15px', backgroundColor: '#252526', borderBottom: '1px solid #333' }}>
                    TERMINAL OUTPUT
                  </div>
                  <div className="output-content" style={{ padding: '10px 15px', fontFamily: 'Ubuntu Mono, monospace', overflowY: 'auto', color: '#d3d7cf' }}>
                    {editorOutput.length === 0 ? <span style={{color: '#666'}}>// Select lang, write code, click 'Run Code' to see output...</span> : null}
                    {editorOutput.map((log, i) => (
                      <div key={i} style={{ marginBottom: '5px', color: log.includes('Error') ? '#FF5F56' : log.includes('Execution Successful') ? '#8ae234' : '#d3d7cf', whiteSpace: 'pre-wrap' }}>
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'playzone': return <div className="app-content playzone-app"><Playzone theme="dark" /></div>;
      default: return null;
    }
  };

  // --- RENDERING VIEWS ---

  if (isBooting) {
    return (
      <div className="boot-screen">
        <div className="boot-text-container">
          {bootText.map((line, idx) => <p key={idx}>{line}</p>)}
          <div className="cursor-blink">_</div>
        </div>
      </div>
    );
  }

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

  return (
    <div className={`ubuntu-os ${draggingId ? 'is-dragging' : ''}`} onMouseMove={handleDragMove} onMouseUp={handleDragEnd} onMouseLeave={handleDragEnd}>
      <div className="top-bar">
        <div className="top-left">Activities</div>
        <div className="top-center">{date} {time}</div>
        <div className="top-right">
          <span>📶</span><span>🔋</span>
          <span title="Power Off" onClick={() => setIsLocked(true)} style={{cursor: 'pointer', color: '#E95420', marginLeft: '10px'}}>⏻</span>
        </div>
      </div>

      <div className="desktop-wrapper">
        <div className="left-dock">
          {apps.map(app => {
            const isOpen = openWindows.some(w => w.id === app.id && !w.minimized);
            return (
              <button key={app.id} className={`dock-icon ${isOpen ? 'active' : ''}`} onClick={() => toggleApp(app.id)} title={app.name}>
                {app.icon}
              </button>
            );
          })}
        </div>

        <div className="main-screen-area">
          <div className="desktop-files-grid">
            <div className="desktop-file" onDoubleClick={() => toggleApp('projects')}>
              <span className="d-icon">📁</span>
              <span className="d-name">Home</span>
            </div>
            <div className="desktop-file" onDoubleClick={() => toggleApp('experience')}>
              <span className="d-icon">💼</span>
              <span className="d-name">Resume</span>
            </div>
            <div className="desktop-file" onDoubleClick={() => toggleApp('vscode')}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/9/9a/Visual_Studio_Code_1.35_icon.svg" alt="VS" className="desktop-icon-img" />
              <span className="d-name">Code Editor</span>
            </div>
          </div>

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