import { useState } from 'react';

export const Game = () => {
  const [cells, setCells] = useState(Array(9).fill(null));
  const [isX, setIsX] = useState(true);
  console.log(cells);

  const handleClick = (i: number) => {
    if (cells[i]) {
      return;
    }
    const newCells = [...cells];
    newCells[i] = isX ? '❌' : '⭕';
    setCells(newCells);
    setIsX(!isX);
  };

  return (
    <div className='w-90 h-90 border grid grid-cols-3 text-black font-bold '>
      {cells.map((value, i) => (
        <button
          key={i}
          onClick={() => handleClick(i)}
          className='flex items-center justify-center border w-30 h-30'
        >
          {value}
        </button>
      ))}
    </div>
  );
};
