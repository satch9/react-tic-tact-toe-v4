import './App.css'
import React, { useReducer, useEffect, useState } from 'react';
import { initialState, gameReducer, GameState } from './reducers/gameReducer';
import { defaultSocketContextState, socketReducer } from './reducers/socketReducers';
import Board from './components/Board';
import { useSocket } from './hooks/useSocket';
import Winner from './components/Winner';
import Draw from './components/Draw';

const App: React.FC = () => {
  const [SocketState, SocketDispatch] = useReducer(socketReducer, defaultSocketContextState);
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [loading, setLoading] = useState(true);
  const [messageError, setMessageError] = useState('');

  console.log("state", state)
  console.log("SocketState", SocketState)

  const socket = useSocket('ws://localhost:4000', {
    reconnectionAttempts: 5,
    reconnectionDelay: 5000,
    autoConnect: false
  });

  useEffect(() => {

    socket.connect();

    /** Save the socket in context */
    SocketDispatch({ type: 'UPDATE_SOCKET', payload: socket });
    /** Start the event listeners */
    StartListeners();
    /** Send the handshake */
    SendHandshake();

    return () => {
      socket.disconnect();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  const StartListeners = () => {
    /** User connected event */
    socket.on('user_connected', (users: string[]) => {
      console.info('User connected, new user list received');
      SocketDispatch({ type: 'UPDATE_USERS', payload: users });
    });

    /** User disconnected event */
    socket.on('user_disconnected', (uid: string) => {
      console.info('User disconnected');
      SocketDispatch({ type: 'REMOVE_USER', payload: uid });
    });

    /** Reconnect event*/
    socket.io.on('reconnect', (attempt) => {
      console.info(`Reconnected on attempt: ${attempt}`);
    });

    /** Reconnect attempt event*/
    socket.io.on('reconnect_attempt', (attempt) => {
      console.info(`Reconnection attempt : ${attempt}`);
    });

    /** Reconnection error*/
    socket.io.on('reconnect_error', (error) => {
      console.info(`Reconnection error : ${error}`);
    });

    /** Reconnection failed*/
    socket.io.on('reconnect_failed', () => {
      console.info(`Reconnection failure`);
      alert('We are unable to connect you to the web socket')
    });

    socket.on('gameState', (gameState: GameState) => {
      dispatch({ type: 'SET_GAME_STATE', payload: gameState });

    });

    socket.on('moveDone', (index: number) => {
      dispatch({ type: 'MAKE_MOVE', payload: index });
      dispatch({ type: 'IS_WINNER' })
      dispatch({ type: 'IS_DRAW' });
    });

    socket.on('forbiddenMove', (message: string) => {
      setMessageError(message);
      setTimeout(() => {
        setMessageError('');
      }, 5000);
    });

    socket.on('restartGame', (gameState: GameState) => {
      dispatch({ type: 'RESTART', payload: gameState });
    });
  }

  const SendHandshake = () => {
    console.info('Sending handshake to server ...');
    socket.emit('handshake', (uid: string, users: string[], role: "X" | "O") => {
      console.log('User handshake callback message received');
      SocketDispatch({ type: 'UPDATE_UID', payload: uid });
      SocketDispatch({ type: 'UPDATE_USERS', payload: users });
      dispatch({ type: 'UPDATE_ROLE', payload: role })

      setLoading(false);
    });
  }

  if (loading) return <p>Loading game ....</p>

  const handleCellClick = (index: number) => {
    if (state.winner || state.board[index] !== null) {
      return;
    }

    socket.emit('makeMove', index);
  }

  const onRestart = () => {
    socket.emit('restart');
  }


  return (
    <>
      <div className="app">
        <h1>Tic Tac Toe</h1>
        {
          !state.winner && !state.draw && (
            <div className='message'>
              {
                state.role === state.currentPlayer ?
                  <p>Vas-y joue !!!</p>
                  :
                  <p>Tu attends !!!</p>


              }
              <p className="messageError">{messageError && messageError}</p>
            </div>
          )
        }
        <Board squares={state.board} onClick={handleCellClick} winner={state.winner ? state.winner.toString() : null} draw={state.draw ? state.draw : false} />
        {
          state.winner && (
            <Winner onRestart={onRestart} winner={state.winner} />
          )
        }
        {
          state.draw && (
            <Draw onRestart={onRestart} />
          )
        }

        {/* <div className='global'>
          <span>Total users: {SocketState.users.length}</span>
          <span>Uid: {SocketState.uid}</span>
          <span>Socket.id: {SocketState.socket?.id}</span>
          <span>---------------------</span>
          <span>Etat du jeu :
            <pre>{JSON.stringify(state, null, 2)}</pre>
          </span>
        </div> */}
      </div>
    </>
  )
}

export default App;
