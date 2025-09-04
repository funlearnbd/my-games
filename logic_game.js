/*
  logic_game.js
  Robust loader + game logic:
  - tries multiple image folders (images/, logic_images/, assets/images/, root)
  - supports emoji items (rendered as text)
  - fixed "missing piece" and "find different" logic
  - responsive options grid (not stacked vertically)
*/

const IMAGE_PATH_CANDIDATES = [
  "images/",
  "logic_images/",
  "assets/images/",
  "" // root
];

const SOUND_PATH_CANDIDATES = [
  "sounds/",
  "logic_sounds/",
  ""
];

/* --- Items: provide fileName for images (case-sensitive) or emoji for faces --- */
/* Update fileName to match the actual names you uploaded to your repo  */
const ITEMS = [
  { id:'apple', name:'Apple', fileName:'apple.png' },
  { id:'banana', name:'Banana', fileName:'banana.png' },
  { id:'cherry', name:'Cherry', fileName:'cherry.png' },
  { id:'grapes', name:'Grapes', fileName:'grapes.png' },
  { id:'orange', name:'Orange', fileName:'orange.png' },
  { id:'pineapple', name:'Pineapple', fileName:'pineapple.png' },
  { id:'strawberry', name:'Strawberry', fileName:'strawberry.png' },
  { id:'kiwi', name:'Kiwi', fileName:'kiwi.png' },
  { id:'dog', name:'Dog', fileName:'dog.png' },
  { id:'cat', name:'Cat', fileName:'cat.png' },
  { id:'rabbit', name:'Rabbit', fileName:'rabbit.png' },
  { id:'fish', name:'Fish', fileName:'fish.png' },
  { id:'car', name:'Car', fileName:'car.png' },
  { id:'ball', name:'Ball', fileName:'ball.png' },
  { id:'train', name:'Train', fileName:'train.png' },
  { id:'teddy', name:'Teddy', fileName:'teddy.png' },
  { id:'flower', name:'Flower', fileName:'flower.png' },
  { id:'sun', name:'Sun', fileName:'sun.png' },
  { id:'star', name:'Star', fileName:'star.png' },
  { id:'rainbow', name:'Rainbow', fileName:'rainbow.png' },

  // emojis (faces) — rendered as emoji text (not images)
  { id:'happy', name:'Happy Face', emoji:'😀' },
  { id:'sad', name:'Sad Face', emoji:'😢' },
  { id:'laugh', name:'Laughing Face', emoji:'😂' },
  { id:'angry', name:'Angry Face', emoji:'😡' },
  { id:'wink', name:'Winking Face', emoji:'😉' },
  { id:'party', name:'Celebrating Face', emoji:'🥳' }
];

/* Optional per-item sounds (place mp3 files into one of SOUND_PATH_CANDIDATES folders) */
const ITEM_SOUNDS = {
  "Dog": "dog_bark.mp3",
  "Cat": "cat_meow.mp3",
  "Apple": "apple_bite.mp3"
  // add as needed, use file names only; loader will try candidate folders
};

/* ----- STATE + DOM ----- */
const clueEl = document.getElementById('clue');
const gridEl = document.getElementById('grid');
const messageEl = document.getElementById('message');
const newBtn = document.getElementById('newBtn');
const exitBtn = document.getElementById('exitBtn');
const successAudio = document.getElementById('successAudio');
const failAudio = document.getElementById('failAudio');

let MODE_INDEX = 0;
let ROUND = 0;
const MODES = ["findItem","findFace","different","missing"];
const TOTAL_ROUNDS = 100;

let resolvedItems = []; // items with resolvedSrc or emoji
let assetFolders = { imageFolder: null, soundFolder: null };

