# Russian Self-Learning Quiz

A web app for learning Russian vocabulary, designed for **Spanish speakers**. It uses a Spanish-friendly romanization so you can focus on words and pronunciation before mastering the Cyrillic alphabet.

Built with React 19, TypeScript, Vite and Tailwind CSS.

## Features

- **Five question types**, mixed within each round:
  - Multiple choice — Spanish → Russian
  - Multiple choice — Russian → Spanish
  - Write the answer in Spanish
  - Write the answer in Russian (romanized)
  - Hangman — guess the Russian word letter by letter
- **20 questions per round** with immediate feedback and a running score.
- **Spaced retry** — questions you get wrong are re-asked until you master them.
- **Keyboard-friendly** — answer multiple choice with keys `1`–`4` and press `Enter` to continue.
- **Category selection** — pick from 19 categories (basic, family, food, verbs, grammar, technology…) or practise the whole vocabulary.
- **Daily score tracking** — your progress for the day is saved locally in the browser.
- **Bilingual UI** — interface available in English and Spanish (`react-i18next`).
- **~1,048 words** across 19 categories in `src/data/russian-words-full.ts`.

## Romanization

Each word is shown in Cyrillic and in a Spanish-friendly Latin transcription. The full guide is in [`ROMANIZATION.md`](./ROMANIZATION.md); the essentials:

| Marker | Meaning | Example |
|--------|---------|---------|
| `á é í ó ú` | stressed syllable | `vodá` (вода — agua) |
| `'` | soft consonant | `den'` (день — día) |
| `j` | Spanish "j" sound (х) | `jleb` (хлеб — pan) |
| `ch` | ч | `chay` (чай — té) |
| `sh` / `zh` / `shch` | ш / ж / щ | `shkóla`, `zhená`, `óvoshch` |
| `ye yo yu ya` | word-initial е ё ю я | `yedá` (еда — comida) |

## Tech stack

- **React 19** + **TypeScript**
- **Vite 7** — dev server and build
- **Tailwind CSS 4** — styling
- **Zustand** — state management
- **react-i18next** — internationalization (en/es)
- **lucide-react** — icons

## Getting started

Requires [Node.js](https://nodejs.org/) 18+ and [Yarn 4](https://yarnpkg.com/) (declared via `packageManager`; run `corepack enable` if Yarn isn't available).

```bash
# Install dependencies
yarn install

# Start the dev server (http://localhost:5173)
yarn dev

# Type-check + production build
yarn build

# Preview the production build
yarn preview

# Lint
yarn lint
```

## Project structure

```
src/
├── components/
│   ├── quiz/            # Quiz flow: container, page, category selection,
│   │   ├── questions/   # one component per question type
│   │   ├── options/     # multiple-choice option rendering
│   │   └── feedback/    # correct/incorrect feedback
│   ├── DailyScoreDisplay.tsx
│   └── LanguageSwitcher.tsx
├── data/
│   └── russian-words-full.ts   # vocabulary + category config
├── hooks/              # useQuiz, useLocalStorage
├── stores/             # Zustand quiz store
├── utils/              # question generation
├── locales/            # en.json / es.json UI strings
├── i18n/               # i18next setup
└── types/              # shared TypeScript types
```

## Adding words

Add entries to `src/data/russian-words-full.ts`:

```ts
{ id: 1049, cyrillic: 'мир', romanized: 'mir', spanish: 'paz', category: 'abstract' }
```

Each word has a unique `id`, its `cyrillic` form, the `romanized` transcription, the `spanish` meaning, and a `category` (see `CATEGORIES_CONFIG` in the same file).

## License

[MIT](./LICENSE)
