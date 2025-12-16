# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Comandos comunes

### Instalación
- Instalar dependencias:
  - `npm install`
  - Alternativa reproducible (usa `package-lock.json`): `npm ci`

### Desarrollo (HMR)
- Levantar el servidor de desarrollo de Vite:
  - `npm run dev`

### Build / producción
- Compilar TypeScript (project references) + bundle con Vite:
  - `npm run build`
- Previsualizar el build (requiere haber corrido `npm run build`):
  - `npm run preview`

### Lint
- Lint del repo:
  - `npm run lint`
- Lint de un archivo puntual (útil para iterar rápido):
  - `npm run lint -- src/SnakeGame.tsx`
  - o directamente: `npx eslint src/SnakeGame.tsx`

### Typecheck
- El typecheck se ejecuta como parte de `npm run build` (por `tsc -b`).
- Para correr solo el typecheck sin bundlear:
  - `npx tsc -b`

### Tests
- No hay runner de tests configurado actualmente (no existe script `test` en `package.json`).

## Arquitectura / estructura (alto nivel)

### Runtime
- App web SPA servida/bundleada por Vite.
- Entrada HTML: `index.html` monta el root y carga `src/main.tsx`.
- Entrada React: `src/main.tsx` crea el root de React y renderiza `App`.
- Composición: `src/App.tsx` es un wrapper mínimo que renderiza `SnakeGame`.

### Juego (Snake)
- Implementación principal en un único componente: `src/SnakeGame.tsx`.
- Modelo de estado:
  - `GameState` mantiene `snake` (lista de celdas), `direction`, `food`, `score`, `running` y `gameOver`.
- Loop del juego:
  - Un `useEffect` registra teclado (flechas/WASD, espacio pausa, `R` reinicia).
  - Otro `useEffect` crea un `setInterval` (constante `TICK_MS`) que aplica un “tick” y hace `setState` con la evolución del juego.
- Reglas principales (dentro del tick):
  - Movimiento con `move(head, direction)`.
  - Game over por salir del tablero (`GRID_SIZE`) o colisionar con el cuerpo (con excepción del último segmento cuando no se está comiendo).
  - Al comer: incrementa score, genera nueva comida con `randomFreeCell(nextSnake)` y crece la serpiente.
- Renderizado del tablero:
  - El tablero es un grid CSS (`.board`) y se generan todas las celdas en memoria como `<div className="cell ..." />`.
  - Para mapear rápidamente serpiente → celda, se deriva `snakeIndexByKey` con `useMemo`.

### Estilos
- Estilos globales y de layout base en `src/index.css`.
- Estilos del tablero/HUD y clases `.cell`, `.snake`, `.head`, `.food` en `src/App.css`.

## Configuración de tooling
- Vite: `vite.config.ts` usa `@vitejs/plugin-react`.
- ESLint: configuración “flat config” en `eslint.config.js` (ignora `dist/`).
- TypeScript:
  - `tsconfig.json` usa project references a `tsconfig.app.json` (app) y `tsconfig.node.json` (Vite config).
