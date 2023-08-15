// client/src/components/Board.tsx
import React from 'react';
import Cell from './Cell';

interface BoardProps {
    squares: string[];
    onClick: (index: number) => void;
    winner: string | null;
    draw?: boolean | null;
}

const Board: React.FC<BoardProps> = ({ squares, onClick, winner, draw}) => (
    <div className="board">
        {squares.map((value, index) => (
            <Cell key={index} value={value} winner={winner} draw={draw} onClick={() => onClick(index)} />
        ))}
    </div>
);

export default Board;
