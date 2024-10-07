let currentPlayer = 'X';
let gameOver = false; // Track game state
const music = document.getElementById('backgroundMusic');
music.volume = 0.2; // Set initial volume to 20%

let playerWins = 0;
let aiWins = 0;
let isSoloMode = false; // Track if the game is in solo mode
let totalGames = 0; // Track total games played

function createBoard() {
    const board = document.getElementById('gameBoard');
    board.innerHTML = ''; // Clear the board
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.addEventListener('click', () => handleCellClick(cell, i));
        board.appendChild(cell);
    }
}

function handleCellClick(cell, index) {
    if (gameOver || cell.innerText) return; // Disable clicking if game is over or cell is filled

    cell.innerText = currentPlayer;
    if (checkWin(currentPlayer)) {
        playerWins++;
        totalGames++;
        endGame(`${currentPlayer} wins!`);
        return;
    }
    if (isBoardFull()) {
        totalGames++;
        endGame("It's a draw!");
        return;
    }

    // If in solo mode, switch to AI's turn
    if (isSoloMode) {
        currentPlayer = 'O';
        setTimeout(aiMove, 500); // Allow a brief pause before AI's move
    } else {
        // Switch to the other player in duo mode
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    }
}

function aiMove() {
    if (gameOver) return; // Ensure game is not over

    const cells = document.querySelectorAll('.cell');
    const difficultyLevel = adjustAIDifficulty(); // Adjust AI's difficulty

    // AI tries to win
    for (let i = 0; i < 9; i++) {
        if (!cells[i].innerText) {
            cells[i].innerText = currentPlayer;
            if (checkWin(currentPlayer)) {
                aiWins++;
                totalGames++;
                endGame(`${currentPlayer} wins!`);
                return; // End game if AI wins
            }
            cells[i].innerText = ''; // Undo the move
        }
    }

    // AI tries to block the player
    currentPlayer = 'X'; // Switch to player to check their win
    for (let i = 0; i < 9; i++) {
        if (!cells[i].innerText) {
            cells[i].innerText = currentPlayer;
            if (checkWin(currentPlayer)) {
                cells[i].innerText = 'O'; // Block player
                currentPlayer = 'X'; // Switch back to player
                return; // End the move after blocking
            }
            cells[i].innerText = ''; // Undo the move
        }
    }

    // Make a random move with adjusted difficulty
    currentPlayer = 'O'; // Switch back to AI
    let availableCells = Array.from(cells).filter(cell => !cell.innerText);
    if (availableCells.length > 0) {
        if (Math.random() < difficultyLevel) {
            const randomCell = availableCells[Math.floor(Math.random() * availableCells.length)];
            randomCell.innerText = currentPlayer;

            if (checkWin(currentPlayer)) {
                aiWins++;
                totalGames++;
                endGame(`${currentPlayer} wins!`);
                return;
            }
            if (isBoardFull()) {
                totalGames++;
                endGame("It's a draw!");
                return;
            }
        } else {
            // If AI is "feeling generous," make a less optimal move
            const lessOptimalCell = availableCells[Math.floor(Math.random() * availableCells.length)];
            lessOptimalCell.innerText = currentPlayer;
        }
    }

    // Switch back to the player for the next turn
    currentPlayer = 'X';
}

function adjustAIDifficulty() {
    if (totalGames === 0) return 0.5; // Default difficulty

    const winRate = playerWins / totalGames;
    // Adjust difficulty based on win rate
    return winRate < 0.5 ? 0.4 : 0.7; // Change AI competitiveness based on player performance
}

function endGame(message) {
    document.getElementById('gameBoard').classList.add('hidden'); // Hide the game board
    const winnerMessage = document.getElementById('winnerMessage');
    winnerMessage.innerText = message;
    winnerMessage.style.display = 'block'; // Show the winner message
    document.getElementById('restartBtn').classList.remove('hidden'); // Show restart button
    gameOver = true; // Set gameOver to true
}

function checkWin(player) {
    const cells = document.querySelectorAll('.cell');
    const winPatterns = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    return winPatterns.some(pattern => 
        pattern.every(index => cells[index].innerText === player)
    );
}

function isBoardFull() {
    const cells = document.querySelectorAll('.cell');
    return [...cells].every(cell => cell.innerText);
}

function restartGame() {
    currentPlayer = 'X';
    gameOver = false; // Reset gameOver flag
    document.getElementById('winnerMessage').style.display = 'none'; // Hide winner message
    document.getElementById('restartBtn').classList.add('hidden'); // Hide restart button
    createBoard();
    document.getElementById('gameBoard').classList.remove('hidden'); // Show the game board
}

// Add event listeners for buttons
document.getElementById('soloBtn').addEventListener('click', () => {
    isSoloMode = true; // Set solo mode
    startGame();
});
document.getElementById('duoBtn').addEventListener('click', () => {
    isSoloMode = false; // Set duo mode
    startGame();
});
document.getElementById('restartBtn').addEventListener('click', restartGame);

function startGame() {
    document.getElementById('gameMode').classList.add('hidden');
    document.getElementById('soloBtn').classList.add('hidden');
    document.getElementById('duoBtn').classList.add('hidden');
    document.getElementById('gameBoard').classList.remove('hidden');
    document.getElementById('message').classList.add('hidden'); // Hide the welcome message
    createBoard();

    // Attempt to play the background music
    music.play().catch(error => {
        console.log('Audio playback failed:', error);
    });
}
