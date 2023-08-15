import { Server as HttpServer } from 'http';
import { Socket, Server as ServerSocketIo } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

import { GameState } from './game';

export class ServerSocket {
    public static instance: ServerSocket;
    public io: ServerSocketIo;

    public users: { [uid: string]: string };
    public xPlayerId: string | null = null;
    public oPlayerId: string | null = null;
    public randomCurrentPlayer: () => "X" | "O";

    public gameState: GameState;

    constructor(httpServer: HttpServer) {
        ServerSocket.instance = this;
        this.users = {};
        this.io = new ServerSocketIo(httpServer, {
            serveClient: false,
            pingInterval: 10000,
            pingTimeout: 5000,
            cookie: false,
            cors: {
                origin: '*',
            }
        });

        this.randomCurrentPlayer = (): "X" | "O" => {
            return Math.random() > 0.5 ? 'X' : 'O';
        };

        this.gameState = {
            board: Array(9).fill(null),
            currentPlayer: this.randomCurrentPlayer(),
            winner: null,
            draw: false,
        };

        this.io.on('connection', this.StartListeners.bind(this));
        console.log('Socket IO started')
    }

    StartListeners(socket: Socket) {

        console.info(`Message received from ${socket.id}`);

        socket.on('handshake', (callback: (uid: string, users: string[], role: 'X' | 'O') => void) => {
            console.log(`Handshake received from ${socket.id}`);

            /** Check if this is a reconnection */
            const reconnected = Object.values(this.users).includes(socket.id);
            //console.log('reconnected', reconnected)
            if (reconnected) {
                console.info('This user has reconnected');

                const uid = this.GetUidFromSocketID(socket.id);
                const users = Object.values(this.users);

                if (uid) {
                    console.info('Sending callback for reconnect ...');

                    if (!this.xPlayerId) {
                        this.xPlayerId = uid;
                    } else if (!this.oPlayerId) {
                        this.oPlayerId = uid;
                    }
                    console.log("X player id reconnected", this.xPlayerId)
                    console.log("O player id reconnected", this.oPlayerId)
                    callback(uid, users, uid === this.xPlayerId ? 'X' : 'O');
                    return;
                }
            }

            /** Generate new user */
            const uid = uuidv4();
            this.users[uid] = socket.id;
            //console.log("Generate this.users", this.users)
            const users = Object.values(this.users);

            //console.log("Generate users", users)
            //console.info('Sending callback for handshake ...')
            //console.log("Generated users")

            if (!this.xPlayerId) {
                this.xPlayerId = uid;
            } else if (!this.oPlayerId) {
                this.oPlayerId = uid;
            }

            //console.log("X player id generate", this.xPlayerId)
            //console.log("O player id generate", this.oPlayerId)

            callback(uid, users, uid === this.xPlayerId ? 'X' : 'O');

            // Send new user to all connected users 

            this.io.emit('new-user', uid);


        });

        // ----------------------------------------- //
        //             Game section
        // ----------------------------------------- //

        // Send initial state to all connected users
        this.io.emit('gameState', this.gameState);



        // Handle player move
        socket.on('makeMove', (index: number) => {
            const userId = this.GetUidFromSocketID(socket.id);

            //console.log("X player id makeMove", this.xPlayerId)
            //console.log("O player id makeMove", this.oPlayerId)

            //console.log("this.gameState  makeMove before", this.gameState)

            if (this.gameState.currentPlayer === 'X') {
                if (userId === this.xPlayerId) {
                    //console.log("X player made a move");
                    // update the game state with the move

                    if (this.gameState.board[index] === null) {
                        this.gameState.board[index] = "X";
                        this.gameState.currentPlayer = 'O';
                        this.io.emit('moveDone', index);
                        //console.log("this.gameState  moveDone X", this.gameState)
                    } else {
                        console.log("case déjà cocher X");
                        return;
                    }
                } else if (userId === this.oPlayerId || !this.oPlayerId) {
                    //console.log("O player tried to make a move during X's turn");
                    this.io.emit('forbiddenMove', "Le joueur O a essayé de jouer pendant le tour du joueur X")
                    return;
                } else {
                    console.log("Wrong player made a move");
                    return;
                }
            } else if (this.gameState.currentPlayer === 'O') {
                if (userId === this.oPlayerId) {
                    //console.log("O player made a move");
                    // update the game state with the move

                    if (this.gameState.board[index] === null) {
                        this.gameState.board[index] = "O";
                        this.gameState.currentPlayer = 'X';
                        this.io.emit('moveDone', index);
                        //console.log("this.gameState  moveDone O", this.gameState)
                    } else {
                        console.log("case déjà cocher O");
                        return;
                    }
                } else if (userId === this.xPlayerId || !this.xPlayerId) {
                    //console.log("X player tried to make a move during O's turn");
                    this.io.emit('forbiddenMove', "Le joueur X a essayé de jouer pendant le tour du joueur O")
                    return;
                } else {
                    console.log("Wrong player made a move");
                    return;
                }
            }
        });




        // Handle restart game
        socket.on('restart', () => {

            this.gameState = {
                board: Array(9).fill(null),
                currentPlayer: this.randomCurrentPlayer(),
                winner: null,
                draw: false,
            };

            this.io.emit('restartGame', this.gameState);

        });

        socket.on('disconnect', () => {
            console.info(`User disconnected: ${socket.id}`);

            /** Remove user from users */
            const uid = this.GetUidFromSocketID(socket.id);
            if (uid) {
                delete this.users[uid];
            }

            if (uid === this.xPlayerId) {
                this.xPlayerId = null;
            } else if (uid === this.oPlayerId) {
                this.oPlayerId = null;
            }

            /** Send disconnected user to all connected users */
            this.io.emit('user_disconnected', uid);

            if (!this.xPlayerId || !this.oPlayerId) {
                this.gameState = {
                    board: Array(9).fill(null),
                    currentPlayer: this.randomCurrentPlayer(),
                    winner: null,
                    draw: false,
                };
                this.io.emit('restartGame', this.gameState);
            }

        });

        socket.on('message', (message: string) => {
            console.info(`Message received from ${socket.id}: ${message}`);

            /** Send message to all connected users */
            socket.broadcast.emit('message', message);
        });
    }

    GetUidFromSocketID = (id: string) => {
        return Object.keys(this.users).find((uid) => this.users[uid] === id);
    }

    /**
     * Send a message through the socket
     * @param name the name of the event, ex: handshake
     * @param users List of socket id's
     * @param payload any information needed by the user for state updates
     */

    SendMessage = (name: string, users: string[], payload?: Object) => {
        console.info(`Emitting event: ${name} to ${users} users`);
        users.forEach((id) => (payload ? this.io.to(id).emit(name, payload) : this.io.to(id).emit(name)));
    }

}
