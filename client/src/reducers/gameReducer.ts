export interface GameState {
    board: string[];
    currentPlayer: 'X' | 'O' | undefined;
    winner: string | null;
    draw?: boolean | null;
    role: 'X' | 'O' | undefined;
}

export const initialState: GameState = {
    board: Array(9).fill(null),
    currentPlayer: undefined,
    winner: null,
    draw: false,
    role: undefined,
};

type Action =
    { type: 'SET_GAME_STATE'; payload: GameState; }
    |
    { type: 'MAKE_MOVE'; payload: number; }
    |
    { type: "UPDATE_ROLE"; payload: "X" | "O";}
    |
    { type: 'IS_WINNER'; }
    |
    { type: 'IS_DRAW'; }
    |
    { type: 'RESTART'; payload: GameState; }

export const gameReducer = (state: GameState, action: Action): GameState => {
    switch (action.type) {
        case 'SET_GAME_STATE':
            return {
                ...state,
                board: action.payload.board,
                currentPlayer: action.payload.currentPlayer,
            };
        case 'MAKE_MOVE': {
            //console.log("gameReducer MAKE_MOVE state", state)
            const newBoard = [...state.board];
            newBoard[action.payload] = state.currentPlayer!;

            const newCurrentPlayer = state.currentPlayer === 'X' ? 'O' : 'X'

            //console.log("gameReducer MAKE_MOVE newBoard", newCurrentPlayer)
            return {
                ...state,
                board: newBoard,
                currentPlayer: newCurrentPlayer,
            };
        }
        case 'UPDATE_ROLE': {
            //console.log("gameReducer UPDATE_ROLE state", state)
            //console.log("gameReducer UPDATE_ROLE action.payload", action.payload)
            return {
                ...state,
                role: action.payload,
            };
        }
        case 'IS_WINNER': {
            const lines = [
                [0, 1, 2], // Ligne 1
                [3, 4, 5], // Ligne 2
                [6, 7, 8], // Ligne 3
                [0, 3, 6], // Colonne 1
                [1, 4, 7], // Colonne 2
                [2, 5, 8], // Colonne 3
                [0, 4, 8], // Diagonale 1
                [2, 4, 6], // Diagonale 2
            ];


            for (const line of lines) {
                const [a, b, c] = line;
                if (state.board[a] && state.board[a] === state.board[b] && state.board[a] === state.board[c]) {
                    return {
                        ...state,
                        winner: state.board[a]
                    };
                }
            }
            return {
                ...state,
                winner: null,
            }

        }
        case 'IS_DRAW': {
            //console.log("state.board.every((cell) => cell !== null)", state.board.every((cell) => cell !== null))
            //console.log("state.winner", state.winner)
            if (state.board.every((cell) => cell !== null) && state.winner === null) {
                return {
                    ...state,
                    draw: true,
                };
            }
            return {
                ...state,
                draw: false,
            };
        }
        case 'RESTART': {
            //console.log("action.payload", action.payload)
            //console.log("action.payload.board", action.payload.board)
            return {
                ...state,
                board: action.payload.board,
                currentPlayer: action.payload.currentPlayer,
                winner: action.payload.winner,
                draw: action.payload.draw,
            };
        }


        default:
            return state;
    }
};