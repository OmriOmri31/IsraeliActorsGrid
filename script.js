// Import the precomputed data
import { validGrids, allActors, intersections } from './data.js';

let topShows = [];
let rightShows = [];
let currentGrid = {};
let solvedCells = 0;
let timerInterval;
let secondsElapsed = 0;

// Load audio files for feedback sounds
const correctSound = new Audio('./sounds/correct.mp3');
const incorrectSound = new Audio('./sounds/incorrect.mp3');
const winSound = new Audio('./sounds/yay.mp3');

// Get DOM elements for later use
const victoryOverlay = document.getElementById('victory-overlay');
const finalTimeSpan = document.getElementById('final-time');
const playAgainButton = document.getElementById('play-again-button');

// Event listener for the "התחל" button to start the game and timer
document.getElementById('start-button').addEventListener('click', () => {
    document.getElementById('instruction-overlay').style.display = 'none';
    startTimer();
    loadPrecomputedGrid();
});

// Event listener for the "צור רשת חדשה" button to generate a new grid and reset the timer
document.getElementById('generate-grid').addEventListener('click', () => {
    stopTimer();          // Stop any ongoing timer
    resetTimerDisplay();   // Reset the timer display to 00:00
    loadPrecomputedGrid(); // Generate a new grid
    startTimer();          // Start a new timer
});

// Event listener for the "שחק שוב" button in the victory overlay
playAgainButton.addEventListener('click', () => {
    victoryOverlay.style.display = 'none';
    stopTimer();
    resetTimerDisplay();
    loadPrecomputedGrid();
    startTimer();
});

// Function to start the game timer
function startTimer() {
    secondsElapsed = 0;
    document.getElementById('timer').textContent = formatTime(secondsElapsed);

    timerInterval = setInterval(() => {
        secondsElapsed++;
        document.getElementById('timer').textContent = formatTime(secondsElapsed);
    }, 1000);
}

// Function to stop the game timer
function stopTimer() {
    clearInterval(timerInterval);
}

// Function to reset the timer display
function resetTimerDisplay() {
    secondsElapsed = 0;
    document.getElementById('timer').textContent = "00:00";
}