/* ----- helpers ----- */
function shuffle(arr){ for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; } return arr; }
function speak(text){ try{ if(window.speechSynthesis){ const u=new SpeechSynthesisUtterance(text); u.lang='en-US'; u.rate=0.95; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);} } catch(e){} }
function tryPlaySoundFor(name){
  if(!assetFolders.soundFolder) return;
  const file = ITEM_SOUNDS[name];
  if(!file) return;
  const url = assetFolders.soundFolder + file;
  const a = new Audio(url);
  a.play().catch(()=>{ /* ignore play errors */ });
}

/* load a single url and return true if loads */
function loadImageUrl(url, timeoutMs=3000){
  return new Promise((resolve) => {
    const img = new Image();
    let done=false;
    const onSuccess = ()=>{ if(done) return; done=true; resolve(true); };
    const onFail = ()=>{ if(done) return; done=true; resolve(false); };
    const timer = setTimeout(() => { onFail(); }, timeoutMs);
    img.onload = () => { clearTimeout(timer); onSuccess(); };
    img.onerror = () => { clearTimeout(timer); onFail(); };
    img.src = url;
  });
}

/* Try to resolve image path for a fileName across candidate folders */
async function resolveImagePath(fileName){
  if(!fileName) return null;
  for(const base of IMAGE_PATH_CANDIDATES){
    const attempt = base + fileName;
    // console.log('trying', attempt);
    try{
      const ok = await loadImageUrl(attempt, 3000);
      if(ok) return {url:attempt,base};
    } catch(e){}
  }
  return null;
}

/* Try to resolve sound folder similarly */
async function resolveSoundFolder(){
  for(const base of SOUND_PATH_CANDIDATES){
    // try minimal check: attempt to load one known file name if any exist in ITEM_SOUNDS
    const keys = Object.keys(ITEM_SOUNDS);
    if(keys.length===0) return null;
    const testFile = ITEM_SOUNDS[keys[0]];
    const attempt = base + testFile;
    const ok = await loadImageUrl(attempt,2000);
    if(ok) return base;
  }
  return null;
}

/* Preload images: resolve each item's image URL or mark as emoji/fallback */
async function preloadAll(){
  clueEl.textContent = "Loading assets…";
  // attempt to find a working sound folder (optional)
  assetFolders.soundFolder = await resolveSoundFolder();

  const list = [];
  for(const it of ITEMS){
    const copy = Object.assign({}, it);
    copy.resolvedSrc = null;
    copy.isImage = false;
    if(copy.fileName){
      const res = await resolveImagePath(copy.fileName);
      if(res){
        copy.resolvedSrc = res.url;
        copy.isImage = true;
        assetFolders.imageFolder = res.base; // remember last-working base
      }
    }
    list.push(copy);
  }
  resolvedItems = list;
  // report number of resolved images:
  const imagesFound = resolvedItems.filter(i=>i.isImage).length;
  clueEl.textContent = `Assets ready — ${imagesFound} images found, ${resolvedItems.length - imagesFound} emoji/labels`;
}

/* ----- game logic ----- */
function startGame(){
  MODE_INDEX = 0;
  ROUND = 0;
  messageEl.textContent = "";
  nextRound();
}

function nextRound(){
  if(ROUND >= TOTAL_ROUNDS){
    clueEl.textContent = "🎉 All rounds completed! Great job!";
    gridEl.innerHTML = "";
    return;
  }
  const mode = MODES[MODE_INDEX];
  MODE_INDEX = (MODE_INDEX + 1) % MODES.length;
  ROUND++;
  messageEl.textContent = "";
  // small delay to help UI breathe
  setTimeout(()=>{
    if(mode === "findItem") runFindItem();
    else if(mode === "findFace") runFindFace();
    else if(mode === "different") runFindDifferent();
    else if(mode === "missing") runFindMissing();
  }, 120);
}

