// script.js

// Import the precomputed data
import { validGrids, allActors, intersections } from './data.js';

// Variables to hold game data
let topShows = [];
let rightShows = [];
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
    document.getElementById('perfect-grid-container').style.display = 'none'; // Hide perfect grid initially

    // Select a random valid grid from precomputed grids
    const randomIndex = Math.floor(Math.random() * validGrids.length);
    currentGrid = validGrids[randomIndex];
    topShows = currentGrid.topShows;
    rightShows = currentGrid.leftShows; // Treat left shows as right headers

    // Create the game and perfect grids using this setup
    createGameGrid(currentGrid.gridSetup);
    createPerfectGrid(currentGrid.gridSetup);
}

function createGameGrid(gridSetup) {
    const gameContainer = document.getElementById('game-container');
    const grid = document.createElement('div');
    grid.className = 'grid';

    // Create the grid layout according to specified cells
    for (let i = 0; i < 3; i++) { // Rows
        for (let j = 0; j < 3; j++) { // Columns
            const cell = document.createElement('div');
            cell.className = 'cell';

            if ((i === 0 && j === 0) || (i === 0 && j === 1)) {
                // Top row headers for TV Shows at 0,0 and 0,1
                cell.classList.add('header-cell');
                cell.textContent = topShows[j];
            } else if ((i === 1 && j === 2) || (i === 2 && j === 2)) {
                // Right column headers for TV Shows at 1,2 and 2,2
                cell.classList.add('header-cell');
                cell.textContent = rightShows[i - 1];
            } else {
                // Playable cells in the 2x2 area: 1,0; 1,1; 2,0; 2,1
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

function createPerfectGrid(gridSetup) {
    const perfectContainer = document.getElementById('perfect-grid-container');
    const grid = document.createElement('div');
    grid.className = 'grid';

    // Create the grid layout for the solution
    for (let i = 0; i < 3; i++) { // Rows
        for (let j = 0; j < 3; j++) { // Columns
            const cell = document.createElement('div');
            cell.className = 'cell';

            if ((i === 0 && j === 0) || (i === 0 && j === 1)) {
                // Top row headers for TV Shows at 0,0 and 0,1
                cell.classList.add('header-cell');
                cell.textContent = topShows[j];
            } else if ((i === 1 && j === 2) || (i === 2 && j === 2)) {
                // Right column headers for TV Shows at 1,2 and 2,2
                cell.classList.add('header-cell');
                cell.textContent = rightShows[i - 1];
            } else {
                // Display possible answers for each intersection in the 2x2 area
                const gridCell = gridSetup[(i - 1) * 2 + j];
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
    const rightShow = cell.dataset.left;
    const key = `${topShow}-${rightShow}`;

    // Create an input field for user interaction
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'actor-input';
    input.placeholder = 'Enter Actor Name';
    cell.innerHTML = '';
    cell.appendChild(input);
    input.focus();

    // Handle autocomplete and suggestions for all actors
    input.addEventListener('input', () => {
        showSuggestions(input);
    });

    // Handle answer submission
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            if (input.value.trim().toLowerCase() === "showans") {
                document.getElementById('perfect-grid-container').style.display = 'block'; // Show perfect grid
            } else {
                submitAnswer(input, cell);
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

function showSuggestions(input) {
    const suggestionsDiv = document.getElementById('suggestions');
    suggestionsDiv.innerHTML = '';
    const query = input.value.trim();

    if (query.length === 0) {
        suggestionsDiv.style.display = 'none';
        return;
    }

    const matchingActors = allActors.filter(actor => actor.includes(query));
    matchingActors.forEach(actor => {
        const div = document.createElement('div');
        div.textContent = actor;
        div.className = 'suggestion-item';
        div.addEventListener('click', () => {
            input.value = actor;
            suggestionsDiv.style.display = 'none';
            submitAnswer(input, input.parentElement); // Automatically submit
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

function submitAnswer(input, cell) {
    const answer = input.value.trim();
    const topShow = cell.dataset.top;
    const rightShow = cell.dataset.left;
    const key = `${topShow}-${rightShow}`;
    const validActors = intersections[key];

    if (validActors.includes(answer)) {
        cell.classList.remove('incorrect');
        cell.classList.add('correct');
        cell.textContent = answer;
        solvedCells++;
        checkGameCompletion();
    } else {
        cell.classList.add('incorrect');
        cell.classList.remove('correct');
    }
}

function checkGameCompletion() {
    if (solvedCells === 4) { // 2x2 grid means 4 correct answers
        alert('Congratulations! You have completed the game!');
    }
}
