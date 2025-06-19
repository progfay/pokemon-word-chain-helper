# CLAUDE.md

Pokemon Word Chain Helper - helper app for Pokemon word-chain games runs on Web Browser.

[`/SPEC.md`](./SPEC.md) has more detail information about specification of app.

## Development Stack

- TypeScript
  - `next`, `react`, `react-dom`
    - Use React Server Component (RSC) without runtime server (run Server Component on build time)
  - `tailwindcss`
- Database
  - Large Pokemon dataset (JSON Format)
  - See [`POKEMON_DATA.md`](./POKEMON_DATA.md)
- Tools
  - Testing: `vitest`
  - Linter: `@biomejs/biome`
  - Type Checker: `tsc`

## Key Rules

- **Follow coding rules**: run `npm run lint:fix` and `npm test`, fix problems if commands are failed
- **Simple and Compact coding**: for readability and maintainability
- **Minimum Dependencies**: for maintainability
- **Update spec as needed**: [`SPEC.md`](./SPEC.md) MUST have latest specification
