import { useEffect, useMemo, useState, type ReactElement } from 'react'
import {
  GRID_SIZE,
  TICK_MS,
  initialState,
  isOpposite,
  stepGame,
  type Direction,
  type GameState,
} from './snakeLogic'

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
      setState((s) => stepGame(s))
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
