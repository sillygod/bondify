# TanStack Query Usage

## Overview

Bondify uses TanStack Query (formerly React Query) v5 for server state management. This provides automatic caching, background refetching, and request deduplication.

## Setup

`QueryClientProvider` is configured in `App.tsx`:

```tsx
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    {/* ... */}
  </QueryClientProvider>
);
```

## Available Hooks

### User & Stats

| Hook | Location | Description |
|------|----------|-------------|
| `useStats()` | `StatsContext` | User profile and learning stats |

**Usage:**
```tsx
import { useStats } from "@/contexts/StatsContext";

const { user, stats, isLoading, refreshStats } = useStats();
```

### Game Questions

| Hook | Location | Description |
|------|----------|-------------|
| `useRocketQuestions(limit)` | `useGameQuestions.ts` | Rocket game questions |
| `useDictionQuestions(limit)` | `useGameQuestions.ts` | Diction game questions |
| `useRecallQuestions(limit)` | `useGameQuestions.ts` | Recall game questions |

**Usage:**
```tsx
import { useRocketQuestions } from "@/hooks/useGameQuestions";

const { refetch, isFetching, data } = useRocketQuestions(10);

// Fetch on demand
const startGame = async () => {
  const result = await refetch();
  const questions = result.data;
};
```

### Wordlist

| Hook | Location | Description |
|------|----------|-------------|
| `useWordlist()` | `useWordlist.ts` | Fetch user's word list |
| `useAddWord()` | `useWordlist.ts` | Mutation to add word |
| `useRemoveWord()` | `useWordlist.ts` | Mutation to remove word |
| `useUpdateWord()` | `useWordlist.ts` | Mutation to update word |

**Usage:**
```tsx
import { useWordlist, useAddWord } from "@/hooks/useWordlist";

const { data, isLoading } = useWordlist();
const addWord = useAddWord();

// Add a word
await addWord.mutateAsync({ word: "example" });
```

## Query Keys

| Key Pattern | Data |
|-------------|------|
| `['user']` | User profile |
| `['learning-stats']` | Learning statistics |
| `['game-questions', type, limit]` | Game questions |
| `['wordlist']` | User's word list |
| `['wordlist-stats']` | Wordlist statistics |

## Invalidation

To refresh data after mutations:
```tsx
const queryClient = useQueryClient();

// Invalidate specific query
queryClient.invalidateQueries({ queryKey: ['wordlist'] });

// Invalidate all game questions
queryClient.invalidateQueries({ queryKey: ['game-questions'] });
```
