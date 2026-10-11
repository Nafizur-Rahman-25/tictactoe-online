// ============================================
// Tic Tac Toe Server - Full Game Logic
// ============================================

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

const rooms = {};

// ============================================
// Player Counter - Persistent Storage
// ============================================


function generateRoomId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let r = '';
    for (let i = 0; i < 6; i++) r += chars.charAt(Math.floor(Math.random() * chars.length));
    return r;
}

const WINNING_COMBOS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

function checkWinner(board) {
    for (const [a, b, c] of WINNING_COMBOS) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    if (!board.includes('')) return 'draw';
    return null;
}

function startGame(room, roomId) {
    room.gameActive = true;
    room.board = ['', '', '', '', '', '', '', '', ''];
    room.currentTurn = 'X';
    room.currentRound = 1;
    room.score1 = 0;
    room.score2 = 0;
    room.draws = 0;
    room.roundOverReadyHost = false;
    room.roundOverReadyGuest = false;

    console.log(`🎮 Starting game in room ${roomId}`);
    console.log(`   ${room.hostName} (X) vs ${room.guestName} (O), ${room.totalRounds} rounds`);

    io.to(room.host).emit('gameStart', {
        opponentName: room.guestName,
        totalRounds: room.totalRounds,
        yourSymbol: 'X',
        currentRound: 1, score1: 0, score2: 0, draws: 0
    });

    io.to(room.guest).emit('gameStart', {
        opponentName: room.hostName,
        totalRounds: room.totalRounds,
        yourSymbol: 'O',
        currentRound: 1, score1: 0, score2: 0, draws: 0
    });

    setTimeout(() => {
        io.to(roomId).emit('turnUpdate', {
            turn: 'X', board: room.board, gameActive: true
        });
    }, 500);
}

