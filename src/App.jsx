import React, { useState, useEffect } from 'react';
import Playzone from './Playzone';
import './App.css'; // Tumhari original CSS yahan import hogi (class ko className kar dena)

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('portfolioTheme') || 'dark');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('portfolioTheme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="app-container">
      {/* NAVBAR */}
      <nav>
        <div className="nav-brand">Mnv<span>.</span> Portfolio</div>
        <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <ul className="nav-links">
            <li><a href="#home" onClick={closeMenu}>Home</a></li>
            <li><a href="#about" onClick={closeMenu}>About</a></li>
            <li><a href="#experience" onClick={closeMenu}>Experience</a></li>
            <li><a href="#projects" onClick={closeMenu}>Projects</a></li>
            <li><a href="#skills" onClick={closeMenu}>Skills</a></li>
            <li><a href="#playzone" onClick={closeMenu}>Play</a></li>
            <li><a href="#contact" onClick={closeMenu}>Contact</a></li>
          </ul>
          <button className="theme-btn" onClick={toggleTheme}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
        <button className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>☰</button>
      </nav>

      {/* HERO SECTION */}
      <section id="home" className="hero">
        <div className="hero-text">
          <h1>Turn Logic <br/><span>Into Magic</span></h1>
          <p>Software Engineer building scalable backend architectures, and tracking real-time user analytics.</p>
          <a href="#projects" className="btn">View My Work</a>
        </div>
        <div className="hero-visual">
          <img src="/hero.png" alt="Developer" className="floating-img" />
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about">
        <h2 className="section-title">About Me</h2>
        <div className="about-wrapper">
          <div className="about-img-box">
            <img src="/about.png" alt="Developer Setup" className="floating-img" />
          </div>
          <div className="glass-card about-text-box">
            <p>I specialize in building robust server architectures using Python and Flask. I actively develop applications that process user data, like capturing IP addresses and resolving them to country codes seamlessly via MySQL databases.</p>
            <p>From automating deployments with Docker and AWS to writing clean, maintainable code, I bridge the gap between development and operations.</p>
          </div>
        </div>
      </section>

      {/* EXPERIENCE SECTION */}
      <section id="experience">
        <h2 className="section-title">Work Experience</h2>
        <div className="glass-card">
          <div className="timeline">
            <div className="timeline-item">
              <h3>Backend Software Engineer</h3>
              <h4>2024 - Present | Remote</h4>
              <p>Leading backend development, designing RESTful APIs, and optimizing MySQL database queries for faster response times. Mentoring junior developers in Python and Django best practices.</p>
            </div>
            <div className="timeline-item">
              <h3>DevOps & Infrastructure Engineer</h3>
              <h4>2022 - 2024 | Tech Corp</h4>
              <p>Containerized legacy applications using Docker. Set up CI/CD pipelines using Git/GitHub Actions to automate testing and AWS deployments.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PROJECTS SECTION */}
      <section id="projects">
        <h2 className="section-title">Featured Projects</h2>
        <div className="projects-grid">
          {/* Project 1 */}
          <div className="glass-card project-card">
            <div>
              <h3>User Analytics Tracker</h3>
              <p>A high-performance web application built to monitor incoming traffic. It captures client IPs, resolves geographical country codes, and persists data securely for real-time monitoring.</p>
            </div>
            <div className="tech-tags">
              <span className="tech-tag">Python</span>
              <span className="tech-tag">Flask</span>
              <span className="tech-tag">MySQL</span>
            </div>
          </div>
          {/* Project 2 */}
          <div className="glass-card project-card">
            <div>
              <h3>Microservices Architecture</h3>
              <p>Designed and deployed a scalable backend system that breaks down monolith services into smaller, manageable docker containers orchestrated on AWS.</p>
            </div>
            <div className="tech-tags">
              <span className="tech-tag">Docker</span>
              <span className="tech-tag">AWS</span>
              <span className="tech-tag">Django</span>
            </div>
          </div>
          {/* Project 3 */}
          <div className="glass-card project-card">
            <div>
              <h3>Automated Task Runner</h3>
              <p>A background Python script integrated with Cron jobs that handles daily database cleanups, backups, and sends email reports automatically.</p>
            </div>
            <div className="tech-tags">
              <span className="tech-tag">Python</span>
              <span className="tech-tag">Linux</span>
              <span className="tech-tag">Git</span>
            </div>
          </div>
        </div>
      </section>

      {/* SKILLS SECTION */}
      <section id="skills">
        <h2 className="section-title">My Toolbox</h2>
        <div className="skills-grid">
          {['python/python-original.svg', 'django/django-plain.svg', 'flask/flask-original.svg', 'mysql/mysql-original-wordmark.svg', 'git/git-original.svg', 'github/github-original.svg', 'docker/docker-original.svg', 'amazonwebservices/amazonwebservices-original-wordmark.svg'].map((icon, index) => (
            <div key={index} className="glass-card skill-card">
              <img src={`https://raw.githubusercontent.com/devicons/devicon/master/icons/${icon}`} alt="Skill" className={icon.includes('github') || icon.includes('amazon') ? 'github-icon' : ''} />
              <span>{icon.split('/')[0].charAt(0).toUpperCase() + icon.split('/')[0].slice(1)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* PLAYZONE COMPONENT */}
      <Playzone theme={theme} />

      {/* CONTACT SECTION */}
      <section id="contact">
        <h2 className="section-title">Connect & Create</h2>
        <div className="contact-grid">
          <div className="glass-card contact-info">
            <h3 style={{fontSize: '1.8rem', marginBottom: '20px'}}>Let's Talk Code.</h3>
            <p style={{marginBottom: '30px'}}>Have a question or a project idea? Feel free to drop a message!</p>
            <p>📧 <strong>Email:</strong> manavchauhan616@Gmail.com</p>
            <p>💼 <strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/mnvchauhan1/" target="_blank" rel="noreferrer">in/mnvchauhan1</a></p>
            <p>🐙 <strong>GitHub:</strong> <a href="https://github.com/mnvchauhan" target="_blank" rel="noreferrer">github.com/mnvchauhan</a></p>
          </div>
          
          <div className="glass-card contact-form">
            <form onSubmit={(e) => { e.preventDefault(); alert('Message Form working!'); }}>
              <input type="text" placeholder="Your Name" required />
              <input type="email" placeholder="Your Email" required />
              <textarea rows="5" placeholder="Your Message" required></textarea>
              <button type="submit" className="btn" style={{width: '100%'}}>Send Message</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;