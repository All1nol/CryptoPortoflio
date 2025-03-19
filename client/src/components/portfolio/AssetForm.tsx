import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { addAsset } from '../../features/portfolio/portfolioSlice';
import { AssetSearchResult, AssetFormData } from '../../types';
import cryptoService from '../../services/cryptoService';
import { formatCryptoPrice, formatPercentage } from '../../utils/formatters';
import '../../styles/components/AssetForm.scss';

const AssetForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState<AssetFormData>({
    symbol: '',
    name: '',
    quantity: 0,
    currentPrice: 0,
    change24h: 0,
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AssetSearchResult[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<AssetSearchResult | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<number | null>(null);

  // Effect to close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Function to load popular assets
  const loadPopularAssets = async () => {
    setIsLoading(true);
    try {
      const assets = await cryptoService.getPopularAssets();
      setSearchResults(assets);
    } catch (error) {
      console.error('Failed to load popular assets', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load popular assets on initial render
  useEffect(() => {
    loadPopularAssets();
  }, []);

  // Handle asset search with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowDropdown(true);
    
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    searchTimeout.current = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        // If query is empty, show popular assets
        if (!query.trim()) {
          await loadPopularAssets();
        } else {
          // Otherwise search for matching assets
          const results = await cryptoService.searchAssets(query);
          setSearchResults(results);
        }
      } catch (error) {
        console.error('Error searching assets:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  // Handle selecting an asset from the dropdown
  const handleSelectAsset = (asset: AssetSearchResult) => {
    setSelectedAsset(asset);
    setFormData({
      symbol: asset.symbol,
      name: asset.name,
      quantity: formData.quantity,
      currentPrice: asset.currentPrice,
      change24h: asset.change24h,
    });
    setSearchQuery(`${asset.name} (${asset.symbol})`);
    setShowDropdown(false);
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'quantity' ? parseFloat(value) || 0 : value,
    });
  };

  // Reset form to initial state
  const handleReset = () => {
    setFormData({
      symbol: '',
      name: '',
      quantity: 0,
      currentPrice: 0,
      change24h: 0,
    });
    setSearchQuery('');
    setSelectedAsset(null);
    setError('');
  };

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!selectedAsset) {
      setError('Please select a cryptocurrency.');
      return;
    }
    
    if (formData.quantity <= 0) {
      setError('Please enter a valid quantity greater than 0.');
      return;
    }
    
    // Dispatch action to add asset
    dispatch(addAsset({
      symbol: formData.symbol,
      name: formData.name,
      quantity: formData.quantity,
      currentPrice: formData.currentPrice,
      change24h: formData.change24h,
      totalCost: formData.quantity * formData.currentPrice
    }));
    
    // Reset form after submission
    handleReset();
  };

  return (
    <div className="asset-form">
      <div className="asset-form__card">
        <div className="asset-form__header">
          <h3>Add New Asset</h3>
          <p>Add any cryptocurrency from Binance to your portfolio to track its performance.</p>
        </div>
        
        <form className="asset-form__form" onSubmit={handleSubmit}>
          <div className="asset-form__group asset-form__crypto-search" ref={dropdownRef}>
            <label htmlFor="crypto-search">Cryptocurrency</label>
            <div className="asset-form__search-container">
              <input
                id="crypto-search"
                type="text"
                placeholder="Search for a cryptocurrency by name or ticker..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setShowDropdown(true)}
                autoComplete="off"
              />
            </div>
            
            {error && error.includes('cryptocurrency') && <div className="error">{error}</div>}
            
            {showDropdown && (
              <div className="asset-form__crypto-search-dropdown">
                {isLoading ? (
                  <div className="asset-form__crypto-search-dropdown-loading">Loading...</div>
                ) : searchResults.length === 0 ? (
                  <div className="asset-form__crypto-search-dropdown-empty">No cryptocurrencies found</div>
                ) : (
                  <>
                    {!searchQuery.trim() && (
                      <div className="asset-form__crypto-search-dropdown-section-header">
                        Popular Cryptocurrencies
                      </div>
                    )}
                    {searchResults.map((asset) => (
                      <div
                        key={asset.id}
                        className="asset-form__crypto-search-dropdown-item"
                        onClick={() => handleSelectAsset(asset)}
                      >
                        <span className="name">{asset.name}</span>
                        <span className="symbol">{asset.symbol}</span>
                        <span className="price">{formatCryptoPrice(asset.currentPrice)}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
          
          <div className="asset-form__group">
            <label htmlFor="quantity">Quantity</label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              step="0.000001"
              min="0"
              value={formData.quantity || ''}
              onChange={handleChange}
              placeholder="Enter quantity"
            />
            {error && error.includes('quantity') && <div className="error">{error}</div>}
          </div>
          
          {selectedAsset && (
            <div className="asset-form__summary">
              <div className="asset-form__summary-item">
                <span>Current Price:</span>
                <span>{formatCryptoPrice(selectedAsset.currentPrice)}</span>
              </div>
              <div className="asset-form__summary-item">
                <span>24h Change:</span>
                <span className={selectedAsset.change24h >= 0 ? 'text-success' : 'text-danger'}>
                  {formatPercentage(selectedAsset.change24h)}
                </span>
              </div>
              <div className="asset-form__summary-item">
                <span>Total Value:</span>
                <span>{formatCryptoPrice(selectedAsset.currentPrice * formData.quantity)}</span>
              </div>
            </div>
          )}
          
          <div className="asset-form__actions">
            <button type="button" className="btn-reset" onClick={handleReset}>
              Reset
            </button>
            <button type="submit" className="btn-add" disabled={!selectedAsset || formData.quantity <= 0}>
              Add to Portfolio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssetForm; 