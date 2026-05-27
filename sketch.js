let shapeBatches = [];
let cursorX = 0;
let cursorY = 0;

let currentState = "landing";
let splitStarted = false;

let orbitAngle = 0;

// DOM refs
const audio = document.getElementById("bg-audio");
const soundToggle = document.getElementById("sound-toggle");
const guideToggle = document.getElementById("guide-toggle");
const typewriter = document.getElementById("typewriter");
const phaseTypewriterOne = document.getElementById("phase-typewriter-one");
const phaseTypewriterTwo = document.getElementById("phase-typewriter-two");
const orbitScene = document.getElementById("orbit-scene");
let orbitFrames = document.querySelectorAll(".orbit-frame");


// TOP UI (sound + restart)
audio.volume = 0.25;
let soundOn = false;

soundToggle.addEventListener("click", () => {
  soundOn = !soundOn;

  if (soundOn) {
    audio.play();
    soundToggle.textContent = "sound on";
  } else {
    audio.pause();
    soundToggle.textContent = "sound off";
  }

  soundToggle.blur();
});

soundToggle.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
  }
});

const restartToggle = document.getElementById("restart-toggle");

restartToggle.addEventListener("click", () => {
  window.location.reload();
});

// GUIDE TOGGLE
document.querySelectorAll(".guide-toggle").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const activeScene = button.closest("section");

    if (!activeScene) return;

    showGuide(activeScene, true);
    button.blur();
  });
});


// landing intro text typewriter effect
const introText = "perhaps small things were never small.";
let charIndex = 0;

// phase 1 main quotes
const phaseMessageOne = "perhaps\nsmall things";
const phaseMessageTwo = "were never\nthat small.";

let phaseCharIndexOne = 0;
let phaseCharIndexTwo = 0;

// orbit frames
const frameOrbitData = [];

function setup() {
  createCanvas(windowWidth, windowHeight);

  cursorX = width / 2;
  cursorY = height / 2;

  setTimeout(typeWriter, 2500);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  clear();

  if (currentState === "landing") {
    drawGeneratedShapes();
  }
}

function keyTyped() {
  if (currentState !== "landing") return;
  if (key === " ") return;

  if (key.match(/[a-zA-Z]/)) {
    let numClusters = int(random(3, 8));
    let batch = [];

    for (let i = 0; i < numClusters; i++) {
      batch.push(makeCluster());
    }

    shapeBatches.push(batch);
  }
}

function keyPressed() {
  if (currentState !== "landing") return;

  if (keyCode === DELETE || keyCode === BACKSPACE) {
    shapeBatches.pop();
    return;
  }

  if (keyCode === 32) {
    startSplitTransition();
    return;
  }
}

function typeWriter() {
  if (charIndex < introText.length) {
    typewriter.textContent += introText.charAt(charIndex);
    charIndex++;
    setTimeout(typeWriter, 100);
  } else {
    typewriter.classList.add("typing-done");
  }
}

function startSplitTransition() {
  if (splitStarted) return;
  splitStarted = true;

  const split = document.getElementById("split-transition");
  const landing = document.getElementById("landing");

  currentState = "transitioning";

  split.classList.add("active");

  if (landing) {
    landing.classList.add("hide");
  }

  setTimeout(() => {
    split.classList.add("split-out");
  }, 80);

  setTimeout(() => {
    split.classList.remove("active");
    split.classList.remove("split-out");

    currentState = "phaseMessage";
    startPhaseMessage();
  }, 1500);
}

function startPhaseMessage() {
  const phaseMessage = document.getElementById("phase-message");

  phaseMessage.classList.add("show");

  phaseCharIndexOne = 0;
  phaseCharIndexTwo = 0;

  phaseTypewriterOne.textContent = "";
  phaseTypewriterTwo.textContent = "";
  phaseTypewriterTwo.classList.remove("typing-done");

  typePhaseMessageOne();
}

function typePhaseMessageOne() {
  if (phaseCharIndexOne < phaseMessageOne.length) {
    phaseTypewriterOne.textContent += phaseMessageOne.charAt(phaseCharIndexOne);
    phaseCharIndexOne++;
    setTimeout(typePhaseMessageOne, 90);
  } else {
    setTimeout(typePhaseMessageTwo, 500);
  }
}

function typePhaseMessageTwo() {
  if (phaseCharIndexTwo < phaseMessageTwo.length) {
    phaseTypewriterTwo.textContent += phaseMessageTwo.charAt(phaseCharIndexTwo);
    phaseCharIndexTwo++;
    setTimeout(typePhaseMessageTwo, 90);
  } else {
    phaseTypewriterTwo.classList.add("typing-done");

    setTimeout(() => {
      startOrbitScene();
    }, 1000);
  }
}


// orbit scene
const ORBIT_RADIUS_X = 67;
const ORBIT_RADIUS_Y = 58;
const ORBIT_TILT = -0.28;
const ORBIT_SPEED = 0.002;

const FRAME_ORBIT_PATTERN = [
  { angle: -92, radiusX: 67, radiusY: 58 },
  { angle: -45, radiusX: 67, radiusY: 58 },

  { angle: 8, radiusX: 67, radiusY: 58 },
  { angle: 42, radiusX: 67, radiusY: 58 },

  { angle: 96, radiusX: 67, radiusY: 58 },
  { angle: 178, radiusX: 67, radiusY: 58 },

  { angle: 245, radiusX: 67, radiusY: 58 },
  { angle: 278, radiusX: 67, radiusY: 58 }
];

function startOrbitScene() {
  const ring = orbitScene.querySelector(".orbit-ring");

  currentState = "orbit";

  if (!orbitScene || !ring) return;

  document.querySelectorAll(".orbit-symbol").forEach((symbol) => symbol.remove());

  for (let i = 0; i < 75; i++) {
    const symbol = document.createElement("span");
    symbol.className = "orbit-symbol";
    symbol.textContent = i % 3 === 0 ? "+" : i % 3 === 1 ? "o" : "x";

    symbol.dataset.angle = (i / 75) * Math.PI * 2;
    symbol.dataset.radiusX = random(ORBIT_RADIUS_X - 6, ORBIT_RADIUS_X + 6);
    symbol.dataset.radiusY = random(ORBIT_RADIUS_Y - 6, ORBIT_RADIUS_Y + 6);
    symbol.dataset.speed = random(0.0012, 0.003);

    ring.appendChild(symbol);
  }

  orbitFrames = document.querySelectorAll(".orbit-frame");

  initOrbitFrames();

  orbitScene.classList.add("show");

  animateOrbitSymbols();
  updateOrbitFrames();
}

function animateOrbitSymbols() {
  const symbols = document.querySelectorAll(".orbit-symbol");

  symbols.forEach((symbol) => {
    let angle = parseFloat(symbol.dataset.angle);
    const radiusX = parseFloat(symbol.dataset.radiusX);
    const radiusY = parseFloat(symbol.dataset.radiusY);
    const speed = parseFloat(symbol.dataset.speed);

    angle += speed;
    symbol.dataset.angle = angle;

    const baseX = Math.cos(angle) * radiusX;
    const baseY = Math.sin(angle) * radiusY;

    const rotatedX =
      baseX * Math.cos(ORBIT_TILT) - baseY * Math.sin(ORBIT_TILT);
    const rotatedY =
      baseX * Math.sin(ORBIT_TILT) + baseY * Math.cos(ORBIT_TILT);

    symbol.style.left = `${50 + rotatedX}%`;
    symbol.style.top = `${50 + rotatedY}%`;
  });

  if (currentState === "orbit") {
    requestAnimationFrame(animateOrbitSymbols);
  }
}

function initOrbitFrames() {
  orbitFrames.forEach((frame, index) => {
    const pattern = FRAME_ORBIT_PATTERN[index % FRAME_ORBIT_PATTERN.length];

    frameOrbitData[index] = {
      baseAngle: (pattern.angle * Math.PI) / 180,
      angleOffset: random(-0.035, 0.035),
      radiusX: pattern.radiusX,
      radiusY: pattern.radiusY,
      speed: ORBIT_SPEED
    };

    frame.style.setProperty("--rotate", `${random(-8, 8)}deg`);
  });
}

function updateOrbitFrames() {
  orbitFrames.forEach((frame, index) => {
    const data = frameOrbitData[index];
    if (!data) return;

    data.baseAngle += data.speed;

    const angle = data.baseAngle + data.angleOffset;

    const baseX = Math.cos(angle) * data.radiusX;
    const baseY = Math.sin(angle) * data.radiusY;

    const rotatedX =
      baseX * Math.cos(ORBIT_TILT) - baseY * Math.sin(ORBIT_TILT);
    const rotatedY =
      baseX * Math.sin(ORBIT_TILT) + baseY * Math.cos(ORBIT_TILT);

    frame.style.left = `${50 + rotatedX}%`;
    frame.style.top = `${50 + rotatedY}%`;
  });

  if (currentState === "orbit") {
    requestAnimationFrame(updateOrbitFrames);
  }
}

