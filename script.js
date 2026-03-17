// ---> CONFIGURACIÓN DE IMÁGENES <---
// Reemplaza estos emojis con las rutas de tus imágenes
const IMAGES = [
    '🐶', '🐱', '🐭', '🐹',  // Índices 0-3: Cuartetos rojos
    '🐰', '🦊', '🐻', '🐼',  // Índices 4-7: Cuartetos rojos
    '🐨', '🐯', '🦁', '🐮',  // Índices 8-11: Cuartetos azules
    '🦄', '🐧', '🐦', '🐤'   // Índices 12-15: Cuartetos azules
];

const GAME_CONFIG = {
    BOARD_SIZE: 8,
    INITIAL_TIME: 180, // 3 minutos
    POINTS_PER_QUARTET: 100,
    MAX_SCORES: 10,
    COMBO_DURATION: 5000, // 5 segundos
    FOCUS_CHANGE_INTERVAL: 15000 // 15 segundos
};

class ArmoniaCuartetos {
    constructor() {
        this.initializeDOMElements();
        this.initializeGameState();
        this.loadScores();
        this.setupEventListeners();
        this.showStartScreen();
    }

    initializeDOMElements() {
        // Pantallas
        this.startScreen = document.getElementById('startScreen');
        this.gamePlayScreen = document.getElementById('gamePlayScreen');
        this.pauseScreen = document.getElementById('pauseScreen');
        this.gameoverScreen = document.getElementById('gameoverScreen');
        this.scoresScreen = document.getElementById('scoresScreen');
        
        // Elementos del juego
        this.board = document.getElementById('gameBoard');
        this.scoreDisplay = document.getElementById('scoreDisplay');
        this.timerDisplay = document.getElementById('timerDisplay');
        this.comboDisplay = document.getElementById('comboDisplay');
        this.comboTimer = document.getElementById('comboTimer');
        this.selectionCount = document.getElementById('selectionCount');
        this.finalScoreDisplay = document.getElementById('finalScore');
        this.maxComboDisplay = document.getElementById('maxCombo');
        this.timeCompletedDisplay = document.getElementById('timeCompleted');
        this.scoresList = document.getElementById('scoresList');
        this.playerNameInput = document.getElementById('playerName');
        
        // Focos
        this.redFocus = document.getElementById('redFocus');
        this.blueFocus = document.getElementById('blueFocus');
        this.redMultiplier = document.getElementById('redMultiplier');
        this.blueMultiplier = document.getElementById('blueMultiplier');
        
        // Botones
        this.startGameBtn = document.getElementById('startGameBtn');
        this.showScoresBtn = document.getElementById('showScoresBtn');
        this.deselectBtn = document.getElementById('deselectBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetGameBtn = document.getElementById('resetGameBtn');
        this.menuBtn = document.getElementById('menuBtn');
        this.resumeBtn = document.getElementById('resumeBtn');
        this.restartFromPauseBtn = document.getElementById('restartFromPauseBtn');
        this.menuFromPauseBtn = document.getElementById('menuFromPauseBtn');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.menuFromGameoverBtn = document.getElementById('menuFromGameoverBtn');
        this.saveScoreBtn = document.getElementById('saveScoreBtn');
        this.clearScoresBtn = document.getElementById('clearScoresBtn');
        this.backFromScoresBtn = document.getElementById('backFromScoresBtn');
    }

    initializeGameState() {
        this.score = 0;
        this.timeLeft = GAME_CONFIG.INITIAL_TIME;
        this.selectedCards = [];
        this.gameActive = false;
        this.gamePaused = false;
        this.timerInterval = null;
        this.comboInterval = null;
        this.focusInterval = null;
        this.comboMultiplier = 1;
        this.maxCombo = 1;
        this.activeFocus = null; // 'red' o 'blue'
        this.currentPlayerName = '';
        this.highScores = [];
        
        // Generar los cuartetos con colores fijos
        this.generateColoredQuartets();
    }

    // ========== GENERAR CUARTETOS POR COLOR ==========
    generateColoredQuartets() {
        // 8 cuartetos rojos (usando imágenes 0-7)
        const redQuartets = [];
        for (let i = 0; i < 8; i++) {
            const imageIndex = i; // Primeras 8 imágenes para rojo
            for (let j = 0; j < 4; j++) {
                redQuartets.push({
                    imageIndex: imageIndex,
                    color: 'red',
                    quartetId: `red-${i}` // Identificador único del cuarteto
                });
            }
        }
        
        // 8 cuartetos azules (usando imágenes 8-15)
        const blueQuartets = [];
        for (let i = 8; i < 16; i++) {
            const imageIndex = i; // Siguientes 8 imágenes para azul
            for (let j = 0; j < 4; j++) {
                blueQuartets.push({
                    imageIndex: imageIndex,
                    color: 'blue',
                    quartetId: `blue-${i}` // Identificador único del cuarteto
                });
            }
        }
        
        // Combinar y mezclar
        this.allCards = this.shuffleArray([...redQuartets, ...blueQuartets]);
    }

    setupEventListeners() {
        this.startGameBtn.addEventListener('click', () => this.startNewGame());
        this.showScoresBtn.addEventListener('click', () => this.showScores());
        
        this.deselectBtn.addEventListener('click', () => this.deselectAll());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.resetGameBtn.addEventListener('click', () => this.resetGame());
        this.menuBtn.addEventListener('click', () => this.returnToMenu());
        
        this.resumeBtn.addEventListener('click', () => this.togglePause());
        this.restartFromPauseBtn.addEventListener('click', () => this.resetGame());
        this.menuFromPauseBtn.addEventListener('click', () => this.returnToMenu());
        
        this.playAgainBtn.addEventListener('click', () => this.startNewGame());
        this.menuFromGameoverBtn.addEventListener('click', () => this.returnToMenu());
        this.saveScoreBtn.addEventListener('click', () => this.saveScore());
        
        this.clearScoresBtn.addEventListener('click', () => this.clearAllScores());
        this.backFromScoresBtn.addEventListener('click', () => this.hideScores());
        
        document.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    // ========== FUNCIONES DE PANTALLAS ==========
    showStartScreen() {
        this.startScreen.classList.remove('hidden');
        this.gamePlayScreen.classList.add('hidden');
        this.pauseScreen.classList.add('hidden');
        this.gameoverScreen.classList.add('hidden');
        this.scoresScreen.classList.add('hidden');
    }

    showGameScreen() {
        this.startScreen.classList.add('hidden');
        this.gamePlayScreen.classList.remove('hidden');
        this.pauseScreen.classList.add('hidden');
        this.gameoverScreen.classList.add('hidden');
        this.scoresScreen.classList.add('hidden');
    }

    showScores() {
        this.renderScores();
        this.startScreen.classList.add('hidden');
        this.scoresScreen.classList.remove('hidden');
    }

    hideScores() {
        this.scoresScreen.classList.add('hidden');
        this.showStartScreen();
    }

    // ========== FUNCIONES DEL JUEGO ==========
    startNewGame() {
        this.initializeGameState();
        this.createBoard();
        this.startTimer();
        this.startFocusRotation();
        this.gameActive = true;
        this.updateSelectionCount();
        this.showGameScreen();
    }

    resetGame() {
        this.stopAllIntervals();
        this.initializeGameState();
        this.createBoard();
        this.startTimer();
        this.startFocusRotation();
        this.gameActive = true;
        this.showGameScreen();
    }

    returnToMenu() {
        this.stopAllIntervals();
        this.gameActive = false;
        this.gamePaused = false;
        this.showStartScreen();
    }

    stopAllIntervals() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        if (this.comboInterval) clearInterval(this.comboInterval);
        if (this.focusInterval) clearInterval(this.focusInterval);
        this.timerInterval = null;
        this.comboInterval = null;
        this.focusInterval = null;
    }

    togglePause() {
        if (!this.gameActive) return;
        
        this.gamePaused = !this.gamePaused;
        
        if (this.gamePaused) {
            this.stopAllIntervals();
            this.pauseScreen.classList.remove('hidden');
        } else {
            this.startTimer();
            this.startFocusRotation();
            if (this.comboMultiplier > 1) {
                this.startComboTimer();
            }
            this.pauseScreen.classList.add('hidden');
        }
    }

    // ========== TEMPORIZADORES ==========
    startTimer() {
        this.updateTimerDisplay();
        this.timerInterval = setInterval(() => {
            if (this.gameActive && !this.gamePaused) {
                this.timeLeft--;
                this.updateTimerDisplay();
                
                if (this.timeLeft <= 0) {
                    this.timeLeft = 0;
                    this.updateTimerDisplay();
                    this.gameOver();
                }
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    startFocusRotation() {
        this.activeFocus = Math.random() < 0.5 ? 'red' : 'blue';
        this.updateFocusUI();
        
        this.focusInterval = setInterval(() => {
            if (this.gameActive && !this.gamePaused) {
                this.activeFocus = this.activeFocus === 'red' ? 'blue' : 'red';
                this.updateFocusUI();
                this.showMessage(`🎯 ${this.activeFocus === 'red' ? '🔴' : '🔵'}`, 'focus');
            }
        }, GAME_CONFIG.FOCUS_CHANGE_INTERVAL);
    }

    updateFocusUI() {
        this.redFocus.classList.remove('active');
        this.blueFocus.classList.remove('active');
        
        if (this.activeFocus === 'red') {
            this.redFocus.classList.add('active');
            this.redMultiplier.textContent = 'x2';
            this.blueMultiplier.textContent = 'x1';
        } else {
            this.blueFocus.classList.add('active');
            this.blueMultiplier.textContent = 'x2';
            this.redMultiplier.textContent = 'x1';
        }
    }

    // ========== FUNCIONES DEL TABLERO ==========
    createBoard() {
        this.board.innerHTML = '';
        
        this.allCards.forEach((cardData, index) => {
            const card = this.createCard(cardData, index);
            this.board.appendChild(card);
        });
    }

    createCard(cardData, id) {
        const card = document.createElement('div');
        card.className = `card ${cardData.color}-card`;
        card.dataset.id = id;
        card.dataset.imageIndex = cardData.imageIndex;
        card.dataset.color = cardData.color;
        card.dataset.quartetId = cardData.quartetId;
        card.textContent = IMAGES[cardData.imageIndex];
        
        card.addEventListener('touchstart', (e) => this.handleCardInteraction(e, card), { passive: false });
        card.addEventListener('mousedown', (e) => this.handleCardInteraction(e, card));
        
        return card;
    }

    // ========== MANEJO DE SELECCIÓN ==========
    handleCardInteraction(e, card) {
        e.preventDefault();
        
        if (!this.gameActive || this.gamePaused) return;
        
        const quartetId = card.dataset.quartetId;
        const cardIndex = this.selectedCards.findIndex(c => c.dataset.id === card.dataset.id);
        
        if (cardIndex !== -1) {
            card.classList.remove('selected');
            this.selectedCards.splice(cardIndex, 1);
        } else {
            if (this.selectedCards.length === 0) {
                card.classList.add('selected');
                this.selectedCards.push(card);
            } else {
                const firstCardQuartetId = this.selectedCards[0].dataset.quartetId;
                
                if (quartetId === firstCardQuartetId && this.selectedCards.length < 4) {
                    card.classList.add('selected');
                    this.selectedCards.push(card);
                } else if (quartetId !== firstCardQuartetId) {
                    this.showMessage('❌ Mismo cuarteto', 'error');
                } else if (this.selectedCards.length >= 4) {
                    this.showMessage('❌ Máximo 4', 'error');
                }
            }
        }
        
        this.updateSelectionCount();
        
        if (this.selectedCards.length === 4) {
            this.completeQuartet();
        }
    }

    completeQuartet() {
        const firstCard = this.selectedCards[0];
        const cardColor = firstCard.dataset.color;
        
        let points = GAME_CONFIG.POINTS_PER_QUARTET;
        points *= this.comboMultiplier;
        
        const focusActive = (this.activeFocus === cardColor);
        if (focusActive) {
            points *= 2;
        }
        
        this.showMessage(`✨ +${points}`, 'success');
        
        if (this.comboMultiplier > 1) {
            this.showMessage(`⚡ x${this.comboMultiplier}`, 'combo');
        }
        
        if (focusActive) {
            this.showMessage(`🎯 FOCO +`, 'focus');
        }
        
        this.selectedCards.forEach(card => {
            card.classList.add('disappearing');
        });
        
        setTimeout(() => {
            this.selectedCards.forEach(card => {
                card.remove();
            });
            
            const cardIdsToRemove = this.selectedCards.map(c => parseInt(c.dataset.id));
            this.allCards = this.allCards.filter((_, index) => !cardIdsToRemove.includes(index));
            
            this.reindexCards();
            this.score += points;
            this.updateScore();
            this.activateCombo();
            this.deselectAll();
            
            if (this.board.children.length === 0) {
                this.gameOver(true);
            }
        }, 200);
    }

    reindexCards() {
        const cards = document.querySelectorAll('.card');
        cards.forEach((card, newIndex) => {
            card.dataset.id = newIndex;
        });
    }

    // ========== SISTEMA DE COMBOS ==========
    activateCombo() {
        this.comboMultiplier *= 2;
        if (this.comboMultiplier > this.maxCombo) {
            this.maxCombo = this.comboMultiplier;
        }
        
        this.comboDisplay.textContent = `x${this.comboMultiplier}`;
        this.comboDisplay.classList.add('combo-flash');
        setTimeout(() => {
            this.comboDisplay.classList.remove('combo-flash');
        }, 300);
        
        this.startComboTimer();
    }

    startComboTimer() {
        if (this.comboInterval) clearInterval(this.comboInterval);
        
        let timeLeft = GAME_CONFIG.COMBO_DURATION / 1000;
        const totalTime = timeLeft;
        
        this.comboInterval = setInterval(() => {
            if (this.gameActive && !this.gamePaused) {
                timeLeft -= 0.1;
                const percentage = (timeLeft / totalTime) * 100;
                this.comboTimer.style.width = `${Math.max(0, percentage)}%`;
                
                if (timeLeft <= 0) {
                    this.resetCombo();
                }
            }
        }, 100);
    }

    resetCombo() {
        this.comboMultiplier = 1;
        this.comboDisplay.textContent = 'x1';
        this.comboTimer.style.width = '100%';
        if (this.comboInterval) {
            clearInterval(this.comboInterval);
            this.comboInterval = null;
        }
        this.showMessage('⏰ Fin combo', 'error');
    }

    // ========== UTILIDADES ==========
    deselectAll() {
        this.selectedCards.forEach(card => {
            card.classList.remove('selected');
        });
        this.selectedCards = [];
        this.updateSelectionCount();
    }

    updateSelectionCount() {
        this.selectionCount.textContent = this.selectedCards.length;
    }

    updateScore() {
        this.scoreDisplay.textContent = this.score;
        this.scoreDisplay.classList.add('score-pop');
        setTimeout(() => {
            this.scoreDisplay.classList.remove('score-pop');
        }, 300);
    }

    // ========== FUNCIÓN CORREGIDA - MENSAJES QUE NO BLOQUEAN ==========
    showMessage(msg, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `game-message ${type}`;
        toast.textContent = msg;
        
        toast.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.6);
            color: #ffd700;
            padding: 8px 20px;
            border-radius: 40px;
            font-size: 1rem;
            font-weight: bold;
            z-index: 999;
            border: 1px solid rgba(255, 215, 0, 0.3);
            backdrop-filter: blur(2px);
            box-shadow: 0 0 15px rgba(255,215,0,0.2);
            pointer-events: none;
            animation: messageFade 1.2s ease forwards;
            opacity: 0;
            white-space: nowrap;
        `;
        
        switch(type) {
            case 'error':
                toast.style.background = 'rgba(255, 68, 68, 0.7)';
                toast.style.color = 'white';
                break;
            case 'success':
                toast.style.background = 'rgba(76, 175, 80, 0.7)';
                toast.style.color = 'white';
                break;
            case 'combo':
                toast.style.background = 'rgba(255, 215, 0, 0.7)';
                toast.style.color = '#1a1a2e';
                toast.style.fontSize = '1.2rem';
                break;
            case 'focus':
                toast.style.background = 'rgba(255, 255, 255, 0.2)';
                toast.style.color = '#ffd700';
                toast.style.fontSize = '1.1rem';
                toast.style.border = '2px solid #ffd700';
                break;
        }
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 1200);
    }

    // ========== GAME OVER ==========
    gameOver(isVictory = false) {
        this.gameActive = false;
        this.stopAllIntervals();
        
        this.finalScoreDisplay.textContent = this.score;
        this.maxComboDisplay.textContent = `x${this.maxCombo}`;
        this.timeCompletedDisplay.textContent = this.timerDisplay.textContent;
        
        if (isVictory) {
            this.timeCompletedDisplay.innerHTML += ' 🏆 ¡VICTORIA PERFECTA!';
        }
        
        this.gamePlayScreen.classList.add('hidden');
        this.gameoverScreen.classList.remove('hidden');
    }

    // ========== SISTEMA DE PUNTUACIONES ==========
    loadScores() {
        const saved = localStorage.getItem('armoniaCuartetos_scores');
        if (saved) {
            this.highScores = JSON.parse(saved);
        } else {
            this.highScores = [];
        }
    }

    saveScores() {
        localStorage.setItem('armoniaCuartetos_scores', JSON.stringify(this.highScores));
    }

    saveScore() {
        const playerName = this.playerNameInput.value.trim().toUpperCase();
        
        if (!playerName) {
            this.showMessage('❌ Ingresa tu nombre', 'error');
            return;
        }
        
        const newScore = {
            name: playerName,
            score: this.score,
            maxCombo: `x${this.maxCombo}`,
            time: this.timerDisplay.textContent,
            date: new Date().toLocaleDateString()
        };
        
        this.highScores.push(newScore);
        this.highScores.sort((a, b) => b.score - a.score);
        
        if (this.highScores.length > GAME_CONFIG.MAX_SCORES) {
            this.highScores = this.highScores.slice(0, GAME_CONFIG.MAX_SCORES);
        }
        
        this.saveScores();
        this.showMessage('✅ ¡Guardado!', 'success');
        
        setTimeout(() => {
            this.returnToMenu();
        }, 1000);
    }

    renderScores() {
        this.scoresList.innerHTML = '';
        
        if (this.highScores.length === 0) {
            this.scoresList.innerHTML = '<div class="score-item" style="justify-content: center;">🏆 No hay puntuaciones aún</div>';
            return;
        }
        
        this.highScores.forEach((score, index) => {
            const scoreItem = document.createElement('div');
            scoreItem.className = 'score-item';
            
            let medal = '';
            if (index === 0) medal = '🥇 ';
            else if (index === 1) medal = '🥈 ';
            else if (index === 2) medal = '🥉 ';
            
            scoreItem.innerHTML = `
                <span>${medal}${score.name}</span>
                <span>${score.score} pts</span>
                <span>${score.maxCombo}</span>
                <span>${score.time}</span>
            `;
            
            this.scoresList.appendChild(scoreItem);
        });
    }

    clearAllScores() {
        if (confirm('¿Borrar todas las puntuaciones?')) {
            this.highScores = [];
            this.saveScores();
            this.renderScores();
            this.showMessage('🗑️ Borradas', 'error');
        }
    }

    // ========== UTILIDADES ==========
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}

// Iniciar juego
document.addEventListener('DOMContentLoaded', () => {
    new ArmoniaCuartetos();
});
