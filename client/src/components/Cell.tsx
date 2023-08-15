import React from 'react';

interface CellProps {
    value: string;
    onClick: () => void;
    winner: string | null;
    draw?: boolean | null;
}


const Cell: React.FC<CellProps> = ({ value, onClick, winner, draw }) => {

    const isCellDisabled = winner !== null || draw === true || draw === undefined;

    return (
        <button className={`cell ${isCellDisabled ? 'disabled' : ''}`} onClick={onClick}>
            {value}
        </button>
    )
}


export default Cell;

