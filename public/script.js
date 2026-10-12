// ============================================
// Tic Tac Toe Client - Full Logic with Mobile Optimization
// ============================================

const socket = io();

let currentRoomId = null;
let isHost = false;
let myName = '';
let opponentName = '';
let mySymbol = '';
let totalRounds = 3;
let currentRound = 1;
let score1 = 0, score2 = 0, draws = 0;
let board = ['', '', '', '', '', '', '', '', ''];
let currentTurn = 'X';
let gameActive = false;
let musicEnabled = true;
let soundEnabled = true;
let currentMusic = null;
let splashCompleted = false;
let roundOverReady = false;
let gameStarted = false;

// ============================================
// Mobile Detection
// ============================================
const isMobile = window.innerWidth < 768;
const isSmallPhone = window.innerWidth < 480;

// ============================================
// Sound System
// ============================================
function playSound(name) {
    if (!soundEnabled) return;
    const snd = document.getElementById('snd' + name.charAt(0).toUpperCase() + name.slice(1));
    if (snd) {
        const clone = snd.cloneNode();
        clone.volume = 0.8;
        clone.play().catch(() => { });
    }
}

function switchMusic(type) {
    if (!musicEnabled) return;
    if (currentMusic === type) return;
    const iMusic = document.getElementById('interfaceMusic');
    const gMusic = document.getElementById('gameplayMusic');
    if (iMusic) { iMusic.pause(); iMusic.currentTime = 0; }
    if (gMusic) { gMusic.pause(); gMusic.currentTime = 0; }

    if (type === 'interface' && iMusic) {
        iMusic.volume = 0.35;
        iMusic.play().catch(() => { });
    } else if (type === 'gameplay' && gMusic) {
        gMusic.volume = 0.35;
        gMusic.play().catch(() => { });
    }
    currentMusic = type;
}

function stopAllMusic() {
    const iMusic = document.getElementById('interfaceMusic');
    const gMusic = document.getElementById('gameplayMusic');
    if (iMusic) iMusic.pause();
    if (gMusic) gMusic.pause();
    currentMusic = null;
}

// ============================================
// Connection
// ============================================
socket.on('connect', () => {
    console.log('✅ Connected:', socket.id);

    const el = document.getElementById('connectionStatus');
    if (el) {
        el.textContent = '✅ Connected';
        el.classList.add('connected');
    }
});

socket.on('disconnect', () => {
    console.log('❌ Disconnected');
    const el = document.getElementById('connectionStatus');
    if (el) {
        el.textContent = '❌ Disconnected';
        el.classList.remove('connected');
        el.classList.add('disconnected');
    }
});

// ============================================
// Screen Navigation
// ============================================
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');

    if (id === 'screen-game') {
        document.body.classList.add('in-game');
        document.body.classList.remove('in-menu');
        if (splashCompleted) switchMusic('gameplay');
    } else if (id === 'screen-round-over' || id === 'screen-match-over') {
        // keep gameplay music
    } else if (id === 'screen-splash') {
        // nothing
    } else {
        document.body.classList.add('in-menu');
        document.body.classList.remove('in-game');
        if (splashCompleted) switchMusic('interface');
    }
}

// ============================================
// Splash
// ============================================
function initSplash() {
    const splash = document.getElementById('screen-splash');
    if (!splash) return;
    splash.addEventListener('click', () => {
        if (splashCompleted) return;
        splashCompleted = true;
        switchMusic('interface');
        setTimeout(() => showScreen('screen-home'), 200);
    });
}

// ============================================
// Home Navigation
// ============================================
function goToPlay() {
    playSound('click');
    showScreen('screen-play');
}

function goToSettings() {
    playSound('click');
    showScreen('screen-settings');
}

function goToCredits() {
    playSound('click');
    showScreen('screen-credits');
}

function exitGame() {
    playSound('click');
    stopAllMusic();
    showScreen('screen-thankyou');
}

