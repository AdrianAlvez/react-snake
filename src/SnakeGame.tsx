import { useEffect, useMemo, useState, type ReactElement } from 'react'

type Vec = { x: number; y: number }
type Direction = 'up' | 'down' | 'left' | 'right'

type GameState = {
  snake: Vec[]
  direction: Direction
  food: Vec
  score: number
  running: boolean
  gameOver: boolean
}

const GRID_SIZE = 20
const TICK_MS = 120

const isSame = (a: Vec, b: Vec) => a.x === b.x && a.y === b.y

const isOpposite = (a: Direction, b: Direction) => {
  return (
    (a === 'up' && b === 'down') ||
    (a === 'down' && b === 'up') ||
    (a === 'left' && b === 'right') ||
    (a === 'right' && b === 'left')
  )
}

const move = (head: Vec, dir: Direction): Vec => {
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

const randomFreeCell = (snake: Vec[]): Vec => {
  const occupied = new Set(snake.map((p) => `${p.x},${p.y}`))

  // Try random sampling first.
  for (let i = 0; i < 200; i++) {
    const x = Math.floor(Math.random() * GRID_SIZE)
    const y = Math.floor(Math.random() * GRID_SIZE)
    const key = `${x},${y}`
    if (!occupied.has(key)) return { x, y }
  }

  // Fallback: deterministic scan.
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const key = `${x},${y}`
      if (!occupied.has(key)) return { x, y }
    }
  }

  // Should only happen when the snake fills the board.
  return { x: 0, y: 0 }
}

const initialState = (): GameState => {
  const snake: Vec[] = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ]

  return {
    snake,
    direction: 'right',
    food: randomFreeCell(snake),
    score: 0,
    running: false,
    gameOver: false,
  }
}

export function SnakeGame() {
  const [state, setState] = useState<GameState>(() => initialState())

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key

      if (key === ' ' || key === 'Spacebar') {
        e.preventDefault()
        setState((s) => {
          if (s.gameOver) return s
          return { ...s, running: !s.running }
        })
        return
      }

      if (key === 'r' || key === 'R') {
        setState(initialState())
        return
      }

      const nextDir: Direction | null =
        key === 'ArrowUp' || key === 'w' || key === 'W'
          ? 'up'
          : key === 'ArrowDown' || key === 's' || key === 'S'
            ? 'down'
            : key === 'ArrowLeft' || key === 'a' || key === 'A'
              ? 'left'
              : key === 'ArrowRight' || key === 'd' || key === 'D'
                ? 'right'
                : null

      if (!nextDir) return
      e.preventDefault()

      setState((s) => {
        if (isOpposite(s.direction, nextDir)) return s
        return { ...s, direction: nextDir }
      })
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (!state.running || state.gameOver) return

    const id = window.setInterval(() => {
      setState((s) => {
        if (!s.running || s.gameOver) return s

        const head = s.snake[0]
        const newHead = move(head, s.direction)

        const outOfBounds =
          newHead.x < 0 ||
          newHead.y < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y >= GRID_SIZE

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
          const nextFood = randomFreeCell(nextSnake)

          // Win condition: board filled.
          const filled = nextScore + 3 >= GRID_SIZE * GRID_SIZE
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
      })
    }, TICK_MS)

    return () => window.clearInterval(id)
  }, [state.running, state.gameOver])

  const snakeIndexByKey = useMemo(() => {
    const map = new Map<string, number>()
    state.snake.forEach((p, idx) => map.set(`${p.x},${p.y}`, idx))
    return map
  }, [state.snake])

  const cells = useMemo(() => {
    const out: ReactElement[] = []

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const key = `${x},${y}`
        const idx = snakeIndexByKey.get(key)

        let className = 'cell'
        if (idx === 0) className += ' head'
        else if (idx !== undefined) className += ' snake'
        if (state.food.x === x && state.food.y === y) className += ' food'

        out.push(<div key={key} className={className} />)
      }
    }

    return out
  }, [snakeIndexByKey, state.food])

  return (
    <div className="snake">
      <div className="hud">
        <div className="title">Snake</div>
        <div className="meta">
          <div>
            <span className="label">Puntos:</span> {state.score}
          </div>
          <div className="keys">Flechas/WASD · Espacio: pausa · R: reiniciar</div>
        </div>

        <div className="buttons">
          <button
            onClick={() =>
              setState((s) => (s.gameOver ? s : { ...s, running: !s.running }))
            }
            disabled={state.gameOver}
          >
            {state.running ? 'Pausar' : 'Iniciar'}
          </button>
          <button onClick={() => setState(initialState())}>Reiniciar</button>
        </div>

        {state.gameOver && (
          <div className="gameover">Game Over</div>
        )}
      </div>

      <div
        className="board"
        role="grid"
        aria-label="Tablero Snake"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, 18px)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, 18px)`,
        }}
      >
        {cells}
      </div>
    </div>
  )
}
