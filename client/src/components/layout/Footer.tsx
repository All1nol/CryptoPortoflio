import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer__container">
        <div className="footer__copyright">
          &copy; {currentYear} CryptoPortfolio. All rights reserved.
        </div>
        <div className="footer__links">
          <a href="https://binance.com" target="_blank" rel="noopener noreferrer">
            Data from Binance
          </a>
          <a href="https://coingecko.com" target="_blank" rel="noopener noreferrer">
            Images from CoinGecko
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 