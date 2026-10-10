# 🎮 Tic Tac Toe Online

A real-time multiplayer Tic Tac Toe game built with Node.js, Socket.IO, and Vanilla JavaScript.

Play with your friends from anywhere in the world — no sign-up, no install. Just share a link and start playing.

![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat&logo=node.js&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-010101?style=flat&logo=socket.io&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat&logo=express&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat)

---

## ✨ Features

### 🎮 Gameplay

- Real-time multiplayer via Socket.IO
- Invite via unique link — no account needed
- Two players can play from any device (PC / Mobile)
- Custom round system — 1 to 100 rounds per match
- Live score tracking — wins and draws displayed
- Champion declaration after final round
- Auto next round — both players click to continue
- Disconnect handling with friend-left notification

### 🎨 Visual Design

- Dark neon theme with cyberpunk aesthetic
- Sakura petals animation in the background
- Glow effects on buttons and text
- Fireworks animation on victory
- Video backgrounds (interface and gameplay)
- Custom fonts — BlackUnicorn, Death, Walshes

### 🔊 Audio

- Background music — separate for menu and game
- Click sounds on all buttons
- Placement sounds for X and O
- Win / Draw / Fail sound effects
- Settings — Music ON/OFF and Sound ON/OFF

### 🚀 User Experience

- Splash screen — click anywhere to start
- Home menu — PLAY, SETTINGS, CREDITS, EXIT
- Play mode — INVITE FRIEND or JOIN A GAME
- Join with code — 6-character room codes
- Credits screen with developer info
- Exit screen — friendly thank-you message
- Fully responsive — works on mobile too

---

## 🎯 How to Play

### Host a Game

1. Open the game in your browser
2. Click anywhere on the splash screen
3. Click PLAY → INVITE FRIEND
4. Enter your name and number of rounds (1–100)
5. Click START GAME
6. Copy the invite link and send it to your friend

### Join a Game

1. Open the invite link your friend shared
2. Click YES when prompted "Your friend wants to play"
3. Enter your name
4. Click READY
5. Game starts automatically

### During the Game

- X (Host) always plays first
- Click on any empty cell to place your mark
- First to 3 in a row wins the round
- Click anywhere or press SPACE after each round
- Champion is declared after all rounds are complete

---

## 🌐 How Room Codes Work

Each game creates a 6-character unique room code. Example link:

https://yourgame.onrender.com/?room=KQ7DRM

The room code is **KQ7DRM** (the part after `room=`).

Your friend can either:

- Click the full link to auto-join
- Or type just **KQ7DRM** in the JOIN A GAME screen

---

## 🛠️ Tech Stack

- **Backend Runtime:** Node.js 20.x
- **Web Framework:** Express 5.x
- **Real-Time Communication:** Socket.IO 4.x
- **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Graphics:** HTML5 Canvas (Fireworks and Sakura petals)
- **Fonts:** BlackUnicorn, Death, Walshes (custom TTF)
- **Audio:** HTML5 Audio API
- **Hosting:** Render.com

---

## 📁 Project Structure

```text
TicTacToe-Server/
├── server.js Main server + Socket.IO logic
├── package.json Dependencies and scripts
├── .gitignore Git ignore rules
├── README.md Project documentation
└── public/ Static files served to browser
├── index.html All screens
├── style.css Complete styling
├── script.js Client-side Socket.IO logic
├── fonts/ Custom fonts
├── sounds/ Sound effects
├── interface.mp4 Menu background video
├── gameplay.mp4 Game background video
├── interfacesound.mp3 Menu background music
└── gameplaysound.mp3 Game background music
```

---

## 🚀 Run Locally

### Prerequisites

- Node.js (v20 or higher)
- npm (comes with Node.js)

### Setup

Run these commands in your terminal:
```bash
git clone https://github.com/Nafizur-Rahman-25/tictactoe-online.git
cd tictactoe-online
npm install
node server.js
```


Then open http://localhost:3000 in your browser.

### Testing Multiplayer Locally

1. Browser 1 (Normal) — Go to http://localhost:3000
2. Click HOST A GAME — copy the invite link
3. Browser 2 (Incognito) — Paste the link
4. Click YES → enter name → READY
5. Play

Important: To test multiplayer on the same device, use Incognito mode for the second player.

---

## 🎨 Design Philosophy

This project recreates the experience of a native C++ / Raylib game using modern web technologies.

- Dark neon aesthetic inspired by cyberpunk themes
- Sakura petals canvas animation for ambient beauty
- Fireworks particles for victory celebrations
- Custom fonts for a distinctive, hand-crafted feel
- Video backgrounds that blend seamlessly with the UI

Every detail — from the glow on buttons to the sound design — was chosen to create an immersive, atmospheric experience.

---

## 🔮 Roadmap

- [x] Real-time multiplayer gameplay
- [x] Custom room codes and invite links
- [x] Round system (1–100 rounds)
- [x] Live score tracking
- [x] Music and sound effects
- [x] Fireworks animations
- [x] Mobile responsive design
- [x] Disconnect handling with friend-left notification
- [ ] AI opponent (Minimax algorithm)
- [ ] Spectator mode
- [ ] In-game chat
- [ ] Match history and statistics
- [ ] Multi-language support (Bangla / English)

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the project
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License — see the LICENSE file for details.

---

## 👨‍💻 Author

**Md. Nafizur Rahman Nafiz**

Department of Computer Science and Engineering  

Chittagong University of Engineering and Technology (CUET)

GitHub: https://github.com/Nafizur-Rahman-25

---

## 🙏 Acknowledgements

- Socket.IO — Real-time engine
- Express — Web framework
- Render.com — Free hosting
- Pixabay — Background videos and music
- Raylib — Original C++ inspiration
- CUET CSE Department — For continuous support

---

⭐ If you enjoyed this project, please give it a star!

Made with ❤️ by Nafizur Rahman