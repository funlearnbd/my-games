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

// -----------------------------
// Game Mode Handlers
// -----------------------------
let currentMode = 0;
const modes = ["find", "different", "missing"];

function loadGame() {
  const mode = modes[currentMode % modes.length];
  if (mode === "find") loadFindGame();
  else if (mode === "different") loadDifferentGame();
  else if (mode === "missing") loadMissingGame();
}

// -----------------------------
// Mode: Find the Item
// -----------------------------
function loadFindGame() {
  const area = document.getElementById("game-area");
  const instruction = document.getElementById("instruction");
  document.getElementById("missing-slot").style.display = "none";

  const correct = items[Math.floor(Math.random() * items.length)];
  instruction.textContent = `Find the ${correct.name}!`;

  const options = shuffle([correct, ...pickRandom(items, 5)]);
  area.innerHTML = "";
  options.forEach(opt => {
    const img = document.createElement("img");
    img.src = opt.img;
    img.alt = opt.name;
    img.onclick = () => {
      if (opt.name === correct.name) alert("✅ Correct!");
      else alert("❌ Try again!");
    };
    area.appendChild(img);
  });
}

// -----------------------------
// Mode: Find the Different Item
// -----------------------------
function loadDifferentGame() {
  const area = document.getElementById("game-area");
  const instruction = document.getElementById("instruction");
  document.getElementById("missing-slot").style.display = "none";

  const same = items[Math.floor(Math.random() * items.length)];
  let different;
  do { different = items[Math.floor(Math.random() * items.length)]; }
  while (different.name === same.name);

  instruction.textContent = "Find the different item!";

  const options = Array(5).fill(same).concat([different]);
  const shuffled = shuffle(options);
  area.innerHTML = "";
  shuffled.forEach(opt => {
    const img = document.createElement("img");
    img.src = opt.img;
    img.alt = opt.name;
    img.onclick = () => {
      if (opt.name === different.name) alert("✅ Correct!");
      else alert("❌ Wrong, try again!");
    };
    area.appendChild(img);
  });
}

// -----------------------------
// Mode: Find the Missing Piece
// -----------------------------
function loadMissingGame() {
  const area = document.getElementById("game-area");
  const instruction = document.getElementById("instruction");
  const slot = document.getElementById("missing-slot");
  slot.style.display = "flex";
  slot.innerHTML = "?";

  const correct = items[Math.floor(Math.random() * items.length)];
  instruction.textContent = "Find the missing piece!";

  const options = shuffle([correct, ...pickRandom(items, 3)]);
  area.innerHTML = "";
  options.forEach(opt => {
    const img = document.createElement("img");
    img.src = opt.img;
    img.alt = opt.name;
    img.onclick = () => {
      if (opt.name === correct.name) {
        slot.innerHTML = `<img src="${opt.img}" alt="${opt.name}" style="width:100%; height:100%;">`;
        alert("✅ Correct!");
      } else alert("❌ Try again!");
    };
    area.appendChild(img);
  });
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
document.getElementById("next-btn").addEventListener("click", () => {
  currentMode++;
  loadGame();
});

loadGame();
