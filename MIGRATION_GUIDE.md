# Migration Guide: From Monolithic to MVC Architecture

## Overview

This guide helps developers understand the architectural changes made during the MVC refactoring and how to work with the new codebase structure.

## 📋 **What Changed**

### **Before: Monolithic Structure**
```
src/
├── modules/
│   ├── data.ts           # Mixed data and UI logic
│   ├── gameState.ts      # Mixed state and UI updates
│   ├── search.ts         # Mixed search and rendering
│   └── ui.ts             # Monolithic UI handling
└── app.ts                # Everything wired together
```

### **After: Clean MVC Architecture**
```
src/
├── models/               # 📊 Data & Business Logic
│   ├── pokemonModel.ts   # Pokemon data management
│   ├── gameStateModel.ts # Game state & rules
│   └── searchModel.ts    # Search logic & caching
├── views/                # 🎨 UI Components  
│   ├── searchView.ts     # Search input & error display
│   ├── listView.ts       # Pokemon list rendering
│   ├── gameStatusView.ts # Game status & restart
│   ├── usedPokemonView.ts# Used Pokemon display
│   └── warningView.ts    # Game warnings
├── controllers/          # 🎮 Coordination Logic
│   ├── appController.ts  # Main app coordination
│   ├── searchController.ts # Search interactions
│   └── gameController.ts # Game logic & rules
└── utils/                # 🛠️ Performance & Utilities
    ├── virtualization.ts # Virtual list for large datasets
    ├── debounce.ts       # Rate limiting
    └── memoization.ts    # Caching optimizations
```

## 🚀 **Key Benefits for Developers**

### **1. Clear Separation of Concerns**
- **Models**: Handle data and business logic only
- **Views**: Handle UI rendering and user interactions only  
- **Controllers**: Coordinate between models and views

### **2. Improved Testability**
- Each component can be tested in isolation
- Mock dependencies easily for unit tests
- 85/85 tests currently passing

### **3. Better Type Safety**
- Full TypeScript coverage with proper interfaces
- Clear dependency injection patterns
- JSDoc documentation for all public APIs

## 📖 **Working with the New Architecture**

### **Adding New Features**

#### **1. Adding a New View Component**
```typescript
// src/views/myNewView.ts
import { createTypedView } from "./createTypedView.js";

interface MyViewState {
  data: string[];
  isLoading: boolean;
}

export const createMyNewView = () => {
  const view = createTypedView<MyViewState>({
    createElement: () => {
      const container = document.createElement("div");
      container.className = "my-new-view";
      return container;
    },
    updateElement: (state) => {
      const element = view.render();
      // Update DOM based on state
    },
    setupEventListeners: () => {
      const element = view.render();
      // Set up event listeners
      return () => {
        // Cleanup function
      };
    }
  });

  return view;
};
```

#### **2. Adding a New Controller**
```typescript
// src/controllers/myNewController.ts
import { createController } from "./createController.js";

export interface MyControllerDependencies {
  myModel: {
    getData: () => any[];
    updateData: (data: any) => void;
  };
  myView: {
    on: (event: string, callback: Function) => void;
    update: (data: any) => void;
  };
}

export const createMyNewController = (deps: MyControllerDependencies) => {
  const { myModel, myView } = deps;

  const handleUserAction = (data: any) => {
    try {
      myModel.updateData(data);
      myView.update({ success: true });
    } catch (error) {
      console.error("Error handling user action:", error);
      myView.update({ errorMessage: "Action failed" });
    }
  };

  const controller = createController({
    setupController: async () => {
      myView.on("user:action", handleUserAction);
      // Initialize view
      myView.update({ data: myModel.getData() });
    },
    cleanupController: () => {
      // Cleanup handled by view components
    }
  });

  return {
    ...controller,
    handleUserAction
  };
};
```

#### **3. Adding a New Model**
```typescript
// src/models/myNewModel.ts
import { createModel } from "./createModel.js";

interface MyModelState {
  items: any[];
  cache: Map<string, any>;
}

export const createMyNewModel = () => {
  const baseModel = createModel({
    id: "my-new-model",
    initialState: {
      items: [],
      cache: new Map()
    } as MyModelState
  });

  const state = baseModel.getState() as MyModelState;

  return {
    ...baseModel,

    getItems(): any[] {
      return state.items;
    },

    addItem(item: any): void {
      try {
        state.items.push(item);
        baseModel.setState(state);
      } catch (error) {
        baseModel.handleError(error as Error);
      }
    },

    clearCache(): void {
      state.cache.clear();
      baseModel.setState(state);
    }
  };
};
```