/* Utility to render option element (image / emoji / fallback) */
function createOptionElement(item){
  const el = document.createElement('div');
  el.className = 'option';
  if(item.isImage && item.resolvedSrc){
    const img = document.createElement('img');
    img.src = item.resolvedSrc;
    img.alt = item.name;
    img.onerror = () => { img.style.display = 'none'; showLabelFallback(); };
    el.appendChild(img);
  } else if(item.emoji){
    const em = document.createElement('div');
    em.className = 'emoji';
    em.textContent = item.emoji;
    el.appendChild(em);
  } else {
    // fallback text
    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = item.name;
    el.appendChild(label);
  }
  return el;
}

function showLabelFallback(){
  // fallback when image fails to show: nothing to do here — label fallback displays automatically
}

/* ----- Modes ----- */

/* Find item: show N options including the correct one (image or emoji) */
function runFindItem(){
  clueEl.textContent = "";
  const pool = resolvedItems.slice();
  shuffle(pool);
  const correct = pool.find(() => true) || pool[0];
  // build options: ensure correct included
  const options = shuffle(pool).slice(0,6);
  if(!options.find(o=>o.id === correct.id)){
    options[0] = correct;
  }
  renderOptionsGrid(options, correct, `Find the ${correct.name}`);
}

/* Find face: only emoji items used */
function runFindFace(){
  const faces = resolvedItems.filter(i => i.emoji);
  if(faces.length === 0){
    // fallback to general find item
    return runFindItem();
  }
  shuffle(faces);
  const correct = faces[0];
  // use up to 6 faces
  const options = shuffle(faces).slice(0,6);
  if(!options.find(o=>o.id===correct.id)) options[0]=correct;
  renderOptionsGrid(options, correct, `Find the ${correct.name}`);
}

/* Find different: 5 identical + 1 different */
function runFindDifferent(){
  const imgPool = resolvedItems.filter(i => i.isImage);
  if(imgPool.length < 2){
    // fallback to findItem
    return runFindItem();
  }
  // choose a repeat item (A) and a different item (B)
  const repeatItem = imgPool[Math.floor(Math.random()*imgPool.length)];
  let diffItem = imgPool[Math.floor(Math.random()*imgPool.length)];
  // ensure diffItem !== repeatItem
  let attempts = 0;
  while(diffItem.id === repeatItem.id && attempts++ < 20){
    diffItem = imgPool[Math.floor(Math.random()*imgPool.length)];
  }
  // build options: 5 repeat, 1 diff
  const options = [];
  for(let i=0;i<5;i++) options.push(repeatItem);
  options.push(diffItem);
  shuffle(options);
  renderOptionsGrid(options, diffItem, "Find the different item");
}

/* Find missing: show puzzle w/ blank and options including the missing one */
function runFindMissing(){
  const imgPool = resolvedItems.filter(i => i.isImage);
  if(imgPool.length < 4){
    return runFindItem();
  }
  // choose 4 distinct images
  const pool = shuffle(imgPool).slice(0,4);
  const missing = pool[Math.floor(Math.random()*pool.length)];
  const puzzleDisplay = pool.filter(i => i.id !== missing.id);
  // options include the missing item + the other puzzle items (so one will obviously be correct)
  const options = shuffle([...puzzleDisplay, missing]);
  renderPuzzleWithOptions(puzzleDisplay, options, missing, "Find the missing piece");
}

/* ----- Renderers ----- */

/* Generic renderer for a set of options (no puzzle) */
function renderOptionsGrid(options, correct, clueText){
  clueEl.textContent = clueText;
  gridEl.innerHTML = '';

  // new options container (grid)
  const optionsContainer = document.createElement('div');
  optionsContainer.className = 'options-grid';

  options.forEach((optItem, idx) => {
    const optEl = createOptionElement(optItem);
    optEl.classList.add('option');
    // attach click
    optEl.addEventListener('click', ()=>{
      handleChoice(optItem, correct, optEl, null);
    });
    optionsContainer.appendChild(optEl);
  });

  gridEl.appendChild(optionsContainer);
}