function scrambleOrbitFrames() {
  orbitFrames.forEach((frame, index) => {
    const data = frameOrbitData[index];
    if (!data) return;

    const pattern = FRAME_ORBIT_PATTERN[index % FRAME_ORBIT_PATTERN.length];

    data.angleOffset = random(-0.05, 0.05);
    data.radiusX = pattern.radiusX + random(-3, 3);
    data.radiusY = pattern.radiusY + random(-3, 3);
    data.speed = ORBIT_SPEED;

    frame.style.setProperty("--rotate", `${random(-12, 12)}deg`);
  });
}

document.addEventListener("click", () => {
  if (!orbitScene.classList.contains("show")) return;
  scrambleOrbitFrames();
});


// generative cluster creation
function makeCluster() {
  let blocks = [];
  let grid = 40;

  let startX = int(random(width / grid)) * grid;
  let startY = int(random(height / grid)) * grid;

  let bw = int(random(10, 40));
  let bh = int(random(10, 40));
  let count = int(random(1, 6));

  blocks.push({ x: startX, y: startY, w: bw, h: bh });

  for (let i = 1; i < count; i++) {
    let last = blocks[int(random(blocks.length))];
    let dir = random(["up", "down", "left", "right"]);

    let newBlock = {
      x: last.x,
      y: last.y,
      w: bw,
      h: bh
    };

    if (dir === "up") newBlock.y -= bh;
    if (dir === "down") newBlock.y += bh;
    if (dir === "left") newBlock.x -= bw;
    if (dir === "right") newBlock.x += bw;

    if (!blocks.some(b => b.x === newBlock.x && b.y === newBlock.y)) {
      blocks.push(newBlock);
    }
  }

  return {
    blocks: blocks
  };
}

function drawGeneratedShapes() {
  noFill();
  stroke("#1a1a1a");
  strokeWeight(1);

  for (let batch of shapeBatches) {
    for (let cluster of batch) {
      drawClusterOutline(cluster);
    }
  }
}

function drawClusterOutline(cluster) {
  let edges = new Map();

  for (let b of cluster.blocks) {
    let corners = [
      [b.x, b.y, b.x + b.w, b.y],
      [b.x + b.w, b.y, b.x + b.w, b.y + b.h],
      [b.x + b.w, b.y + b.h, b.x, b.y + b.h],
      [b.x, b.y + b.h, b.x, b.y]
    ];

    for (let e of corners) {
      let key = e.join(",");
      let rev = [e[2], e[3], e[0], e[1]].join(",");

      if (edges.has(rev)) {
        edges.delete(rev);
      } else {
        edges.set(key, e);
      }
    }
  }

  if (edges.size === 0) return;

  let outline = [];
  let startKey = edges.keys().next().value;
  let current = edges.get(startKey);

  outline.push(createVector(current[0], current[1]));

  let cx = current[2];
  let cy = current[3];

  edges.delete(startKey);

  while (edges.size > 0) {
    let found = null;

    for (let [, e] of edges) {
      if (e[0] === cx && e[1] === cy) {
        found = e;
        break;
      }
    }

    if (!found) break;

    outline.push(createVector(found[0], found[1]));

    cx = found[2];
    cy = found[3];

    edges.delete(found.join(","));
  }

  beginShape();

  for (let p of outline) {
    vertex(p.x, p.y);
  }

  endShape(CLOSE);
}

// custom cursor
let customCursor = document.getElementById("custom-cursor");

if (!customCursor) {
  customCursor = document.createElement("div");
  customCursor.id = "custom-cursor";
}

document.body.appendChild(customCursor);

const cursorTrail = [];

let htmlCursorX = window.innerWidth / 2;
let htmlCursorY = window.innerHeight / 2;
let targetCursorX = window.innerWidth / 2;
let targetCursorY = window.innerHeight / 2;

document.addEventListener("mousemove", (event) => {
  targetCursorX = event.clientX;
  targetCursorY = event.clientY;

  cursorTrail.push({
    x: event.clientX,
    y: event.clientY,
    life: 1
  });

  if (cursorTrail.length > 10) {
    cursorTrail.shift();
  }
});

function animateCustomCursor() {
  htmlCursorX += (targetCursorX - htmlCursorX) * 0.25;
  htmlCursorY += (targetCursorY - htmlCursorY) * 0.25;

  const floatX = Math.sin(Date.now() * 0.006) * 2;
  const floatY = Math.cos(Date.now() * 0.005) * 2;

  customCursor.style.display = "block";
  customCursor.style.visibility = "visible";
  customCursor.style.opacity = "1";
  customCursor.style.zIndex = "999999";

  customCursor.style.left = `${htmlCursorX + floatX}px`;
  customCursor.style.top = `${htmlCursorY + floatY}px`;

  requestAnimationFrame(animateCustomCursor);
}

function renderCursorTrail() {
  document.querySelectorAll(".cursor-trail").forEach((trail) => trail.remove());

  cursorTrail.forEach((point, index) => {
    const trail = document.createElement("div");
    trail.className = "cursor-trail";

    trail.style.left = `${point.x}px`;
    trail.style.top = `${point.y}px`;
    trail.style.opacity = point.life * 0.45;

    const scale = 0.25 + (index / cursorTrail.length) * 0.6;
    trail.style.transform = `translate(-50%, -50%) scale(${scale})`;

    document.body.appendChild(trail);

    point.life -= 0.08;
  });

  for (let i = cursorTrail.length - 1; i >= 0; i--) {
    if (cursorTrail[i].life <= 0) {
      cursorTrail.splice(i, 1);
    }
  }

  requestAnimationFrame(renderCursorTrail);
}

animateCustomCursor();
renderCursorTrail();

// FRAME DETAIL INTERACTION
const phaseMessage = document.getElementById("phase-message");
const whiteTransition = document.getElementById("white-transition");
const interactionGuide = document.getElementById("interaction-guide");

// SHARED POP UP GUIDE
let isGuideOpen = false;
let canCloseGuide = false;
let detailGuideSeen = false;

function clearGuideBlur() {
  phoneDetailScene.classList.remove("guide-active");
  peopleDetailScene.classList.remove("guide-active");
  randomThingsDetailScene.classList.remove("guide-active");
  lifeDetailScene.classList.remove("guide-active");
  pauseDetailScene.classList.remove("guide-active");
  shoesDetailScene.classList.remove("guide-active");
  feedingDetailScene.classList.remove("guide-active");
}

function showGuide(activeScene, forceShow = false) {
  if (detailGuideSeen && !forceShow) return;

  detailGuideSeen = true;
  isGuideOpen = true;
  canCloseGuide = false;

  clearGuideBlur();

  activeScene.classList.add("guide-active");
  interactionGuide.classList.remove("hidden");

  requestAnimationFrame(() => {
    interactionGuide.classList.add("show");
  });

  setTimeout(() => {
    canCloseGuide = true;
  }, 250);
}

function hideGuide() {
  clearGuideBlur();

  interactionGuide.classList.remove("show");

  setTimeout(() => {
    interactionGuide.classList.add("hidden");
    isGuideOpen = false;
    canCloseGuide = false;

    if (isPhoneDetailOpen && detailStep === 1 && phoneTypewriter.textContent === "") {
      typeTextGeneric(phoneTypewriter, detailText);
    }

    if (isPeopleDetailOpen && peopleStep === 1 && peopleTypewriter.textContent === "") {
      typeTextGeneric(peopleTypewriter, peopleText);
    }

    if (
      isRandomThingsDetailOpen &&
      randomThingsStep === 1 &&
      randomThingsTypewriter.textContent === ""
    ) {
      typeTextGeneric(randomThingsTypewriter, randomThingsText);
    }

    if (isLifeDetailOpen && lifeStep === 1 && lifeTypewriter.textContent === "") {
      typeTextGeneric(lifeTypewriter, lifeText);
    }

    if (isPauseDetailOpen && pauseStep === 1 && pauseTypewriter.textContent === "") {
      typeTextGeneric(pauseTypewriter, pauseText);
    }

    if (isShoesDetailOpen && shoesStep === 1 && shoesTypewriter.textContent === "") {
      typeTextGeneric(shoesTypewriter, shoesText);
    }

    if (
      isFeedingDetailOpen &&
      feedingStep === 1 &&
      feedingTypewriter.textContent === ""
    ) {
      typeTextGeneric(feedingTypewriter, feedingText);
    }
  }, 350);
}

// PHONE
const phoneFrame = document.querySelector(".phone-frame");
const phonePreview = document.getElementById("phone-preview");
const phoneDetailScene = document.getElementById("phone-detail-scene");
const detailInfo = document.getElementById("detail-info");

const phoneTypewriter = document.getElementById("phone-typewriter-01");
const phoneTypewriter02 = document.getElementById("phone-typewriter-02");
const phoneTypewriter03 = document.getElementById("phone-typewriter-03");

const phoneDetail01 = document.querySelector(".phone-detail-01");
const phoneDetail02 = document.querySelector(".phone-detail-02");
const phoneDetail03 = document.querySelector(".phone-detail-03");

let isPhonePreviewLocked = false;
let isPhoneDetailOpen = false;
let detailStep = 1;

const detailText =
  "remember that one time you randomly\n\ntexted a friend just to check in?";

const detailText02 =
  "but what if that message meant more\n\nthan you realized?";

