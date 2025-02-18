
// Game Object Initialization: Simon Game object, setting up properties like colors, sequences, scores, and DOM element references.
function SimonGame() {
    this.colors = ['green', 'red', 'yellow', 'blue'];
    this.sequence = [];
    this.playerSequence = [];
    this.score = 0;
    this.highScore = this.loadHighScore() || 0;
    this.gameActive = false;
    this.difficulty = 'medium';

    this.domElements = {
        startButton: document.getElementById('start-button'),
        scoreDisplay: document.getElementById('current-score'),
        highScoreDisplay: document.getElementById('best-score'),
        difficultySelect: document.getElementById('difficulty-level'),
        gameMessage: document.getElementById('game-message')
    };

    this.sounds = this.loadSounds();
    this.setupEventListeners();
    this.updateHighScoreDisplay();
}

// Sound Loading
SimonGame.prototype.loadSounds = function() {
    return {
        green: new Audio('sounds/green.mp3'),
        red: new Audio('sounds/red.mp3'),
        yellow: new Audio('sounds/yellow.mp3'),
        blue: new Audio('sounds/blue.mp3'),
        wrong: new Audio('sounds/gameover.mp3')
    };
};

// Event Listener Setup: Attaching event listeners to the game interactive elements (start button, color buttons, difficulty selection) to respond to user actions.
SimonGame.prototype.setupEventListeners = function() {
    var self = this; // Capture 'this' for use within event listeners

    this.domElements.startButton.addEventListener('click', function() {
        self.startGame();
    });

    this.domElements.difficultySelect.addEventListener('change', function(e) {
        self.difficulty = e.target.value;
    });

    for (var i = 0; i < this.colors.length; i++) {
        var color = this.colors[i];
        document.getElementById(color).addEventListener('click', function(color) {
            return function() {
                self.handlePlayerInput(color);
            };
        }(color)); // Closure to capture the color
    }
};

// High Score Persistence: saving and loading the high score from local storage, and updating the UI display.
SimonGame.prototype.loadHighScore = function() {
    try {
        var savedScore = localStorage.getItem('simonGameHighScore');
        if (savedScore) {
            return parseInt(savedScore);
        } else {
            return null;
        }
    } catch (e) {
        console.warn("Local storage unavailable, high score not loaded.");
        return null;
    }
};

SimonGame.prototype.updateHighScoreDisplay = function() {
    this.domElements.highScoreDisplay.textContent = this.highScore;
};

SimonGame.prototype.saveHighScore = function() {
    try {
        localStorage.setItem('simonGameHighScore', this.highScore);
        this.updateHighScoreDisplay();
    } catch (e) {
        console.warn("Local storage unavailable, high score not saved.");
    }
};

// Visual & Audio feedback functions
SimonGame.prototype.playSound = function(color) {
    var sound = this.sounds[color];
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(function() { console.warn('Failed to play sound: ' + color); });
    }
};

SimonGame.prototype.flashButton = function(color) {
    var button = document.getElementById(color);
    if (button) {
        button.style.opacity = '1';
        this.playSound(color);
        setTimeout(function() {
            button.style.opacity = '0.6';
        }, 300);
    }
};

// Game Sequence Generation & Display: 

SimonGame.prototype.playSequence = function() {
    var self = this;
    var speedMultiplier = this.getSpeedMultiplier();
    this.domElements.gameMessage.textContent = 'Watch!';
    this.sequence.push(this.getRandomColor());

    for (var i = 0; i < this.sequence.length; i++) {
        (function(index) {
            setTimeout(function() {
                self.flashButton(self.sequence[index]);
            }, (index + 1) * (600 * speedMultiplier));
        })(i);
    }

    var sequenceDelay = (this.sequence.length + 1) * (600 * speedMultiplier);
    setTimeout(function() {
        self.playerSequence = [];
        self.domElements.gameMessage.textContent = 'Your turn!';
    }, sequenceDelay);
};

SimonGame.prototype.getSpeedMultiplier = function() {
    var speed = { easy: 1.5, hard: 0.5, medium: 1 }[this.difficulty];
    return speed || 1; // Default to 1 if difficulty is invalid
};

// Player Input Handling
SimonGame.prototype.handlePlayerInput = function(color) {
    if (!this.gameActive) {
        return;
    }

    this.flashButton(color);
    this.playerSequence.push(color);

    if (!this.isSequenceCorrect()) {
        this.endGame();
        return;
    }

    if (this.playerSequence.length === this.sequence.length) {
        this.score++;
        this.domElements.scoreDisplay.textContent = this.score;
        var self = this;
        setTimeout(function() {
            self.playSequence();
        }, 1000);
    }
};

SimonGame.prototype.isSequenceCorrect = function() {
    for (var i = 0; i < this.playerSequence.length; i++) {
        if (this.playerSequence[i] !== this.sequence[i]) {
            return false;
        }
    }
    return true;
};

SimonGame.prototype.getRandomColor = function() {
    var randomIndex = Math.floor(Math.random() * this.colors.length);
    return this.colors[randomIndex];
};

// Game State Management: Controls the overall game flow - starting a new game, ending the game (e.g., on a wrong answer), handling score updates.
SimonGame.prototype.startGame = function() {
    if (this.gameActive) {
        return;
    }

    this.gameActive = true;
    this.sequence = [];
    this.playerSequence = [];
    this.score = 0;

    this.domElements.scoreDisplay.textContent = this.score;
    this.domElements.startButton.textContent = 'Playing...';
    this.domElements.startButton.disabled = true;
    this.domElements.gameMessage.textContent = 'Get Ready!';

    var self = this;
    setTimeout(function() {
        self.playSequence();
        self.domElements.startButton.disabled = false;
    }, 1500);
};

SimonGame.prototype.endGame = function() {
    this.sounds.wrong.play();
    this.gameActive = false;
    this.domElements.startButton.textContent = 'Start';
    this.saveHighScore();
    this.domElements.gameMessage.textContent = 'Game Over! Score: ' + this.score;
};

// DOM Ready Initialization: the dom is fully loadedand ready
document.addEventListener('DOMContentLoaded', function() {
    window.simonGame = new SimonGame();
});