function closeTab() {
    window.open('', '_self', '');
    window.close();
    setTimeout(() => {
        const msg = document.getElementById('closeMessage');
        if (msg) msg.style.display = 'block';
    }, 300);
}

// ============================================
// Settings
// ============================================
function toggleMusic() {
    musicEnabled = !musicEnabled;
    const btn = document.getElementById('musicToggle');
    if (musicEnabled) {
        btn.textContent = 'ON';
        btn.style.backgroundColor = 'rgba(30, 100, 50, 0.9)';
        btn.style.borderColor = 'var(--success)';
        if (splashCompleted) {
            if (currentMusic === 'interface') switchMusic('interface');
            else if (currentMusic === 'gameplay') switchMusic('gameplay');
            else switchMusic('interface');
        }
    } else {
        btn.textContent = 'OFF';
        btn.style.backgroundColor = 'rgba(80, 40, 30, 0.9)';
        btn.style.borderColor = 'var(--danger)';
        stopAllMusic();
    }
    playSound('click');
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    const btn = document.getElementById('soundToggle');
    if (soundEnabled) {
        btn.textContent = 'ON';
        btn.style.backgroundColor = 'rgba(30, 100, 50, 0.9)';
        btn.style.borderColor = 'var(--success)';
        playSound('click');
    } else {
        btn.textContent = 'OFF';
        btn.style.backgroundColor = 'rgba(80, 40, 30, 0.9)';
        btn.style.borderColor = 'var(--danger)';
    }
}

// ============================================
// Host Flow
// ============================================
function goToHostSetup() {
    playSound('click');
    isHost = true;
    showScreen('screen-host-setup');
}

function setRounds(n) {
    playSound('click');
    document.getElementById('roundsInput').value = n;
    document.querySelectorAll('.btn-num').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
}

function submitHostSetup() {
    const name = document.getElementById('hostNameInput').value.trim();
    let roundsVal = parseInt(document.getElementById('roundsInput').value);

    if (!name) {
        alert('Please enter your name!');
        return;
    }
    if (isNaN(roundsVal) || roundsVal < 1) roundsVal = 1;
    if (roundsVal > 100) roundsVal = 100;

    playSound('click');
    myName = name;
    mySymbol = 'X';
    totalRounds = roundsVal;

    console.log('📤 Creating room with host name:', myName);
    socket.emit('hostGame', { name: myName, rounds: totalRounds });
}

socket.on('roomCreated', (data) => {
    currentRoomId = data.roomId;
    isHost = true;
    document.getElementById('shareLink').value = `${window.location.origin}/?room=${data.roomId}`;
    showScreen('screen-waiting');
});

function copyLink() {
    playSound('click');
    const inp = document.getElementById('shareLink');
    inp.select();
    inp.setSelectionRange(0, 99999);
    try {
        navigator.clipboard.writeText(inp.value);
        document.getElementById('copyStatus').textContent = '✅ Link copied!';
        setTimeout(() => document.getElementById('copyStatus').textContent = '', 2000);
    } catch (e) {
        document.execCommand('copy');
        document.getElementById('copyStatus').textContent = '✅ Link copied!';
        setTimeout(() => document.getElementById('copyStatus').textContent = '', 2000);
    }
}

function cancelHost() {
    playSound('click');
    socket.emit('cancelHost');
    isHost = false;
    currentRoomId = null;
    gameStarted = false;
    showScreen('screen-play');
}

function backToHome() {
    playSound('click');
    if (gameStarted) {
        socket.emit('leaveGame', { roomId: currentRoomId });
    } else if (isHost) {
        socket.emit('cancelHost');
    }
    resetBoard();
    isHost = false;
    currentRoomId = null;
    gameStarted = false;
    stopAllMusic();
    if (splashCompleted) switchMusic('interface');
    showScreen('screen-home');
}

// ============================================
// Join with Code
// ============================================
function goToJoinInput() {
    playSound('click');
    document.getElementById('joinCodeInput').value = '';
    showScreen('screen-join-input');
}