const detailText03 =
  "what if, on that particular day,\n\nit made someone feel a little\n\nless alone?";

// PEOPLE
const peopleFrame = document.querySelector(".people-frame");
const peoplePreview = document.getElementById("people-preview");
const peopleDetailScene = document.getElementById("people-detail-scene");
const peopleDetailInfo = document.getElementById("people-detail-info");

const peopleTypewriter = document.getElementById("people-typewriter-01");
const peopleTypewriter02 = document.getElementById("people-typewriter-02");
const peopleTypewriter03 = document.getElementById("people-typewriter-03");

const peopleDetail01 = document.querySelector(".people-detail-01");
const peopleDetail02 = document.querySelector(".people-detail-02");
const peopleDetail03 = document.querySelector(".people-detail-03");

let isPeoplePreviewLocked = false;
let isPeopleDetailOpen = false;
let peopleStep = 1;

const peopleText =
  "remember when someone recognized\n\nyou before you noticed them?";

const peopleText02 =
  "a smile across the street. a small wave.\n\na brief pause in the flow of an ordinary day.";

const peopleText03 =
  "the kind of passing interaction\n\nwe rarely think twice about.";

// RANDOM THINGS
const randomThingsFrame = document.querySelector(".random-things-frame");
const randomThingsPreview = document.getElementById("random-things-preview");
const randomThingsDetailScene = document.getElementById("random-things-detail-scene");
const randomThingsDetailInfo = document.getElementById("random-things-detail-info");

const randomThingsTypewriter = document.getElementById("random-things-typewriter-01");
const randomThingsTypewriter02 = document.getElementById("random-things-typewriter-02");
const randomThingsTypewriter03 = document.getElementById("random-things-typewriter-03");

const randomThingsDetail01 = document.querySelector(".random-things-detail-01");
const randomThingsDetail02 = document.querySelector(".random-things-detail-02");
const randomThingsDetail03 = document.querySelector(".random-things-detail-03");

let isRandomThingsPreviewLocked = false;
let isRandomThingsDetailOpen = false;
let randomThingsStep = 1;

const randomThingsText =
  "remember the random things people keep?";

const randomThingsText02 =
  "a receipt. a note.\n\na screenshot saved without much thought.";

const randomThingsText03 =
  "ordinary traces of moments\n\nwe never meant to archive.";

// LIFE
const lifeFrame = document.querySelector(".life-frame");
const lifePreview = document.getElementById("life-preview");
const lifeDetailScene = document.getElementById("life-detail-scene");
const lifeDetailInfo = document.getElementById("life-detail-info");

const lifeTypewriter = document.getElementById("life-typewriter-01");
const lifeTypewriter02 = document.getElementById("life-typewriter-02");
const lifeTypewriter03 = document.getElementById("life-typewriter-03");

const lifeDetail01 = document.querySelector(".life-detail-01");
const lifeDetail02 = document.querySelector(".life-detail-02");
const lifeDetail03 = document.querySelector(".life-detail-03");

let isLifePreviewLocked = false;
let isLifeDetailOpen = false;
let lifeStep = 1;

const lifeText =
  "remember the sounds that become part of your everyday\n\nwithout you noticing?";

const lifeText02 =
  "laughter through a wall. plates clinking somewhere nearby.\n\na distant motorbike passing at night.";

const lifeText03 =
  "the background noise of other lives\n\nunfolding beside yours.";

// PAUSE
const pauseFrame = document.querySelector(".pause-frame");
const pausePreview = document.getElementById("pause-preview");
const pauseDetailScene = document.getElementById("pause-detail-scene");
const pauseDetailInfo = document.getElementById("pause-detail-info");

const pauseTypewriter = document.getElementById("pause-typewriter-01");
const pauseTypewriter02 = document.getElementById("pause-typewriter-02");
const pauseTypewriter03 = document.getElementById("pause-typewriter-03");

const pauseDetail01 = document.querySelector(".pause-detail-01");
const pauseDetail02 = document.querySelector(".pause-detail-02");
const pauseDetail03 = document.querySelector(".pause-detail-03");

let isPausePreviewLocked = false;
let isPauseDetailOpen = false;
let pauseStep = 1;

const pauseText =
  "remember the moments you pause to notice\n\nwhat was always there?";

const pauseText02 =
  "rain gathering against the window.\n\npassing headlights below.\n\nthe quiet movement of an ordinary evening.";

const pauseText03 =
  "some things only become visible\n\nwhen we slow down enough to notice.";

// SHOES
const shoesFrame = document.querySelector(".shoes-frame");
const shoesPreview = document.getElementById("shoes-preview");
const shoesDetailScene = document.getElementById("shoes-detail-scene");
const shoesDetailInfo = document.getElementById("shoes-detail-info");

const shoesTypewriter = document.getElementById("shoes-typewriter-01");
const shoesTypewriter02 = document.getElementById("shoes-typewriter-02");
const shoesTypewriter03 = document.getElementById("shoes-typewriter-03");

const shoesDetail01 = document.querySelector(".shoes-detail-01");
const shoesDetail02 = document.querySelector(".shoes-detail-02");
const shoesDetail03 = document.querySelector(".shoes-detail-03");

let isShoesPreviewLocked = false;
let isShoesDetailOpen = false;
let shoesStep = 1;

const shoesText =
  "remember the small routines\n\nyour body knows by heart?";

const shoesText02 =
  "shoes left by the door.\n\nyour bag set down without thought.\n\nthe familiar quiet waiting inside.";

const shoesText03 =
  "ordinary rituals that quietly mark\n\nthe end of a day.";

// FEEDING
const feedingFrame = document.querySelector(".feeding-frame");
const feedingPreview = document.getElementById("feeding-preview");
const feedingDetailScene = document.getElementById("feeding-detail-scene");
const feedingDetailInfo = document.getElementById("feeding-detail-info");

const feedingTypewriter = document.getElementById("feeding-typewriter-01");
const feedingTypewriter02 = document.getElementById("feeding-typewriter-02");
const feedingTypewriter03 = document.getElementById("feeding-typewriter-03");

const feedingDetail01 = document.querySelector(".feeding-detail-01");
const feedingDetail02 = document.querySelector(".feeding-detail-02");
const feedingDetail03 = document.querySelector(".feeding-detail-03");

let isFeedingPreviewLocked = false;
let isFeedingDetailOpen = false;
let feedingStep = 1;

const feedingText =
  "remember the moments you eat\n\nwithout much thought?";

const feedingText02 =
  "a half-finished drink.\n\ncrumbs left behind.\n\nmeals squeezed between the rest of the day.";

const feedingText03 =
  "even the smallest routines quietly shape\n\nhow we move through life.";


// PHONE PREVIEW
phoneFrame.addEventListener("mouseenter", () => {
  if (isPhonePreviewLocked || isGuideOpen || isPhoneDetailOpen || isPeopleDetailOpen) return;

  orbitScene.classList.add("blurred");
  phaseMessage.classList.add("blurred");
  phonePreview.classList.add("show-ui");
});

phoneFrame.addEventListener("mouseleave", () => {
  if (isPhonePreviewLocked || isGuideOpen || isPhoneDetailOpen || isPeopleDetailOpen) return;

  orbitScene.classList.remove("blurred");
  phaseMessage.classList.remove("blurred");
  phonePreview.classList.remove("show-ui");
});

phoneFrame.addEventListener("click", lockPhonePreview);
phonePreview.addEventListener("click", openPhoneGuideFlow);

function lockPhonePreview(event) {
  event.stopPropagation();

  if (isGuideOpen || isPhoneDetailOpen || isPeopleDetailOpen) return;

  isPhonePreviewLocked = true;

  orbitScene.classList.add("blurred");
  phaseMessage.classList.add("blurred");

  phonePreview.classList.add("show-ui");
  phonePreview.classList.add("is-locked");
}

function openPhoneGuideFlow(event) {
  event.stopPropagation();

  if (!isPhonePreviewLocked) return;

  isPhonePreviewLocked = false;
  isPhoneDetailOpen = true;
  detailStep = 1;
  canCloseGuide = false;

  phonePreview.classList.remove("show-ui");
  phonePreview.classList.remove("is-locked");

  whiteTransition.classList.add("show");

  setTimeout(() => {
    whiteTransition.classList.remove("show");

    orbitScene.classList.remove("blurred");
    phaseMessage.classList.remove("blurred");
    orbitScene.classList.remove("show");

    phoneDetailScene.classList.remove("hidden");
    detailInfo.classList.remove("hidden");

    phoneDetail01.classList.remove("hidden");
    phoneDetail02.classList.add("hidden");
    phoneDetail03.classList.add("hidden");

    phoneTypewriter.textContent = "";
    phoneTypewriter.classList.remove("typing-done");

    phoneTypewriter02.textContent = "";
    phoneTypewriter02.classList.remove("typing-done");

    phoneTypewriter03.textContent = "";
    phoneTypewriter03.classList.remove("typing-done");

    showGuide(phoneDetailScene);

    if (!isGuideOpen) {
      typeTextGeneric(phoneTypewriter, detailText);
    }
  }, 600);
}