/* Puzzle renderer: top row shows puzzle items + blank, bottom row shows options */
function renderPuzzleWithOptions(puzzleItems, options, correct, clueText){
  clueEl.textContent = clueText;
  gridEl.innerHTML = '';

  // puzzle row
  const puzzleRow = document.createElement('div');
  puzzleRow.className = 'puzzle-row';
  puzzleItems.forEach(item => {
    const cell = document.createElement('div');
    cell.style.width = '120px';
    cell.style.height = '120px';
    cell.style.borderRadius = '12px';
    cell.style.overflow = 'hidden';
    cell.style.background = '#fff';
    cell.style.display = 'flex';
    cell.style.alignItems = 'center';
    cell.style.justifyContent = 'center';
    if(item.isImage && item.resolvedSrc){
      const img = document.createElement('img');
      img.src = item.resolvedSrc; img.style.maxWidth = '100%'; img.style.maxHeight = '100%'; img.style.objectFit = 'contain';
      cell.appendChild(img);
    } else if(item.emoji){
      const em = document.createElement('div'); em.className = 'emoji'; em.textContent = item.emoji; em.style.fontSize='56px';
      cell.appendChild(em);
    } else {
      const label = document.createElement('div'); label.className='label'; label.textContent = item.name;
      cell.appendChild(label);
    }
    puzzleRow.appendChild(cell);
  });

  // blank cell for missing
  const blank = document.createElement('div');
  blank.className = 'blank';
  blank.textContent = '???';
  puzzleRow.appendChild(blank);

  gridEl.appendChild(puzzleRow);

  // options grid
  const optionsGrid = document.createElement('div');
  optionsGrid.className = 'options-grid';
  options.forEach(optItem => {
    const optEl = createOptionElement(optItem);
    optEl.classList.add('option');
    optEl.addEventListener('click', ()=>{
      handleChoice(optItem, correct, optEl, blank);
    });
    optionsGrid.appendChild(optEl);
  });

  gridEl.appendChild(optionsGrid);
}

/* ----- choice handling ----- */
function handleChoice(selected, correct, elementEl, blankEl){
  // visual feedback
  if(selected.id === correct.id){
    // correct
    elementEl.style.borderColor = '#27ae60';
    elementEl.style.boxShadow = '0 10px 30px rgba(39,174,96,0.12)';
    messageEl.textContent = '✅ Correct!';
    tryPlaySoundFor(correct.name);
    speak(correct.name + '! Good job!');
    if(blankEl){
      // fill the blank with the actual image if available, else show emoji/name
      blankEl.innerHTML = '';
      if(selected.isImage && selected.resolvedSrc){
        const img = document.createElement('img');
        img.src = selected.resolvedSrc; img.style.maxWidth='100%'; img.style.maxHeight='100%'; img.style.objectFit='contain';
        blankEl.appendChild(img);
      } else if(selected.emoji){
        const em = document.createElement('div'); em.className='emoji'; em.textContent = selected.emoji; em.style.fontSize='56px';
        blankEl.appendChild(em);
      } else {
        blankEl.textContent = selected.name;
      }
    }
    // small delay then next
    setTimeout(()=>{ messageEl.textContent=''; nextRound(); }, 1000);
  } else {
    // wrong
    elementEl.style.borderColor = '#e74c3c';
    messageEl.textContent = '❌ Try again!';
    speak('Try again!');
    setTimeout(()=>{ elementEl.style.borderColor = ''; messageEl.textContent = ''; }, 700);
  }
}

/* ----- initialization ----- */
async function init(){
  // show a short loading indicator
  clueEl.textContent = "Loading images (trying multiple folders)…";
  await preloadAll();
  // small delay to avoid flicker
  setTimeout(()=>{
    clueEl.textContent = "Ready! Starting game…";
    startGame();
  }, 350);
}

/* Start button & exit button handlers */
newBtn.addEventListener('click', ()=>{ startGame(); });
exitBtn.addEventListener('click', ()=>{ window.location.href = 'index.html'; });

/* Kick off */
init();
