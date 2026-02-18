import { useEffect, useReducer } from 'react';

type Mark = '❌' | '⭕';

type State = {
  cells: (Mark | null)[];
  isX: boolean;
  winner: Mark | null;
  winningLine: number[] | null;
  draw: boolean;
  vsComputer: boolean;
  humanMark: Mark;
  computerMark: Mark;
  gameStarted: boolean;
};

type Action =
  | { type: 'RESET' }
  | { type: 'GO_SETUP' }
  | { type: 'SET_MODE'; vsComputer: boolean }
  | { type: 'START GAME' }
  | { type: 'SET_HUMAN_MARK'; mark: Mark }
  | { type: 'CLICK_CELL'; index: number }
  | { type: 'COMPUTER_MOVE'; index: number };

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
] as const;

const INITIAL_STATE: State = {
  cells: Array(9).fill(null),
  isX: true,
  winner: null,
  winningLine: null,
  draw: false,
  vsComputer: true,
  humanMark: '❌',
  computerMark: '⭕',
  gameStarted: false,
};

const getWinner = (
  cells: (Mark | null)[],
): { winner: Mark | null; winningLine: number[] | null } => {
  for (const [a, b, c] of WIN_LINES) {
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
      return { winner: cells[a], winningLine: [a, b, c] };
    }
  }

  return { winner: null, winningLine: null };
};

const applyMove = (state: State, index: number): State => {
  if (!state.gameStarted || state.winner || state.draw || state.cells[index]) {
    return state;
  }

  const currentMark: Mark = state.isX ? '❌' : '⭕';
  const nextCells = [...state.cells];
  nextCells[index] = currentMark;

  const { winner, winningLine } = getWinner(nextCells);
  const draw = !winner && nextCells.every((cell) => cell !== null);

  return {
    ...state,
    cells: nextCells,
    winner,
    winningLine,
    draw,
    isX: winner || draw ? state.isX : !state.isX,
  };
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'GO_SETUP':
      return {
        ...state,
        cells: Array(9).fill(null),
        isX: true,
        winner: null,
        winningLine: null,
        draw: false,
        gameStarted: false,
      };
    case 'RESET':
      return {
        ...state,
        cells: Array(9).fill(null),
        isX: true,
        winner: null,
        winningLine: null,
        draw: false,
        gameStarted: true,
      };
    case 'SET_MODE':
      if (state.gameStarted) return state;
      return { ...state, vsComputer: action.vsComputer };
    case 'SET_HUMAN_MARK':
      if (state.gameStarted) return state;
      return {
        ...state,
        humanMark: action.mark,
        computerMark: action.mark === '❌' ? '⭕' : '❌',
      };
    case 'START GAME':
      return {
        ...state,
        cells: Array(9).fill(null),
        isX: true,
        winner: null,
        winningLine: null,
        draw: false,
        gameStarted: true,
      };
    case 'CLICK_CELL': {
      const currentMark: Mark = state.isX ? '❌' : '⭕';
      const isHumanTurn = !state.vsComputer || currentMark === state.humanMark;
      if (!isHumanTurn) return state;

      return applyMove(state, action.index);
    }
    case 'COMPUTER_MOVE': {
      if (!state.vsComputer) return state;

      const currentMark: Mark = state.isX ? '❌' : '⭕';
      if (currentMark !== state.computerMark) return state;

      return applyMove(state, action.index);
    }
    default:
      return state;
  }
};

const modeButtonClass = (active: boolean) =>
  `w-full rounded-2xl border px-5 py-3.5 text-base font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-400 active:scale-[0.98] ${
    active
      ? 'border-blue-700 bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-300/70'
      : 'border-slate-300 bg-white text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 hover:shadow'
  }`;

const markButtonClass = (active: boolean) =>
  `w-full rounded-2xl border px-5 py-3.5 text-base font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-400 active:scale-[0.98] ${
    active
      ? 'border-emerald-700 bg-gradient-to-b from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-300/70'
      : 'border-slate-300 bg-white text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 hover:shadow'
  }`;