// PEOPLE PREVIEW
if (peopleFrame) {
  peopleFrame.addEventListener("mouseenter", () => {
    if (isPeoplePreviewLocked || isGuideOpen || isPhoneDetailOpen || isPeopleDetailOpen) return;

    orbitScene.classList.add("blurred");
    phaseMessage.classList.add("blurred");
    peoplePreview.classList.add("show-ui");
  });

  peopleFrame.addEventListener("mouseleave", () => {
    if (isPeoplePreviewLocked || isGuideOpen || isPhoneDetailOpen || isPeopleDetailOpen) return;

    orbitScene.classList.remove("blurred");
    phaseMessage.classList.remove("blurred");
    peoplePreview.classList.remove("show-ui");
  });

  peopleFrame.addEventListener("click", lockPeoplePreview);
  peoplePreview.addEventListener("click", openPeopleDetail);
}

function lockPeoplePreview(event) {
  event.stopPropagation();

  if (isGuideOpen || isPhoneDetailOpen || isPeopleDetailOpen) return;

  isPeoplePreviewLocked = true;

  orbitScene.classList.add("blurred");
  phaseMessage.classList.add("blurred");

  peoplePreview.classList.add("show-ui");
  peoplePreview.classList.add("is-locked");
}

function openPeopleDetail(event) {
  event.stopPropagation();

  if (!isPeoplePreviewLocked) return;

  isPeoplePreviewLocked = false;
  isPeopleDetailOpen = true;
  peopleStep = 1;
  canCloseGuide = false;

  peoplePreview.classList.remove("show-ui");
  peoplePreview.classList.remove("is-locked");

  whiteTransition.classList.add("show");

  setTimeout(() => {
    whiteTransition.classList.remove("show");

    orbitScene.classList.remove("blurred");
    phaseMessage.classList.remove("blurred");
    orbitScene.classList.remove("show");

    peopleDetailScene.classList.remove("hidden");
    peopleDetailInfo.classList.remove("hidden");

    peopleDetail01.classList.remove("hidden");
    peopleDetail02.classList.add("hidden");
    peopleDetail03.classList.add("hidden");

    peopleTypewriter.textContent = "";
    peopleTypewriter.classList.remove("typing-done");

    peopleTypewriter02.textContent = "";
    peopleTypewriter02.classList.remove("typing-done");

    peopleTypewriter03.textContent = "";
    peopleTypewriter03.classList.remove("typing-done");

    showGuide(peopleDetailScene);

    if (!isGuideOpen) {
      typeTextGeneric(peopleTypewriter, peopleText);
    }
  }, 600);
}

// RANDOM THINGS PREVIEW
if (randomThingsFrame) {
  randomThingsFrame.addEventListener("mouseenter", () => {
    if (
      isRandomThingsPreviewLocked ||
      isGuideOpen ||
      isPhoneDetailOpen ||
      isPeopleDetailOpen ||
      isRandomThingsDetailOpen
    ) return;

    hoverOverlay.classList.add("show-ui");
    randomThingsPreview.classList.add("show-ui");

    orbitScene.classList.add("blurred");
    phaseMessage.classList.add("blurred");
  });

  randomThingsFrame.addEventListener("mouseleave", () => {
    if (
      isRandomThingsPreviewLocked ||
      isGuideOpen ||
      isPhoneDetailOpen ||
      isPeopleDetailOpen ||
      isRandomThingsDetailOpen
    ) return;

    hoverOverlay.classList.remove("show-ui");
    randomThingsPreview.classList.remove("show-ui");

    orbitScene.classList.remove("blurred");
    phaseMessage.classList.remove("blurred");
  });

  randomThingsFrame.addEventListener("click", lockRandomThingsPreview);
  randomThingsPreview.addEventListener("click", openRandomThingsDetail);
}

function lockRandomThingsPreview(event) {
  event.stopPropagation();

  if (
    isGuideOpen ||
    isPhoneDetailOpen ||
    isPeopleDetailOpen ||
    isRandomThingsDetailOpen
  ) return;

  isRandomThingsPreviewLocked = true;

  hoverOverlay.classList.add("show-ui");
  randomThingsPreview.classList.add("show-ui");
  randomThingsPreview.classList.add("is-locked");

  orbitScene.classList.add("blurred");
  phaseMessage.classList.add("blurred");
}

function openRandomThingsDetail(event) {
  if (event) event.stopPropagation();

  if (!isRandomThingsPreviewLocked) return;

  isRandomThingsPreviewLocked = false;
  isRandomThingsDetailOpen = true;
  randomThingsStep = 1;
  canCloseGuide = false;

  hoverOverlay.classList.remove("show-ui");
  randomThingsPreview.classList.remove("show-ui");
  randomThingsPreview.classList.remove("is-locked");

  orbitScene.classList.add("hidden");
  phaseMessage.classList.add("hidden");

  randomThingsDetailScene.classList.remove("hidden");
  randomThingsDetailInfo.classList.remove("hidden");

  randomThingsDetail01.classList.remove("hidden");
  randomThingsDetail02.classList.add("hidden");
  randomThingsDetail03.classList.add("hidden");

  randomThingsTypewriter.textContent = "";
  randomThingsTypewriter.classList.remove("typing-done");

  randomThingsTypewriter02.textContent = "";
  randomThingsTypewriter02.classList.remove("typing-done");

  randomThingsTypewriter03.textContent = "";
  randomThingsTypewriter03.classList.remove("typing-done");

  showGuide(randomThingsDetailScene);

  if (!isGuideOpen) {
    typeTextGeneric(randomThingsTypewriter, randomThingsText);
  }
}

// LIFE PREVIEW
lifeFrame.addEventListener("mouseenter", () => {
  if (isLifePreviewLocked || isLifeDetailOpen) return;

  hoverOverlay.classList.add("show-ui");
  lifePreview.classList.add("show-ui");

  orbitScene.classList.add("blurred");
  phaseMessage.classList.add("blurred");
});

lifeFrame.addEventListener("mouseleave", () => {
  if (isLifePreviewLocked || isLifeDetailOpen) return;

  hoverOverlay.classList.remove("show-ui");
  lifePreview.classList.remove("show-ui");

  orbitScene.classList.remove("blurred");
  phaseMessage.classList.remove("blurred");
});

lifeFrame.addEventListener("click", () => {
  isLifePreviewLocked = true;

  lifePreview.classList.add("show-ui");
  lifePreview.classList.add("is-locked");
  hoverOverlay.classList.add("show-ui");

  orbitScene.classList.add("blurred");
  phaseMessage.classList.add("blurred");
});

lifePreview.addEventListener("click", () => {
  openLifeDetail();
});

function openLifeDetail() {
  isLifeDetailOpen = true;
  lifeStep = 1;

  lifePreview.classList.remove("show-ui", "is-locked");
  hoverOverlay.classList.remove("show-ui");

  orbitScene.classList.add("hidden");
  phaseMessage.classList.add("hidden");

  lifeDetailScene.classList.remove("hidden");

  lifeDetail01.classList.remove("hidden");
  lifeDetail02.classList.add("hidden");
  lifeDetail03.classList.add("hidden");

  lifeTypewriter.textContent = "";
  lifeTypewriter.classList.remove("typing-done");

  typeTextGeneric(lifeTypewriter, lifeText);
}

function goToLifeStep2() {
  lifeStep = 2;

  lifeDetail01.classList.add("hidden");
  lifeDetail02.classList.remove("hidden");
  lifeDetail03.classList.add("hidden");

  lifeTypewriter02.textContent = "";
  lifeTypewriter02.classList.remove("typing-done");

  typeTextGeneric(lifeTypewriter02, lifeText02);
}

function goToLifeStep3() {
  lifeStep = 3;

  lifeDetail02.classList.add("hidden");
  lifeDetail03.classList.remove("hidden");

  lifeTypewriter03.textContent = "";
  lifeTypewriter03.classList.remove("typing-done");

  typeTextGeneric(lifeTypewriter03, lifeText03);
}

function returnLifeToOrbit() {
  isLifeDetailOpen = false;
  isLifePreviewLocked = false;
  lifeStep = 1;

  lifeDetailScene.classList.add("hidden");

  orbitScene.classList.remove("hidden", "blurred");
  phaseMessage.classList.remove("hidden", "blurred");

  lifePreview.classList.remove("show-ui", "is-locked");
  hoverOverlay.classList.remove("show-ui");
}

// PAUSE PREVIEW
if (pauseFrame) {
  pauseFrame.addEventListener("mouseenter", () => {
    if (isPausePreviewLocked || isGuideOpen || isPhoneDetailOpen || isPeopleDetailOpen) return;

    orbitScene.classList.add("blurred");
    phaseMessage.classList.add("blurred");
    pausePreview.classList.add("show-ui");
  });

  pauseFrame.addEventListener("mouseleave", () => {
    if (isPausePreviewLocked || isGuideOpen || isPhoneDetailOpen || isPeopleDetailOpen) return;

    orbitScene.classList.remove("blurred");
    phaseMessage.classList.remove("blurred");
    pausePreview.classList.remove("show-ui");
  });

  pauseFrame.addEventListener("click", lockPausePreview);
  pausePreview.addEventListener("click", openPauseDetail);
}

