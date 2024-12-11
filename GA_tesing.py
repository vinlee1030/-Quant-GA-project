import random
import statistics

def sma(data, period):
    result = []
    for i in range(len(data)):
        if i < period - 1:
            result.append(None)
        else:
            window = data[i - period + 1 : i + 1]
            avg = sum(window) / period
            result.append(avg)
    return result

def evaluate_strategy(shortMA, longMA, data, initial_capital=10000):
    short_line = sma(data, shortMA)
    long_line = sma(data, longMA)

    capital = initial_capital
    position = 0
    entry_price = 0

    for i in range(len(data)):
        if short_line[i] is None or long_line[i] is None:
            continue

        # Buy signal
        if short_line[i] > long_line[i] and position == 0:
            position = 1
            entry_price = data[i]

        # Sell signal
        if short_line[i] < long_line[i] and position == 1:
            position = 0
            profit = data[i] - entry_price
            capital += profit

    # Close position at end if still open
    if position == 1:
        profit = data[-1] - entry_price
        capital += profit

    return capital

def create_individual(min_short, max_short, min_long, max_long):
    shortMA = random.randint(min_short, max_short)
    longMA = random.randint(min_long, max_long)
    if longMA <= shortMA:
        longMA = shortMA + 1
        if longMA > max_long:
            longMA = max_long
    return (shortMA, longMA)

def mutate(ind, min_short, max_short, min_long, max_long, mutation_rate):
    shortMA, longMA = ind
    if random.random() < mutation_rate:
        shortMA += random.choice([1, -1])
        shortMA = max(min_short, min(max_short, shortMA))
    if random.random() < mutation_rate:
        longMA += random.choice([1, -1])
        longMA = max(min_long, min(max_long, longMA))
        if longMA <= shortMA:
            longMA = shortMA + 1
            if longMA > max_long:
                longMA = max_long
    return (shortMA, longMA)

def crossover(parent1, parent2):
    shortMA = parent1[0] if random.random() < 0.5 else parent2[0]
    longMA = parent1[1] if random.random() < 0.5 else parent2[1]
    return (shortMA, longMA)

def run_ga(data, population_size, generations, min_short, max_short, min_long, max_long, mutation_rate, initial_capital=10000):
    population = [create_individual(min_short, max_short, min_long, max_long) for _ in range(population_size)]
    best_individual = None
    best_fitness = float('-inf')

    for _ in range(generations):
        scored = []
        for ind in population:
            fitness = evaluate_strategy(ind[0], ind[1], data, initial_capital)
            scored.append((ind, fitness))
        
        scored.sort(key=lambda x: x[1], reverse=True)
        if scored[0][1] > best_fitness:
            best_fitness = scored[0][1]
            best_individual = scored[0][0]

        survivors = [x[0] for x in scored[:population_size//2]]

        next_gen = []
        while len(next_gen) < population_size:
            parent1 = random.choice(survivors)
            parent2 = random.choice(survivors)
            offspring = crossover(parent1, parent2)
            offspring = mutate(offspring, min_short, max_short, min_long, max_long, mutation_rate)
            next_gen.append(offspring)
        population = next_gen

    return best_individual, best_fitness

# Example usage:
# data = [ ... ] # some price data
# best_params, fitness = run_ga(data, 50, 50, 2, 250, 20, 500, 0.1)
# print("Best:", best_params, "Fitness:", fitness)
