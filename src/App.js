import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Range, getTrackBackground } from 'react-range';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  BubbleController,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import { sma, runGA, evaluateStrategyDetailed } from './gaAlgorithm';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BubbleController,
  Title,
  Tooltip,
  Legend
);

export default function App() {
  const [populationSize, setPopulationSize] = useState(50);
  const [generations, setGenerations] = useState(50);
  const [shortMARange, setShortMARange] = useState([2, 250]); 
  const [longMARange, setLongMARange] = useState([20, 500]); 
  const [mutationRate, setMutationRate] = useState(0.1);
  const [initialCapital, setInitialCapital] = useState(10000);
  const [bestParams, setBestParams] = useState(null);

  const [prices, setPrices] = useState([]);
  const [shortLineData, setShortLineData] = useState([]);
  const [longLineData, setLongLineData] = useState([]);
  const [ticker, setTicker] = useState('AAPL'); 
  const [dates, setDates] = useState([]);

  const [isLoading, setIsLoading] = useState(false); 
  const [isFetchingData, setIsFetchingData] = useState(false); 
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');

  // Data for the second chart:
  const [capitalTimeline, setCapitalTimeline] = useState([]);
  const [buyEvents, setBuyEvents] = useState([]);
  const [sellEvents, setSellEvents] = useState([]);

  // Fetch historical data when ticker changes
  useEffect(() => {
    async function fetchData() {
      setIsFetchingData(true);
      try {
        const response = await fetch(`http://localhost:5000/api/history?ticker=${ticker}&range=10y`);
        const json = await response.json();
        setPrices(json.prices);
        setDates(json.dates);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsFetchingData(false);
      }
    }
    fetchData();
  }, [ticker]);

  const handleRunGA = async () => {
    if (!prices || prices.length === 0) return;
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 100)); 
    const best = runGA({
      data: prices,
      populationSize,
      generations,
      minShort: shortMARange[0],
      maxShort: shortMARange[1],
      minLong: longMARange[0],
      maxLong: longMARange[1],
      mutationRate,
      initialCapital
    });
    setBestParams(best);

    if (best) {
      const bestShort = best.shortMA;
      const bestLong = best.longMA;
      setShortLineData(sma(prices, bestShort));
      setLongLineData(sma(prices, bestLong));

      // Evaluate strategy in detail
      const details = evaluateStrategyDetailed(bestShort, bestLong, prices, initialCapital);
      setCapitalTimeline(details.capitalTimeline);
      setBuyEvents(details.buyEvents);
      setSellEvents(details.sellEvents);
    }
    setIsLoading(false);
  };

  const priceChartData = {
    labels: dates.length === prices.length ? dates : prices.map((_, i) => i),
    datasets: [
      {
        label: 'Price',
        data: prices,
        borderColor: 'blue',
        fill: false,
        pointRadius: 0,
      },
      {
        label: bestParams ? `Short MA (${bestParams.shortMA})` : 'Short MA',
        data: shortLineData,
        borderColor: 'green',
        fill: false,
        pointRadius: 0,
      },
      {
        label: bestParams ? `Long MA (${bestParams.longMA})` : 'Long MA',
        data: longLineData,
        borderColor: 'red',
        fill: false,
        pointRadius: 0,
      }
    ]
  };

  // Second chart: show capital over time and buy/sell markers
  const capitalLabels = prices.map((_, i) => i); // or use dates if you prefer matching indexes
  const capitalChartData = {
    labels: capitalLabels,
    datasets: [
      {
        label: 'Capital Over Time',
        data: capitalTimeline,
        borderColor: 'purple',
        fill: false,
        pointRadius: 0,
      },
      {
        label: 'Buy Events',
        data: buyEvents,
        borderColor: 'transparent',
        backgroundColor: 'green',
        pointRadius: 5,
        type: 'bubble'
      },
      {
        label: 'Sell Events',
        data: sellEvents,
        borderColor: 'transparent',
        backgroundColor: 'red',
        pointRadius: 5,
        type: 'bubble'
      }
    ]
  };

  const containerStyle = {
    width: '100vw',
    height: '100%',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: backgroundColor,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    boxSizing: 'border-box'
  };

  const contentStyle = {
    width: '90%',
    maxWidth: '900px'
  };

  const controlPanelStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    marginBottom: '20px',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  };

  const sectionStyle = {
    flex: '1 1 45%',
    minWidth: '300px'
  };

  const labelStyle = { fontWeight: 'bold', display: 'block', marginBottom: '5px' };

  const loadingSpinnerStyle = {
    width: '40px',
    height: '40px',
    border: '6px solid #ccc',
    borderTop: '6px solid #333',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '20px auto'
  };

  const renderDoubleSlider = (values, setValues, min, max, label) => (
    <div style={{ marginBottom: '20px' }}>
      <label style={labelStyle}>{label}: {values[0]} - {values[1]}</label>
      <Range
        step={1}
        min={min}
        max={max}
        values={values}
        onChange={vals => setValues(vals)}
        renderTrack={({ props, children }) => {
          return (
            <div
              {...props}
              style={{
                ...props.style,
                height: '6px',
                width: '100%',
                borderRadius: '3px',
                background: getTrackBackground({
                  values: values,
                  colors: ['#ccc', '#548BF4', '#ccc'],
                  min: min,
                  max: max
                }),
                margin: '20px 0',
                position: 'relative'
              }}
            >
              {children}
            </div>
          );
        }}
        renderThumb={({ props }) => (
          <div
            {...props}
            style={{
              ...props.style,
              height: '20px',
              width: '20px',
              borderRadius: '10px',
              background: '#548BF4',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 0 2px #aaa'
            }}
          />
        )}
      />
    </div>
  );

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <h1 style={{ textAlign: 'center' }}>Genetic Algorithm Trading Strategy (10 Years Data)</h1>
        
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Background Color:</label>
          <input
            type="color"
            value={backgroundColor}
            onChange={e => setBackgroundColor(e.target.value)}
          />
        </div>

        <div style={controlPanelStyle}>
          <div style={sectionStyle}>
            <label style={labelStyle}>Choose Ticker:</label>
            <select
              value={ticker}
              onChange={e => setTicker(e.target.value)}
              style={{ width: '100%', padding: '5px' }}
            >
              <option value="AAPL">AAPL</option>
              <option value="MSFT">MSFT</option>
              <option value="TSLA">TSLA</option>
              <option value="GOOGL">GOOGL</option>
              <option value="AMZN">AMZN</option>
            </select>
          </div>

          <div style={sectionStyle}>
            <label style={labelStyle}>Population Size: {populationSize}</label>
            <input
              type="range"
              min="20"
              max="20000" // Increased max population
              value={populationSize}
              onChange={e => setPopulationSize(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div style={sectionStyle}>
            <label style={labelStyle}>Generations: {generations}</label>
            <input
              type="range"
              min="10"
              max="200"
              value={generations}
              onChange={e => setGenerations(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div style={sectionStyle}>
            {renderDoubleSlider(shortMARange, setShortMARange, 2, 250, 'Short MA Range')}
          </div>

          <div style={sectionStyle}>
            {renderDoubleSlider(longMARange, setLongMARange, 20, 500, 'Long MA Range')}
          </div>

          <div style={sectionStyle}>
            <label style={labelStyle}>Mutation Rate: {mutationRate.toFixed(2)}</label>
            <input
              type="range"
              step="0.01"
              min="0.01"
              max="0.5"
              value={mutationRate}
              onChange={e => setMutationRate(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div style={sectionStyle}>
            <label style={labelStyle}>Initial Capital: {initialCapital}</label>
            <input
              type="range"
              min="1000"
              max="100000"
              step="1000"
              value={initialCapital}
              onChange={e => setInitialCapital(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <button
            onClick={handleRunGA}
            disabled={!prices || prices.length === 0 || isFetchingData || isLoading}
            style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
          >
            {isFetchingData ? 'Fetching Data...' : 'Run GA'}
          </button>
        </div>

        {isLoading && (
          <div style={{ textAlign: 'center' }}>
            <div style={loadingSpinnerStyle} />
            <p>Running the genetic algorithm. Please wait...</p>
          </div>
        )}

        {!isLoading && bestParams && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <h2>Best Found Parameters for {ticker}:</h2>
            <p>Short MA: {bestParams.shortMA}, Long MA: {bestParams.longMA}</p>
            <p>Final Fitness (Capital): {bestParams.fitness.toFixed(2)}</p>
          </div>
        )}

        <div style={{ height: '400px', marginTop: '20px' }}>
          {isFetchingData ? (
            <p style={{ textAlign: 'center' }}>Loading data...</p>
          ) : (
            prices && prices.length > 0 ? <Line data={priceChartData} /> : <p>No data available...</p>
          )}
        </div>

        {/* Second Chart for Capital Timeline and Buy/Sell Events */}
        {bestParams && capitalTimeline.length > 0 && (
          <div style={{ height: '400px', marginTop: '40px' }}>
            <h3 style={{ textAlign: 'center' }}>Capital Timeline with Buy/Sell Events</h3>
            <Line
              data={capitalChartData}
              options={{
                scales: {
                  x: { title: { display: true, text: 'Index' } },
                  y: { title: { display: true, text: 'Capital' } }
                },
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: function(tooltipItem) {
                        // Customize tooltip for buy/sell points if needed
                        return `${tooltipItem.dataset.label}: ${tooltipItem.formattedValue}`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
