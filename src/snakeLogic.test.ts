import { describe, expect, it } from 'vitest'
import { move, stepGame, type GameState } from './snakeLogic'

function makeRng(values: number[]) {
  let i = 0
  return () => {
    if (i >= values.length) {
      throw new Error('RNG sin valores: el test necesita más samples')
    }
    return values[i++]
  }
}

describe('Snake logic', () => {
  it("1) mueve la cabeza correctamente según la dirección", () => {
    const head = { x: 5, y: 5 }

    expect(move(head, 'up')).toEqual({ x: 5, y: 4 })
    expect(move(head, 'down')).toEqual({ x: 5, y: 6 })
    expect(move(head, 'left')).toEqual({ x: 4, y: 5 })
    expect(move(head, 'right')).toEqual({ x: 6, y: 5 })
  })

  it('2) genera comida nueva en una celda válida y libre tras comer', () => {
    const gridSize = 5

    const s: GameState = {
      snake: [
        { x: 2, y: 2 },
        { x: 1, y: 2 },
        { x: 0, y: 2 },
      ],
      direction: 'right',
      food: { x: 3, y: 2 },
      score: 0,
      running: true,
      gameOver: false,
    }

    // Primer intento: (3,2) -> ocupado (newHead). Segundo: (4,4) -> libre.
    const rng = makeRng([
      0.61,
      0.41,
      0.81,
      0.81,
    ])

    const next = stepGame(s, { gridSize, rng })

    expect(next.food.x).toBeGreaterThanOrEqual(0)
    expect(next.food.y).toBeGreaterThanOrEqual(0)
    expect(next.food.x).toBeLessThan(gridSize)
    expect(next.food.y).toBeLessThan(gridSize)

    const occupied = new Set(next.snake.map((p) => `${p.x},${p.y}`))
    expect(occupied.has(`${next.food.x},${next.food.y}`)).toBe(false)
  })

  it('3) crece la serpiente y aumenta el score cuando come', () => {
    const gridSize = 5

    const s: GameState = {
      snake: [
        { x: 2, y: 2 },
        { x: 1, y: 2 },
        { x: 0, y: 2 },
      ],
      direction: 'right',
      food: { x: 3, y: 2 },
      score: 0,
      running: true,
      gameOver: false,
    }

    const rng = makeRng([
      0.81,
      0.81,
    ])

    const next = stepGame(s, { gridSize, rng })

    expect(next.score).toBe(1)
    expect(next.snake.length).toBe(s.snake.length + 1)
    expect(next.snake[0]).toEqual({ x: 3, y: 2 })
  })

  it('4) termina el juego cuando la serpiente colisiona consigo misma', () => {
    const gridSize = 5

    const s: GameState = {
      snake: [
        { x: 2, y: 2 },
        { x: 2, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 2 },
      ],
      direction: 'up', // newHead = (2,1) => colisión con el cuerpo
      food: { x: 4, y: 4 },
      score: 0,
      running: true,
      gameOver: false,
    }

    const next = stepGame(s, { gridSize })
    expect(next.gameOver).toBe(true)
    expect(next.running).toBe(false)
  })

  it('5) termina el juego cuando la serpiente colisiona con la pared', () => {
    const gridSize = 5

    const s: GameState = {
      snake: [
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: 2 },
      ],
      direction: 'up', // newHead y = -1 => fuera
      food: { x: 4, y: 4 },
      score: 0,
      running: true,
      gameOver: false,
    }

    const next = stepGame(s, { gridSize })
    expect(next.gameOver).toBe(true)
    expect(next.running).toBe(false)
  })
})
