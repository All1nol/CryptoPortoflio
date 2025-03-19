import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="container header__container">
        <a href="/" className="header__logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="16" fill="#3861FB" />
            <path d="M21.5 16C21.5 19.0376 19.0376 21.5 16 21.5C12.9624 21.5 10.5 19.0376 10.5 16C10.5 12.9624 12.9624 10.5 16 10.5C19.0376 10.5 21.5 12.9624 21.5 16Z" stroke="white" strokeWidth="1.5" />
            <path d="M16 7V10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M16 22V25" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M7 16H10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M22 16H25" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <h1>CryptoPortfolio</h1>
        </a>
        <nav className="header__nav">
          <a href="https://github.com/yourusername/crypto-portfolio" className="header__nav-item" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header; 