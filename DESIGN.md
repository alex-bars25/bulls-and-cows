# Design — Bulls and Cows

## 1. Структуры данных и алгоритмы

### Состояние игры и история попыток

```ts
type GameState = {
  readonly settings: GameSettings;
  readonly secret: string;
  readonly history: readonly HistoryEntry[];
  readonly status: GameStatus;
  readonly startedAt: number;
};

type HistoryEntry = GuessResult & {
  readonly guess: string;
  readonly attemptNumber: number;
  readonly timestamp: number;
};
```

**Почему так:**

- **`secret: string`, а не `number`.** Секрет может начинаться с нуля (`0123`), число потеряло бы ведущий ноль. Строка + `createDigitValidator` дают корректную работу с любой базой.
- **`history: readonly HistoryEntry[]` — массив.** Нужны порядок вставки (хронология в UI) и полная итерация при рендере. `history.length + 1` даёт `attemptNumber` без отдельного счётчика. Добавление — `[...history, entry]`; при n ≤ 6 стоимость копирования несущественна.
- **`status: 'in-progress' | 'won'` — union, а не boolean.** TypeScript сужает тип по значению в `if`/`switch`, а новый статус (`'lost'`) — расширение union, не переделка boolean по коду.

### `evaluateGuess(secret, guess)`

```ts
export const evaluateGuess = (secret: string, guess: string): GuessResult => {
  const secretChars = [...secret.toLowerCase()];
  const guessChars = [...guess.toLowerCase()];

  const bulls = guessChars.filter((ch, i) => ch === secretChars[i]).length;
  const commonCount = guessChars.filter((ch) => secretChars.includes(ch)).length;
  const cows = commonCount - bulls;

  return { bulls, cows };
};
```

Шаги:
1. Нормализация регистра — для hex (`a` = `A`).
2. **bulls** — символы на совпадающих позициях.
3. **commonCount ** — символы попытки, присутствующие в секрете.
4. **cows = commonCount − bulls.**

Вычитание корректно только при уникальных символах — это гарантируют `generateSecret` и `isValidGuess`.

### `countPossibleSecrets(length, base)`

```ts
const cache = new Map<string, number>();

export const countPossibleSecrets = (length: number, base: number): number => {
  if (length === 0) return 1;
  if (length > base) return 0;

  const key = `${length}:${base}`;
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  const result = base * countPossibleSecrets(length - 1, base - 1);
  cache.set(key, result);
  return result;
};
```

Математика: `P(base, length) = base · P(base − 1, length − 1)` — фиксируем первую цифру (`base` вариантов), остаток — перестановка `length − 1` из `base − 1`.

- База: `length === 0` → `1`; `length > base` → `0` (нельзя выбрать больше уникальных цифр, чем есть).
- **Мемоизация** в `Map` в замыкании модуля — функция вызывается при каждом изменении настроек в UI. Ключ `"length:base"`, повторный вызов `O(1)`. Кэш скрыт от внешнего кода, контракт функции остаётся чистым.

---

## 2. Сложность (Big O)

`n` — длина секрета/попытки, `b` — основание системы счисления.

| Функция | Время | Память | Обоснование |
|---------|-------|--------|-------------|
| `generateSecret` | `O(n·b)` | `O(b+n)` | `n` уровней рекурсии; на уровне `i` копируется массив `available` длины `b − i` через `slice`+спред. Сумма `Σ(b − i) = n·b − n(n−1)/2`. |
| `evaluateGuess` | `O(n²)` | `O(n)` | Доминирует `commonCount`: `filter` по `n` элементам, внутри `sChars.includes(ch)` — линейный поиск по `n`. |
| `isValidGuess` | `O(n·b)` | `O(n)` | `chars.every(isDigit)` — `n` вызовов; каждый `isDigit` делает `DIGIT_CHARS.slice(0, b)` + `includes` — `O(b)`. |
| `countPossibleSecrets` | `O(n)` первый / `O(1)` повторный | `O(n)` | Глубина рекурсии `n`, на каждом уровне `O(1)` работы + `Map.get`/`Map.set`. Внутри одного вызова пары `(length, base)` уникальны — повторных подзадач нет, `O(n²)` не возникает. |

---

## 3. Принципы чистого кода

Принципы из модуля Clean Code, с указанием конкретных мест применения.

**SOLID**
- `evaluateGuess` (`src/logic/evaluateGuess.ts`) — только считает bulls/cows.
- `isValidGuess` (`src/logic/isValidGuess.ts`) — только проверяет валидность.
- `gameReducer` (`src/state/gameState.ts`) — только диспетчеризует по `action.type`.
- `el()` (`src/ui/index.ts`) — только создаёт DOM-элемент, не монтирует и не вешает обработчики.

**DRY**
- `DIGIT_CHARS` (`src/logic/digitChars.ts`) — одна строка `'0123456789abcdef'` для `createDigitValidator` и `generateSecret`.
- `createDigitValidator` — используется в `isValidGuess` (валидация) и `src/ui/index.ts` (фильтрация ввода).
- `formatDuration` и `baseLabel` (`src/ui/index.ts`) — единый формат времени и названия базы для таймера, истории, таблицы рекордов.

**Fail Fast**
- `generateSecret` (`src/logic/generateSecret.ts`) бросает `Error` при `length > base` — не возвращает мусор.
- `requireElement` (`src/ui/index.ts`) бросает `Error`, если элемент не найден, — не возвращает `null`.
- `expectState` (`tests/state/gameState.test.ts`) — сужает тип или падает с понятным сообщением.

**Separation of Concerns**
- `src/logic/` не импортирует `src/state/` и `src/ui/`; `src/state/` не импортирует `src/ui/`.
- `localStorage` вызывается только в `src/state/recordsStorage.ts`; `document`/`window` — только в `src/ui/index.ts`.