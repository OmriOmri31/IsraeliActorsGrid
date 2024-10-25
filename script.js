// script.js

// Import the precomputed data
import { validGrids, intersections } from './data.js';

// Variables to hold game data
let topShows = [];
let leftShows = [];
let currentGrid = {};
let solvedCells = 0;

// Generate a new grid when the page loads
window.onload = () => {
    loadPrecomputedGrid();
};

// Event listener for the "Generate New Grid" button
document.getElementById('generate-grid').addEventListener('click', loadPrecomputedGrid);

function loadPrecomputedGrid() {
    // Reset variables
    solvedCells = 0;

    // Clear previous grids
    document.getElementById('game-container').innerHTML = '';
    document.getElementById('perfect-grid-container').innerHTML = '';

    // Select a random valid grid from precomputed grids
    const randomIndex = Math.floor(Math.random() * validGrids.length);
    currentGrid = validGrids[randomIndex];
    topShows = currentGrid.topShows;
    leftShows = currentGrid.leftShows;

    // Create the game and perfect grids using this setup
    createGameGrid(currentGrid.gridSetup);
    createPerfectGrid(currentGrid.gridSetup);
}

function createGameGrid(gridSetup) {
    const gameContainer = document.getElementById('game-container');
    const grid = document.createElement('div');
    grid.className = 'grid';

    // Create the grid layout
    for (let i = 0; i < 3; i++) { // Rows (3 includes header row)
        for (let j = 0; j < 3; j++) { // Columns (3 includes header column)
            const cell = document.createElement('div');
            cell.className = 'cell';

            if (i === 0 && j === 0) {
                // Top-left empty cell
                cell.classList.add('empty-cell');
            } else if (i === 0) {
                // Top row headers
                cell.classList.add('header-cell');
                cell.textContent = topShows[j - 1];
            } else if (j === 0) {
                // Left column headers
                cell.classList.add('header-cell');
                cell.textContent = leftShows[i - 1];
            } else {
                // Intersection cells for 2x2 grid
                const gridCell = gridSetup[(i - 1) * 2 + (j - 1)];
                cell.dataset.top = gridCell.top;
                cell.dataset.left = gridCell.left;
                cell.addEventListener('click', handleCellClick);
            }

            grid.appendChild(cell);
        }
    }

    gameContainer.appendChild(grid);
}

function createPerfectGrid(gridSetup) {
    const perfectContainer = document.getElementById('perfect-grid-container');
    const grid = document.createElement('div');
    grid.className = 'grid';

    // Create the grid layout for the solution
    for (let i = 0; i < 3; i++) { // Rows (3 includes header row)
        for (let j = 0; j < 3; j++) { // Columns (3 includes header column)
            const cell = document.createElement('div');
            cell.className = 'cell';

            if (i === 0 && j === 0) {
                cell.classList.add('empty-cell');
            } else if (i === 0) {
                // Top row headers
                cell.classList.add('header-cell');
                cell.textContent = topShows[j - 1];
            } else if (j === 0) {
                // Left column headers
                cell.classList.add('header-cell');
                cell.textContent = leftShows[i - 1];
            } else {
                // Show possible answers for each intersection
                const gridCell = gridSetup[(i - 1) * 2 + (j - 1)];
                cell.textContent = gridCell.actors.join(', ');
            }

            grid.appendChild(cell);
        }
    }

    perfectContainer.appendChild(grid);
}

function handleCellClick(event) {
    const cell = event.currentTarget;
    if (cell.classList.contains('correct')) return; // Prevent further input if already correct

    const topShow = cell.dataset.top;
    const leftShow = cell.dataset.left;
    const key = `${topShow}-${leftShow}`;
    const validActors = intersections[key];

    // Create an input field for user interaction
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'actor-input';
    input.placeholder = 'Enter Actor Name';
    cell.innerHTML = '';
    cell.appendChild(input);
    input.focus();

    // Handle autocomplete and suggestions
    input.addEventListener('input', () => {
        showSuggestions(input, validActors);
    });

    // Handle answer submission
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const answer = input.value.trim();
            if (validActors.includes(answer)) {
                // Correct answer
                cell.classList.remove('incorrect');
                cell.classList.add('correct');
                cell.textContent = answer;
                solvedCells++;
                checkGameCompletion();
            } else {
                // Incorrect answer
                cell.classList.add('incorrect');
            }
        }
    });

    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!cell.contains(e.target)) {
            cell.innerHTML = '';
        }
    }, { once: true });
}

function showSuggestions(input, validActors) {
    const suggestionsDiv = document.getElementById('suggestions');
    suggestionsDiv.innerHTML = '';
    const query = input.value.trim();

    if (query.length === 0) {
        suggestionsDiv.style.display = 'none';
        return;
    }

    const matchingActors = validActors.filter(actor => actor.includes(query));
    matchingActors.forEach(actor => {
        const div = document.createElement('div');
        div.textContent = actor;
        div.className = 'suggestion-item';
        div.addEventListener('click', () => {
            input.value = actor;
            suggestionsDiv.style.display = 'none';
            input.focus();
        });
        suggestionsDiv.appendChild(div);
    });

    if (matchingActors.length > 0) {
        const rect = input.getBoundingClientRect();
        suggestionsDiv.style.left = `${rect.left}px`;
        suggestionsDiv.style.top = `${rect.bottom + window.scrollY}px`;
        suggestionsDiv.style.display = 'block';
    } else {
        suggestionsDiv.style.display = 'none';
    }
}

function checkGameCompletion() {
    if (solvedCells === 4) { // 2x2 grid means 4 correct answers
        alert('Congratulations! You have completed the game!');
    }
}