// Function to format the time in mm:ss format
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const remainingSeconds = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainingSeconds}`;
}

// Function to load a new random valid grid
function loadPrecomputedGrid() {
    solvedCells = 0;
    document.getElementById('game-container').innerHTML = '';
    document.getElementById('perfect-grid-container').style.display = 'none';

    const randomIndex = Math.floor(Math.random() * validGrids.length);
    currentGrid = validGrids[randomIndex];
    topShows = currentGrid.topShows;
    rightShows = currentGrid.leftShows;

    createGameGrid(currentGrid.gridSetup);
    createPerfectGrid(currentGrid.gridSetup);
}

// Function to create the game grid dynamically
function createGameGrid(gridSetup) {
    const gameContainer = document.getElementById('game-container');
    const grid = document.createElement('div');
    grid.className = 'grid';

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';

            // Top show headers
            if ((i === 0 && j === 0) || (i === 0 && j === 1)) {
                cell.classList.add('header-cell');
                cell.textContent = topShows[j];
            }
            // Left show headers
            else if ((i === 1 && j === 2) || (i === 2 && j === 2)) {
                cell.classList.add('header-cell');
                cell.textContent = rightShows[i - 1];
            }
            // Interactive cells
            else {
                const gridCell = gridSetup[(i - 1) * 2 + j];
                cell.dataset.top = gridCell.top;
                cell.dataset.left = gridCell.left;
                cell.addEventListener('click', handleCellClick);
            }

            grid.appendChild(cell);
        }
    }

    gameContainer.appendChild(grid);
}

// Function to create the perfect grid (answers) for reference
function createPerfectGrid(gridSetup) {
    const perfectContainer = document.getElementById('perfect-grid-container');
    perfectContainer.innerHTML = ''; // Clear previous content
    const grid = document.createElement('div');
    grid.className = 'grid';

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';

            // Top show headers
            if ((i === 0 && j === 0) || (i === 0 && j === 1)) {
                cell.classList.add('header-cell');
                cell.textContent = topShows[j];
            }
            // Left show headers
            else if ((i === 1 && j === 2) || (i === 2 && j === 2)) {
                cell.classList.add('header-cell');
                cell.textContent = rightShows[i - 1];
            }
            // Answer cells
            else {
                const gridCell = gridSetup[(i - 1) * 2 + j];
                cell.textContent = gridCell.actors.join(', ');
            }

            grid.appendChild(cell);
        }
    }

    perfectContainer.appendChild(grid);
}

// Function to handle clicks on interactive cells
function handleCellClick(event) {
    const cell = event.currentTarget;
    if (cell.classList.contains('correct')) return; // Ignore if already correct

    const topShow = cell.dataset.top;
    const leftShow = cell.dataset.left;

    // Create input field for the user to enter the actor's name
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'actor-input';
    input.placeholder = 'Enter Actor Name';

    cell.innerHTML = '';
    cell.appendChild(input);
    input.focus();

    // Event listener for input changes to show suggestions
    input.addEventListener('input', () => {
        showSuggestions(input);
    });

    // Event listener for pressing Enter key
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            if (input.value.trim().toLowerCase() === "showans") {
                document.getElementById('perfect-grid-container').style.display = 'block';
            } else {
                submitAnswer(input, cell);
            }
        }
    });

    // Close input when clicking outside the cell
    document.addEventListener('click', (e) => {
        if (!cell.contains(e.target)) {
            cell.innerHTML = '';
            document.getElementById('suggestions').style.display = 'none';
        }
    }, { once: true });
}

// Function to show autocomplete suggestions
function showSuggestions(input) {
    const suggestionsDiv = document.getElementById('suggestions');
    suggestionsDiv.innerHTML = '';
    const query = input.value.trim().toLowerCase();

    if (query.length === 0) {
        suggestionsDiv.style.display = 'none';
        return;
    }

    // Filter actors that contain the query substring (case-insensitive)
    const matchingActors = allActors.filter(actor => actor.toLowerCase().includes(query));

    matchingActors.forEach(actor => {
        const div = document.createElement('div');
        div.textContent = actor;
        div.className = 'suggestion-item';
        div.addEventListener('click', () => {
            input.value = actor;
            suggestionsDiv.style.display = 'none';
            submitAnswer(input, input.parentElement);
        });
        suggestionsDiv.appendChild(div);
    });

    if (matchingActors.length > 0) {
        // Position the suggestions div below the input field
        const rect = input.getBoundingClientRect();
        suggestionsDiv.style.left = `${rect.left + window.scrollX}px`;
        suggestionsDiv.style.top = `${rect.bottom + window.scrollY}px`;
        suggestionsDiv.style.display = 'block';
    } else {
        suggestionsDiv.style.display = 'none';
    }
}

// Function to handle the submission of an answer
function submitAnswer(input, cell) {
    const suggestionsDiv = document.getElementById('suggestions');
    const answer = input.value.trim();
    const topShow = cell.dataset.top;
    const leftShow = cell.dataset.left;
    const key = `${topShow}-${leftShow}`;
    const validActors = intersections[key];

    suggestionsDiv.style.display = 'none';

    if (validActors.includes(answer)) {
        cell.classList.remove('incorrect');
        cell.classList.add('correct');
        cell.innerHTML = '';
        cell.textContent = answer;
        correctSound.play();
        solvedCells++;
        checkGameCompletion();
    } else {
        cell.classList.add('incorrect');
        cell.classList.remove('correct');
        cell.innerHTML = '';
        cell.textContent = answer;
        incorrectSound.play();
    }
}

// Function to check if the game is completed
function checkGameCompletion() {
    if (solvedCells === 4) {
        winSound.play();
        stopTimer();
        showVictoryOverlay();
    }
}

// Function to display the victory overlay
function showVictoryOverlay() {
    finalTimeSpan.textContent = formatTime(secondsElapsed);
    victoryOverlay.style.display = 'flex';
}
