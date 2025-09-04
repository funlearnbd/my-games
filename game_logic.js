// ---------- ITEMS & IMAGES ----------
const items = [
  { name:"Apple", src:"image/apple.png" },
  { name:"Banana", src:"image/banana.png" },
  { name:"Cherry", src:"image/cherry.png" },
  { name:"Dog", src:"image/dog.png" },
  { name:"Cat", src:"image/cat.png" },
  { name:"Flower", src:"image/flower.png" },
  { name:"Happy Face", emoji:"😀" },
  { name:"Sad Face", emoji:"😢" },
  { name:"Laughing Face", emoji:"😂" },
  { name:"Angry Face", emoji:"😡" },
  { name:"Winking Face", emoji:"😉" },
  { name:"Celebrating Face", emoji:"🥳" }
  // Add more items as needed, total 40+ recommended
];

// Optional sounds for items (make sure to place mp3 files in a 'sounds' folder)
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
  const pool = shuffle(items.filter(i=>i.src)).slice(0,6);
  const same = pool.slice(0,5);
  const diff = pool[5];
  let options = shuffle([...same, diff]);
  renderGrid(options, diff, "Find the different item");
}

function gameMissing(){
  const pool = shuffle(items.filter(i=>i.src)).slice(0,4);
  const missing = pool.pop();
  renderGrid(pool, missing, "Find the missing piece", true);
}

// ---------- RENDER GRID ----------
function renderGrid(options, correct, clueText, missing=false){
  clueDiv.textContent = clueText;
  gridDiv.innerHTML = "";
  
  options.forEach(opt=>{
    let el;
    if(opt.src){
      // IMAGE ITEM
      el = document.createElement("img");
      el.src = opt.src;
      el.style.width="120px";
      el.style.height="120px";
      el.style.objectFit="cover";
    } else if(opt.emoji){
      // EMOJI ITEM
      el = document.createElement("div");
      el.textContent = opt.emoji;
      el.style.fontSize = "80px";
      el.style.textAlign = "center";
      el.style.width = "120px";
      el.style.height = "120px";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.border = "2px solid #ccc";
      el.style.borderRadius = "15px";
      el.style.cursor = "pointer";
      el.style.background = "#f9f9f9";
    }

    el.alt = opt.name || opt.emoji;
    el.style.cursor = "pointer";
    el.onclick = ()=>{
      if(opt === correct){
        messageDiv.textContent="✅ Correct!";
        if(itemSounds[correct.name]){ new Audio(itemSounds[correct.name]).play(); }
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
    gridDiv.appendChild(el);
  });
}

// ---------- START ----------
startGame();