io.on('connection', (socket) => {
    console.log('✅ New client connected:', socket.id);



    // Send current count to the newly connected player
    socket.emit('playerCountUpdate', { count: totalPlayers });


    // ---- Host Game (with name + rounds from start) ----
    socket.on('hostGame', (data) => {
        let roomId;
        do { roomId = generateRoomId(); } while (rooms[roomId]);

        rooms[roomId] = {
            host: socket.id, guest: null,
            hostName: data.name || 'Player',
            guestName: null,
            totalRounds: data.rounds || 3,
            currentRound: 1,
            score1: 0, score2: 0, draws: 0,
            board: ['', '', '', '', '', '', '', '', ''],
            currentTurn: 'X', gameActive: false,
            roundOverReadyHost: false, roundOverReadyGuest: false
        };

        socket.join(roomId);
        socket.roomId = roomId;
        socket.isHost = true;

        console.log(`🎮 Room created: ${roomId} by ${data.name}, ${data.rounds} rounds`);
        socket.emit('roomCreated', { roomId });
    });

    // ---- Check Room ----
    socket.on('checkRoom', (data) => {
        const room = rooms[data.roomId];
        if (!room || room.guest) {
            socket.emit('roomNotFound');
            return;
        }
        socket.emit('roomInfo', {
            roomId: data.roomId,
            hostName: room.hostName
        });
    });

    // ---- Accept Invitation ----
    socket.on('acceptInvitation', (data) => {
        const room = rooms[data.roomId];
        if (!room || room.guest) {
            socket.emit('roomNotFound');
            return;
        }
        room.guest = socket.id;
        socket.roomId = data.roomId;
        socket.isHost = false;
        socket.join(data.roomId);
        console.log(`✅ Guest ${socket.id} joined room ${data.roomId}`);
        io.to(room.host).emit('friendJoined', { guestName: 'Your Friend', roomId: data.roomId });
    });

    // ---- Decline ----
    socket.on('declineInvitation', (data) => {
        const room = rooms[data.roomId];
        if (room) io.to(room.host).emit('friendDeclined');
    });

    // ---- Cancel Host ----
    socket.on('cancelHost', () => {
        if (socket.roomId && rooms[socket.roomId]) {
            delete rooms[socket.roomId];
            socket.leave(socket.roomId);
            socket.roomId = null;
        }
    });

    // ---- Guest Setup ----
    socket.on('guestSetup', (data) => {
        const room = rooms[data.roomId];
        if (!room) return;
        room.guestName = data.name;
        console.log(`📝 Guest setup: ${data.name}`);

        if (room.hostName && room.guestName) {
            startGame(room, data.roomId);
        }
    });

    // ---- Leave Game ----
    socket.on('leaveGame', (data) => {
        const room = rooms[data.roomId];
        if (!room) return;

        const opponentId = (socket.id === room.host) ? room.guest : room.host;
        if (opponentId) {
            io.to(opponentId).emit('friendLeft');
        }

        delete rooms[data.roomId];
        socket.leave(data.roomId);
        socket.roomId = null;
        console.log(`🚪 Player left room: ${data.roomId}`);
    });

    // ---- Make Move ----
    socket.on('makeMove', (data) => {
        const room = rooms[data.roomId];
        if (!room || !room.gameActive) return;
        if (room.currentTurn !== data.symbol) return;
        if (room.board[data.index] !== '') return;

        room.board[data.index] = data.symbol;
        console.log(`🎯 Move: ${data.symbol} at ${data.index}`);

        socket.to(data.roomId).emit('opponentMove', { index: data.index, symbol: data.symbol });

        const result = checkWinner(room.board);
        if (result) {
            room.gameActive = false;
            let winner = null;
            if (result === 'X') { room.score1++; winner = 'X'; }
            else if (result === 'O') { room.score2++; winner = 'O'; }
            else { room.draws++; winner = 'draw'; }

            const isLastRound = room.currentRound >= room.totalRounds;
            console.log(`🏆 Round ${room.currentRound} winner: ${winner}${isLastRound ? ' (FINAL)' : ''}`);

            io.to(data.roomId).emit('turnUpdate', {
                turn: room.currentTurn, board: room.board, gameActive: false
            });
            io.to(data.roomId).emit('roundResult', {
                winner, score1: room.score1, score2: room.score2, draws: room.draws,
                currentRound: room.currentRound, isLastRound
            });
        } else {
            room.currentTurn = room.currentTurn === 'X' ? 'O' : 'X';
            io.to(data.roomId).emit('turnUpdate', {
                turn: room.currentTurn, board: room.board, gameActive: true
            });
        }
    });

    // ---- Ready for Next Round ----
    socket.on('readyForNextRound', (data) => {
        const room = rooms[data.roomId];
        if (!room) return;

        if (socket.isHost) room.roundOverReadyHost = true;
        else room.roundOverReadyGuest = true;

        console.log(`✅ Ready: host=${room.roundOverReadyHost}, guest=${room.roundOverReadyGuest}`);

        if (room.roundOverReadyHost && room.roundOverReadyGuest) {
            room.currentRound++;
            room.roundOverReadyHost = false;
            room.roundOverReadyGuest = false;

            if (room.currentRound > room.totalRounds) {
                let champion = 'tie';
                if (room.score1 > room.score2) champion = 'X';
                else if (room.score2 > room.score1) champion = 'O';

                console.log(`👑 MATCH OVER - Champion: ${champion}`);
                io.to(data.roomId).emit('matchOver', {
                    champion, score1: room.score1, score2: room.score2, draws: room.draws
                });
            } else {
                room.board = ['', '', '', '', '', '', '', '', ''];
                room.currentTurn = 'X';
                room.gameActive = true;
                console.log(`🎮 Starting Round ${room.currentRound}`);
                io.to(data.roomId).emit('startNextRound', {
                    currentRound: room.currentRound, startingTurn: 'X'
                });
                setTimeout(() => {
                    io.to(data.roomId).emit('turnUpdate', {
                        turn: 'X', board: room.board, gameActive: true
                    });
                }, 500);
            }
        }
    });

    // ---- Disconnect ----
    socket.on('disconnect', () => {
        console.log('❌ Client disconnected:', socket.id);
        if (socket.roomId && rooms[socket.roomId]) {
            const room = rooms[socket.roomId];
            const opponentId = (socket.id === room.host) ? room.guest : room.host;

            if (opponentId && (room.gameActive || room.hostName)) {
                io.to(opponentId).emit('friendLeft');
            }

            if (room.host === socket.id) delete rooms[socket.roomId];
            else if (room.guest === socket.id) {
                room.guest = null;
                room.guestName = null;
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Server started: http://localhost:${PORT}`);
    
});