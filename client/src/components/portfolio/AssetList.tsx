import React from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { removeAsset } from '../../features/portfolio/portfolioSlice';
import { formatCryptoPrice, formatPercentage, formatQuantity } from '../../utils/formatters';
import '../../styles/components/AssetList.scss';

const AssetList: React.FC = () => {
  const assets = useAppSelector((state) => state.portfolio.assets);
  const loading = useAppSelector((state) => state.portfolio.loading);
  const dispatch = useAppDispatch();
  
  const handleDeleteAsset = (id: string) => {
    dispatch(removeAsset(id));
  };

  const renderRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const asset = assets[index];
    const percentageClass = asset.change24h >= 0 ? 'asset-list__percentage--positive' : 'asset-list__percentage--negative';
    const changeIcon = asset.change24h >= 0 ? '↑' : '↓';
    
    return (
      <div style={style} className="asset-list__table-row">
        <table className="asset-list__table">
          <tbody>
            <tr>
              <td className="asset-list__asset-name">
                <span>{asset.name}</span>
                <span className="symbol">{asset.symbol}</span>
              </td>
              <td>{formatQuantity(asset.quantity)}</td>
              <td>{formatCryptoPrice(asset.currentPrice)}</td>
              <td>{formatCryptoPrice(asset.totalCost)}</td>
              <td className={`asset-list__percentage ${percentageClass}`}>
                <span className="icon">{changeIcon}</span>
                {formatPercentage(asset.change24h)}
              </td>
              <td>
                {formatPercentage(asset.percentageOfPortfolio / 100)}
                <div className="asset-list__portfolio-percentage">
                  <div className="bar" style={{ width: `${asset.percentageOfPortfolio}%` }}></div>
                </div>
              </td>
              <td className="asset-list__actions">
                <button onClick={() => handleDeleteAsset(asset.id)} aria-label="Delete asset">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.5 3H11.5V2.5C11.5 1.4 10.6 0.5 9.5 0.5H6.5C5.4 0.5 4.5 1.4 4.5 2.5V3H2.5C1.95 3 1.5 3.45 1.5 4C1.5 4.55 1.95 5 2.5 5H3V13.5C3 14.6 3.9 15.5 5 15.5H11C12.1 15.5 13 14.6 13 13.5V5H13.5C14.05 5 14.5 4.55 14.5 4C14.5 3.45 14.05 3 13.5 3ZM6 2.5C6 2.23 6.22 2 6.5 2H9.5C9.78 2 10 2.23 10 2.5V3H6V2.5ZM11.5 13.5C11.5 13.78 11.28 14 11 14H5C4.72 14 4.5 13.78 4.5 13.5V5H11.5V13.5Z" fill="currentColor" />
                    <path d="M6 11.5C6.55 11.5 7 11.05 7 10.5V8.5C7 7.95 6.55 7.5 6 7.5C5.45 7.5 5 7.95 5 8.5V10.5C5 11.05 5.45 11.5 6 11.5Z" fill="currentColor" />
                    <path d="M10 11.5C10.55 11.5 11 11.05 11 10.5V8.5C11 7.95 10.55 7.5 10 7.5C9.45 7.5 9 7.95 9 8.5V10.5C9 11.05 9.45 11.5 10 11.5Z" fill="currentColor" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="asset-list">
        <div className="asset-list__header">
          <h2>Your Portfolio</h2>
        </div>
        <div className="asset-list__table-container">
          <div className="asset-list__loading">
            Loading assets...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="asset-list">
      <div className="asset-list__header">
        <h2>Your Portfolio</h2>
      </div>
      
      {assets.length === 0 ? (
        <div className="asset-list__table-container">
          <div className="asset-list__empty">
            <p>Your portfolio is empty. Add assets to get started.</p>
          </div>
        </div>
      ) : (
        <div className="asset-list__table-container">
          <div className="d-none d-md-block">
            <table className="asset-list__table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                  <th>24h Change</th>
                  <th>Portfolio %</th>
                  <th></th>
                </tr>
              </thead>
            </table>
          </div>
          
          <div style={{ height: Math.min(400, assets.length * 70 + 2) }}>
            <AutoSizer>
              {({ height, width }) => (
                <List
                  className="asset-list__virtual-list"
                  height={height}
                  itemCount={assets.length}
                  itemSize={70}
                  width={width}
                >
                  {renderRow}
                </List>
              )}
            </AutoSizer>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetList; 