function joinWithCode() {
    let input = document.getElementById('joinCodeInput').value.trim();
    if (!input) {
        alert('Please enter a room code or link!');
        return;
    }

    let roomCode = input;
    if (input.includes('room=')) {
        const match = input.match(/room=([A-Z0-9]+)/i);
        if (match) roomCode = match[1].toUpperCase();
    } else {
        roomCode = input.toUpperCase();
    }

    playSound('click');
    currentRoomId = roomCode;
    isHost = false;
    splashCompleted = true;

    socket.emit('checkRoom', { roomId: roomCode });
    showScreen('screen-invitation');
}

// ============================================
// URL Check
// ============================================
window.addEventListener('load', () => {
    initSplash();
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get('room');
    if (roomId) {
        currentRoomId = roomId;
        isHost = false;
        splashCompleted = true;
        showScreen('screen-invitation');
        socket.emit('checkRoom', { roomId });
    }
});

// ============================================
// Room Info
// ============================================
socket.on('roomInfo', (data) => {
    console.log('📋 Room info received:', data);
    if (data.hostName) {
        document.getElementById('inviterName').textContent = `${data.hostName} wants to play`;
    }
});

socket.on('roomNotFound', () => {
    document.getElementById('errorMessage').textContent = 'The room no longer exists or is full.';
    showScreen('screen-error');
});

// ============================================
// Accept / Decline
// ============================================
function acceptInvitation() {
    playSound('click');
    socket.emit('acceptInvitation', { roomId: currentRoomId });
    showScreen('screen-guest-setup');
}

function declineInvitation() {
    playSound('click');
    socket.emit('declineInvitation', { roomId: currentRoomId });
    showScreen('screen-home');
}

// ============================================
// Guest Setup
// ============================================
function submitGuestName() {
    const name = document.getElementById('guestNameInput').value.trim();
    if (!name) {
        alert('Please enter your name!');
        return;
    }
    playSound('click');
    myName = name;
    mySymbol = 'O';
    socket.emit('guestSetup', { roomId: currentRoomId, name: myName });
    document.getElementById('guestNameInput').disabled = true;
    document.querySelector('#screen-guest-setup .btn-yes').disabled = true;
}

// ============================================
// Host: Friend Joined
// ============================================
socket.on('friendJoined', (data) => {
    playSound('win');
    console.log('🎉 Friend joined:', data);
});

// ============================================
// Round Input Filter
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const roundsInput = document.getElementById('roundsInput');
    if (roundsInput) {
        roundsInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
            if (e.target.value.length > 3) e.target.value = e.target.value.slice(0, 3);
            document.querySelectorAll('.btn-num').forEach(b => b.classList.remove('active'));
        });
    }
});

// ============================================
// Game Start
// ============================================
socket.on('gameStart', (data) => {
    opponentName = data.opponentName;
    totalRounds = data.totalRounds;
    mySymbol = data.yourSymbol;
    currentRound = data.currentRound || 1;
    score1 = data.score1 || 0;
    score2 = data.score2 || 0;
    draws = data.draws || 0;
    currentTurn = 'X';
    gameStarted = true;

    if (mySymbol === 'X') {
        document.getElementById('player1Name').textContent = myName;
        document.getElementById('player2Name').textContent = opponentName;
    } else {
        document.getElementById('player1Name').textContent = opponentName;
        document.getElementById('player2Name').textContent = myName;
    }

    resetBoard();
    updateGameUI();
    showScreen('screen-game');
});

// ============================================
// Cell Click
// ============================================
document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', () => {
        const index = parseInt(cell.getAttribute('data-index'));
        if (!gameActive) return;
        if (board[index] !== '') return;
        if (currentTurn !== mySymbol) return;

        playSound('place');
        board[index] = mySymbol;
        cell.textContent = mySymbol;
        cell.classList.add(mySymbol.toLowerCase());

        socket.emit('makeMove', { roomId: currentRoomId, index, symbol: mySymbol });
    });
});

