import { useEffect, useReducer } from 'react';

type Mark = '❌' | '⭕';

type State = {
  cells: (Mark | null)[];
  isX: boolean;
  winner: Mark | null;
  draw: boolean;
  vsComputer: boolean;
  humanMark: Mark;
  computerMark: Mark;
  gameStarted: boolean;
};

type Action =
  | { type: 'RESET' }
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
  draw: false,
  vsComputer: true,
  humanMark: '❌',
  computerMark: '⭕',
  gameStarted: false,
};

const getWinner = (cells: (Mark | null)[]): Mark | null => {
  for (const [a, b, c] of WIN_LINES) {
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
      return cells[a];
    }
  }

  return null;
};

const applyMove = (state: State, index: number): State => {
  if (!state.gameStarted || state.winner || state.draw || state.cells[index]) {
    return state;
  }

  const currentMark: Mark = state.isX ? '❌' : '⭕';
  const nextCells = [...state.cells];
  nextCells[index] = currentMark;

  const winner = getWinner(nextCells);
  const draw = !winner && nextCells.every((cell) => cell !== null);

  return {
    ...state,
    cells: nextCells,
    winner,
    draw,
    isX: winner || draw ? state.isX : !state.isX,
  };
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'RESET':
      return {
        ...state,
        cells: Array(9).fill(null),
        isX: true,
        winner: null,
        draw: false,
        gameStarted: false,
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

  return (
    <div className='flex flex-col gap-4'>
      <h2 className='text-2xl font-bold'>
        {state.winner
          ? `Победитель: ${state.winner}`
          : state.draw
            ? 'Ничья!'
            : state.gameStarted
              ? `Ход: ${currentMark}`
              : 'Выберите режим и начните игру'}
      </h2>

      {!state.gameStarted && (
        <div className='flex flex-col gap-3'>
          <div className='flex gap-2'>
            <button
              onClick={() => dispatch({ type: 'SET_MODE', vsComputer: true })}
              className={`px-4 py-2 rounded border ${state.vsComputer ? 'bg-blue-500 text-white' : 'bg-white'}`}
            >
              С компьютером
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_MODE', vsComputer: false })}
              className={`px-4 py-2 rounded border ${!state.vsComputer ? 'bg-blue-500 text-white' : 'bg-white'}`}
            >
              С другом
            </button>
          </div>

          <div className='flex gap-2'>
            <button
              onClick={() => dispatch({ type: 'SET_HUMAN_MARK', mark: '❌' })}
              className={`px-4 py-2 rounded border ${state.humanMark === '❌' ? 'bg-green-500 text-white' : 'bg-white'}`}
            >
              Играть за ❌
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_HUMAN_MARK', mark: '⭕' })}
              className={`px-4 py-2 rounded border ${state.humanMark === '⭕' ? 'bg-green-500 text-white' : 'bg-white'}`}
            >
              Играть за ⭕
            </button>
          </div>

          <button
            onClick={() => dispatch({ type: 'START GAME' })}
            className='px-6 py-2 bg-black text-white rounded-lg'
          >
            Начать игру
          </button>
        </div>
      )}

      {state.gameStarted && (
        <div className='w-90 h-90 border grid grid-cols-3 text-black font-bold'>
          {state.cells.map((value, i) => (
            <button
              key={i}
              onClick={() => dispatch({ type: 'CLICK_CELL', index: i })}
              disabled={Boolean(value) || Boolean(state.winner) || state.draw || isAiTurn}
              className='flex items-center justify-center border w-30 h-30 text-4xl disabled:opacity-60'
            >
              {value}
            </button>
          ))}
        </div>
      )}

      {state.gameStarted && isAiTurn && (
        <p className='text-sm text-gray-600'>Компьютер думает...</p>
      )}

      {(state.winner || state.draw || state.gameStarted) && (
        <button
          onClick={() => dispatch({ type: 'RESET' })}
          className='mt-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition h-10'
        >
          Новая игра
        </button>
      )}
    </div>
  );
};
