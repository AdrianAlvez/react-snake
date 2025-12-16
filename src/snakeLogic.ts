export type Vec = { x: number; y: number }
export type Direction = 'up' | 'down' | 'left' | 'right'

export type GameState = {
  snake: Vec[]
  direction: Direction
  food: Vec
  score: number
  running: boolean
  gameOver: boolean
}

export const GRID_SIZE = 20
export const TICK_MS = 120

export const isSame = (a: Vec, b: Vec) => a.x === b.x && a.y === b.y

export const isOpposite = (a: Direction, b: Direction) => {
  return (
    (a === 'up' && b === 'down') ||
    (a === 'down' && b === 'up') ||
    (a === 'left' && b === 'right') ||
    (a === 'right' && b === 'left')
  )
}

export const move = (head: Vec, dir: Direction): Vec => {
  switch (dir) {
    case 'up':
      return { x: head.x, y: head.y - 1 }
    case 'down':
      return { x: head.x, y: head.y + 1 }
    case 'left':
      return { x: head.x - 1, y: head.y }
    case 'right':
      return { x: head.x + 1, y: head.y }
  }
}

type StepConfig = {
  gridSize?: number
  rng?: () => number
}

export const randomFreeCell = (
  snake: Vec[],
  { gridSize = GRID_SIZE, rng = Math.random }: StepConfig = {}
): Vec => {
  const occupied = new Set(snake.map((p) => `${p.x},${p.y}`))

  // Try random sampling first.
  for (let i = 0; i < 200; i++) {
    const x = Math.floor(rng() * gridSize)
    const y = Math.floor(rng() * gridSize)
    const key = `${x},${y}`
    if (!occupied.has(key)) return { x, y }
  }

  // Fallback: deterministic scan.
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const key = `${x},${y}`
      if (!occupied.has(key)) return { x, y }
    }
  }

  // Should only happen when the snake fills the board.
  return { x: 0, y: 0 }
}

export const initialState = (
  { gridSize = GRID_SIZE, rng = Math.random }: StepConfig = {}
): GameState => {
  const center = Math.floor(gridSize / 2)
  const snake: Vec[] = [
    { x: center, y: center },
    { x: center - 1, y: center },
    { x: center - 2, y: center },
  ]

  return {
    snake,
    direction: 'right',
    food: randomFreeCell(snake, { gridSize, rng }),
    score: 0,
    running: false,
    gameOver: false,
  }
}

export const stepGame = (
  s: GameState,
  { gridSize = GRID_SIZE, rng = Math.random }: StepConfig = {}
): GameState => {
  if (!s.running || s.gameOver) return s

  const head = s.snake[0]
  const newHead = move(head, s.direction)

  const outOfBounds =
    newHead.x < 0 || newHead.y < 0 || newHead.x >= gridSize || newHead.y >= gridSize

  if (outOfBounds) {
    return { ...s, running: false, gameOver: true }
  }

  const willEat = isSame(newHead, s.food)

  // If we are not eating, the tail will move away, so exclude it from self-collision.
  const bodyToCheck = willEat ? s.snake : s.snake.slice(0, -1)
  const hitsSelf = bodyToCheck.some((p) => isSame(p, newHead))

  if (hitsSelf) {
    return { ...s, running: false, gameOver: true }
  }

  const nextSnake = [newHead, ...s.snake]
  if (!willEat) nextSnake.pop()

  if (willEat) {
    const nextScore = s.score + 1
    const nextFood = randomFreeCell(nextSnake, { gridSize, rng })

    // Win condition: board filled.
    const filled = nextScore + 3 >= gridSize * gridSize
    return {
      ...s,
      snake: nextSnake,
      food: nextFood,
      score: nextScore,
      running: filled ? false : s.running,
      gameOver: filled ? true : s.gameOver,
    }
  }

  return { ...s, snake: nextSnake }
}
