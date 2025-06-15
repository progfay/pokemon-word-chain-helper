# Copilot Instructions for Pokemon Word Chain Helper

## Project Overview

A pure HTML/CSS/TypeScript web application to help players in Pokemon word chain games (しりとり).

## Core Technologies

- HTML/CSS/TypeScript only
- No runtime dependencies (only dev tools allowed)
- Dev dependencies:
  - Biome (for linting and formatting)
  - Vitest (for testing)
  - TypeScript

## Data Structure

### Pokemon Type

```typescript
type PokemonType =
  | "grass"
  | "poison"
  | "fire"
  | "flying"
  | "water"
  | "bug"
  | "normal"
  | "electric"
  | "ground"
  | "fairy"
  | "fighting"
  | "psychic"
  | "rock"
  | "steel"
  | "ice"
  | "ghost"
  | "dragon"
  | "dark";

type Pokemon = {
  /** Name of Pokemon (e.g.: "ピカチュウ") */
  name: string;
  /** Genus of Pokemon (e.g.: "ねずみポケモン") */
  genus: string;
  /** The first generation that the Pokemon appear (e.g.: 1) */
  generation_id: number;
  /** Pokedex number (e.g.: 25) */
  pokedex_number: number;
  /** Type name that the Pokemon has (e.g.: "electric") */
  types: PokemonType[];
  /** Added for search functionality */
  firstChar?: string;
  /** Added for search functionality */
  lastChar?: string;
};
```

## Code Style Requirements

1. **TypeScript**
   - Use strict type checking
   - Use proper type annotations
   - Define interfaces/types in `/src/types/index.ts`

2. **Import/Export**
   - Use ES Module syntax
   - Use Import Attributes for JSON: `import data from './file.json' with { type: "json" }`
   - Include `.js` extensions in imports for browser compatibility

3. **Testing**
   - Write tests for critical functionality
   - Use Vitest for testing framework
   - Focus on character conversion and search logic

4. **Code Organization**
   - Keep modules focused and single-responsibility
   - Use proper ES6+ features
   - Maintain clear separation of concerns

## Build and Quality Tools

1. **Biome**
   - Use for linting and formatting
   - Follow Biome's recommended rules
   - Run before commits: `npm run lint`

2. **TypeScript**
   - Run type checking: `npm run typecheck`
   - Fix all type errors before committing
   - Use strict mode

3. **Development Server**
   - Use http-server for local development
   - Run with: `npm run serve`

## UI Requirements

1. **Responsive Design**
   - Work on both desktop and mobile
   - Clear and readable typography
   - Proper spacing and layout

2. **Search Interface**
   - Real-time search results
   - Clear error messages for invalid input
   - Detailed Pokemon information display

3. **Game State Display**
   - Clear list of used Pokemon
   - Prominent display of remaining count
   - Visible warnings for "ん" ending Pokemon

## Error Handling

1. **Input Validation**
   - Validate Japanese character input
   - Show clear error messages
   - Prevent invalid Pokemon selections

2. **Data Validation**
   - Validate Pokemon types against enum
   - Handle missing or invalid data gracefully
   - Log warnings for data issues

## Performance Considerations

1. **Search Optimization**
   - Pre-process Pokemon names for quick search
   - Cache normalized character forms
   - Efficient filtering of Pokemon list

2. **Memory Management**
   - Avoid unnecessary object creation
   - Clean up event listeners when needed
   - Efficient DOM updates

## Security

1. **Input Sanitization**
   - Sanitize user input before processing
   - Validate JSON data during import
   - Prevent XSS in HTML injection

2. **Error Exposure**
   - Don't expose internal errors to users
   - Log errors appropriately
   - Show user-friendly error messages
