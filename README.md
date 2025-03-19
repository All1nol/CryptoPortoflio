# CryptoPortfolio

A modern cryptocurrency portfolio management application that allows users to track their crypto assets in real-time.

## Features

- **Real-time Price Updates**: Connects to Binance WebSocket API to provide real-time price updates
- **Portfolio Management**: Add and remove cryptocurrency assets to track your portfolio
- **Portfolio Analytics**: View portfolio allocation and performance metrics
- **Responsive Design**: Works seamlessly on both desktop and mobile devices
- **Data Persistence**: Saves your portfolio data locally in your browser

## Technologies Used

- **React**: UI library for building the user interface
- **TypeScript**: For type safety and better developer experience
- **Redux Toolkit**: For state management
- **WebSocket**: For real-time data updates
- **Chart.js**: For data visualization
- **SCSS**: For styling with a modern CSS preprocessor
- **Vite**: For fast development and optimized builds
- **Virtualization**: For efficient rendering of large lists

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/crypto-portfolio.git
cd crypto-portfolio/client
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to: `http://localhost:5173`

### Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

The build files will be in the `dist` directory.

## Architecture

The application follows a modern React architecture:

- **Features**: Organized by domain (portfolio)
- **Components**: Reusable UI components
- **Services**: APIs and WebSocket communication
- **Redux Store**: Centralized state management
- **SCSS Modules**: Component-specific styling

## Data Flow

1. **Initial Load**: Fetches initial crypto data from Binance API
2. **Real-time Updates**: Establishes WebSocket connection for live price updates
3. **User Actions**: Updates the Redux store when adding/removing assets
4. **Local Storage**: Persists portfolio data in browser storage

## License

MIT

## Acknowledgements

- [Binance API](https://binance.com) for cryptocurrency data
- [CoinGecko](https://coingecko.com) for cryptocurrency images
- [Chart.js](https://chartjs.org) for data visualization
- [React Window](https://react-window.vercel.app/) for virtualization
