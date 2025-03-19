import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { fetchInitialPrices } from './features/portfolio/portfolioSlice';
import Layout from './components/layout/Layout';
import PortfolioSummary from './components/portfolio/PortfolioSummary';
import AssetForm from './components/portfolio/AssetForm';
import AssetList from './components/portfolio/AssetList';
import webSocketService from './services/websocketService';
import './styles/main.scss';
import './styles/layout.scss';

function App() {
  const dispatch = useAppDispatch();
  const assets = useAppSelector((state) => state.portfolio.assets);

  // Fetch initial price data
  useEffect(() => {
    dispatch(fetchInitialPrices());
  }, [dispatch]);

  // Setup WebSocket connection
  useEffect(() => {
    // Initialize WebSocket only on first render
    webSocketService.init(dispatch, assets.map(asset => asset.symbol));

    return () => {
      webSocketService.disconnect();
    };
  }, [dispatch]); // Only depend on dispatch, not assets

  // Update WebSocket subscription when assets change
  useEffect(() => {
    if (assets.length > 0) {
      const symbols = assets.map(asset => asset.symbol);
      webSocketService.updateAssets(symbols);
    }
  }, [assets]);

  return (
    <Layout>
      <PortfolioSummary />
      <div className="row" style={{ marginTop: '2rem' }}>
        <div className="col-md-4">
          <AssetForm />
        </div>
        <div className="col-md-8">
          <AssetList />
        </div>
      </div>
    </Layout>
  );
}

export default App;
