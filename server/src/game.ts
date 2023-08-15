export interface GameState {
    board: (string | null)[];
    currentPlayer: 'X' | 'O';
    winner: string | null;
    draw?: boolean;
}

export interface Room {
    id: string;
    players: string[];
}


