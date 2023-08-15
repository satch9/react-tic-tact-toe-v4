import React from 'react'

interface DrawProps {
    onRestart: () => void;
}

const Draw: React.FC<DrawProps> = ({ onRestart }) => {
    return (
        <div className='draw'>
            <h2>Pas de chance ;-( !!! égalité</h2>
            <button className="button" onClick={onRestart} >Rejouer</button>
        </div>
    )
}

export default Draw