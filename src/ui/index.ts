import { createDigitValidator } from '../logic/createDigitValidator';
import { countPossibleSecrets } from '../logic/countPossibleSecrets';
import { evaluateGuess } from '../logic/evaluateGuess';
import { generateSecret } from '../logic/generateSecret';
import { isValidGuess } from '../logic/isValidGuess';
import { isValidSettings } from '../logic/isValidSettings';
import { addRecord, type RecordEntry, type Records } from '../logic/records';
import { gameReducer, type GameSettings, type GameState } from '../state/gameState';
import { loadRecords, saveRecords } from '../state/recordsStorage';

const RECORDS_LIMIT = 10;

type ElementOptions = {
  className?: string;
  textContent?: string;
  hidden?: boolean;
  attributes?: Record<string, string>;
};

const el = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options: ElementOptions = {},
  ...children: (Node | string)[]
): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);
  if (options.className !== undefined) node.className = options.className;
  if (options.textContent !== undefined) node.textContent = options.textContent;
  if (options.hidden !== undefined) node.hidden = options.hidden;
  if (options.attributes !== undefined) {
    for (const [key, value] of Object.entries(options.attributes)) {
      node.setAttribute(key, value);
    }
  }
  node.append(...children);
  return node;
};

const formatDuration = (durationMs: number): string => {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const baseLabel = (base: number): string => {
  switch (base) {
    case 2:
      return 'Binary';
    case 8:
      return 'Octal';
    case 10:
      return 'Decimal';
    case 16:
      return 'Hex';
    default:
      return `Base ${base}`;
  }
};

// --- Settings screen ---
const baseOptions: { value: string; label: string }[] = [
  { value: '2', label: 'Binary (2)' },
  { value: '8', label: 'Octal (8)' },
  { value: '10', label: 'Decimal (10)' },
  { value: '16', label: 'Hex (16)' },
];

const baseInputs: HTMLInputElement[] = [];

const baseFieldset = el(
  'fieldset',
  {},
  el('legend', { textContent: 'Base' }),
  ...baseOptions.map(({ value, label }) => {
    const input = el('input', { attributes: { type: 'radio', name: 'base', value } });
    if (value === '2') input.checked = true;
    baseInputs.push(input);
    return el('label', {}, input, ' ', label);
  }),
);

const lengthInput = el('input', {
  attributes: {
    type: 'number',
    name: 'length',
    min: '2',
    max: '6',
    value: '2',
    required: '',
  },
});

const possibleSecretsElement = el('p', { className: 'info' });
const startButton = el('button', {
  textContent: 'Start',
  attributes: { type: 'submit' },
});

const settingsForm = el(
  'form',
  { attributes: { novalidate: '' } },
  baseFieldset,
  el('label', {}, 'Length: ', lengthInput),
  possibleSecretsElement,
  startButton,
);

const settingsScreen = el(
  'section',
  { className: 'screen' },
  el('h1', { textContent: 'Bulls and Cows' }),
  settingsForm,
);

// --- Game screen ---
const gameInfoElement = el('p', { className: 'info' });
const timerElement = el('p', { className: 'timer', textContent: '00:00' });
const guessInput = el('input', {
  attributes: {
    type: 'text',
    autocomplete: 'off',
    spellcheck: 'false',
    'aria-label': 'Your guess',
  },
});
const guessForm = el(
  'form',
  { attributes: { novalidate: '' } },
  guessInput,
  el('button', { textContent: 'Guess', attributes: { type: 'submit' } }),
);
const guessErrorElement = el('p', {
  className: 'error',
  attributes: { role: 'alert' },
});
const historyList = el('ol', { className: 'history' });
const winInfoElement = el('p');
const newGameButton = el('button', {
  textContent: 'New game',
  attributes: { type: 'button' },
});
const winBanner = el(
  'div',
  { className: 'win-banner', hidden: true },
  el('h2', { textContent: 'You won!' }),
  winInfoElement,
  newGameButton,
);

const gameScreen = el(
  'section',
  { className: 'screen', hidden: true },
  el('header', {}, el('h2', { textContent: 'Guess the secret' }), gameInfoElement, timerElement),
  guessForm,
  guessErrorElement,
  historyList,
  winBanner,
);

// --- Records screen ---
const recordsBody = el('tbody');
const recordsScreen = el(
  'section',
  { className: 'screen' },
  el('h2', { textContent: 'Records' }),
  el(
    'table',
    {},
    el(
      'thead',
      {},
      el(
        'tr',
        {},
        el('th', { textContent: '#' }),
        el('th', { textContent: 'Attempts' }),
        el('th', { textContent: 'Time' }),
        el('th', { textContent: 'Settings' }),
        el('th', { textContent: 'Date' }),
      ),
    ),
    recordsBody,
  ),
);

// --- Mount ---
const app = el('main', { className: 'app' }, settingsScreen, gameScreen, recordsScreen);
document.body.append(app);

// --- App state ---
let gameState: GameState | null = null;
let records: Records = loadRecords();
let timerIntervalId: number | null = null;

// --- Rendering ---
const renderRecords = (): void => {
  const rows = records.map((entry, index) => {
    const row = el('tr');
    row.append(
      el('td', { textContent: String(index + 1) }),
      el('td', { textContent: String(entry.attempts) }),
      el('td', { textContent: formatDuration(entry.durationMs) }),
      el('td', { textContent: `${baseLabel(entry.settings.base)} × ${entry.settings.length}` }),
      el('td', { textContent: new Date(entry.finishedAt).toLocaleString() }),
    );
    return row;
  });
  recordsBody.replaceChildren(...rows);
};

const renderHistory = (): void => {
  if (gameState === null) return;
  const items = gameState.history.map((entry) =>
    el('li', {
      textContent: `${entry.guess.toUpperCase()} — bulls: ${entry.bulls}, cows: ${entry.cows}`,
    }),
  );
  historyList.replaceChildren(...items);
};

const renderGame = (): void => {
  if (gameState === null) return;
  const { settings, status } = gameState;
  gameInfoElement.textContent = `${baseLabel(settings.base)}, length ${settings.length}`;
  renderHistory();
  winBanner.hidden = status !== 'won';
  guessInput.disabled = status === 'won';
};

const renderTimer = (): void => {
  if (gameState === null) return;
  timerElement.textContent = formatDuration(Date.now() - gameState.startedAt);
};

const startTimer = (): void => {
  stopTimer();
  renderTimer();
  timerIntervalId = window.setInterval(renderTimer, 1000);
};

const stopTimer = (): void => {
  if (timerIntervalId !== null) {
    window.clearInterval(timerIntervalId);
    timerIntervalId = null;
  }
};

// --- Settings logic ---
const readSettingsFromForm = (): GameSettings => {
  const base = Number(baseInputs.find((input) => input.checked)?.value ?? '10');
  const length = Number(lengthInput.value);
  return { length, base };
};

const updatePossibleSecrets = (): void => {
  const settings = readSettingsFromForm();
  if (!isValidSettings(settings)) {
    possibleSecretsElement.textContent = 'Invalid settings';
    startButton.disabled = true;
    return;
  }
  const count = countPossibleSecrets(settings.length, settings.base);
  possibleSecretsElement.textContent = `Possible secrets: ${count.toLocaleString()}`;
  startButton.disabled = false;
};

const showSettings = (): void => {
  stopTimer();
  gameState = null;
  settingsScreen.hidden = false;
  gameScreen.hidden = true;
  winBanner.hidden = true;
  guessErrorElement.textContent = '';
  historyList.replaceChildren();
};

const startGame = (settings: GameSettings): void => {
  const secret = generateSecret(settings.length, settings.base);
  const now = Date.now();
  gameState = gameReducer(null, { type: 'start', settings, secret, startedAt: now });
  if (gameState === null) return;

  settingsScreen.hidden = true;
  gameScreen.hidden = false;
  winBanner.hidden = true;
  guessInput.value = '';
  guessInput.maxLength = settings.length;
  guessErrorElement.textContent = '';

  renderGame();
  startTimer();
  guessInput.focus();
};

settingsForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const settings = readSettingsFromForm();
  if (!isValidSettings(settings)) return;
  startGame(settings);
});