socket.on('opponentMove', (data) => {
    board[data.index] = data.symbol;
    const cell = document.querySelector(`.cell[data-index="${data.index}"]`);
    if (cell) {
        cell.textContent = data.symbol;
        cell.classList.add(data.symbol.toLowerCase());
    }
});

socket.on('turnUpdate', (data) => {
    currentTurn = data.turn;
    board = data.board;
    gameActive = data.gameActive;

    board.forEach((val, i) => {
        const cell = document.querySelector(`.cell[data-index="${i}"]`);
        if (cell) {
            cell.textContent = val;
            cell.classList.remove('x', 'o');
            if (val) cell.classList.add(val.toLowerCase());
        }
    });
    updateGameUI();
});

// ============================================
// Round Result
// ============================================
socket.on('roundResult', (data) => {
    gameActive = false;
    score1 = data.score1;
    score2 = data.score2;
    draws = data.draws;
    currentRound = data.currentRound;
    updateGameUI();
    setTimeout(() => showRoundOver(data), 800);
});

function showRoundOver(data) {
    const title = document.getElementById('roundOverTitle');
    const winnerEl = document.getElementById('roundWinner');
    const loserEl = document.getElementById('roundLoser');
    const scoreEl = document.getElementById('roundScore');
    const nextEl = document.getElementById('roundNextInfo');
    const readyEl = document.getElementById('readyStatus');

    title.textContent = `ROUND ${data.currentRound} RESULT`;

    if (data.winner === 'draw') {
        winnerEl.textContent = "It's a DRAW!";
        winnerEl.style.color = 'var(--subtext-color)';
        loserEl.textContent = "Both played well!";
        playSound('draw');
    } else {
        const winnerName = data.winner === 'X' ?
            document.getElementById('player1Name').textContent :
            document.getElementById('player2Name').textContent;
        const loserName = data.winner === 'X' ?
            document.getElementById('player2Name').textContent :
            document.getElementById('player1Name').textContent;
        const winnerColor = data.winner === 'X' ? 'var(--accent-x)' : 'var(--accent-o)';

        winnerEl.textContent = `${winnerName} Wins!`;
        winnerEl.style.color = winnerColor;
        loserEl.textContent = `Who lost: ${loserName}`;
        playSound('win');
    }

    const p1Name = document.getElementById('player1Name').textContent;
    const p2Name = document.getElementById('player2Name').textContent;
    scoreEl.textContent = `${p1Name}  ${score1} - ${score2}  ${p2Name}`;

    if (data.isLastRound) {
        nextEl.textContent = "Final round done!";
    } else {
        nextEl.textContent = `Next: Round ${data.currentRound + 1} of ${totalRounds}`;
    }

    readyEl.textContent = 'Click anywhere or press SPACE to continue';
    readyEl.style.color = 'var(--gold)';

    showScreen('screen-round-over');
    setupFireworks('fireworksCanvas');
    startFireworks('fireworksCanvas');
    roundOverReady = true;
}

function continueToNextRound() {
    if (!roundOverReady) return;
    roundOverReady = false;
    stopFireworks('fireworksCanvas');
    socket.emit('readyForNextRound', { roomId: currentRoomId });
    document.getElementById('readyStatus').textContent = 'Waiting for other player...';
    document.getElementById('readyStatus').style.color = 'var(--subtext-color)';
}

document.getElementById('screen-round-over').addEventListener('click', continueToNextRound);
document.addEventListener('keydown', (e) => {
    if (e.key === ' ' && document.getElementById('screen-round-over').classList.contains('active')) {
        continueToNextRound();
    }
});

socket.on('startNextRound', (data) => {
    currentRound = data.currentRound;
    currentTurn = data.startingTurn || 'X';
    resetBoard();
    updateGameUI();
    showScreen('screen-game');
});

