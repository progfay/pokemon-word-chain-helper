# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Pokemon Word Chain Helper** - a web application that assists players in Pokemon shiritori (word chain) games. It provides search functionality to find Pokemon starting with specific Japanese characters, hint systems to help identify Pokemon, and tracks used Pokemon to prevent duplicates.

[SPEC.md](./SPEC.md) has more detail information.

The application implements a **strict MVC architecture** with comprehensive TypeScript types, event-driven communication, and extensive test coverage.

## Coding Guidelines

### Non-Null Assertions (`!.`)
**Strictly prohibited.** Use safer alternatives:

- **Optional chaining**: `shadowRoot?.querySelector()` instead of `shadowRoot!.querySelector()`
- **Null checks**: `if (element) element.click()` instead of `element!.click()`
- **Type guards**: `as HTMLElement | null` with conditional execution
- **Test assertions**: `expect(shadowRoot).toBeTruthy()` before access

Prevents runtime crashes and improves code safety.

## Essential Commands

### Development Workflow
```bash
# Build the application
npm run build

# Run all tests
npm test

# Run single test file
npm test src/tests/path/to/test.test.ts

# Type checking only
npm run typecheck

# Lint and format code
npm run lint
npm run lint:fix
```

## Architecture Overview

### MVC Pattern Implementation
This codebase follows a **strict MVC architecture** with event-driven communication:

- **Models** (`src/models/`): Pure data and business logic, emit events on state changes
- **Views** (`src/views/`): UI components using `createTypedView` factory pattern, emit user interaction events
- **Controllers** (`src/controllers/`): Coordinate between models and views, handle application flow

### Key Architectural Patterns

#### Factory Functions
All components use **factory functions** rather than classes:
```typescript
// Models
const pokemonModel = createPokemonModel();
const gameStateModel = createGameStateModel(pokemonModel);

// Views
const searchView = createSearchView();
const listView = createListView();

// Controllers
const appController = createAppController({ models, views });
```

#### Event-Driven Communication
Components communicate via typed events:
```typescript
// Views emit user interactions
searchView.on('search:character-select', (char: string) => {...});
searchView.on('search:pokemon-select', (pokemon: PokemonObject) => {...});

// Models emit state changes
pokemonModel.on('data:loaded', () => {...});
gameStateModel.on('state:changed', () => {...});
```

#### TypeScript Integration
Extensive use of TypeScript with strict interfaces defined in `src/types/`:
- `mvc.ts`: Core MVC interfaces (Model, View, Controller)
- `index.ts`: Pokemon data types and game interfaces

### Core Data Flow

1. **Pokemon Search**: User selects character → SearchController → SearchModel → Results displayed via ListView
2. **Pokemon Selection**: User clicks Pokemon → SearchController validates chain → GameStateModel updates → All views refresh
3. **Chain Validation**: GameStateModel tracks order, PokemonModel validates chain rules (last char → first char)

### Testing Strategy

- **Unit Tests**: Individual model/view/controller testing (`src/tests/`)
- **Integration Tests**: Full MVC interaction testing (`src/tests/integration/`)
- **Test Environment**: Vitest with jsdom for DOM testing
- **Coverage**: 101 tests with 100% pass rate maintained

### Performance Optimizations

- `errorHandler.ts`: Comprehensive error handling and reporting

## Key Architectural Decisions

### Japanese Character Handling
- All Japanese characters are normalized and stored in `src/utils/japaneseConstants.ts`
- Chain validation uses normalized character comparison
- Support for both hiragana and katakana input

### State Management
- **GameStateModel** maintains both used Pokemon set and order array for chain validation
- **PokemonModel** provides efficient search by first character using Map-based indexing
- **SearchModel** implements caching for search results

### Component Creation Pattern
All components follow consistent factory pattern:
```typescript
// Consistent across models, views, controllers
export const createComponentName = (dependencies?: Dependencies) => {
  const baseComponent = createBase({...});
  return {
    ...baseComponent,
    // Component-specific methods
  };
};
```

### Error Handling
Comprehensive error handling system with:
- Categorized errors (Model, View, Controller, Network)
- Severity levels (Low, Medium, High, Critical)
- User-friendly error messages in Japanese
- Error recovery strategies

## Development Guidelines

### Adding New Features
1. Define interfaces in `src/types/mvc.ts` first
2. Implement model layer with business logic
3. Create views using `createTypedView` pattern
4. Wire together with controllers using event system
5. Write comprehensive tests for all layers

### Testing New Code
- Unit tests for individual components
- Integration tests for cross-component functionality
- Maintain 100% test pass rate
- Test both success and error scenarios

### Japanese Text Handling
- Use utilities in `src/utils/japaneseConstants.ts` for character operations
- All user-facing text should be in Japanese
- Character normalization is handled automatically in chain validation

### Performance Considerations
- Use provided utility functions for performance optimizations
- Virtual scrolling is already implemented for large lists
- Debouncing is available for user input handling
- LRU caching is available for expensive operations

## Build System

- **TypeScript**: ES2020 target, strict mode enabled
- **Module System**: ES modules (`"type": "module"` in package.json)
- **Code Quality**: Biome for linting and formatting with strict rules
- **Testing**: Vitest with jsdom environment
- **Assets**: Pokemon database JSON file copied to dist/ during build