export const Game = () => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  useEffect(() => {
    if (!state.gameStarted || !state.vsComputer || state.winner || state.draw) {
      return;
    }

    const currentMark: Mark = state.isX ? '❌' : '⭕';
    if (currentMark !== state.computerMark) return;

    const emptyIndexes = state.cells
      .map((cell, index) => (cell === null ? index : -1))
      .filter((index) => index !== -1);

    if (emptyIndexes.length === 0) return;

    const randomIndex =
      emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];

    const timerId = setTimeout(() => {
      dispatch({ type: 'COMPUTER_MOVE', index: randomIndex });
    }, 350);

    return () => clearTimeout(timerId);
  }, [state]);

  const currentMark: Mark = state.isX ? '❌' : '⭕';
  const isAiTurn =
    state.gameStarted &&
    state.vsComputer &&
    !state.winner &&
    !state.draw &&
    currentMark === state.computerMark;

  const modeLabel = state.vsComputer ? 'Режим: VS Компьютер' : 'Режим: VS Друг';
  const sideLabel = state.vsComputer
    ? `Ты: ${state.humanMark} | AI: ${state.computerMark}`
    : 'Игра на двоих';
  const containerClass = state.gameStarted
    ? 'game-card w-full max-w-md rounded-3xl p-5 text-slate-900'
    : 'game-card w-full max-w-xl rounded-3xl p-6 text-slate-900';

  return (
    <section className={containerClass}>
      <h1 className='text-3xl font-black tracking-tight'>Tic Tac Toe</h1>
      <div className='mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-700'>
        <span className='rounded-full bg-slate-100 px-2.5 py-1'>
          {modeLabel}
        </span>
        <span className='rounded-full bg-slate-100 px-2.5 py-1'>
          {sideLabel}
        </span>
      </div>
      <p className='mt-2 text-sm text-slate-600'>
        {state.winner
          ? `Победитель: ${state.winner}`
          : state.draw
            ? 'Ничья. Сыграем еще раз?'
            : state.gameStarted
              ? `Сейчас ходит: ${currentMark}`
              : 'Выберите режим и сторону перед стартом'}
      </p>

      {!state.gameStarted && (
        <div className='mt-3 flex flex-col gap-2'>
          <div className='grid grid-cols-2 gap-4'>
            <button
              onClick={() => dispatch({ type: 'SET_MODE', vsComputer: true })}
              className={modeButtonClass(state.vsComputer)}
            >
              С компьютером
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_MODE', vsComputer: false })}
              className={modeButtonClass(!state.vsComputer)}
            >
              С другом
            </button>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <button
              onClick={() => dispatch({ type: 'SET_HUMAN_MARK', mark: '❌' })}
              className={markButtonClass(state.humanMark === '❌')}
            >
              Играть за ❌
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_HUMAN_MARK', mark: '⭕' })}
              className={markButtonClass(state.humanMark === '⭕')}
            >
              Играть за ⭕
            </button>
          </div>

          <button
            onClick={() => dispatch({ type: 'START GAME' })}
            className='w-full rounded-2xl bg-linear-to-b from-slate-800 to-slate-900 px-6 py-4 text-base font-bold text-white shadow-lg shadow-slate-300 transition duration-200 hover:-translate-y-0.5 hover:from-slate-700 hover:to-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500 active:scale-[0.98]'
          >
            Начать игру
          </button>
        </div>
      )}

      {state.gameStarted && (
        <div className='mt-5 rounded-2xl bg-slate-100 p-2 shadow-inner'>
          <div className='grid grid-cols-3 gap-2'>
            {state.cells.map((value, i) => {
              const isWinningCell = Boolean(state.winningLine?.includes(i));

              return (
                <button
                  key={i}
                  onClick={() => dispatch({ type: 'CLICK_CELL', index: i })}
                  disabled={
                    Boolean(value) ||
                    Boolean(state.winner) ||
                    state.draw ||
                    isAiTurn
                  }
                  className={`aspect-square rounded-2xl border border-slate-200 bg-white text-4xl shadow-sm transition duration-150 hover:scale-[1.02] hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-400 disabled:cursor-not-allowed disabled:opacity-60 ${
                    isWinningCell ? 'winner-cell' : ''
                  }`}
                >
                  <span className={value ? 'mark-pop inline-block' : ''}>
                    {value}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {state.gameStarted && isAiTurn && (
        <p className='mt-3 rounded-lg bg-amber-100 px-3 py-2 text-sm font-medium text-amber-800'>
          Компьютер думает...
        </p>
      )}

      {state.gameStarted && (
        <div className='mt-4 grid grid-cols-2 gap-3'>
          <button
            onClick={() => dispatch({ type: 'RESET' })}
            className='w-full rounded-2xl bg-linear-to-b from-blue-600 to-blue-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-300/70 transition duration-200 hover:-translate-y-0.5 hover:from-blue-500 hover:to-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-400 active:scale-[0.98]'
          >
            Сыграть снова
          </button>
          <button
            onClick={() => dispatch({ type: 'GO_SETUP' })}
            className='w-full rounded-2xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-bold text-slate-800 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-400 active:scale-[0.98]'
          >
            Настройки
          </button>
        </div>
      )}
    </section>
  );
};