// ============================================
// Match Over
// ============================================
socket.on('matchOver', (data) => {
    stopFireworks('fireworksCanvas');
    stopFireworks('fireworksCanvas2');

    const champEl = document.getElementById('matchChampion');
    const scoreEl = document.getElementById('matchScore');
    const drawsEl = document.getElementById('matchDraws');
    const loserEl = document.getElementById('matchLoser');

    const p1Name = document.getElementById('player1Name').textContent;
    const p2Name = document.getElementById('player2Name').textContent;

    if (data.champion === 'tie') {
        champEl.textContent = `${p1Name} & ${p2Name}`;
        champEl.style.color = 'var(--success)';
        loserEl.textContent = "Nobody - it's a tie!";
        playSound('draw');
    } else {
        const champName = data.champion === 'X' ? p1Name : p2Name;
        const loserName = data.champion === 'X' ? p2Name : p1Name;
        const champColor = data.champion === 'X' ? 'var(--accent-x)' : 'var(--accent-o)';

        champEl.textContent = champName;
        champEl.style.color = champColor;
        loserEl.textContent = `Who lost: ${loserName}`;
        playSound('win');
    }

    scoreEl.textContent = `${data.score1} - ${data.score2}`;
    drawsEl.textContent = `Draws: ${data.draws}`;

    showScreen('screen-match-over');
    setupFireworks('fireworksCanvas2');
    startFireworks('fireworksCanvas2');
});

// ============================================
// Friend Left Game
// ============================================
socket.on('friendLeft', () => {
    console.log('⚠️ Friend left the game');
    gameStarted = false;
    stopFireworks('fireworksCanvas');
    stopFireworks('fireworksCanvas2');
    showScreen('screen-friend-left');
});

// ============================================
// Helpers
// ============================================
function resetBoard() {
    board = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    document.querySelectorAll('.cell').forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o');
    });
}

function updateGameUI() {
    document.getElementById('player1Score').textContent = `Score: ${score1}`;
    document.getElementById('player2Score').textContent = `Score: ${score2}`;
    document.getElementById('roundInfo').textContent = `Round ${currentRound} / ${totalRounds}`;
    document.getElementById('drawsInfo').textContent = `Draws: ${draws}`;

    const status = document.getElementById('gameStatus');
    status.className = 'status-text';

    const p1 = document.getElementById('player1Name').textContent;
    const p2 = document.getElementById('player2Name').textContent;

    if (currentTurn === 'X') {
        status.textContent = `${p1}'s Turn`;
        status.classList.add('turn-x');
    } else {
        status.textContent = `${p2}'s Turn`;
        status.classList.add('turn-o');
    }
}

// ============================================
// Fireworks
// ============================================
let fireworksAnims = {};

function setupFireworks(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function startFireworks(canvasId) {
    stopFireworks(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let particles = [];
    let lastSpawn = 0;
    const colors = ['#ff5078', '#50c8ff', '#64ff96', '#ffd700', '#ff8c42', '#ff69b4', '#87ceeb', '#ee82ee'];

    const spawnCount = isMobile ? 12 : 25;
    const spawnInterval = isMobile ? 800 : 500;

    function spawn() {
        const x = Math.random() * canvas.width;
        const y = 100 + Math.random() * (canvas.height * 0.5);
        const color = colors[Math.floor(Math.random() * colors.length)];
        for (let i = 0; i < spawnCount; i++) {
            const angle = (Math.PI * 2 * i) / spawnCount;
            const speed = 2 + Math.random() * 4;
            particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color, life: 1.5 + Math.random(),
                size: 2 + Math.random() * 3
            });
        }
    }

    function animate(timestamp) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (timestamp - lastSpawn > spawnInterval) { spawn(); lastSpawn = timestamp; }

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.15;
            p.life -= 0.016;
            if (p.life <= 0) { particles.splice(i, 1); continue; }

            ctx.globalAlpha = Math.min(1, p.life);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        fireworksAnims[canvasId] = requestAnimationFrame(animate);
    }
    fireworksAnims[canvasId] = requestAnimationFrame(animate);
}