settingsForm.addEventListener('input', updatePossibleSecrets);
settingsForm.addEventListener('change', updatePossibleSecrets);

// --- Game logic ---
guessInput.addEventListener('input', () => {
  if (gameState === null) return;
  const isDigit = createDigitValidator(gameState.settings.base);
  const filtered = [...guessInput.value].filter((char) => isDigit(char)).join('');
  if (filtered !== guessInput.value) {
    guessInput.value = filtered;
  }
});

const handleWin = (): void => {
  if (gameState === null) return;
  stopTimer();

  const durationMs = Date.now() - gameState.startedAt;
  const entry: RecordEntry = {
    attempts: gameState.history.length,
    durationMs,
    settings: gameState.settings,
    finishedAt: Date.now(),
  };
  records = addRecord(records, entry, RECORDS_LIMIT);
  saveRecords(records);
  renderRecords();

  winInfoElement.textContent = `Solved in ${entry.attempts} attempt(s) and ${formatDuration(durationMs)}.`;
  winBanner.hidden = false;
};

guessForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (gameState === null || gameState.status === 'won') return;

  const guess = guessInput.value.toLowerCase();
  const { settings } = gameState;

  if (!isValidGuess(guess, settings.length, settings.base)) {
    guessErrorElement.textContent = `Enter ${settings.length} unique digits valid for ${baseLabel(settings.base)}`;
    return;
  }
  guessErrorElement.textContent = '';

  const result = evaluateGuess(gameState.secret, guess);
  const timestamp = Date.now();
  const nextState = gameReducer(gameState, { type: 'guess', guess, result, timestamp });

  if (nextState === null) return;
  gameState = nextState;

  guessInput.value = '';
  renderGame();

  if (gameState.status === 'won') {
    handleWin();
  }
});

newGameButton.addEventListener('click', () => {
  showSettings();
  updatePossibleSecrets();
});

// --- Init ---
renderRecords();
updatePossibleSecrets();
