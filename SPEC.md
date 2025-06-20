# Pokemon Word Chain Helper - Specification

## Overview

Pokemon Word Chain Helper is a web application that assists players in Pokemon shiritori (word chain) games. It provides a comprehensive Pokemon database with hints and tracks used Pokemon to help players find the next Pokemon in the chain.

## Core Features

### 1. Used Pokemon Management

#### Purpose
Track which Pokemon have been used in the current game session to avoid repetition.

#### Features
- **Add Pokemon**: Users can mark Pokemon as used via text input in the footer
- **Usage History Display**: Shows list of used Pokemon with count (e.g., "使用履歴 (3件)")
- **Clear All**: Single button to mark all used Pokemon as unused
- **Individual Removal**: Users can mark specific used Pokemon as unused
- **Visual Distinction**: Used Pokemon cards have different styling (grayed out, "使用済み" badge)

#### UI Components
- **Footer Input Section**: Text input with "追加" button for adding used Pokemon
- **Usage History Section**: Header with count and clear button, followed by list of used Pokemon cards
- **Pokemon Cards**: Visual indication when Pokemon is marked as used

### 2. Pokemon Hints System

#### Structure Overview
The hints are organized in a hierarchical accordion structure:
```
Accordion Groups (行) → Tabs (Character) → Pokemon Cards
```

#### Accordion Groups (行)
- **Groups**: あ行, か行, が行, さ行, ざ行, た行, だ行, な行, は行, ば行, ぱ行, ま行, や行, ら行, わ行
- **State**: Expandable/collapsible
- **Display**: Group name + Pokemon count badge (e.g., "あ行 24")
- **Default**: All groups are collapsed by default

#### Character Tabs
- **Within each group**: Individual character tabs (あ, い, う, え, お for あ行)
- **State**: Only one tab active at a time per group
- **Default**: First character tab is active when group is expanded
- **Styling**: Active tab has different background color and styling

#### Pokemon Cards
- **Layout**: Grid layout within each character tab
- **Information Display**: Pokedex number, hints, and answer button
- **Interactive Elements**: Expandable hint sections and image controls

### 3. Pokemon Card Details

#### Card Header
- **Pokedex Number**: Displays as "#XXX" (e.g., "#024", "#065")
- **Answer Button**: "答えを見る" button to reveal Pokemon name
- **Used State**: Shows "使用済み" badge and Pokemon name when marked as used

#### Hint Categories
Pokemon cards contain multiple hint categories that can be revealed individually:

##### 1. Generation (世代)
- **Icon**: Calendar icon
- **Expandable**: Collapsed by default
- **Content**: Shows generation (e.g., "第1世代")
- **Purpose**: Helps narrow down Pokemon by release generation

##### 2. Type (タイプ)
- **Icon**: Tag icon
- **Expandable**: Can be expanded/collapsed
- **Content**: Shows Pokemon type(s) as colored badges
- **Examples**: "どく" (Poison), "エスパー" (Psychic)
- **Colors**: Each type has specific color coding

##### 3. Image (画像)
- **Icon**: Image icon
- **Expandable**: Can be expanded/collapsed
- **Content**: Pokemon image with visibility controls
- **Interactive**: Multiple viewing options

#### Image Visibility System
Pokemon images have four distinct visibility states:

1. **Hidden**: No image shown (default state)
2. **Silhouette**: Black silhouette only
3. **Blurred**: Blurred version of the image
4. **Full Color**: Complete, clear image

#### Image Controls
- **Toggle Buttons**: "シルエット", "ぼかし", "フルカラー"
- **Single Selection**: Only one visibility mode active at a time
- **Visual Feedback**: Active button has different styling
- **Image Container**: 120px height container for consistent layout

### 4. Answer Reveal System

#### Confirmation Modal
When user clicks "答えを見る" button:
1. **Modal Appears**: Confirmation dialog
2. **Options**:
   - **Confirm**: Reveals Pokemon name, marks as used, closes modal
   - **Cancel**: Closes modal with no action
3. **Consequence**: Confirming automatically adds Pokemon to used list

#### Post-Reveal State
- Pokemon name becomes visible in card header
- Card gains "使用済み" badge
- Card styling changes to indicate used state
- Pokemon appears in usage history section

## Data Structure

### Pokemon Database
- **Format**: JSON file with Pokemon data
- **Organization**: Grouped by first katakana character for efficient shiritori searches
- **Data Fields**: Name, genus, generation, Pokedex number, types