### **Integrating Components in AppController**
```typescript
// src/controllers/appController.ts
import { createMyNewController } from "./myNewController.js";
import { createMyNewModel } from "../models/myNewModel.js";
import { createMyNewView } from "../views/myNewView.js";

// In createAppController():
const myNewModel = createMyNewModel();
const myNewView = createMyNewView();
const myNewController = createMyNewController({
  myModel: myNewModel,
  myView: myNewView
});

// In setupController():
await myNewController.initialize();

// In cleanupController():
myNewController.destroy();
```

## 🔧 **Common Patterns**

### **Event Handling**
```typescript
// Controllers handle events from views
searchView.on("search:input", (query: string) => {
  searchController.handleSearch(query);
});

// Models emit state changes
gameStateModel.on("state:updated", () => {
  gameController.updateAllViews();
});
```

### **Error Handling**
```typescript
// All controllers include try-catch blocks
const handleAction = (data: any) => {
  try {
    // Main logic
  } catch (error) {
    console.error("Error in action:", error);
    view.update({ errorMessage: "Action failed" });
  }
};
```

### **State Management**
```typescript
// Models manage state internally
const state = baseModel.getState() as ModelState;
state.property = newValue;
baseModel.setState(state); // Triggers state:updated event
```

## 🧪 **Testing Patterns**

### **Controller Testing**
```typescript
// Mock dependencies
const mockDependencies = {
  model: {
    getData: vi.fn().mockReturnValue([]),
    updateData: vi.fn()
  },
  view: {
    on: vi.fn(),
    update: vi.fn()
  }
};

const controller = createMyController(mockDependencies);

// Test behavior
await controller.initialize();
expect(mockDependencies.view.on).toHaveBeenCalledWith("event", expect.any(Function));
```

### **Integration Testing**
```typescript
// Test real component interactions
const models = { /* real models */ };
const views = { /* real views */ };
const controllers = { /* real controllers */ };

// Test workflows
await controllers.searchController.initialize();
controllers.searchController.handleSearch("test");
expect(models.searchModel.getCachedResults()).toHaveLength(1);
```

## 🎯 **Best Practices**

### **Do's ✅**
- **Follow MVC boundaries**: Models handle data, Views handle UI, Controllers coordinate
- **Use dependency injection**: Pass dependencies to constructors
- **Handle errors gracefully**: Always wrap risky operations in try-catch
- **Test components in isolation**: Mock dependencies for unit tests
- **Use TypeScript interfaces**: Define clear contracts between components
- **Add JSDoc comments**: Document public APIs

### **Don'ts ❌**
- **Don't mix concerns**: Keep UI logic out of models, business logic out of views
- **Don't access DOM in models**: Models should be UI-agnostic
- **Don't handle business logic in views**: Views should be dumb renderers
- **Don't skip error handling**: Always handle potential failures
- **Don't ignore TypeScript errors**: Fix type issues immediately

## 🔄 **Performance Considerations**

### **Virtual Lists for Large Data**
```typescript
import { VirtualList } from "../utils/virtualization.js";

const virtualList = new VirtualList({
  container: listContainer,
  itemHeight: 60,
  visibleCount: 10,
  totalCount: allPokemon.length,
  renderItem: (index, element) => {
    const pokemon = allPokemon[index];
    element.innerHTML = `<div>${pokemon.name}</div>`;
  }
});
```

### **Debounced Search**
```typescript
import { debounce } from "../utils/debounce.js";

const debouncedSearch = debounce((query: string) => {
  searchController.handleSearch(query);
}, 300);

searchInput.addEventListener("input", (e) => {
  debouncedSearch(e.target.value);
});
```

### **Memoized Calculations**
```typescript
import { memoizeLRU } from "../utils/memoization.js";

const memoizedSearch = memoizeLRU(
  (query: string) => expensiveSearchOperation(query),
  100 // LRU cache size
);
```

## 📚 **Further Reading**

- See `src/tests/integration/mvc-integration.test.ts` for real usage examples
- Check `src/types/mvc.ts` for complete interface definitions
- Review `REFACTORING.md` for the complete implementation timeline
- Look at existing controllers for patterns and best practices

## 🆘 **Getting Help**

- All public APIs are documented with JSDoc comments
- Integration tests show real-world usage patterns
- Each component follows consistent patterns for easy understanding
- Error messages include context for debugging

---

**Happy coding with the new MVC architecture!** 🎉