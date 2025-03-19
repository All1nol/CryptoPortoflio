import React from 'react';
import { useAppSelector } from '../../app/hooks';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { formatCryptoPrice, formatPercentage } from '../../utils/formatters';
import '../../styles/components/PortfolioSummary.scss';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

const PortfolioSummary: React.FC = () => {
  const assets = useAppSelector((state) => state.portfolio.assets);
  const totalPortfolioValue = useAppSelector((state) => state.portfolio.totalPortfolioValue);
  
  const calculate24hChange = (): number => {
    if (assets.length === 0) return 0;
    
    let previousTotalValue = 0;
    const currentTotalValue = totalPortfolioValue;
    
    assets.forEach(asset => {
      if (asset.previousPrice) {
        previousTotalValue += asset.quantity * asset.previousPrice;
      } else {
        previousTotalValue += asset.totalCost;
      }
    });
    
    if (previousTotalValue === 0) return 0;
    return ((currentTotalValue - previousTotalValue) / previousTotalValue) * 100;
  };
  
  // Prepare data for the allocation chart
  const getAllocationChartData = () => {
    const labels = assets.map(asset => asset.symbol);
    const data = assets.map(asset => asset.totalCost);
    const backgroundColor = [
      '#3861FB', // Primary color
      '#F7931A', // Bitcoin orange
      '#627EEA', // Ethereum blue
      '#16C784', // Success color
      '#EA3943', // Danger color
      '#8247E5', // Purple
      '#2775CA', // Blue
      '#26A17B', // Teal
      '#F0B90B', // Yellow
      '#E84142', // Red
      '#345D9D', // Dark blue
      '#2AABC9', // Light blue
      '#5FCDE5', // Cyan
      '#6BB795', // Green
    ];
    
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColor.slice(0, assets.length),
          borderWidth: 1,
        },
      ],
    };
  };
  
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.raw;
            const total = context.chart.getDatasetMeta(0).total;
            const percentage = Math.round((value / total) * 100);
            return `${context.label}: ${formatCryptoPrice(value)} (${percentage}%)`;
          },
        },
      },
    },
  };
  
  const totalChange24h = calculate24hChange();
  const changeClass = totalChange24h >= 0 ? 'portfolio-summary__card-change--positive' : 'portfolio-summary__card-change--negative';
  const changeIcon = totalChange24h >= 0 ? '↑' : '↓';
  
  return (
    <div className="portfolio-summary">
      <div className="portfolio-summary__header">
        <h2>Portfolio Overview</h2>
        <p>Track and manage your cryptocurrency investments in one place.</p>
      </div>
      
      <div className="portfolio-summary__cards">
        <div className="portfolio-summary__card">
          <div className="portfolio-summary__card-title">Total Value</div>
          <div className="portfolio-summary__card-value">{formatCryptoPrice(totalPortfolioValue)}</div>
          <div className={`portfolio-summary__card-change ${changeClass}`}>
            <span className="icon">{changeIcon}</span>
            {formatPercentage(totalChange24h)}
          </div>
        </div>
        
        <div className="portfolio-summary__card">
          <div className="portfolio-summary__card-title">Assets</div>
          <div className="portfolio-summary__card-value">{assets.length}</div>
        </div>
        
        <div className="portfolio-summary__card">
          <div className="portfolio-summary__card-title">Best Performer</div>
          {assets.length > 0 ? (
            <>
              <div className="portfolio-summary__card-value">
                {assets.reduce((prev, current) => 
                  (current.change24h > prev.change24h) ? current : prev
                ).symbol}
              </div>
              <div className="portfolio-summary__card-change portfolio-summary__card-change--positive">
                <span className="icon">↑</span>
                {formatPercentage(assets.reduce((prev, current) => 
                  (current.change24h > prev.change24h) ? current : prev
                ).change24h)}
              </div>
            </>
          ) : (
            <div className="portfolio-summary__card-value">N/A</div>
          )}
        </div>
        
        <div className="portfolio-summary__card">
          <div className="portfolio-summary__card-title">Worst Performer</div>
          {assets.length > 0 ? (
            <>
              <div className="portfolio-summary__card-value">
                {assets.reduce((prev, current) => 
                  (current.change24h < prev.change24h) ? current : prev
                ).symbol}
              </div>
              <div className="portfolio-summary__card-change portfolio-summary__card-change--negative">
                <span className="icon">↓</span>
                {formatPercentage(assets.reduce((prev, current) => 
                  (current.change24h < prev.change24h) ? current : prev
                ).change24h)}
              </div>
            </>
          ) : (
            <div className="portfolio-summary__card-value">N/A</div>
          )}
        </div>
      </div>
      
      {assets.length > 0 && (
        <div className="portfolio-summary__chart">
          <div className="portfolio-summary__chart-header">
            <h3>Portfolio Allocation</h3>
          </div>
          
          <div className="portfolio-summary__chart-container">
            <Doughnut data={getAllocationChartData()} options={chartOptions} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioSummary; 