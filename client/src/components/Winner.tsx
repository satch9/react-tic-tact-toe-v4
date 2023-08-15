import React from 'react'

interface WinnerProps {
    onRestart: () => void;
    winner: string | null;
}

const Winner: React.FC<WinnerProps>= ({onRestart, winner}) => {
    return (
        <div className='winner'>
            <h2>Le gagnant est {winner}</h2>
            <button className="button" onClick={onRestart} >Rejouer</button>
        </div>
    )
}

export default Winner