function lockPausePreview(event) {
  event.stopPropagation();

  if (isGuideOpen || isPhoneDetailOpen || isPeopleDetailOpen) return;

  isPausePreviewLocked = true;

  orbitScene.classList.add("blurred");
  phaseMessage.classList.add("blurred");

  pausePreview.classList.add("show-ui");
  pausePreview.classList.add("is-locked");
}

function openPauseDetail(event) {
  event.stopPropagation();

  if (!isPausePreviewLocked) return;

  isPausePreviewLocked = false;
  isPauseDetailOpen = true;
  pauseStep = 1;
  canCloseGuide = false;

  pausePreview.classList.remove("show-ui");
  pausePreview.classList.remove("is-locked");

  whiteTransition.classList.add("show");

  setTimeout(() => {
    whiteTransition.classList.remove("show");

    orbitScene.classList.remove("blurred");
    phaseMessage.classList.remove("blurred");
    orbitScene.classList.remove("show");

    pauseDetailScene.classList.remove("hidden");
    pauseDetailInfo.classList.remove("hidden");

    pauseDetail01.classList.remove("hidden");
    pauseDetail02.classList.add("hidden");
    pauseDetail03.classList.add("hidden");

    pauseTypewriter.textContent = "";
    pauseTypewriter.classList.remove("typing-done");

    pauseTypewriter02.textContent = "";
    pauseTypewriter02.classList.remove("typing-done");

    pauseTypewriter03.textContent = "";
    pauseTypewriter03.classList.remove("typing-done");

    showGuide(pauseDetailScene);

    if (!isGuideOpen) {
      typeTextGeneric(pauseTypewriter, pauseText);
    }
  }, 600);
}

// SHOES PREVIEW
if (shoesFrame) {
  shoesFrame.addEventListener("mouseenter", () => {
    if (isShoesPreviewLocked || isGuideOpen || isPhoneDetailOpen || isPeopleDetailOpen) return;

    orbitScene.classList.add("blurred");
    phaseMessage.classList.add("blurred");
    shoesPreview.classList.add("show-ui");
  });

  shoesFrame.addEventListener("mouseleave", () => {
    if (isShoesPreviewLocked || isGuideOpen || isPhoneDetailOpen || isPeopleDetailOpen) return;

    orbitScene.classList.remove("blurred");
    phaseMessage.classList.remove("blurred");
    shoesPreview.classList.remove("show-ui");
  });

  shoesFrame.addEventListener("click", lockShoesPreview);
  shoesPreview.addEventListener("click", openShoesDetail);
}

function lockShoesPreview(event) {
  event.stopPropagation();

  if (isGuideOpen || isPhoneDetailOpen || isPeopleDetailOpen) return;

  isShoesPreviewLocked = true;

  orbitScene.classList.add("blurred");
  phaseMessage.classList.add("blurred");

  shoesPreview.classList.add("show-ui");
  shoesPreview.classList.add("is-locked");
}

function openShoesDetail(event) {
  event.stopPropagation();

  if (!isShoesPreviewLocked) return;

  isShoesPreviewLocked = false;
  isShoesDetailOpen = true;
  shoesStep = 1;
  canCloseGuide = false;

  shoesPreview.classList.remove("show-ui");
  shoesPreview.classList.remove("is-locked");

  whiteTransition.classList.add("show");

  setTimeout(() => {
    whiteTransition.classList.remove("show");

    orbitScene.classList.remove("blurred");
    phaseMessage.classList.remove("blurred");
    orbitScene.classList.remove("show");

    shoesDetailScene.classList.remove("hidden");
    shoesDetailInfo.classList.remove("hidden");

    shoesDetail01.classList.remove("hidden");
    shoesDetail02.classList.add("hidden");
    shoesDetail03.classList.add("hidden");

    shoesTypewriter.textContent = "";
    shoesTypewriter.classList.remove("typing-done");

    shoesTypewriter02.textContent = "";
    shoesTypewriter02.classList.remove("typing-done");

    shoesTypewriter03.textContent = "";
    shoesTypewriter03.classList.remove("typing-done");

    showGuide(shoesDetailScene);

    if (!isGuideOpen) {
      typeTextGeneric(shoesTypewriter, shoesText);
    }
  }, 600);
}

// FEEDING PREVIEW
if (feedingFrame) {
  feedingFrame.addEventListener("mouseenter", () => {
    if (isFeedingPreviewLocked || isGuideOpen || isPhoneDetailOpen || isPeopleDetailOpen) return;

    orbitScene.classList.add("blurred");
    phaseMessage.classList.add("blurred");
    feedingPreview.classList.add("show-ui");
  });

  feedingFrame.addEventListener("mouseleave", () => {
    if (isFeedingPreviewLocked || isGuideOpen || isPhoneDetailOpen || isPeopleDetailOpen) return;

    orbitScene.classList.remove("blurred");
    phaseMessage.classList.remove("blurred");
    feedingPreview.classList.remove("show-ui");
  });

  feedingFrame.addEventListener("click", lockFeedingPreview);
  feedingPreview.addEventListener("click", openFeedingDetail);
}

function lockFeedingPreview(event) {
  event.stopPropagation();

  if (isGuideOpen || isPhoneDetailOpen || isPeopleDetailOpen) return;

  isFeedingPreviewLocked = true;

  orbitScene.classList.add("blurred");
  phaseMessage.classList.add("blurred");

  feedingPreview.classList.add("show-ui");
  feedingPreview.classList.add("is-locked");
}

function openFeedingDetail(event) {
  event.stopPropagation();

  if (!isFeedingPreviewLocked) return;

  isFeedingPreviewLocked = false;
  isFeedingDetailOpen = true;
  feedingStep = 1;
  canCloseGuide = false;

  feedingPreview.classList.remove("show-ui");
  feedingPreview.classList.remove("is-locked");

  whiteTransition.classList.add("show");

  setTimeout(() => {
    whiteTransition.classList.remove("show");

    orbitScene.classList.remove("blurred");
    phaseMessage.classList.remove("blurred");
    orbitScene.classList.remove("show");

    feedingDetailScene.classList.remove("hidden");
    feedingDetailInfo.classList.remove("hidden");

    feedingDetail01.classList.remove("hidden");
    feedingDetail02.classList.add("hidden");
    feedingDetail03.classList.add("hidden");

    feedingTypewriter.textContent = "";
    feedingTypewriter.classList.remove("typing-done");

    feedingTypewriter02.textContent = "";
    feedingTypewriter02.classList.remove("typing-done");

    feedingTypewriter03.textContent = "";
    feedingTypewriter03.classList.remove("typing-done");

    showGuide(feedingDetailScene);

    if (!isGuideOpen) {
      typeTextGeneric(feedingTypewriter, feedingText);
    }
  }, 600);
}

// CLICK OUTSIDE
document.addEventListener("click", (event) => {
  if (isGuideOpen) {
    if (!canCloseGuide) return;

    const clickedGuide = interactionGuide.contains(event.target);

    if (clickedGuide) return;

    closeGuideAndOpenPhoneDetail();
    return;
  }

  if (isPhonePreviewLocked) {
    const clickedPhoneFrame = phoneFrame.contains(event.target);
    const clickedPreview = phonePreview.contains(event.target);

    if (clickedPhoneFrame || clickedPreview) return;

    isPhonePreviewLocked = false;

    orbitScene.classList.remove("blurred");
    phaseMessage.classList.remove("blurred");
    phonePreview.classList.remove("show-ui");
    phonePreview.classList.remove("is-locked");
  }

  if (isPeoplePreviewLocked) {
    const clickedPeopleFrame = peopleFrame && peopleFrame.contains(event.target);
    const clickedPeoplePreview = peoplePreview.contains(event.target);

    if (clickedPeopleFrame || clickedPeoplePreview) return;

    isPeoplePreviewLocked = false;

    orbitScene.classList.remove("blurred");
    phaseMessage.classList.remove("blurred");
    peoplePreview.classList.remove("show-ui");
    peoplePreview.classList.remove("is-locked");
  }
});