function stopFireworks(canvasId) {
    if (fireworksAnims[canvasId]) {
        cancelAnimationFrame(fireworksAnims[canvasId]);
        delete fireworksAnims[canvasId];
    }
    const canvas = document.getElementById(canvasId);
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

// ============================================
// Sakura + Stars + Shooting Stars + Orbs Background
// ============================================
(function initBackground() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    ctx.imageSmoothingEnabled = false;
    console.log('✅ Background animation started at:', new Date().toLocaleTimeString());

    // ============================================
    // 1. Sakura Petals
    // ============================================
    const petals = [];
    const petalColors = [
        { fill: '#ffb7d5', stroke: '#ff8cb8' },
        { fill: '#ffd1e0', stroke: '#ffa0c0' },
        { fill: '#ffc0d5', stroke: '#ff99bb' },
        { fill: '#50c8ff', stroke: '#2ea8df' }
    ];

    const numPetals = isMobile ? 12 : 25;

    for (let i = 0; i < numPetals; i++) {
        petals.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: 6 + Math.random() * 10,
            speedY: 0.4 + Math.random() * 0.9,
            speedX: -0.3 + Math.random() * 0.6,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: -0.02 + Math.random() * 0.04,
            swayPhase: Math.random() * Math.PI * 2,
            swaySpeed: 0.02 + Math.random() * 0.03,
            color: petalColors[Math.floor(Math.random() * petalColors.length)],
            alpha: 0.5 + Math.random() * 0.4
        });
    }

    function drawPetal(p) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color.fill;
        ctx.strokeStyle = p.color.stroke;
        ctx.lineWidth = 0.8;
        const s = p.size;

        for (let i = 0; i < 4; i++) {
            ctx.save();
            ctx.rotate((Math.PI / 2) * i);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(-s * 0.6, -s * 0.8, -s * 0.3, -s * 1.4, 0, -s * 1.2);
            ctx.bezierCurveTo(s * 0.3, -s * 1.4, s * 0.6, -s * 0.8, 0, 0);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();
    }

    // ============================================
    // 2. Stars
    // ============================================
    const stars = [];
    const numStars = isMobile ? 25 : 40;
    const starColors = ['#50c8ff', '#ff5078', '#ffffff', '#ffd700', '#a070ff'];

    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: 0.5 + Math.random() * 1.5,
            color: starColors[Math.floor(Math.random() * starColors.length)],
            alpha: 0.2 + Math.random() * 0.5,
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: 0.02 + Math.random() * 0.03,
            speedY: (Math.random() - 0.5) * 0.15,
            speedX: (Math.random() - 0.5) * 0.1
        });
    }

    function drawStar(star) {
        star.pulse += star.pulseSpeed;
        star.y += star.speedY;
        star.x += star.speedX;

        const pulsingAlpha = star.alpha + Math.sin(star.pulse) * 0.25;

        if (star.y < -10) star.y = canvas.height + 10;
        if (star.y > canvas.height + 10) star.y = -10;
        if (star.x < -10) star.x = canvas.width + 10;
        if (star.x > canvas.width + 10) star.x = -10;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = Math.max(0.1, Math.min(0.9, pulsingAlpha));
        ctx.shadowBlur = isMobile ? 5 : 10;
        ctx.shadowColor = star.color;
        ctx.fill();
    }

    // ============================================
    // 3. Shooting Stars
    // ============================================
    const shootingStars = [];
    const maxShootingStars = isMobile ? 1 : 3;

    function spawnShootingStar() {
        if (shootingStars.length >= maxShootingStars) return;
        if (Math.random() > 0.02) return;

        shootingStars.push({
            x: Math.random() * canvas.width,
            y: -50,
            length: 80 + Math.random() * 100,
            speed: 8 + Math.random() * 6,
            angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
            life: 1.0,
            color: Math.random() > 0.5 ? '#50c8ff' : '#ffffff'
        });
    }

    function drawShootingStar(s) {
        ctx.save();
        ctx.globalAlpha = s.life * 0.9;
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = s.color;

        const endX = s.x - Math.cos(s.angle) * s.length;
        const endY = s.y - Math.sin(s.angle) * s.length;

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(s.x, s.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.fill();

        ctx.restore();
    }

    function updateShootingStars() {
        for (let i = shootingStars.length - 1; i >= 0; i--) {
            const s = shootingStars[i];
            s.x += Math.cos(s.angle) * s.speed;
            s.y += Math.sin(s.angle) * s.speed;
            s.life -= 0.01;

            if (s.life <= 0 || s.x > canvas.width + 100 || s.y > canvas.height + 100) {
                shootingStars.splice(i, 1);
            }
        }
    }

    // ============================================
    // 4. Glowing Orbs
    // ============================================
    const orbs = [];
    const numOrbs = isMobile ? 2 : 6;
    const orbColors = [
        'rgba(80, 200, 255, 0.15)',
        'rgba(255, 80, 120, 0.12)',
        'rgba(160, 112, 255, 0.13)',
        'rgba(100, 255, 150, 0.1)'
    ];

    for (let i = 0; i < numOrbs; i++) {
        orbs.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: 80 + Math.random() * 120,
            color: orbColors[Math.floor(Math.random() * orbColors.length)],
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: (Math.random() - 0.5) * 0.3,
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: 0.005 + Math.random() * 0.01
        });
    }

    function drawOrb(orb) {
        orb.pulse += orb.pulseSpeed;
        orb.x += orb.speedX;
        orb.y += orb.speedY;

        if (orb.x < -orb.radius) orb.x = canvas.width + orb.radius;
        if (orb.x > canvas.width + orb.radius) orb.x = -orb.radius;
        if (orb.y < -orb.radius) orb.y = canvas.height + orb.radius;
        if (orb.y > canvas.height + orb.radius) orb.y = -orb.radius;

        const pulseRadius = orb.radius + Math.sin(orb.pulse) * 20;

        const gradient = ctx.createRadialGradient(
            orb.x, orb.y, 0,
            orb.x, orb.y, pulseRadius
        );
        gradient.addColorStop(0, orb.color);
        gradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(orb.x, orb.y, pulseRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    }

    // ============================================
    // 5. Combined Animation Loop
    // ============================================
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        orbs.forEach(orb => drawOrb(orb));
        stars.forEach(star => drawStar(star));
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        spawnShootingStar();
        updateShootingStars();
        shootingStars.forEach(s => drawShootingStar(s));

        petals.forEach(p => {
            p.y += p.speedY;
            p.swayPhase += p.swaySpeed;
            p.x += p.speedX + Math.sin(p.swayPhase) * 0.5;
            p.rotation += p.rotationSpeed;

            if (p.y > canvas.height + 30) { p.y = -30; p.x = Math.random() * canvas.width; }
            if (p.x < -30) p.x = canvas.width + 30;
            if (p.x > canvas.width + 30) p.x = -30;

            drawPetal(p);
        });

        requestAnimationFrame(animate);
    }
    animate();
})();


