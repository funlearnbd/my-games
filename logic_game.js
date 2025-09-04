// ---------- ITEMS ----------
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
];

const itemSounds = {
  "Apple":"sounds/apple.mp3",
  "Banana":"sounds/banana.mp3",
  "Dog":"sounds/dog.mp3",
  "Cat":"sounds/cat.mp3",
  "Flower":"sounds/flower.mp3"
};

// ---------- GAME STATE ----------
let currentModeIndex = 0;
let currentRound = 0;
const modes = ["findItem","findFace","different","missing"];
const laps = 100;

const clueDiv = document.getElementById('clue');
const gridDiv = document.getElementById('grid');
const messageDiv = document.getElementById('message');
const newBtn = document.getElementById('newBtn');
const exitBtn = document.getElementById('exitBtn');
newBtn.onclick = startGame;
exitBtn.onclick = ()=>window.location.href="index.html";

// ---------- UTILS ----------
function shuffle(arr){for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}return arr;}
function speak(text){if(window.speechSynthesis){const u=new SpeechSynthesisUtterance(text);u.lang='en-US';window.speechSynthesis.speak(u);}}

// ---------- GAME ----------
function startGame(){currentModeIndex=0;currentRound=0;nextRound();}

function nextRound(){
  if(currentRound>=laps){clueDiv.textContent="🎉 You completed all rounds!"; gridDiv.innerHTML=""; messageDiv.textContent=""; return;}
  const mode = modes[currentModeIndex];
  currentModeIndex=(currentModeIndex+1)%modes.length;
  currentRound++;
  messageDiv.textContent="";
  if(mode==="findItem") gameFindItem();
  else if(mode==="findFace") gameFindFace();
  else if(mode==="different") gameDifferent();
  else if(mode==="missing") gameMissing();
}

// ---------- MODES ----------
function gameFindItem(){
  const pool = items.filter(i=>i.src||i.emoji);
  const correct = pool[Math.floor(Math.random()*pool.length)];
  let options = shuffle(pool).slice(0,5);
  if(!options.includes(correct)) options[0]=correct;
  renderGrid(options, correct,"Find the "+correct.name);
}

function gameFindFace(){
  const faces = items.filter(i=>i.emoji);
  const correct = faces[Math.floor(Math.random()*faces.length)];
  renderGrid(faces, correct,"Find the "+correct.name);
}

function gameDifferent(){
  const imgItems = items.filter(i=>i.src);
  const repeatItem = imgItems[Math.floor(Math.random()*imgItems.length)];
  const diffItem = imgItems.filter(i=>i!==repeatItem)[Math.floor(Math.random()*(imgItems.length-1))];
  const options=[...Array(5).fill(repeatItem), diffItem];
  shuffle(options);
  renderGrid(options,diffItem,"Find the different item");
}

function gameMissing(){
  const imgItems = items.filter(i=>i.src);
  const pool = shuffle(imgItems).slice(0,4);
  const missing = pool[Math.floor(Math.random()*pool.length)];
  const puzzleDisplay = pool.filter(i=>i!==missing); // show without missing
  const options = shuffle([...puzzleDisplay, missing]); // include missing in options
  renderGrid(options, missing,"Find the missing piece",true,puzzleDisplay);
}

// ---------- RENDER GRID ----------
function renderGrid(options, correct, clueText, missing=false, puzzleDisplay=null){
  clueDiv.textContent=clueText;
  gridDiv.innerHTML="";

  // Puzzle with blank for missing mode
  if(missing && puzzleDisplay){
    const puzzleContainer = document.createElement("div");
    puzzleContainer.style.display="flex";
    puzzleContainer.style.gap="10px";
    puzzleDisplay.forEach(opt=>{
      const el = document.createElement("img");
      el.src = opt.src;
      el.style.width="120px";
      el.style.height="120px";
      el.style.objectFit="cover";
      el.style.borderRadius="15px";
      puzzleContainer.appendChild(el);
    });
    const blank = document.createElement("div");
    blank.style.width="120px"; blank.style.height="120px"; blank.style.border="2px dashed #555"; blank.style.borderRadius="15px";
    puzzleContainer.appendChild(blank);
    gridDiv.appendChild(puzzleContainer);
  }

  // Options
  const optionsContainer = document.createElement("div");
optionsContainer.className = "options-container";

  options.forEach(opt=>{
    let el;
    if(opt.src){el=document.createElement("img");el.src=opt.src;el.style.width="120px";el.style.height="120px";el.style.objectFit="cover";el.style.borderRadius="15px";}
    else if(opt.emoji){el=document.createElement("div");el.textContent=opt.emoji;el.style.fontSize="80px";el.style.display="flex";el.style.alignItems="center";el.style.justifyContent="center";el.style.width="120px";el.style.height="120px";el.style.border="2px solid #ccc";el.style.borderRadius="15px";el.style.background="#f9f9f9";}
    el.style.cursor="pointer";
    el.onclick=()=>{
      if(opt===correct){
        messageDiv.textContent="✅ Correct!";
        if(itemSounds[correct.name]) new Audio(itemSounds[correct.name]).play();
        speak("Great job!");
        if(missing && correct.src){
          gridDiv.innerHTML=`<img src="${correct.src}" style="width:120px;height:120px;border-radius:15px;">`;
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