// KEYBOARD
document.addEventListener("keydown", (event) => {
    if (event.code === "KeyX") {
      if (isPhoneDetailOpen) {
        event.preventDefault();
        returnPhoneToOrbit();
        return;
      }

      if (isPeopleDetailOpen) {
        event.preventDefault();
        returnPeopleToOrbit();
        return;
      }

      if (isRandomThingsDetailOpen) {
        event.preventDefault();
        returnRandomThingsToOrbit();
        return;
      }

      if (isLifeDetailOpen) {
        event.preventDefault();
        returnLifeToOrbit();
        return;
      }

      if (isPauseDetailOpen) {
        event.preventDefault();
        returnPauseToOrbit();
        return;
      }

      if (isShoesDetailOpen) {
        event.preventDefault();
        returnShoesToOrbit();
        return;
      }

      if (isFeedingDetailOpen) {
        event.preventDefault();
        returnFeedingToOrbit();
        return;
      }
    }

  if (event.code !== "Space") return;

  if (isGuideOpen && canCloseGuide) {
    event.preventDefault();
    hideGuide();
    return;
  }

  if (isPhoneDetailOpen) {
    event.preventDefault();

    if (detailStep === 1 && phoneTypewriter.classList.contains("typing-done")) {
      goToDetailStep2();
      return;
    }

    if (detailStep === 2 && phoneTypewriter02.classList.contains("typing-done")) {
      goToDetailStep3();
      return;
    }
  }

  if (isPeopleDetailOpen) {
    event.preventDefault();

    if (peopleStep === 1 && peopleTypewriter.classList.contains("typing-done")) {
      goToPeopleStep2();
      return;
    }

    if (peopleStep === 2 && peopleTypewriter02.classList.contains("typing-done")) {
      goToPeopleStep3();
      return;
    }
  }

  if (isRandomThingsDetailOpen) {
    event.preventDefault();

    if (
      randomThingsStep === 1 &&
      randomThingsTypewriter.classList.contains("typing-done")
    ) {
      goToRandomThingsStep2();
      return;
    }

    if (
      randomThingsStep === 2 &&
      randomThingsTypewriter02.classList.contains("typing-done")
    ) {
      goToRandomThingsStep3();
      return;
    }
  }

  if (isLifeDetailOpen) {
    event.preventDefault();

    if (
      lifeStep === 1 &&
      lifeTypewriter.classList.contains("typing-done")
    ) {
      goToLifeStep2();
      return;
    }

    if (
      lifeStep === 2 &&
      lifeTypewriter02.classList.contains("typing-done")
    ) {
      goToLifeStep3();
      return;
    }
  }

  if (isPauseDetailOpen) {
    event.preventDefault();

    if (
      pauseStep === 1 &&
      pauseTypewriter.classList.contains("typing-done")
    ) {
      goToPauseStep2();
      return;
    }

    if (
      pauseStep === 2 &&
      pauseTypewriter02.classList.contains("typing-done")
    ) {
      goToPauseStep3();
      return;
    }
  }

  if (isShoesDetailOpen) {
    event.preventDefault();

    if (
      shoesStep === 1 &&
      shoesTypewriter.classList.contains("typing-done")
    ) {
      goToShoesStep2();
      return;
    }

    if (
      shoesStep === 2 &&
      shoesTypewriter02.classList.contains("typing-done")
    ) {
      goToShoesStep3();
      return;
    }
  }

   if (isFeedingDetailOpen) {
    event.preventDefault();

    if (
      feedingStep === 1 &&
      feedingTypewriter.classList.contains("typing-done")
    ) {
      goToFeedingStep2();
      return;
    }

    if (
      feedingStep === 2 &&
      feedingTypewriter02.classList.contains("typing-done")
    ) {
      goToFeedingStep3();
      return;
    }
  }
});


// INFO BUTTON
detailInfo.addEventListener("click", (event) => {
  event.stopPropagation();
  showGuide(phoneDetailScene, true);
});

peopleDetailInfo.addEventListener("click", (event) => {
  event.stopPropagation();
  showGuide(peopleDetailScene, true);
});


// PHONE DETAIL
function closeGuideAndOpenPhoneDetail() {
  isGuideOpen = false;
  canCloseGuide = false;
  isPhoneDetailOpen = true;
  detailStep = 1;

  clearGuideBlur();
  interactionGuide.classList.remove("show");
  interactionGuide.classList.add("hidden");

  orbitScene.classList.remove("blurred");
  phaseMessage.classList.remove("blurred");
  orbitScene.classList.remove("show");

  phoneDetailScene.classList.remove("hidden");
  phoneDetailScene.classList.remove("step-2");
  phoneDetailScene.classList.remove("step-3");

  detailInfo.classList.remove("hidden");

  phoneDetail01.classList.remove("hidden");
  phoneDetail02.classList.add("hidden");
  phoneDetail03.classList.add("hidden");

  phoneTypewriter.textContent = "";
  phoneTypewriter.classList.remove("typing-done");

  phoneTypewriter02.textContent = "";
  phoneTypewriter02.classList.remove("typing-done");

  phoneTypewriter03.textContent = "";
  phoneTypewriter03.classList.remove("typing-done");

  typeTextGeneric(phoneTypewriter, detailText);
}

function goToDetailStep2() {
  detailStep = 2;

  phoneDetailScene.classList.add("step-2");

  phoneDetail01.classList.add("hidden");
  phoneDetail02.classList.remove("hidden");
  phoneDetail03.classList.add("hidden");

  phoneTypewriter02.textContent = "";
  phoneTypewriter02.classList.remove("typing-done");

  typeTextGeneric(phoneTypewriter02, detailText02);
}

function goToDetailStep3() {
  detailStep = 3;

  phoneDetailScene.classList.remove("step-2");
  phoneDetailScene.classList.add("step-3");

  phoneDetail02.classList.add("hidden");
  phoneDetail03.classList.remove("hidden");

  phoneTypewriter03.textContent = "";
  phoneTypewriter03.classList.remove("typing-done");

  typeTextGeneric(phoneTypewriter03, detailText03);
}

function returnPhoneToOrbit() {
  whiteTransition.classList.add("show");
  hideGuide();

  setTimeout(() => {
    phoneDetailScene.classList.add("hidden");
    detailInfo.classList.add("hidden");

    phoneDetailScene.classList.remove("step-2");
    phoneDetailScene.classList.remove("step-3");
    phoneDetailScene.classList.remove("guide-active");

    phoneDetail01.classList.remove("hidden");
    phoneDetail02.classList.add("hidden");
    phoneDetail03.classList.add("hidden");

    phoneTypewriter.textContent = "";
    phoneTypewriter.classList.remove("typing-done");

    phoneTypewriter02.textContent = "";
    phoneTypewriter02.classList.remove("typing-done");

    phoneTypewriter03.textContent = "";
    phoneTypewriter03.classList.remove("typing-done");

    isPhoneDetailOpen = false;
    currentState = "orbit";

    if (detailStep === 3) {
      countViewedDetail();
      checkOrdinaryPrompt();
    }

    detailStep = 1;

    orbitScene.classList.add("show");

    whiteTransition.classList.remove("show");
  }, 600);
}

// PEOPLE DETAIL
function goToPeopleStep2() {
  peopleStep = 2;

  peopleDetail01.classList.add("hidden");
  peopleDetail02.classList.remove("hidden");
  peopleDetail03.classList.add("hidden");

  peopleTypewriter02.textContent = "";
  peopleTypewriter02.classList.remove("typing-done");

  typeTextGeneric(peopleTypewriter02, peopleText02);
}

function goToPeopleStep3() {
  peopleStep = 3;

  peopleDetail02.classList.add("hidden");
  peopleDetail03.classList.remove("hidden");

  peopleTypewriter03.textContent = "";
  peopleTypewriter03.classList.remove("typing-done");

  typeTextGeneric(peopleTypewriter03, peopleText03);
}

function returnPeopleToOrbit() {
  whiteTransition.classList.add("show");

  hideGuide();

  setTimeout(() => {
    peopleDetailScene.classList.add("hidden");
    peopleDetailInfo.classList.add("hidden");

    peopleDetailScene.classList.remove("guide-active");

    peopleDetail01.classList.remove("hidden");
    peopleDetail02.classList.add("hidden");
    peopleDetail03.classList.add("hidden");

    peopleTypewriter.textContent = "";
    peopleTypewriter.classList.remove("typing-done");

    peopleTypewriter02.textContent = "";
    peopleTypewriter02.classList.remove("typing-done");

    peopleTypewriter03.textContent = "";
    peopleTypewriter03.classList.remove("typing-done");

    isPeopleDetailOpen = false;
    currentState = "orbit";

    if (peopleStep === 3) {
      countViewedDetail();
      checkOrdinaryPrompt();
    }

    peopleStep = 1;

    orbitScene.classList.add("show");

    whiteTransition.classList.remove("show");
  }, 600);
}

// RANDOM THINGS PREVIEW
if (randomThingsFrame) {
  randomThingsFrame.addEventListener("mouseenter", () => {
    if (
      isRandomThingsPreviewLocked ||
      isGuideOpen ||
      isPhoneDetailOpen ||
      isPeopleDetailOpen ||
      isRandomThingsDetailOpen
    ) return;

    orbitScene.classList.add("blurred");
    phaseMessage.classList.add("blurred");
    randomThingsPreview.classList.add("show-ui");
  });

  randomThingsFrame.addEventListener("mouseleave", () => {
    if (
      isRandomThingsPreviewLocked ||
      isGuideOpen ||
      isPhoneDetailOpen ||
      isPeopleDetailOpen ||
      isRandomThingsDetailOpen
    ) return;

    orbitScene.classList.remove("blurred");
    phaseMessage.classList.remove("blurred");
    randomThingsPreview.classList.remove("show-ui");
  });

  randomThingsFrame.addEventListener("click", lockRandomThingsPreview);
  randomThingsPreview.addEventListener("click", openRandomThingsDetail);
}

function lockRandomThingsPreview(event) {
  event.stopPropagation();

  if (
    isGuideOpen ||
    isPhoneDetailOpen ||
    isPeopleDetailOpen ||
    isRandomThingsDetailOpen
  ) return;

  isRandomThingsPreviewLocked = true;

  orbitScene.classList.add("blurred");
  phaseMessage.classList.add("blurred");

  randomThingsPreview.classList.add("show-ui");
  randomThingsPreview.classList.add("is-locked");
}

