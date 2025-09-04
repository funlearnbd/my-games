// ---------- ITEMS & IMAGES ----------
const items = [
  { name:"Apple", src:"image/apple.png" },
  { name:"Banana", src:"image/banana.png" },
  { name:"Cherry", src:"image/cherry.png" },
  { name:"Dog", src:"image/dog.png" },
  { name:"Cat", src:"image/cat.png" },
  { name:"Flower", src:"image/Flower.png" },
  { name:"Happy Face", emoji:"😀" },
  { name:"Sad Face", emoji:"😢" },
  { name:"Laughing Face", emoji:"😂" },
  { name:"Angry Face", emoji:"😡" },
  { name:"Winking Face", emoji:"😉" },
  { name:"Celebrating Face", emoji:"🥳" }
  // Add more items as needed (40+ recommended)
];

// Optional sounds for items
const itemSounds = {
  "Apple":"sounds/apple.mp3",
  "Banana":"sounds/banana.mp3",
  "Dog":"sounds/dog.mp3",
  "Cat":"sounds/cat.mp3",
  "Flower":"sounds/flower.mp3"
};

// ---------- GAME STATE ----------
let currentModeIndex = 0, currentRound = 0;
const modes = ["findItem","findFace","different","missing"];
const laps = 100;

const clueDiv = document.getElementById('clue');
const gridDiv = document.getElementById('grid');
const messageDiv = document.getElementById('message');
const newBtn = document.getElementById('newBtn');
const exitBtn = document.getElementById('exitBtn');
newBtn.onclick = startGame;
exitBtn.onclick = () => window.location.href = "index.html";

// ---------- UTILS ----------
function shuffle(arr){for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}return arr;}
function speak(text){if(window.speechSynthesis){const u=new SpeechSynthesisUtterance(text);u.lang='en-US';window.speechSynthesis.speak(u);}}

// ---------- GAME FUNCTIONS ----------
function startGame(){
  currentModeIndex = 0;
  currentRound = 0;
  nextRound();
}

function nextRound(){
  if(currentRound >= laps){
    clueDiv.textContent="🎉 You completed all rounds!";
    gridDiv.innerHTML = "";
    messageDiv.textContent = "";
    return;
  }
  const mode = modes[currentModeIndex];
  currentModeIndex = (currentModeIndex + 1) % modes.length;
  currentRound++;
  messageDiv.textContent="";
  
  if(mode==="findItem") gameFindItem();
  else if(mode==="findFace") gameFindFace();
  else if(mode==="different") gameDifferent();
  else if(mode==="missing") gameMissing();
}

// ---------- GAME MODES ----------
function gameFindItem(){
  const pool = items.filter(i=>i.src||i.emoji);
  const correct = pool[Math.floor(Math.random()*pool.length)];
  let options = shuffle(pool).slice(0,5);
  if(!options.includes(correct)) options[0] = correct;
  renderGrid(options, correct, "Find the "+correct.name);
}

function gameFindFace(){
  const faces = items.filter(i=>i.emoji);
  const correct = faces[Math.floor(Math.random()*faces.length)];
  renderGrid(faces, correct, "Find the "+correct.name);
}

function gameDifferent(){
  // Pick one item to repeat 5 times
  const repeatItem = items.filter(i=>i.src).sort(()=>0.5-Math.random())[0];
  const diffItem = items.filter(i=>i.src && i!==repeatItem).sort(()=>0.5-Math.random())[0];
  
  const options = [];
  for(let i=0;i<5;i++) options.push(repeatItem);
  options.push(diffItem);
  shuffle(options);
  
  renderGrid(options, diffItem, "Find the different item");
}

function gameMissing(){
  // Pick 4 items for puzzle
  const pool = shuffle(items.filter(i=>i.src)).slice(0,4);
  const missing = pool[Math.floor(Math.random()*pool.length)];
  const puzzleDisplay = pool.filter(i=>i!==missing); // show puzzle without missing

  // Options = include missing item so kid can select it
  const options = shuffle([...puzzleDisplay, missing]);

  renderGrid(options, missing, "Find the missing piece", true, puzzleDisplay);
}

// ---------- RENDER GRID ----------
function renderGrid(options, correct, clueText, missing=false, puzzleDisplay=null){
  clueDiv.textContent = clueText;
  gridDiv.innerHTML = "";

  // If missing piece mode, render puzzle with blank
  if(missing && puzzleDisplay){
    const puzzleContainer = document.createElement("div");
    puzzleContainer.style.display = "flex";
    puzzleContainer.style.gap = "10px";
    puzzleDisplay.forEach(opt=>{
      const el = document.createElement(opt.src?"img":"div");
      if(opt.src){ el.src = opt.src; el.style.objectFit="cover"; }
      else el.textContent = opt.emoji;
      el.style.width="120px";
      el.style.height="120px";
      el.style.borderRadius="15px";
      puzzleContainer.appendChild(el);
    });

    // Add blank for missing
    const blank = document.createElement("div");
    blank.style.width="120px";
    blank.style.height="120px";
    blank.style.border="2px dashed #555";
    blank.style.borderRadius="15px";
    puzzleContainer.appendChild(blank);

    gridDiv.appendChild(puzzleContainer);
  }

  // Render options for selection
  const optionsContainer = document.createElement("div");
  optionsContainer.style.display = "flex";
  optionsContainer.style.flexWrap = "wrap";
  optionsContainer.style.gap = "15px";
  optionsContainer.style.marginTop = "15px";

  options.forEach(opt=>{
    let el;
    if(opt.src){
      el = document.createElement("img");
      el.src = opt.src;
      el.style.width="120px";
      el.style.height="120px";
      el.style.objectFit="cover";
      el.style.borderRadius="15px";
    } else if(opt.emoji){
      el = document.createElement("div");
      el.textContent = opt.emoji;
      el.style.fontSize="80px";
      el.style.display="flex";
      el.style.alignItems="center";
      el.style.justifyContent="center";
      el.style.width="120px";
      el.style.height="120px";
      el.style.border="2px solid #ccc";
      el.style.borderRadius="15px";
      el.style.background="#f9f9f9";
    }
    el.style.cursor="pointer";
    el.onclick = ()=>{
      if(opt===correct){
        messageDiv.textContent="✅ Correct!";
        if(itemSounds[correct.name]) new Audio(itemSounds[correct.name]).play();
        speak("Great job!");
        if(missing && correct.src){
          gridDiv.innerHTML = `<img src="${correct.src}" style="width:120px;height:120px;border-radius:15px;">`;
        }
        setTimeout(nextRound,1200);
      } else {
        messageDiv.textContent="❌ Try again!";
        speak("Try again!");
      }
    };
    optionsContainer.appendChild(el);
  });
  gridDiv.appendChild(optionsContainer);
}

// ---------- START ----------
startGame();
