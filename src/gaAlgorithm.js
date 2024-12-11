// gaAlgorithm.js

export function sma(data, period) {
    const result = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        result.push(null);
      } else {
        const slice = data.slice(i - period + 1, i + 1);
        const avg = slice.reduce((a, b) => a + b, 0) / period;
        result.push(avg);
      }
    }
    return result;
  }
  
  export function evaluateStrategy(shortMA, longMA, data, initialCapital = 10000) {
    const shortLine = sma(data, shortMA);
    const longLine = sma(data, longMA);
  
    let capital = initialCapital;
    let position = 0; // 0 means no shares, 1 means holding
    let entryPrice = 0;
  
    for (let i = 0; i < data.length; i++) {
      if (shortLine[i] === null || longLine[i] === null) continue;
  
      // Buy signal
      if (shortLine[i] > longLine[i] && position === 0) {
        position = 1;
        entryPrice = data[i];
      }
  
      // Sell signal
      if (shortLine[i] < longLine[i] && position === 1) {
        position = 0;
        const profit = data[i] - entryPrice;
        capital += profit;
      }
    }
  
    // Close position at end if still open
    if (position === 1) {
      const profit = data[data.length - 1] - entryPrice;
      capital += profit;
    }
  
    return capital;
  }
  
  // A more detailed evaluation that records capital over time and buy/sell events
  export function evaluateStrategyDetailed(shortMA, longMA, data, initialCapital = 10000) {
    const shortLine = sma(data, shortMA);
    const longLine = sma(data, longMA);
  
    let capital = initialCapital;
    let position = 0;
    let entryPrice = 0;
  
    const capitalTimeline = [];
    const buyEvents = [];
    const sellEvents = [];
  
    for (let i = 0; i < data.length; i++) {
      // If MAs aren't ready, capital remains the same as before
      if (i === 0) {
        capitalTimeline.push(capital);
      } else {
        capitalTimeline.push(capital); 
      }
  
      if (shortLine[i] === null || longLine[i] === null) continue;
  
      // Buy signal
      if (shortLine[i] > longLine[i] && position === 0) {
        position = 1;
        entryPrice = data[i];
        buyEvents.push({ x: i, y: capital });
      }
  
      // Sell signal
      if (shortLine[i] < longLine[i] && position === 1) {
        position = 0;
        const profit = data[i] - entryPrice;
        capital += profit;
        sellEvents.push({ x: i, y: capital });
        // Update capital timeline after selling
        capitalTimeline[i] = capital;
      }
    }
  
    // If still holding at the end, sell at last price
    if (position === 1) {
      const profit = data[data.length - 1] - entryPrice;
      capital += profit;
      sellEvents.push({ x: data.length - 1, y: capital });
      capitalTimeline[data.length - 1] = capital;
    }
  
    return {
      finalCapital: capital,
      capitalTimeline,
      buyEvents,
      sellEvents
    };
  }
  
  // GA Functions
  function createIndividual(minShort, maxShort, minLong, maxLong) {
    const shortMA = Math.floor(Math.random() * (maxShort - minShort + 1)) + minShort;
    let longMA = Math.floor(Math.random() * (maxLong - minLong + 1)) + minLong;
    // Ensure longMA > shortMA
    if (longMA <= shortMA) {
      longMA = shortMA + 1;
      if (longMA > maxLong) longMA = maxLong;
    }
    return { shortMA, longMA };
  }
  
  function mutate(ind, minShort, maxShort, minLong, maxLong, mutationRate) {
    let { shortMA, longMA } = ind;
    if (Math.random() < mutationRate) {
      shortMA += Math.random() < 0.5 ? 1 : -1;
      shortMA = Math.max(minShort, Math.min(maxShort, shortMA));
    }
    if (Math.random() < mutationRate) {
      longMA += Math.random() < 0.5 ? 1 : -1;
      longMA = Math.max(minLong, Math.min(maxLong, longMA));
      if (longMA <= shortMA) {
        longMA = shortMA + 1;
        if (longMA > maxLong) longMA = maxLong;
      }
    }
    return { shortMA, longMA };
  }
  
  function crossover(parent1, parent2) {
    const shortMA = Math.random() < 0.5 ? parent1.shortMA : parent2.shortMA;
    const longMA = Math.random() < 0.5 ? parent1.longMA : parent2.longMA;
    return { shortMA, longMA };
  }
  
  export function runGA({
    data,
    populationSize,
    generations,
    minShort,
    maxShort,
    minLong,
    maxLong,
    mutationRate,
    initialCapital
  }) {
    let population = [];
    for (let i = 0; i < populationSize; i++) {
      population.push(createIndividual(minShort, maxShort, minLong, maxLong));
    }
  
    let bestIndividual = null;
    let bestFitness = -Infinity;
  
    for (let gen = 0; gen < generations; gen++) {
      let scored = population.map(ind => {
        const fitness = evaluateStrategy(ind.shortMA, ind.longMA, data, initialCapital);
        return { ...ind, fitness };
      });
  
      scored.forEach(ind => {
        if (ind.fitness > bestFitness) {
          bestFitness = ind.fitness;
          bestIndividual = ind;
        }
      });
  
      scored.sort((a, b) => b.fitness - a.fitness);
      const survivors = scored.slice(0, Math.floor(populationSize / 2));
  
      const nextGen = [];
      while (nextGen.length < populationSize) {
        const parent1 = survivors[Math.floor(Math.random() * survivors.length)];
        const parent2 = survivors[Math.floor(Math.random() * survivors.length)];
        let offspring = crossover(parent1, parent2);
        offspring = mutate(offspring, minShort, maxShort, minLong, maxLong, mutationRate);
        nextGen.push(offspring);
      }
  
      population = nextGen;
    }
  
    return bestIndividual ? { ...bestIndividual, fitness: bestFitness } : null;
  }
  