function openRandomThingsDetail(event) {
  event.stopPropagation();

  if (!isRandomThingsPreviewLocked) return;

  isRandomThingsPreviewLocked = false;
  isRandomThingsDetailOpen = true;
  randomThingsStep = 1;
  canCloseGuide = false;

  randomThingsPreview.classList.remove("show-ui");
  randomThingsPreview.classList.remove("is-locked");

  whiteTransition.classList.add("show");

  setTimeout(() => {
    whiteTransition.classList.remove("show");

    orbitScene.classList.remove("blurred");
    phaseMessage.classList.remove("blurred");
    orbitScene.classList.remove("show");

    randomThingsDetailScene.classList.remove("hidden");
    randomThingsDetailInfo.classList.remove("hidden");

    randomThingsDetail01.classList.remove("hidden");
    randomThingsDetail02.classList.add("hidden");
    randomThingsDetail03.classList.add("hidden");

    randomThingsTypewriter.textContent = "";
    randomThingsTypewriter.classList.remove("typing-done");

    randomThingsTypewriter02.textContent = "";
    randomThingsTypewriter02.classList.remove("typing-done");

    randomThingsTypewriter03.textContent = "";
    randomThingsTypewriter03.classList.remove("typing-done");

    showGuide(randomThingsDetailScene);

    if (!isGuideOpen) {
      typeTextGeneric(randomThingsTypewriter, randomThingsText);
    }
  }, 600);
}

// RANDOM THINGS DETAIL
function goToRandomThingsStep2() {
  randomThingsStep = 2;

  randomThingsDetail01.classList.add("hidden");
  randomThingsDetail02.classList.remove("hidden");
  randomThingsDetail03.classList.add("hidden");

  randomThingsTypewriter02.textContent = "";
  randomThingsTypewriter02.classList.remove("typing-done");

  typeTextGeneric(randomThingsTypewriter02, randomThingsText02);
}

function goToRandomThingsStep3() {
  randomThingsStep = 3;

  randomThingsDetail02.classList.add("hidden");
  randomThingsDetail03.classList.remove("hidden");

  randomThingsTypewriter03.textContent = "";
  randomThingsTypewriter03.classList.remove("typing-done");

  typeTextGeneric(randomThingsTypewriter03, randomThingsText03);
}

function returnRandomThingsToOrbit() {
  whiteTransition.classList.add("show");

  hideGuide();

  setTimeout(() => {
    randomThingsDetailScene.classList.add("hidden");
    randomThingsDetailInfo.classList.add("hidden");

    randomThingsDetailScene.classList.remove("guide-active");

    randomThingsDetail01.classList.remove("hidden");
    randomThingsDetail02.classList.add("hidden");
    randomThingsDetail03.classList.add("hidden");

    randomThingsTypewriter.textContent = "";
    randomThingsTypewriter.classList.remove("typing-done");

    randomThingsTypewriter02.textContent = "";
    randomThingsTypewriter02.classList.remove("typing-done");

    randomThingsTypewriter03.textContent = "";
    randomThingsTypewriter03.classList.remove("typing-done");

    isRandomThingsDetailOpen = false;
    isRandomThingsPreviewLocked = false;
    currentState = "orbit";

    if (randomThingsStep === 3) {
      countViewedDetail();
      checkOrdinaryPrompt();
    }

    randomThingsStep = 1;

    orbitScene.classList.add("show");

    whiteTransition.classList.remove("show");
  }, 600);
}

// LIFE PREVIEW
if (lifeFrame) {
  lifeFrame.addEventListener("mouseenter", () => {
    if (
      isLifePreviewLocked ||
      isGuideOpen ||
      isPhoneDetailOpen ||
      isPeopleDetailOpen ||
      isRandomThingsDetailOpen ||
      isLifeDetailOpen
    ) return;

    orbitScene.classList.add("blurred");
    phaseMessage.classList.add("blurred");
    lifePreview.classList.add("show-ui");
  });

  lifeFrame.addEventListener("mouseleave", () => {
    if (
      isLifePreviewLocked ||
      isGuideOpen ||
      isPhoneDetailOpen ||
      isPeopleDetailOpen ||
      isRandomThingsDetailOpen ||
      isLifeDetailOpen
    ) return;

    orbitScene.classList.remove("blurred");
    phaseMessage.classList.remove("blurred");
    lifePreview.classList.remove("show-ui");
  });

  lifeFrame.addEventListener("click", lockLifePreview);
  lifePreview.addEventListener("click", openLifeDetail);
}

function lockLifePreview(event) {
  event.stopPropagation();

  if (
    isGuideOpen ||
    isPhoneDetailOpen ||
    isPeopleDetailOpen ||
    isRandomThingsDetailOpen ||
    isLifeDetailOpen
  ) return;

  isLifePreviewLocked = true;

  orbitScene.classList.add("blurred");
  phaseMessage.classList.add("blurred");

  lifePreview.classList.add("show-ui");
  lifePreview.classList.add("is-locked");
}

function openLifeDetail(event) {
  event.stopPropagation();

  if (!isLifePreviewLocked) return;

  isLifePreviewLocked = false;
  isLifeDetailOpen = true;
  lifeStep = 1;
  canCloseGuide = false;

  lifePreview.classList.remove("show-ui");
  lifePreview.classList.remove("is-locked");

  whiteTransition.classList.add("show");

  setTimeout(() => {
    whiteTransition.classList.remove("show");

    orbitScene.classList.remove("blurred");
    phaseMessage.classList.remove("blurred");
    orbitScene.classList.remove("show");

    lifeDetailScene.classList.remove("hidden");
    lifeDetailInfo.classList.remove("hidden");

    lifeDetail01.classList.remove("hidden");
    lifeDetail02.classList.add("hidden");
    lifeDetail03.classList.add("hidden");

    lifeTypewriter.textContent = "";
    lifeTypewriter.classList.remove("typing-done");

    lifeTypewriter02.textContent = "";
    lifeTypewriter02.classList.remove("typing-done");

    lifeTypewriter03.textContent = "";
    lifeTypewriter03.classList.remove("typing-done");

    showGuide(lifeDetailScene);

    if (!isGuideOpen) {
      typeTextGeneric(lifeTypewriter, lifeText);
    }
  }, 600);
}

// LIFE DETAIL
function goToLifeStep2() {
  lifeStep = 2;

  lifeDetail01.classList.add("hidden");
  lifeDetail02.classList.remove("hidden");
  lifeDetail03.classList.add("hidden");

  lifeTypewriter02.textContent = "";
  lifeTypewriter02.classList.remove("typing-done");

  typeTextGeneric(lifeTypewriter02, lifeText02);
}

function goToLifeStep3() {
  lifeStep = 3;

  lifeDetail02.classList.add("hidden");
  lifeDetail03.classList.remove("hidden");

  lifeTypewriter03.textContent = "";
  lifeTypewriter03.classList.remove("typing-done");

  typeTextGeneric(lifeTypewriter03, lifeText03);
}

function returnLifeToOrbit() {
  whiteTransition.classList.add("show");

  hideGuide();

  setTimeout(() => {
    lifeDetailScene.classList.add("hidden");
    lifeDetailInfo.classList.add("hidden");

    lifeDetailScene.classList.remove("guide-active");

    lifeDetail01.classList.remove("hidden");
    lifeDetail02.classList.add("hidden");
    lifeDetail03.classList.add("hidden");

    lifeTypewriter.textContent = "";
    lifeTypewriter.classList.remove("typing-done");

    lifeTypewriter02.textContent = "";
    lifeTypewriter02.classList.remove("typing-done");

    lifeTypewriter03.textContent = "";
    lifeTypewriter03.classList.remove("typing-done");

    isLifeDetailOpen = false;
    isLifePreviewLocked = false;
    currentState = "orbit";

    if (lifeStep === 3) {
      countViewedDetail();
      checkOrdinaryPrompt();
    }

    lifeStep = 1;

    orbitScene.classList.add("show");

    whiteTransition.classList.remove("show");
  }, 600);
}

// PAUSE DETAIL
function goToPauseStep2() {
  pauseStep = 2;

  pauseDetail01.classList.add("hidden");
  pauseDetail02.classList.remove("hidden");
  pauseDetail03.classList.add("hidden");

  pauseTypewriter02.textContent = "";
  pauseTypewriter02.classList.remove("typing-done");

  typeTextGeneric(pauseTypewriter02, pauseText02);
}

function goToPauseStep3() {
  pauseStep = 3;

  pauseDetail02.classList.add("hidden");
  pauseDetail03.classList.remove("hidden");

  pauseTypewriter03.textContent = "";
  pauseTypewriter03.classList.remove("typing-done");

  typeTextGeneric(pauseTypewriter03, pauseText03);
}

