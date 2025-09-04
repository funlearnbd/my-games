const items = [
    { name: "Apple", img: "image/apple.png" },
    { name: "Banana", img: "image/banana.png" },
    { name: "Car", img: "image/car.png" },
    { name: "Dog", img: "image/dog.png" },
    { name: "Cat", img: "image/cat.png" },
    { name: "Flower", img: "image/flower.png" },
    { name: "Ball", img: "image/ball.png" },
    { name: "Star", img: "image/star.png" },
    { name: "Tree", img: "image/tree.png" },
    { name: "Fish", img: "image/fish.png" }
];

// DOM Elements
const gameArea = document.getElementById("game-area");
const instruction = document.getElementById("instruction");
const missingSlot = document.getElementById("missing-slot");
const nextBtn = document.getElementById("next-btn");
const message = document.getElementById("message");
const scoreDisplay = document.getElementById("score");

// Game State
let currentMode = 0;
let score = 0;
const modes = ["find", "different", "missing"];
let isClickable = true;

// -----------------------------
// Game Logic
// -----------------------------

function loadGame() {
    isClickable = true;
    message.textContent = "";
    const mode = modes[currentMode % modes.length];
    if (mode === "find") loadFindGame();
    else if (mode === "different") loadDifferentGame();
    else if (mode === "missing") loadMissingGame();
}

// -----------------------------
// Mode: Find the Item
// -----------------------------
function loadFindGame() {
    missingSlot.style.display = "none";
    
    const correct = items[Math.floor(Math.random() * items.length)];
    instruction.textContent = `Find the ${correct.name}!`;

    const options = shuffle([correct, ...pickRandom(items, 5)]);
    renderOptions(options, correct.name);
}

// -----------------------------
// Mode: Find the Different Item
// -----------------------------
function loadDifferentGame() {
    missingSlot.style.display = "none";

    const same = items[Math.floor(Math.random() * items.length)];
    let different;
    do { 
        different = items[Math.floor(Math.random() * items.length)]; 
    } while (different.name === same.name);

    instruction.textContent = "Find the different item!";

    const options = Array(5).fill(same).concat([different]);
    const shuffled = shuffle(options);
    renderOptions(shuffled, different.name);
}

// -----------------------------
// Mode: Find the Missing Piece
// -----------------------------
function loadMissingGame() {
    missingSlot.style.display = "flex";
    missingSlot.innerHTML = "?";

    const correct = items[Math.floor(Math.random() * items.length)];
    instruction.textContent = "Find the missing piece!";

    const options = shuffle([correct, ...pickRandom(items, 3)]);
    renderOptions(options, correct.name, true);
}

// -----------------------------
// Rendering and Interaction
// -----------------------------
function renderOptions(options, correctName, isMissingMode = false) {
    gameArea.innerHTML = "";
    options.forEach(opt => {
        const img = document.createElement("img");
        img.src = opt.img;
        img.alt = opt.name;
        img.onclick = () => handleGuess(opt.name, correctName, img, isMissingMode);
        gameArea.appendChild(img);
    });
    nextBtn.style.display = 'none';
}

function handleGuess(guessedName, correctName, imgElement, isMissingMode) {
    if (!isClickable) return;

    if (guessedName === correctName) {
        message.textContent = "✅ Correct!";
        message.className = "message-text correct";
        imgElement.classList.add("correct");
        score++;
        scoreDisplay.textContent = score;
        isClickable = false;
        
        if (isMissingMode) {
            setTimeout(() => {
                missingSlot.innerHTML = `<img src="${imgElement.src}" alt="${imgElement.alt}" style="width:100%; height:100%;">`;
            }, 500); // Delay for animation
        }

        setTimeout(() => {
            currentMode++;
            loadGame();
        }, 1500); // Delay before next puzzle
    } else {
        message.textContent = "❌ Try again!";
        message.className = "message-text incorrect";
        imgElement.classList.add("incorrect");
        
        setTimeout(() => {
            imgElement.classList.remove("incorrect");
            message.textContent = "";
        }, 800);
    }
}

// -----------------------------
// Helpers
// -----------------------------
function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
}

function pickRandom(arr, count) {
    const copy = [...arr];
    const result = [];
    while (result.length < count && copy.length) {
        const idx = Math.floor(Math.random() * copy.length);
        result.push(copy.splice(idx, 1)[0]);
    }
    return result;
}

// -----------------------------
// Start Game
// -----------------------------
nextBtn.addEventListener("click", () => {
    currentMode++;
    loadGame();
});

loadGame();
