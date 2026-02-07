import { useReducer } from 'react';

type State = {
  cells: (string | null)[];
  isX: boolean;
  winner: string | null;
};

type Action = { type: 'CLICK_CELL'; index: number } | { type: 'RESET' };

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'CLICK_CELL': {
      const { index } = action;
      if (state.cells[index] || state.winner) return state;

      const newCells = [...state.cells];
      newCells[index] = state.isX ? '❌' : '⭕';

      let winner: string | null = null;
      for (const [a, b, c] of WIN_LINES) {
        if (
          newCells[a] &&
          newCells[a] === newCells[b] &&
          newCells[a] === newCells[c]
        ) {
          winner = newCells[a];
          break;
        }
      }
      return {
        cells: newCells,
        isX: !state.isX,
        winner,
      };
    }
    case 'RESET':
      return {
        cells: Array(9).fill(null),
        isX: true,
        winner: null,
      };
    default:
      return state;
  }
};

export const Game = () => {
  const [state, dispatch] = useReducer(reducer, {
    cells: Array(9).fill(null),
    isX: true,
    winner: null,
  });

  return (
    <div className='flex flex-col gap-2.5'>
      <h2 className='text-2xl font-bold'>
        {state.winner
          ? `Победитель: ${state.winner}`
          : `Ход: ${state.isX ? '❌' : '⭕'}`}
      </h2>
      <div className='w-90 h-90 border grid grid-cols-3 text-black font-bold '>
        {state.cells.map((value, i) => (
          <button
            key={i}
            onClick={() => dispatch({ type: 'CLICK_CELL', index: i })}
            className='flex items-center justify-center border w-30 h-30 text-4xl'
          >
            {value}
          </button>
        ))}
      </div>
      {state.winner && (
        <button
          onClick={() => dispatch({ type: 'RESET' })}
          className='mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition h-10'
        >
          Начать заново
        </button>
      )}
    </div>
  );
};
