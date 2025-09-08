export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  snake: Position[];
  food: Position;
  direction: Position;
  score: number;
  gameOver: boolean;
  paused: boolean;
}

export const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
} as const;

export const BOARD_SIZE = 20;
export const CELL_SIZE = 20;

export const getInitialGameState = (): GameState => ({
  snake: [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ],
  food: generateFood([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ]),
  direction: DIRECTIONS.RIGHT,
  score: 0,
  gameOver: false,
  paused: false,
});

export const generateFood = (snake: Position[]): Position => {
  let food: Position;
  do {
    food = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    };
  } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
  return food;
};

export const moveSnake = (gameState: GameState): GameState => {
  if (gameState.gameOver || gameState.paused) {
    return gameState;
  }

  const { snake, direction, food } = gameState;
  const head = snake[0];
  const newHead: Position = {
    x: head.x + direction.x,
    y: head.y + direction.y,
  };

  // Check wall collision
  if (
    newHead.x < 0 ||
    newHead.x >= BOARD_SIZE ||
    newHead.y < 0 ||
    newHead.y >= BOARD_SIZE
  ) {
    return { ...gameState, gameOver: true };
  }

  // Check self collision
  if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
    return { ...gameState, gameOver: true };
  }

  const newSnake = [newHead, ...snake];

  // Check food collision
  if (newHead.x === food.x && newHead.y === food.y) {
    return {
      ...gameState,
      snake: newSnake,
      food: generateFood(newSnake),
      score: gameState.score + 10,
    };
  }

  // Remove tail if no food eaten
  newSnake.pop();

  return {
    ...gameState,
    snake: newSnake,
  };
};

export const changeDirection = (
  currentDirection: Position,
  newDirection: Position
): Position => {
  // Prevent reversing direction
  if (
    currentDirection.x + newDirection.x === 0 &&
    currentDirection.y + newDirection.y === 0
  ) {
    return currentDirection;
  }
  return newDirection;
};

export const getGameSpeed = (score: number): number => {
  // Base speed is 200ms, decreases as score increases (faster game)
  const baseSpeed = 200;
  const speedIncrease = Math.floor(score / 50) * 20;
  return Math.max(100, baseSpeed - speedIncrease);
};

export const saveHighScore = (score: number): void => {
  const currentHigh = getHighScore();
  if (score > currentHigh) {
    localStorage.setItem('snakeHighScore', score.toString());
  }
};

export const getHighScore = (): number => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('snakeHighScore');
    return saved ? parseInt(saved, 10) : 0;
  }
  return 0;
};