// ============================================
// Background Videos Control
// PC: Play videos in loop continuously (FORCED)
// Mobile: Static image (video hidden)
// ============================================
let videosReady = false;

function initVideos() {
    const menuBg = document.getElementById('menuBg');
    const gameBg = document.getElementById('gameBg');

    if (!menuBg || !gameBg) {
        console.log('⚠️ Video elements not found');
        return;
    }

    [menuBg, gameBg].forEach(video => {
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.autoplay = true;
        video.preload = 'auto';
        video.volume = 0;
    });

    if (isMobile) {
        console.log('📱 Mobile mode: Videos hidden');
        menuBg.style.display = 'none';
        gameBg.style.display = 'none';
        videosReady = true;
        return;
    }

    console.log('💻 PC mode: Forcing videos to play');

    menuBg.style.display = 'block';
    gameBg.style.display = 'block';

    menuBg.load();
    gameBg.load();

    function forcePlay(video, name) {
        if (!video) return;
        video.muted = true;
        video.volume = 0;
        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log(`✅ ${name} video playing`);
            }).catch(err => {
                console.log(`⚠️ ${name} video blocked: ${err.message}`);
                setTimeout(() => {
                    video.play().catch(() => {});
                }, 500);
            });
        }
    }

    forcePlay(menuBg, 'Menu');
    gameBg.pause();

    videosReady = true;
}