### Pokemon Data Schema
```typescript
type Pokemon = [
  name: string,           // Pokemon name in katakana
  genus: string,          // Pokemon genus
  generation_id: number,  // Generation (1-9)
  pokedex_number: number, // National Pokedex number
  types: [PokemonType] | [PokemonType, PokemonType] // 1-2 types
];

type PokemonDatabase = {
  [firstChar: string]: Pokemon[];
};
```

### Type System
- **18 Pokemon Types**: normal, fire, water, electric, grass, ice, fighting, poison, ground, flying, psychic, bug, rock, ghost, dragon, dark, steel, fairy
- **Color Coding**: Each type has specific color for visual distinction

## User Interface Design

### Layout Structure
```
┌─────────────────────────────────────┐
│          Usage History              │
├─────────────────────────────────────┤
│                                     │
│         Accordion Groups            │
│    ┌─ あ行 (24) ─────────────────┐  │
│    │  [あ] [い] [う] [え] [お]     │  │
│    │  ┌─────────┐ ┌─────────┐   │  │
│    │  │Pokemon  │ │Pokemon  │   │  │
│    │  │Card     │ │Card     │   │  │
│    │  └─────────┘ └─────────┘   │  │
│    └─────────────────────────────┘  │
│    ┌─ か行 (31) ─────────────────┐  │
│    │         (collapsed)         │  │
│    └─────────────────────────────┘  │
│                                     │
├─────────────────────────────────────┤
│    ポケモンを使用する                │
│    [Input Field] [追加 Button]      │
└─────────────────────────────────────┘
```

### Responsive Design
- **Mobile-First**: Design optimized for 375px width
- **Adaptive Layout**: Content adjusts to screen size
- **Touch-Friendly**: Adequate button sizes and spacing

### Color Scheme
- **Primary**: Blue (#2563EB)
- **Background**: Light gray (#F8FAFC)
- **Cards**: White (#FFFFFF)
- **Borders**: Light gray (#E5E7EB)
- **Text**: Dark gray (#111827)
- **Disabled**: Medium gray (#6B7280)

## User Experience Flow

### 1. Initial Load
1. App loads with あ行 accordion expanded
2. あ tab is active by default
3. Pokemon cards show minimal information
4. Usage history is empty

### 2. Exploring Pokemon
1. User browses accordion groups
2. User clicks character tabs to see different Pokemon
3. User expands hint categories as needed
4. User adjusts image visibility for visual hints

### 3. Revealing Answers
1. User clicks "答えを見る" on a Pokemon card
2. Confirmation modal appears
3. User confirms to see answer
4. Pokemon name is revealed and marked as used

### 4. Managing Used Pokemon
1. Used Pokemon appear in usage history
2. User can add more Pokemon via footer input
3. User can clear all used Pokemon or remove individual ones
4. Visual feedback shows used state throughout interface

## Technical Requirements

### Performance
- **Efficient Rendering**: React Server Components for optimal performance
- **Data Loading**: JSON database loaded efficiently
- **Search Optimization**: Data organized by first character for quick lookups

### Accessibility
- **Keyboard Navigation**: All interactive elements keyboard accessible
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Sufficient contrast ratios for all text
- **Focus Management**: Clear focus indicators

### Browser Support
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile Browsers**: iOS Safari, Chrome Mobile
- **Progressive Enhancement**: Core functionality works without JavaScript

## Development Guidelines

### Code Quality
- **TypeScript**: Strict typing for all components
- **Testing**: Unit tests for all major functionality
- **Linting**: Biome for code quality and consistency
- **Type Checking**: No TypeScript errors allowed

### File Structure
```
app/
├── globals.css           # Global styles
├── layout.tsx           # Root layout
├── page.tsx             # Main page component
├── components/          # React components
├── lib/                 # Utility functions
└── types/               # TypeScript type definitions
```

### Component Architecture
- **Server Components**: Use RSC for static content
- **Client Components**: Only when interactivity is needed
- **Atomic Design**: Break down UI into reusable components
- **Props Interface**: Clear TypeScript interfaces for all props

## Future Enhancements

### Potential Features
- **Search Functionality**: Search Pokemon by name or characteristics
- **Game Modes**: Different shiritori game variations
- **Statistics**: Track usage patterns and game statistics
- **Favorites**: Save frequently used Pokemon
- **Filters**: Filter by type, generation, or other criteria
- **Offline Support**: PWA functionality for offline use

### Scalability Considerations
- **Database Updates**: Easy updating of Pokemon data
- **Internationalization**: Support for multiple languages
- **Performance Monitoring**: Track app performance metrics
- **User Preferences**: Save user settings and preferences