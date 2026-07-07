# Russian Learning Quiz

A web application for learning Russian vocabulary using Czech-style romanization for Spanish speakers.

## Features

- **20 questions per round** with immediate feedback
- **Three question types**:
  1. Multiple choice: Find the Russian word from Spanish
  2. Translation: Write Spanish word from Russian
  3. Writing: Write the Russian word (romanized)
- **Duolingo-style retry**: Failed questions are re-asked until mastered
- **Czech-style romanization**: Uses familiar Latin characters with stress marks
- **2000 most common Russian words** (expandable database)

## Romanization Guide

This project uses Czech-style Latin alphabet to represent Russian pronunciation:

- **Stress marks**: `á, é, í, ó, ú, ý` indicate the stressed syllable
- **Semivowel**: `j` represents [j] sound (like Spanish "y" in "ay")
- **Palatalization**: `lj, nj` for palatalized sounds (ль, нь)
- **Final palatalization**: `'` (apostrophe) at word end

### Examples

| Cyrillic | Romanized | Spanish |
|----------|-----------|---------|
| дом | dóm | casa |
| солнце | sólnce | sol |
| вода | vodá | agua |
| любовь | ljubóv' | amor |
| семья | sem'já | familia |

## Tech Stack

- **React** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components

## Development Commands

### Install dependencies
```bash
npm install
```

### Start development server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for production
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

### Type checking
```bash
npx tsc --noEmit
```

### Linting
```bash
npx eslint .
```

## Project Structure

```
russian/
├── src/
│   ├── components/
│   │   ├── ui/           # shadcn/ui components
│   │   └── quiz/         # Quiz-specific components
│   ├── data/
│   │   └── words.ts      # Russian vocabulary database
│   ├── types/
│   │   └── index.ts      # TypeScript type definitions
│   ├── hooks/            # Custom React hooks
│   ├── lib/
│   │   └── utils.ts      # Utility functions
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles with Tailwind
├── public/               # Static assets
└── package.json          # Dependencies and scripts
```

## Adding New Words

To expand the vocabulary database, edit `src/data/words.ts`:

```typescript
export const words: Word[] = [
  {
    id: 1,
    cyrillic: 'дом',
    romanized: 'dóm',
    spanish: 'casa'
  },
  // Add more words here...
];
```

## Roadmap

- [ ] Implement quiz logic and state management
- [ ] Create multiple-choice question component
- [ ] Create Spanish translation input component
- [ ] Create Russian word input component with virtual keyboard
- [ ] Add progress tracking and statistics
- [ ] Implement spaced repetition algorithm
- [ ] Add difficulty levels
- [ ] Create word expansion to 2000+ entries
- [ ] Add audio pronunciation (optional)
- [ ] Dark mode toggle

## License

MIT