function switchVideoForScreen(screenId) {
    if (!videosReady || isMobile) return;

    const menuBg = document.getElementById('menuBg');
    const gameBg = document.getElementById('gameBg');
    if (!menuBg || !gameBg) return;

    const inGame = (
        screenId === 'screen-game' ||
        screenId === 'screen-round-over' ||
        screenId === 'screen-match-over'
    );

    if (inGame) {
        document.body.classList.add('in-game');
        document.body.classList.remove('in-menu');
    } else {
        document.body.classList.add('in-menu');
        document.body.classList.remove('in-game');
    }

    if (inGame) {
        menuBg.pause();
        gameBg.muted = true;
        gameBg.volume = 0;
        gameBg.play().catch(() => {
            setTimeout(() => gameBg.play().catch(() => {}), 300);
        });
    } else {
        gameBg.pause();
        menuBg.muted = true;
        menuBg.volume = 0;
        menuBg.play().catch(() => {
            setTimeout(() => menuBg.play().catch(() => {}), 300);
        });
    }
}

const _originalShowScreen = showScreen;
window.showScreen = function (id) {
    _originalShowScreen(id);
    switchVideoForScreen(id);
};

document.addEventListener('visibilitychange', () => {
    if (isMobile || !videosReady) return;

    const menuBg = document.getElementById('menuBg');
    const gameBg = document.getElementById('gameBg');

    if (document.hidden) {
        if (menuBg) menuBg.pause();
        if (gameBg) gameBg.pause();
    } else {
        const activeScreen = document.querySelector('.screen.active');
        if (activeScreen) {
            switchVideoForScreen(activeScreen.id);
        }
    }
});

function retryVideoPlay() {
    if (isMobile || !videosReady) return;

    const activeScreen = document.querySelector('.screen.active');
    if (!activeScreen) return;

    const inGame = (
        activeScreen.id === 'screen-game' ||
        activeScreen.id === 'screen-round-over' ||
        activeScreen.id === 'screen-match-over'
    );

    const menuBg = document.getElementById('menuBg');
    const gameBg = document.getElementById('gameBg');

    if (inGame) {
        if (gameBg && gameBg.paused) {
            gameBg.muted = true;
            gameBg.volume = 0;
            gameBg.play().catch(() => {});
        }
    } else {
        if (menuBg && menuBg.paused) {
            menuBg.muted = true;
            menuBg.volume = 0;
            menuBg.play().catch(() => {});
        }
    }
}

document.addEventListener('click', retryVideoPlay);
document.addEventListener('touchstart', retryVideoPlay);
document.addEventListener('keydown', retryVideoPlay);
document.addEventListener('mousemove', retryVideoPlay, { once: true });
document.addEventListener('scroll', retryVideoPlay, { once: true });

// Every 3 sec check if video paused and resume
setInterval(() => {
    if (isMobile || !videosReady) return;
    if (document.hidden) return;

    const activeScreen = document.querySelector('.screen.active');
    if (!activeScreen) return;

    const inGame = (
        activeScreen.id === 'screen-game' ||
        activeScreen.id === 'screen-round-over' ||
        activeScreen.id === 'screen-match-over'
    );

    const menuBg = document.getElementById('menuBg');
    const gameBg = document.getElementById('gameBg');

    if (inGame) {
        if (gameBg && gameBg.paused) gameBg.play().catch(() => {});
    } else {
        if (menuBg && menuBg.paused) menuBg.play().catch(() => {});
    }
}, 3000);

window.addEventListener('load', () => {
    setTimeout(() => {
        initVideos();
        const activeScreen = document.querySelector('.screen.active');
        if (activeScreen) {
            switchVideoForScreen(activeScreen.id);
        }
    }, 500);
});

document.addEventListener('DOMContentLoaded', () => {
    if (!isMobile) {
        setTimeout(() => {
            initVideos();
        }, 100);
    }
});