// ---------- ITEMS & IMAGES ----------
const items = [
{ name: "Apple", src: "image/apple.png" },
  { name: "Banana", src: "image/banana.png" },
  { name: "Dog", src: "image/dog.png" },
  { name: "Cat", src: "image/cat.png" },
  { name: "Flower", src: "image/flower.png" },
{ name:"Happy Face", emoji:"😀" },
{ name:"Sad Face", emoji:"😢" },
{ name:"Laughing Face", emoji:"😂" },
{ name:"Angry Face", emoji:"😡" },
{ name:"Winking Face", emoji:"😉" },
{ name:"Celebrating Face", emoji:"🥳" }
// Add more items as needed up to 20+
];

const itemSounds = {
"Apple":"data:audio/mp3;base64,//uQxAA...",
"Banana":"data:audio/mp3;base64,//uQxAA...",
"Dog":"data:audio/mp3;base64,//uQxAA..."
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
newBtn.onclick=startGame;
exitBtn.onclick=()=>window.location.href="index.html";

// ---------- UTILS ----------
function shuffle(arr){for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}return arr;}
function speak(text){if(window.speechSynthesis){const u=new SpeechSynthesisUtterance(text);u.lang='en-US';window.speechSynthesis.speak(u);}}

// ---------- GAME FUNCTIONS ----------
function startGame(){currentModeIndex=0; currentRound=0; nextRound();}
function nextRound(){
    if(currentRound>=laps){clueDiv.textContent="🎉 You completed all rounds!"; gridDiv.innerHTML=""; messageDiv.textContent=""; return;}
    const mode=modes[currentModeIndex];
    currentModeIndex=(currentModeIndex+1)%modes.length;
    currentRound++;
    messageDiv.textContent="";
    if(mode==="findItem") gameFindItem();
    else if(mode==="findFace") gameFindFace();
    else if(mode==="different") gameDifferent();
    else if(mode==="missing") gameMissing();
}

// ---------- GAME MODES ----------
function gameFindItem(){
    const pool=items.filter(i=>i.src||i.emoji);
    const correct=pool[Math.floor(Math.random()*pool.length)];
    let options=shuffle(pool).slice(0,5);
    if(!options.includes(correct)) options[0]=correct;
    renderGrid(options,correct,"Find the "+correct.name);
}

function gameFindFace(){
    const faces=items.filter(i=>i.emoji);
    const correct=faces[Math.floor(Math.random()*faces.length)];
    renderGrid(faces,correct,"Find the "+correct.name);
}

function gameDifferent(){
    const pool=shuffle(items.filter(i=>i.src));
    const same=pool.slice(0,5);
    const diff=pool[5];
    let options=shuffle([...same,diff]);
    renderGrid(options,diff,"Find the different item");
}

function gameMissing(){
    const pool=shuffle(items.filter(i=>i.src)).slice(0,4);
    const missing=pool.pop();
    renderGrid(pool,missing,"Find the missing piece",true);
}

// ---------- RENDER GRID ----------
function renderGrid(options,correct,clueText,missing=false){
    clueDiv.textContent=clueText;
    gridDiv.innerHTML="";
    options.forEach(opt=>{
        const img=document.createElement("img");
        if(opt.src) img.src=opt.src;
        else img.src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."; // fallback
        img.alt=opt.name||opt.emoji;
        img.onclick=()=>{
            if(opt===correct){
                messageDiv.textContent="✅ Correct!";
                if(itemSounds[correct.name]){new Audio(itemSounds[correct.name]).play();}
                speak("Great job!");
                if(missing) gridDiv.innerHTML=`<img src="${correct.src}" style="width:120px;height:120px;border-radius:15px;">`;
                setTimeout(nextRound,1200);
            } else {
                messageDiv.textContent="❌ Try again!";
                speak("Try again!");
            }
        };
        gridDiv.appendChild(img);
    });
}

// ---------- START ----------
startGame();
