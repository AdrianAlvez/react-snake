# Snake (React + TypeScript + Vite)
Juego clásico de Snake implementado como SPA con React.

## Reglas
- Mueves la serpiente por una grilla.
- Si comes la comida, la serpiente crece y el puntaje aumenta.
- Las paredes **no** causan colisión: hay **wrap-around** (sales por un borde y reapareces por el opuesto).
- Pierdes únicamente si la cabeza choca contra alguna parte de tu propia serpiente.

## Controles
- Flechas o WASD: mover.
- Espacio: pausar / reanudar.
- R: reiniciar.

## Comandos
Instalación:
- `npm install`

Desarrollo (Vite + HMR):
- `npm run dev`

Build (TypeScript + Vite):
- `npm run build`

Previsualizar build:
- `npm run preview`

Lint:
- `npm run lint`

Tests (Vitest):
- `npm test` (watch)
- `npm run test:run` (una sola corrida)

## Estructura del proyecto
- `index.html`: entrada HTML.
- `vite.config.ts`: configuración de Vite.
- `eslint.config.js`: configuración de ESLint (flat config).
- `src/main.tsx`: monta la app React.
- `src/App.tsx`: wrapper mínimo que renderiza el juego.
- `src/SnakeGame.tsx`: componente principal (UI + input + loop del juego).
- `src/snakeLogic.ts`: lógica pura (movimiento, tick, generación de comida). Es el punto principal para unit tests.
- `src/snakeLogic.test.ts`: tests unitarios de la lógica.
- `src/index.css`, `src/App.css`: estilos.

## Notas de implementación
- El juego corre por “ticks” (intervalo) y aplica una transición de estado pura (`stepGame`).
- La comida se genera en una celda libre usando `randomFreeCell`.
- Para tests determinísticos, la lógica permite inyectar un `rng` (generador aleatorio).
