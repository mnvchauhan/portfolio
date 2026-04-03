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
  const [resizing, setResizing] = useState(null);
  const [trayOpen, setTrayOpen] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [bgImage, setBgImage] = useState('none');
  const [contextMenu, setContextMenu] = useState(null);
  const [showWallpaperMenu, setShowWallpaperMenu] = useState(false);
  const [appDrawerOpen, setAppDrawerOpen] = useState(false);

  const UbuntuLogoSVG = ({size = 150}) => (
    <svg width={size} height={size} viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">
      <circle cx="110" cy="110" r="100" fill="#E95420"/>
      <path d="M72 178a22 22 0 1 1-38-23 22 22 0 0 1 38 23zM72 42a22 22 0 1 0-38 23 22 22 0 0 0 38-23zM203 110a22 22 0 1 0-8 43 22 22 0 0 0 8-43z" fill="#FFF"/>
      <path d="M129 196a80 80 0 0 1-79-45l24-12a52 52 0 0 0 55 31v26zM129 24v26a52 52 0 0 0-55 31L50 69a80 80 0 0 1 79-45zM200 110c0 14-4 28-11 39l-22-14a52 52 0 0 0 0-50l22-14c7 11 11 25 11 39z" fill="#FFF"/>
    </svg>
  );

  const wallpapers = [
    { id: 'wp0', url: 'none', thumb: '', name: 'Ubuntu Default Gradient' },
    { id: 'wp1', url: '/wallpapers/ubuntu_1.jpg', thumb: '/wallpapers/ubuntu_1.jpg', name: 'Ubuntu Theme 1' },
    { id: 'wp2', url: '/wallpapers/ubuntu_2.jpg', thumb: '/wallpapers/ubuntu_2.jpg', name: 'Ubuntu Theme 2' },
    { id: 'wp3', url: '/wallpapers/ubuntu_3.jpg', thumb: '/wallpapers/ubuntu_3.jpg', name: 'Ubuntu Theme 3' },
    { id: 'wp4', url: '/wallpapers/ubuntu_4.jpg', thumb: '/wallpapers/ubuntu_4.jpg', name: 'Ubuntu Theme 4' }
  ];

  const handleDesktopClick = () => {
    if (contextMenu) setContextMenu(null);
    if (trayOpen) setTrayOpen(false);
  };
  
  const handleContextMenu = (e) => {
    if (e.target.closest('.ubuntu-window') || e.target.closest('.bottom-dock') || e.target.closest('.top-bar') || e.target.closest('.desktop-file')) return;
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const [termInput, setTermInput] = useState('');
  const [currentDir, setCurrentDir] = useState('~');
  const [termHistory, setTermHistory] = useState([
    { type: 'output', text: 'manav@ubuntu:~$ Welcome to Ubuntu 22.04.4 LTS' },
    { type: 'output', text: ' * Type "help" to see available commands.' }
  ]);

  const fileSystem = {
    '~': { type: 'dir', contents: ['projects', 'documents', 'downloads', 'desktop', 'resume.txt', 'about.txt'] },
    '~/projects': { type: 'dir', contents: ['portfolio', 'makemypdfs', 'e_learning'] },
    '~/documents': { type: 'dir', contents: ['ideas.txt', 'notes.md'] },
    '~/downloads': { type: 'dir', contents: ['docker-compose.yml', 'aws_deploy.sh'] },
    '~/desktop': { type: 'dir', contents: ['Home', 'Resume', 'Terminal', 'Editor', 'Trash'] },
    '~/resume.txt': { type: 'file', content: 'Manav Chauhan\n\nBackend Dev (2024-Pres) | DevOps Engineer (2022-2024)\nEmail: manavchauhan616@Gmail.com' },
    '~/about.txt': { type: 'file', content: 'I love building scalable backend architectures and modern web apps.' },
    '~/projects/portfolio': { type: 'dir', contents: ['src', 'public', 'package.json'] },
    '~/projects/makemypdfs': { type: 'dir', contents: ['main.py', 'requirements.txt'] },
    '~/projects/e_learning': { type: 'dir', contents: ['manage.py', 'db.sqlite3'] },
    '~/documents/ideas.txt': { type: 'file', content: '1. Build an OS in React\n2. Learn Rust\n3. Master Kubernetes' },
    '~/documents/notes.md': { type: 'file', content: '# DevOps Notes\nAlways use Docker containers for deployments.' },
    '~/downloads/docker-compose.yml': { type: 'file', content: 'version: "3"\nservices:\n  web:\n    image: nginx:alpine\n    ports:\n      - "80:80"' },
    '~/downloads/aws_deploy.sh': { type: 'file', content: '#!/bin/bash\necho "Deploying to AWS EC2..."\nsleep 2\necho "Done!"' }
  };
  const terminalEndRef = useRef(null);

  const playSound = useCallback((type) => {
    const soundUrls = {
      startup: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Ubuntu_Startup.ogg',
      open: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Pop.ogg', 
      close: 'https://upload.wikimedia.org/wikipedia/commons/3/3d/Click_01.ogg',
      click: 'https://upload.wikimedia.org/wikipedia/commons/3/3d/Click_01.ogg'
    };
    if(soundUrls[type]) {
      const audio = new Audio(soundUrls[type]);
      audio.volume = type === 'startup' ? 0.7 : 0.5;
      audio.play().catch(() => console.log("Audio play prevented"));
    }
  }, []);

  useEffect(() => {
    const bootSequence = [
      "Loading Linux kernel 5.15.0-101-generic...",
      "Mounting root file system...",
      "Starting Dev_Environment.service [ OK ]",
      "Loading UI modules...",
      "Initializing System Monitor daemon...",
      "Welcome to Ubuntu."
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < bootSequence.length) { setBootText(prev => [...prev, bootSequence[i]]); i++; } 
      else { clearInterval(interval); setTimeout(() => setIsBooting(false), 800); }
    }, 400); 
    return () => clearInterval(interval);
  }, []);

  // --- 🚀 REAL PYTHON EXECUTION (OFFLINE IN BROWSER VIA SKULPT) ---
  const defaultPythonCode = '# Welcome to Python Playground!\n\nname = "Manav"\na = 50\nb = 50\n\nprint("Total is:", a + b)\nprint("Hire " + name + " Chauhan!")';
  const [editorCode, setEditorCode] = useState(defaultPythonCode);
  const [editorOutput, setEditorOutput] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false); 

  const loadScript = (src) => new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  const runCode = async () => {
    setIsExecuting(true);
    setEditorOutput(['manav@ubuntu:~$ Running Python locally... Please wait...']);
    
    try {
      // Load Skulpt (Lightweight Python to JS compiler)
      await loadScript("https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt.min.js");
      await loadScript("https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt-stdlib.js");

      let outArr = ['[Execution Successful] ✅', ''];

      window.Sk.configure({
        output: (text) => {
          if (text !== '\n') outArr.push(text); // Capture print statements
        },
        read: (x) => {
          if (window.Sk.builtinFiles === undefined || window.Sk.builtinFiles["files"][x] === undefined)
            throw "File not found: '" + x + "'";
          return window.Sk.builtinFiles["files"][x];
        }
      });

      // Execute the code
      await window.Sk.misceval.asyncToPromise(() => 
        window.Sk.importMainWithBody("<stdin>", false, editorCode, true)
      );
      
      setEditorOutput(outArr);
    } catch (err) {
      setEditorOutput(['[Python Error] ❌', err.toString()]);
    }
    
    setIsExecuting(false);
  };

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

  const vscodeIconUrl = "https://upload.wikimedia.org/wikipedia/commons/9/9a/Visual_Studio_Code_1.35_icon.svg";
  const ytIconUrl = "https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg";

  // SVG TERMINAL ICON (NEVER BREAKS)
  const TerminalSVG = ({ className, style }) => (
    <svg viewBox="0 0 48 48" className={className} style={style}>
      <rect x="4" y="8" width="40" height="32" rx="6" fill="#300A24"/>
      <path d="M12 16L20 24L12 32" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M24 32H36" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );

  const WifiSVG = ({style}) => <svg viewBox="0 0 24 24" className="tray-icon" style={style}><path d="M12 3C7.3 3 3.1 4.6 0 7.1l1.5 1.8C4.1 6.8 7.8 5.4 12 5.4s7.9 1.4 10.5 3.5l1.5-1.8C20.9 4.6 16.7 3 12 3zm0 5.5c-3 0-5.8 1.1-7.9 2.9l1.5 1.8c1.7-1.4 3.9-2.2 6.4-2.2s4.7.8 6.4 2.2l1.5-1.8c-2.1-1.8-4.9-2.9-7.9-2.9zm0 5.2c-1.5 0-2.9.5-4 1.4L12 21l4-5.8c-1.1-.9-2.5-1.4-4-1.4z"/></svg>;
  const VolSVG = ({style}) => <svg viewBox="0 0 24 24" className="tray-icon" style={style}><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>;
  const BattSVG = ({style}) => <svg viewBox="0 0 24 24" className="tray-icon" style={style}><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/></svg>;
  const PowerSVG = ({style}) => <svg viewBox="0 0 24 24" className="tray-icon" style={{fill: '#FF5F56', ...style}}><path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z"/></svg>;

  const apps = [
    { id: 'browser', icon: <img src="https://upload.wikimedia.org/wikipedia/commons/a/a0/Firefox_logo%2C_2019.svg" alt="Firefox" className="dock-icon-img" />, name: 'Firefox' },
    { id: 'projects', icon: '📁', name: 'Files' },
    { id: 'terminal', icon: <TerminalSVG className="dock-icon-img" style={{width: '75%', height: '75%'}} />, name: 'Terminal' },
    { id: 'vscode', icon: <img src={vscodeIconUrl} alt="VS" className="dock-icon-img" />, name: 'VS Code' },
    { id: 'sysmon', icon: '📊', name: 'Sys Monitor' },
    { id: 'settings', icon: '⚙️', name: 'Settings' },
    { id: 'chai', icon: '☕', name: 'Buy Chai' },
    { id: 'experience', icon: '💼', name: 'Experience' }, 
    { id: 'resume', icon: '📄', name: 'Resume' },
    { id: 'music', icon: <img src={ytIconUrl} alt="Music" className="dock-icon-img" />, name: 'Music' },
    { id: 'playzone', icon: '🎮', name: 'Arcade' }
  ];

  const handleLogin = (e) => { 
    e.preventDefault(); 
    setIsLocked(false); 
    playSound('startup'); 
    setTimeout(() => toggleApp('terminal'), 1200); 
  };

  const handleDragStart = (e, id) => {
    if (window.innerWidth <= 768) return; 
    bringToFront(id);
    const win = openWindows.find(w => w.id === id);
    if (win.maximized) return; 
    setDragOffset({ x: e.clientX - win.x, y: e.clientY - win.y });
    setDraggingId(id);
  };

  const handleResizeStart = (e, id, dir) => {
    e.stopPropagation();
    if (window.innerWidth <= 768) return;
    bringToFront(id);
    const win = openWindows.find(w => w.id === id);
    if (win.maximized) return;
    setResizing({ id, dir, startX: e.clientX, startY: e.clientY, startW: win.w, startH: win.h });
  };

  const handleGlobalMouseMove = (e) => {
    if (draggingId && window.innerWidth > 768) {
      setOpenWindows(wins => wins.map(w => 
        w.id === draggingId ? { ...w, x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y } : w
      ));
    } else if (resizing && window.innerWidth > 768) {
      setOpenWindows(wins => wins.map(w => {
        if (w.id === resizing.id) {
          let newW = w.w;
          let newH = w.h;
          if (resizing.dir.includes('e')) newW = Math.max(300, resizing.startW + (e.clientX - resizing.startX));
          if (resizing.dir.includes('s')) newH = Math.max(200, resizing.startH + (e.clientY - resizing.startY));
          return { ...w, w: newW, h: newH };
        }
        return w;
      }));
    }
  };

  const handleGlobalMouseUp = () => {
    setDraggingId(null);
    setResizing(null);
  };

  const toggleApp = (appId) => {
    if (appId === 'settings') {
      setShowWallpaperMenu(true);
      return;
    }
    if (appId === 'chai') {
      window.open('https://buymeachai.ezee.li/Mnvchauhan', '_blank');
      return;
    }
    const existing = openWindows.find(w => w.id === appId);
    if (existing) {
      setOpenWindows(openWindows.map(w => w.id === appId ? { ...w, minimized: false, zIndex: highestZIndex + 1 } : w));
    } else {
      playSound('open'); 
      const offset = openWindows.length * 20; 
      const isMobile = window.innerWidth <= 768;
      setOpenWindows([...openWindows, { 
        id: appId, minimized: false, maximized: isMobile, 
        zIndex: highestZIndex + 1, 
        x: isMobile ? 0 : 80 + offset, 
        y: isMobile ? 0 : 40 + offset, 
        w: isMobile ? '100%' : 750, 
        h: isMobile ? '100%' : 480 
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
      const rawCmd = termInput.trim();
      if (!rawCmd) {
        setTermHistory([...termHistory, { type: 'input', text: `manav@ubuntu:${currentDir}$ ` }]);
        setTermInput('');
        return;
      }
      const args = rawCmd.split(' ').filter(Boolean);
      const cmd = args[0].toLowerCase();
      const newHistory = [...termHistory, { type: 'input', text: `manav@ubuntu:${currentDir}$ ${rawCmd}` }];

      const resolvePath = (pathArg) => {
        if (!pathArg) return currentDir;
        if (pathArg === '~') return '~';
        if (pathArg === '..') {
          if (currentDir === '~') return '~';
          const parts = currentDir.split('/');
          parts.pop();
          return parts.join('/') || '~';
        }
        if (pathArg.startsWith('~/')) return pathArg;
        if (pathArg.startsWith('/')) return '~' + pathArg;
        return currentDir === '~' ? `~/${pathArg}` : `${currentDir}/${pathArg}`;
      };

      if (cmd === 'help') newHistory.push({ type: 'output', text: 'Commands: ls, cd, pwd, cat, echo, clear, whoami, skills, experience, contact, sudo' });
      else if (cmd === 'clear') { setTermHistory([]); setTermInput(''); return; }
      else if (cmd === 'whoami') newHistory.push({ type: 'output', text: 'manav' });
      else if (cmd === 'skills') newHistory.push({ type: 'output', text: 'Python, Django, Flask, MySQL, Docker, React' });
      else if (cmd === 'experience') newHistory.push({ type: 'output', text: 'Backend Dev (2024-Pres) | DevOps Engineer (2022-2024)' });
      else if (cmd === 'contact') newHistory.push({ type: 'output', text: 'Email: manavchauhan616@Gmail.com | Insta: @mnvchauhan' });
      else if (cmd === 'pwd') newHistory.push({ type: 'output', text: currentDir.replace('~', '/home/manav') });
      else if (cmd === 'sudo') newHistory.push({ type: 'output', text: `[sudo] password for manav: \nmanav is not in the sudoers file. This incident will be reported.` });
      else if (cmd === 'echo') newHistory.push({ type: 'output', text: args.slice(1).join(' ') });
      else if (cmd === 'ls') {
        const targetDir = resolvePath(args[1] || currentDir);
        const node = fileSystem[targetDir];
        if (node && node.type === 'dir') {
          newHistory.push({ type: 'output', text: node.contents.join('  ') });
        } else if (node && node.type === 'file') {
          newHistory.push({ type: 'output', text: args[1] });
        } else {
          newHistory.push({ type: 'output', text: `ls: cannot access '${args[1] || currentDir}': No such file or directory` });
        }
      }
      else if (cmd === 'cd') {
        const targetDir = resolvePath(args[1] || '~');
        const node = fileSystem[targetDir];
        if (node && node.type === 'dir') setCurrentDir(targetDir);
        else if (node && node.type === 'file') newHistory.push({ type: 'output', text: `bash: cd: ${args[1]}: Not a directory` });
        else newHistory.push({ type: 'output', text: `bash: cd: ${args[1]}: No such file or directory` });
      }
      else if (cmd === 'cat') {
        if (!args[1]) newHistory.push({ type: 'output', text: 'cat: missing file operand' });
        else {
          const targetFile = resolvePath(args[1]);
          const node = fileSystem[targetFile];
          if (node && node.type === 'file') newHistory.push({ type: 'output', text: node.content });
          else if (node && node.type === 'dir') newHistory.push({ type: 'output', text: `cat: ${args[1]}: Is a directory` });
          else newHistory.push({ type: 'output', text: `cat: ${args[1]}: No such file or directory` });
        }
      }
      else if (cmd === 'mkdir' || cmd === 'rm' || cmd === 'touch') newHistory.push({ type: 'output', text: `${cmd}: Permission denied` });
      else newHistory.push({ type: 'output', text: `${cmd}: command not found` });

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
                <span className="user">manav@ubuntu</span>:<span className="dir">{currentDir}</span>$ 
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
              <div style={{textAlign: 'center', marginTop: '40px'}}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" alt="Google" style={{width: '200px', margin: '0 auto'}}/>
              </div>
              <div className="search-box">Manav Chauhan Software Engineer</div>
              <div className="search-results">
                <h3><a href="https://github.com/mnvchauhan" target="_blank" rel="noreferrer">GitHub - mnvchauhan</a></h3>
                <p>Backend architectures, Python, Django, Flask, DevOps, Docker...</p>
                <br/>
                <h3><a href="https://linkedin.com/in/mnvchauhan1" target="_blank" rel="noreferrer">LinkedIn - Manav Chauhan</a></h3>
                <p>View professional profile, connections, and work experience.</p>
                <br/>
                <h3><a href="https://instagram.com/mnvchauhan" target="_blank" rel="noreferrer">Instagram - @mnvchauhan</a></h3>
                <p>Follow my personal journey and tech updates on Instagram.</p>
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
              <div className="exp-timeline-item">
                <div className="exp-dot"></div>
                <h3>DevOps & Infrastructure Engineer</h3>
                <p className="exp-duration">2022 - 2024 | Tech Corp</p>
                <p className="exp-desc">Containerized legacy applications using Docker. Set up CI/CD pipelines using Git/GitHub Actions.</p>
              </div>
            </div>
          </div>
        );
      case 'projects':
        return (
          <div className="app-content nautilus-app">
            <div className="nautilus-sidebar">
              <ul>
                <li className="active">🏠 Home</li>
                <li>📄 Documents</li>
                <li>⬇️ Downloads</li>
                <li>🌐 Network</li>
              </ul>
            </div>
            <div className="nautilus-main">
              <h2>Home / Developer</h2>
              <div className="ubuntu-grid">
                <div className="ubuntu-file" onClick={() => window.open('https://mnvchauhan.pythonanywhere.com/', '_blank')}><span className="file-icon">📁</span><p>MakeMyPDFs</p></div>
                <div className="ubuntu-file"><span className="file-icon">📁</span><p>E_Learning</p></div>
                <div className="ubuntu-file"><span className="file-icon">🐳</span><p>docker-compose</p></div>
                <div className="ubuntu-file"><span className="file-icon">☁️</span><p>aws_deploy.sh</p></div>
                <div className="ubuntu-file"><span className="file-icon">🐍</span><p>flask_api.py</p></div>
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
                  <span style={{fontSize: '1.2rem'}}>🐍</span>
                  main.py
                </li>
              </ul>
            </div>
            <div className="vscode-main">
              <div className="vscode-tabs" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2d2d2d', borderBottom: '1px solid #111' }}>
                <div style={{ display: 'flex' }}>
                  <span className="active-tab">main.py</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', paddingRight: '10px' }}>
                  <button className="run-btn" onClick={runCode} disabled={isExecuting}>
                    {isExecuting ? '⏳ Running...' : '▶ Run Python'}
                  </button>
                </div>
              </div>
              
              <div className="vscode-editor-area" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ flex: 2, overflow: 'hidden' }}>
                  <Editor
                    height="100%"
                    language="python"
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
                    {editorOutput.length === 0 ? <span style={{color: '#666'}}>// Write Python code and click 'Run Python' to see output...</span> : null}
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
      case 'sysmon':
        return (
          <div className="app-content" style={{ backgroundColor: '#1e1e1e', padding: '20px', color: '#fff' }}>
            <h2 style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '20px' }}>System Monitor</h2>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}><span>CPU History</span><span>32%</span></div>
              <div style={{ width: '100%', backgroundColor: '#333', height: '20px', borderRadius: '4px', overflow: 'hidden' }}><div style={{ width: '32%', backgroundColor: '#E95420', height: '100%' }}></div></div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}><span>Memory and Swap History</span><span>4.2 GiB (26%) of 15.6 GiB</span></div>
              <div style={{ width: '100%', backgroundColor: '#333', height: '20px', borderRadius: '4px', overflow: 'hidden' }}><div style={{ width: '26%', backgroundColor: '#8ae234', height: '100%' }}></div></div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}><span>Network History</span><span>Receiving: 1.2 MB/s | Sending: 45 KB/s</span></div>
              <div style={{ width: '100%', backgroundColor: '#333', height: '20px', borderRadius: '4px', overflow: 'hidden' }}><div style={{ width: '60%', backgroundColor: '#729fcf', height: '100%' }}></div></div>
            </div>
            <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '30px', textAlign: 'center' }}>Daemon running optimally. All systems go for Manav's deployment.</p>
          </div>
        );
      case 'resume':
        return (
          <div className="app-content" style={{ backgroundColor: '#fff', height: '100%', padding: '0' }}>
            <iframe 
              style={{ width: '100%', height: '100%', border: 'none' }} 
              src="https://drive.google.com/file/d/1GDCbWpqHbe-SY54qD1IZBOpsuefWtsqh/preview" 
              title="Resume"
            ></iframe>
          </div>
        );
      case 'music':
        return (
          <div className="app-content" style={{ backgroundColor: '#000', height: '100%', padding: '10px' }}>
            <iframe 
              style={{ borderRadius: '12px', border: 'none' }} 
              src="https://www.youtube.com/embed/G855146ZO18" 
              width="100%" 
              height="100%" 
              allowFullScreen="" 
              allow="autoplay; encrypted-media; picture-in-picture" 
              title="YouTube Music Player"
            ></iframe>
          </div>
        );
      case 'playzone': return <div className="app-content playzone-app"><Playzone theme="dark" /></div>;
      default: return null;
    }
  };

  if (isBooting) {
    return (
      <div className="boot-screen" style={{display: 'flex', flexDirection: 'column', backgroundColor: '#000', color: '#fff', height: '100vh', padding: 0}}>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/a/ab/Logo-ubuntu_cof-orange-hex.svg" alt="Ubuntu Logo" style={{width: '140px', marginBottom: '20px'}} />
          <div style={{fontFamily: 'Ubuntu, sans-serif', fontSize: '3rem', fontWeight: 'bold', letterSpacing: '1px'}}>mnv ubontu</div>
        </div>
        <div style={{paddingBottom: '10vh', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div className="ubuntu-spinner" style={{width: '35px', height: '35px', borderWidth: '3px'}}></div>
          <div style={{marginTop: '20px', fontSize: '0.9rem', color: '#aaa', minHeight: '1.2rem'}}>{bootText[bootText.length - 1] || "..."}</div>
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
            <input type="password" placeholder="Password (Press Enter)" autoFocus />
            <button type="submit">→</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`ubuntu-os ${draggingId || resizing ? 'is-dragging' : ''}`} style={{backgroundImage: bgImage !== 'none' ? `url(${bgImage})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center'}} onMouseMove={handleGlobalMouseMove} onMouseUp={handleGlobalMouseUp} onMouseLeave={handleGlobalMouseUp} onClick={handleDesktopClick}>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: `rgba(0, 0, 0, ${(100 - brightness) / 100})`, pointerEvents: 'none', zIndex: 99999 }} />
      <div className="top-bar">
        <div className="top-left">Activities</div>
        <div className="top-center" style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
          {date} {time}
          <img src="https://api.visitorbadge.io/api/visitors?path=mnv.portfolio.v1&countColor=%23E95420" alt="visitors" style={{height: '20px'}} title="Live Visits" />
        </div>
        <div className="top-right" onClick={() => { playSound('click'); setTrayOpen(!trayOpen); }}>
          <WifiSVG /><VolSVG /><BattSVG />
          {trayOpen && (
            <div className="quick-settings" onClick={(e) => e.stopPropagation()}>
              <div className="qs-header">Quick Settings</div>
              <div className="qs-item">
                <button className="qs-icon-btn"><WifiSVG style={{width:'20px', height:'20px'}}/></button>
                <div style={{display:'flex', flexDirection:'column', flex:1}}>
                  <span style={{fontSize:'0.9rem'}}>Mnv Wifi</span>
                  <span style={{fontSize:'0.75rem', color:'#aaa'}}>Connected, secured</span>
                </div>
              </div>
              <div className="qs-item">
                <button className="qs-icon-btn inactive"><VolSVG style={{width:'20px', height:'20px'}}/></button>
                <input type="range" className="qs-slider" defaultValue="60" />
              </div>
              <div className="qs-item">
                <button className="qs-icon-btn inactive"><svg viewBox="0 0 24 24" style={{fill:'white', width:'20px', height:'20px'}}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg></button>
                <input type="range" className="qs-slider" value={brightness} onChange={(e) => setBrightness(e.target.value)} min="20" max="100" />
              </div>
              <div style={{borderTop: '1px solid #444', margin: '5px 0'}}></div>
              <div className="qs-row">
                <button className="qs-icon-btn" style={{backgroundColor:'transparent'}} onClick={() => { setIsLocked(true); setTrayOpen(false); }} title="Power Off"><PowerSVG style={{width:'24px', height:'24px'}}/></button>
                <span style={{fontSize:'0.85rem', flex:1, color:'#ddd'}}>Power off / Log out</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="desktop-wrapper" onContextMenu={handleContextMenu}>
        {contextMenu && (
          <div className="context-menu" style={{ left: contextMenu.x, top: contextMenu.y }} onClick={(e) => e.stopPropagation()}>
            <div className="cm-item" onClick={() => { setShowWallpaperMenu(true); setContextMenu(null); }}>Change Background...</div>
            <div className="cm-item" onClick={() => setContextMenu(null)}>Display Settings</div>
          </div>
        )}
        {showWallpaperMenu && (
          <div className="wp-menu" onClick={(e) => e.stopPropagation()}>
            <div className="wp-header">
              <span>Backgrounds</span>
              <span className="wp-close" onClick={() => setShowWallpaperMenu(false)}>✕</span>
            </div>
            <div className="wp-grid">
              {wallpapers.map(wp => (
                <div key={wp.id} className={`wp-item ${bgImage === wp.url ? 'active' : ''}`} onClick={() => setBgImage(wp.url)}>
                  {wp.url === 'none' ? <div className="wp-img" style={{background: 'radial-gradient(circle at top left, #E95420, #772953 50%, #2c001e)'}}></div> : <img src={wp.thumb} alt={wp.name} className="wp-img" />}
                  <div className="wp-name">{wp.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="main-screen-area">
          <div className="desktop-files-grid">
            <div className="desktop-file" onDoubleClick={() => toggleApp('projects')}>
              <span className="d-icon">📁</span>
              <span className="d-name">Home</span>
            </div>
            <div className="desktop-file" onDoubleClick={() => toggleApp('resume')}>
              <span className="d-icon">📄</span>
              <span className="d-name">Resume</span>
            </div>
            <div className="desktop-file" onDoubleClick={() => toggleApp('terminal')}>
              <TerminalSVG className="desktop-icon-img" style={{width: '3.2rem', height:'3.2rem', marginBottom: '5px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'}} />
              <span className="d-name">Terminal</span>
            </div>
            <div className="desktop-file" onDoubleClick={() => toggleApp('vscode')}>
              <img src={vscodeIconUrl} alt="VS" className="desktop-icon-img" />
              <span className="d-name">Editor</span>
            </div>
            <div className="desktop-file" onDoubleClick={() => toggleApp('settings')}>
              <span className="d-icon">⚙️</span>
              <span className="d-name">Settings</span>
            </div>
            <div className="desktop-file" onDoubleClick={() => toggleApp('chai')}>
              <span className="d-icon">☕</span>
              <span className="d-name">Buy Chai</span>
            </div>
            <div className="desktop-file" onDoubleClick={() => {}}>
              <span className="d-icon">🗑️</span>
              <span className="d-name">Trash</span>
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
                  top: win.maximized ? '0px' : `${win.y}px`, left: win.maximized ? '0px' : `${win.x}px`, 
                  width: win.maximized ? '100%' : `${win.w}px`, height: win.maximized ? '100%' : `${win.h}px`,
                  zIndex: win.zIndex,
                  transform: win.minimized ? 'scale(0.8) translateY(200px)' : 'scale(1) translateY(0)',
                  opacity: win.minimized ? 0 : 1, visibility: win.minimized ? 'hidden' : 'visible',
                  pointerEvents: win.minimized ? 'none' : 'auto'
                }}
              >
                {!win.maximized && (
                  <>
                    <div className="resize-handle se" onMouseDown={(e) => handleResizeStart(e, win.id, 'se')} />
                    <div className="resize-handle e" onMouseDown={(e) => handleResizeStart(e, win.id, 'e')} />
                    <div className="resize-handle s" onMouseDown={(e) => handleResizeStart(e, win.id, 's')} />
                  </>
                )}
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
        
        <div className="bottom-dock">
          {apps.slice(0, window.innerWidth <= 768 ? 4 : apps.length).map(app => {
            const isOpen = openWindows.some(w => w.id === app.id && !w.minimized);
            return (
              <button key={app.id} className={`dock-icon ${isOpen ? 'active' : ''}`} onClick={() => toggleApp(app.id)} title={app.name}>
                {app.icon}
              </button>
            );
          })}
          {window.innerWidth <= 768 && (
            <button className="dock-icon" onClick={() => setAppDrawerOpen(!appDrawerOpen)} title="Show Applications">
              <svg viewBox="0 0 24 24" fill="#fff" width="24" height="24">
                <circle cx="5" cy="5" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="19" cy="5" r="2"/>
                <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
                <circle cx="5" cy="19" r="2"/><circle cx="12" cy="19" r="2"/><circle cx="19" cy="19" r="2"/>
              </svg>
            </button>
          )}
        </div>

      {appDrawerOpen && (
        <div className="app-drawer-overlay" onClick={() => setAppDrawerOpen(false)}>
          <div className="app-drawer-grid">
            {apps.map(app => (
              <div key={app.id} className="app-drawer-item" onClick={(e) => { e.stopPropagation(); toggleApp(app.id); setAppDrawerOpen(false); }}>
                <div className="drawer-icon">{typeof app.icon === 'string' ? <span style={{fontSize:'3rem'}}>{app.icon}</span> : app.icon}</div>
                <div className="drawer-name">{app.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default App;