function returnPauseToOrbit() {
  whiteTransition.classList.add("show");

  hideGuide();

  setTimeout(() => {
    pauseDetailScene.classList.add("hidden");
    pauseDetailInfo.classList.add("hidden");

    pauseDetailScene.classList.remove("guide-active");

    pauseDetail01.classList.remove("hidden");
    pauseDetail02.classList.add("hidden");
    pauseDetail03.classList.add("hidden");

    pauseTypewriter.textContent = "";
    pauseTypewriter.classList.remove("typing-done");

    pauseTypewriter02.textContent = "";
    pauseTypewriter02.classList.remove("typing-done");

    pauseTypewriter03.textContent = "";
    pauseTypewriter03.classList.remove("typing-done");

    isPauseDetailOpen = false;
    isPausePreviewLocked = false;
    currentState = "orbit";

    if (pauseStep === 3) {
      countViewedDetail();
      checkOrdinaryPrompt();
    }

    pauseStep = 1;

    orbitScene.classList.add("show");

    whiteTransition.classList.remove("show");
  }, 600);
}

// SHOES DETAIL
function goToShoesStep2() {
  shoesStep = 2;

  shoesDetail01.classList.add("hidden");
  shoesDetail02.classList.remove("hidden");
  shoesDetail03.classList.add("hidden");

  shoesTypewriter02.textContent = "";
  shoesTypewriter02.classList.remove("typing-done");

  typeTextGeneric(shoesTypewriter02, shoesText02);
}

function goToShoesStep3() {
  shoesStep = 3;

  shoesDetail02.classList.add("hidden");
  shoesDetail03.classList.remove("hidden");

  shoesTypewriter03.textContent = "";
  shoesTypewriter03.classList.remove("typing-done");

  typeTextGeneric(shoesTypewriter03, shoesText03);
}

function returnShoesToOrbit() {
  whiteTransition.classList.add("show");

  hideGuide();

  setTimeout(() => {
    shoesDetailScene.classList.add("hidden");
    shoesDetailInfo.classList.add("hidden");

    shoesDetailScene.classList.remove("guide-active");

    shoesDetail01.classList.remove("hidden");
    shoesDetail02.classList.add("hidden");
    shoesDetail03.classList.add("hidden");

    shoesTypewriter.textContent = "";
    shoesTypewriter.classList.remove("typing-done");

    shoesTypewriter02.textContent = "";
    shoesTypewriter02.classList.remove("typing-done");

    shoesTypewriter03.textContent = "";
    shoesTypewriter03.classList.remove("typing-done");

    isShoesDetailOpen = false;
    isShoesPreviewLocked = false;
    currentState = "orbit";

    if (shoesStep === 3) {
      countViewedDetail();
      checkOrdinaryPrompt();
    }

    shoesStep = 1;

    orbitScene.classList.add("show");

    whiteTransition.classList.remove("show");
  }, 600);
}

// FEEDING DETAIL
function goToFeedingStep2() {
  feedingStep = 2;

  feedingDetail01.classList.add("hidden");
  feedingDetail02.classList.remove("hidden");
  feedingDetail03.classList.add("hidden");

  feedingTypewriter02.textContent = "";
  feedingTypewriter02.classList.remove("typing-done");

  typeTextGeneric(feedingTypewriter02, feedingText02);
}

function goToFeedingStep3() {
  feedingStep = 3;

  feedingDetail02.classList.add("hidden");
  feedingDetail03.classList.remove("hidden");

  feedingTypewriter03.textContent = "";
  feedingTypewriter03.classList.remove("typing-done");

  typeTextGeneric(feedingTypewriter03, feedingText03);
}

function returnFeedingToOrbit() {
  whiteTransition.classList.add("show");

  hideGuide();

  setTimeout(() => {
    feedingDetailScene.classList.add("hidden");
    feedingDetailInfo.classList.add("hidden");

    feedingDetailScene.classList.remove("guide-active");

    feedingDetail01.classList.remove("hidden");
    feedingDetail02.classList.add("hidden");
    feedingDetail03.classList.add("hidden");

    feedingTypewriter.textContent = "";
    feedingTypewriter.classList.remove("typing-done");

    feedingTypewriter02.textContent = "";
    feedingTypewriter02.classList.remove("typing-done");

    feedingTypewriter03.textContent = "";
    feedingTypewriter03.classList.remove("typing-done");

    isFeedingDetailOpen = false;
    isFeedingPreviewLocked = false;
    currentState = "orbit";

    if (feedingStep === 3) {
      countViewedDetail();
      checkOrdinaryPrompt();
    }

    feedingStep = 1;

    orbitScene.classList.add("show");

    whiteTransition.classList.remove("show");
  }, 600);
}


// TYPEWRITER
function typeTextGeneric(target, text, index = 0) {
  if (index < text.length) {
    target.textContent += text.charAt(index);

    setTimeout(() => {
      typeTextGeneric(target, text, index + 1);
    }, 45);
  } else {
    target.classList.add("typing-done");
  }
}

// LINGER SYMBOLS ON CLICK
let lingerInterval = null;

function createLingerSymbols(x, y, amount = 8) {
  const symbols = ["+", "x", "o"];

  for (let i = 0; i < amount; i++) {
    const symbol = document.createElement("span");
    symbol.className = "linger-symbol";
    symbol.textContent = symbols[Math.floor(Math.random() * symbols.length)];

    const angle = Math.random() * Math.PI * 2;
    const distance = 28 + Math.random() * 95;

    symbol.style.left = `${x}px`;
    symbol.style.top = `${y}px`;
    symbol.style.setProperty("--x", `${Math.cos(angle) * distance}px`);
    symbol.style.setProperty("--y", `${Math.sin(angle) * distance}px`);
    symbol.style.setProperty("--r", `${Math.random() * 220 - 110}deg`);

    document.body.appendChild(symbol);

    setTimeout(() => {
      symbol.remove();
    }, 850);
  }
}

document.addEventListener("mousedown", (event) => {
  const isInDetailScene =
    isPhoneDetailOpen ||
    isPeopleDetailOpen ||
    isRandomThingsDetailOpen ||
    isLifeDetailOpen ||
    isPauseDetailOpen ||
    isShoesDetailOpen ||
    isFeedingDetailOpen;

  if (!isInDetailScene) return;
  if (isGuideOpen) return;
  if (event.target.closest("button")) return;

  if (
    event.target.closest(".phone-detail-01, .phone-detail-02, .phone-detail-03") ||
    event.target.closest(".people-detail-01, .people-detail-02, .people-detail-03") ||
    event.target.closest(".random-things-detail-01, .random-things-detail-02, .random-things-detail-03") ||
    event.target.closest(".life-detail-01, .life-detail-02, .life-detail-03") ||
    event.target.closest(".pause-detail-01, .pause-detail-02, .pause-detail-03") ||
    event.target.closest(".shoes-detail-01, .shoes-detail-02, .shoes-detail-03") ||
    event.target.closest(".feeding-detail-01, .feeding-detail-02, .feeding-detail-03")
  ) {
    return;
  }

  createLingerSymbols(event.clientX, event.clientY, 10);

  lingerInterval = setInterval(() => {
    createLingerSymbols(targetCursorX, targetCursorY, 5);
  }, 120);
});

document.addEventListener("mouseup", () => {
  clearInterval(lingerInterval);
  lingerInterval = null;
});

document.addEventListener("mouseleave", () => {
  clearInterval(lingerInterval);
  lingerInterval = null;
});


// ORDINARY MESSAGE GENERATOR
const ordinaryMessageCta = document.getElementById("ordinary-message-cta");
const ordinaryMessageModal = document.getElementById("ordinary-message-modal");
const ordinaryNameInput = document.getElementById("ordinary-name-input");
const ordinaryContinue = document.getElementById("ordinary-continue");
const ordinaryCancel = document.getElementById("ordinary-cancel");
const ordinaryFinalMessage = document.getElementById("ordinary-final-message");

let viewedDetailCount = 0;
let ordinaryPromptShown = false;

const ordinaryMessages = [
  "{name}, maybe everything landed here for a reason.",
  "{name}, perhaps the smallest routines were proof that you kept going.",
  "{name}, even the quietest days leave something behind.",
  "{name}, perhaps what felt ordinary was care in disguise.",
  "{name}, maybe it was the tiny things that kept you going all along.",
  "{name}, not everything that held you together needed to make itself known.",
];

function checkOrdinaryPrompt() {
  if (viewedDetailCount >= 2 && !ordinaryPromptShown && currentState === "orbit") {
    ordinaryPromptShown = true;
    ordinaryMessageCta.classList.remove("hidden");
  }
}

function countViewedDetail() {
  viewedDetailCount += 1;
}

ordinaryMessageCta.addEventListener("click", () => {
  ordinaryMessageModal.classList.remove("hidden");
  ordinaryNameInput.value = "";
  ordinaryFinalMessage.textContent = "";
  ordinaryFinalMessage.classList.remove("show");
  ordinaryNameInput.focus();
});

ordinaryCancel.addEventListener("click", () => {
  ordinaryMessageModal.classList.add("hidden");
});

ordinaryContinue.addEventListener("click", () => {
  const userName = ordinaryNameInput.value.trim() || "you";

  const randomMessage =
    ordinaryMessages[Math.floor(Math.random() * ordinaryMessages.length)]
      .replace("{name}", userName);

  ordinaryFinalMessage.classList.remove("show");
  ordinaryFinalMessage.textContent = randomMessage;

  requestAnimationFrame(() => {
    ordinaryFinalMessage.classList.add("show");
  });
});