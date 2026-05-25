/* ============================================
   CHOLADO RACE — Game Logic & Board Rendering
   ============================================ */

// ==========================================
// BOARD DATA
// ==========================================

const MAIN_PATH = [
    [1,7],  [2,7],  [3,7],  [4,7],  [5,7],  [6,7],
    [7,6],  [7,5],  [7,4],  [7,3],  [7,2],  [7,1],
    [8,1],
    [9,1],  [9,2],  [9,3],  [9,4],  [9,5],  [9,6],
    [10,7], [11,7], [12,7], [13,7], [14,7], [15,7],
    [15,8],
    [15,9], [14,9], [13,9], [12,9], [11,9], [10,9],
    [9,10], [9,11], [9,12], [9,13], [9,14], [9,15],
    [8,15],
    [7,15], [7,14], [7,13], [7,12], [7,11], [7,10],
    [6,9],  [5,9],  [4,9],  [3,9],  [2,9],  [1,9],
    [1,8],
];

const HOME_STRETCHES = {
    green:  [[2,8], [3,8], [4,8], [5,8], [6,8]],     // Top arm
    red:    [[8,2], [8,3], [8,4], [8,5], [8,6]],     // Left arm
    blue:   [[14,8],[13,8],[12,8],[11,8],[10,8]],    // Bottom arm
    yellow: [[8,14],[8,13],[8,12],[8,11],[8,10]],    // Right arm
};

// Entry cell index on MAIN_PATH for each color
const ENTRIES = {
    green:  51,
    red:    12,
    blue:   25,
    yellow: 38,
};

// Starting path index when a token leaves the base
// (this maps exactly to the colored X cells where they should start)
const START_INDEX = {
    green:  2,
    red:    15,
    blue:   28,
    yellow: 41,
};

const X_CELLS = {
    2:  'green',
    15: 'red',
    28: 'blue',
    41: 'yellow',
};

const CARD_INDICES = new Set([
    1, 3, 5,
    6, 8, 10,
    17,
    19, 21, 23,
    27, 29, 31,
    33, 35, 37,
    40, 43,
    45, 47, 49, 50
]);

// ==========================================
// CARD DATA
// ==========================================

const CARDS = [
    { type: 'advance', steps: 3, text: 'Encuentras un mejor lugar dentro de la plaza donde hay más paso de personas.', action: 'Avanza 3 casillas' },
    { type: 'advance', steps: 2, text: 'Un turista prueba tu cholado y le encanta. ¡Te recomienda con todos sus amigos!', action: 'Avanza 2 casillas' },
    { type: 'advance', steps: 1, text: 'Consigues frutas frescas y económicas en el mercado. ¡Hoy tendrás más ganancia!', action: 'Avanza 1 casilla' },
    { type: 'advance', steps: 4, text: 'Una familia grande te compra 5 cholados de una vez. ¡Gran venta del día!', action: 'Avanza 4 casillas' },
    { type: 'advance', steps: 2, text: 'Inventas una nueva combinación de frutas que se vuelve la favorita del barrio.', action: 'Avanza 2 casillas' },
    { type: 'advance', steps: 3, text: 'El clima está perfecto: soleado y caluroso. ¡Todos quieren un cholado bien frío!', action: 'Avanza 3 casillas' },
    { type: 'advance', steps: 4, text: 'Un influencer local prueba tu cholado y lo publica en redes. ¡Se vuelve viral!', action: 'Avanza 4 casillas' },
    { type: 'advance', steps: 1, text: 'Tu vecino te presta un refrigerador más grande. ¡Puedes guardar más frutas!', action: 'Avanza 1 casilla' },
    { type: 'retreat', steps: -2, text: 'Un cliente discute por el precio y se va sin comprar, afectando tu flujo de ventas.', action: 'Retrocede 2 casillas' },
    { type: 'retreat', steps: -3, text: 'Se corta la luz y tu hielo se empieza a derretir. Debes conseguir más.', action: 'Retrocede 3 casillas' },
    { type: 'retreat', steps: -1, text: 'Llueve fuerte y no hay clientes por un rato. Toca esperar bajo el toldo.', action: 'Retrocede 1 casilla' },
    { type: 'retreat', steps: -2, text: 'La fruta que compraste hoy no estaba en buen estado. Debes ir a reemplazarla.', action: 'Retrocede 2 casillas' },
    { type: 'retreat', steps: -1, text: 'Un competidor se instala justo al lado tuyo y baja los precios. Pierdes clientes.', action: 'Retrocede 1 casilla' },
    { type: 'skip',   steps:  0, text: 'Te toca hacer una fila larga para renovar el permiso de ventas. ¡Qué demora!', action: 'Pierdes un turno' },
    { type: 'retreat', steps: -2, text: 'Se te cae un balde de leche condensada. Hay que comprar más y eso cuesta.', action: 'Retrocede 2 casillas' },
    { type: 'retreat', steps: -3, text: 'Hay una manifestación y cierran las calles de tu zona. Pocos clientes hoy.', action: 'Retrocede 3 casillas' },
];

// ==========================================
// SVG TEMPLATES
// ==========================================

function cardIconSVG() {
    return `<svg class="cell__icon" viewBox="0 0 28 28" fill="none">
        <rect x="3" y="6" width="13" height="17" rx="2" stroke="#999" stroke-width="1.5" fill="#f5f5f5" transform="rotate(-8 9.5 14.5)"/>
        <rect x="8" y="4" width="13" height="17" rx="2" stroke="#999" stroke-width="1.5" fill="white" transform="rotate(5 14.5 12.5)"/>
    </svg>`;
}

// ==========================================
// BOARD RENDERING
// ==========================================

function renderBoard() {
    const board = document.getElementById('board');

    MAIN_PATH.forEach(([row, col], index) => {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.style.gridRow = row;
        cell.style.gridColumn = col;
        cell.dataset.pathIndex = index;

        const entryColor = Object.entries(ENTRIES).find(([, idx]) => idx === index);
        const xColor = X_CELLS[index];
        const isCard = CARD_INDICES.has(index);

        if (entryColor) {
            const color = entryColor[0];
            cell.classList.add('cell--entry', `cell--entry-${color}`, 'cell--arrow');
            const rotations = { green: 90, red: 0, blue: -90, yellow: 180 };
            cell.innerHTML = `<svg viewBox="0 0 24 24" style="width:55%;height:55%;fill:none;stroke:white;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;transform:rotate(${rotations[color]}deg)">
                <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>`;
        } else if (xColor) {
            cell.classList.add('cell--x', `cell--x-${xColor}`);
            cell.innerHTML = `<svg viewBox="0 0 24 24" style="width:55%;height:55%;fill:none;stroke:white;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;">
                <path d="M6 6l12 12M6 18L18 6"/>
            </svg>`;
        } else if (isCard) {
            cell.classList.add('cell--card');
            cell.innerHTML = cardIconSVG();
        }

        board.appendChild(cell);
    });

    Object.entries(HOME_STRETCHES).forEach(([color, cells]) => {
        cells.forEach(([row, col], i) => {
            const cell = document.createElement('div');
            cell.className = `cell cell--home cell--home-${color}`;
            cell.style.gridRow = row;
            cell.style.gridColumn = col;
            cell.dataset.homeColor = color;
            cell.dataset.homeIndex = i;
            board.appendChild(cell);
        });
    });
}

// ==========================================
// DICE
// ==========================================

const DICE_PATTERNS = {
    1: [[2,2]],
    2: [[1,3],[3,1]],
    3: [[1,3],[2,2],[3,1]],
    4: [[1,1],[1,3],[3,1],[3,3]],
    5: [[1,1],[1,3],[2,2],[3,1],[3,3]],
    6: [[1,1],[1,3],[2,1],[2,3],[3,1],[3,3]],
};

let isDiceRolling = false;

function renderDice(value, color) {
    const dice = document.getElementById('dice');
    dice.innerHTML = '';
    dice.className = `dice dice--${color || 'blue'}`;
    for (let r = 1; r <= 3; r++) {
        for (let c = 1; c <= 3; c++) {
            const dot = document.createElement('div');
            const isActive = DICE_PATTERNS[value].some(([dr, dc]) => dr === r && dc === c);
            dot.className = `dice__dot${isActive ? '' : ' dice__dot--hidden'}`;
            dice.appendChild(dot);
        }
    }
}

// ==========================================
// AUDIO SYNTHESIS FOR DICE
// ==========================================
const AudioContextClass = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContextClass();

function playDiceSound() {
    if (isMuted) return;
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    // Dice roll is typically 3-4 clacks
    for (let i = 0; i < 4; i++) {
        setTimeout(() => playClack(), i * 120 + Math.random() * 60);
    }
}

function playClack() {
    if (isMuted) return;
    
    const bufferSize = audioCtx.sampleRate * 0.05; // 50ms
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1; // white noise
    }
    
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 4000 + Math.random() * 2000;
    filter.Q.value = 2;
    
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(1.5, audioCtx.currentTime); // Make it slightly louder
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.04);
    
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    noise.start();
}

function playBellSound() {
    if (isMuted) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const freqs = [880, 1760, 2640]; // A5, A6, E7
    const t = audioCtx.currentTime;
    
    freqs.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        
        // Attack
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.4 / (i + 1), t + 0.02);
        // Decay
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(t);
        osc.stop(t + 2);
    });
}

function playCardSound() {
    if (isMuted) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const bufferSize = audioCtx.sampleRate * 0.15; // 150ms
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    // Lowpass filter for paper-like sound
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, audioCtx.currentTime);
    filter.frequency.linearRampToValueAtTime(2500, audioCtx.currentTime + 0.05);
    filter.frequency.linearRampToValueAtTime(600, audioCtx.currentTime + 0.15);
    
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.8, audioCtx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    
    noise.start();
}

function rollDiceAnimated(color) {
    return new Promise(resolve => {
        if (isDiceRolling) return;
        isDiceRolling = true;
        
        playDiceSound();

        const dice = document.getElementById('dice');
        dice.classList.add('rolling');
        let count = 0;
        const maxChanges = 10;
        const interval = setInterval(() => {
            renderDice(Math.floor(Math.random() * 6) + 1, color);
            dice.classList.add('rolling');
            count++;
            if (count >= maxChanges) {
                clearInterval(interval);
                const finalValue = Math.floor(Math.random() * 6) + 1;
                renderDice(finalValue, color);
                dice.classList.remove('rolling');
                isDiceRolling = false;
                resolve(finalValue);
            }
        }, 80);
    });
}

// ==========================================
// GAME STATE
// ==========================================

const COLORS = ['green', 'yellow', 'red', 'blue'];
const COLOR_NAMES = { green: 'Verde', yellow: 'Amarillo', red: 'Rojo', blue: 'Azul' };

// Each token: { color, pathIndex (null = in base), homeIndex (null = not in home stretch), finished }
let tokens = {};
let turnOrder = [];       // array of colors in play order
let originalTurnOrder = []; // guardado para restaurar tras empate
let currentTurnIdx = 0;
let phase = 'roll-for-order'; // 'roll-for-order' | 'playing'
let rollForOrderResults = {};
let skipNextTurn = {};    // color -> true if they lose next turn
let pendingCardAction = null;  // card to apply after modal closes
let gameOver = false;
let isPaused = false;
let isMuted = false;

function initGameState() {
    const activeColors = getActiveColors(playerCount);

    // Always initialize ALL 4 colors so all tokens render in their base
    COLORS.forEach(color => {
        tokens[color] = { color, pathIndex: null, homeIndex: null, finished: false };
        skipNextTurn[color] = false;
    });

    // Only active colors participate in turns
    turnOrder = [...activeColors];
    originalTurnOrder = [...activeColors];
    currentTurnIdx = 0;
    phase = 'roll-for-order';
    rollForOrderResults = {};
    gameOver = false;
}

// ==========================================
// TOKEN RENDERING
// ==========================================

function getCellByPathIndex(index) {
    return document.querySelector(`.cell[data-path-index="${index}"]`);
}

function getCellByHome(color, homeIndex) {
    return document.querySelector(`.cell[data-home-color="${color}"][data-home-index="${homeIndex}"]`);
}

function renderAllTokens() {
    const activeColors = getActiveColors(playerCount);
    activeColors.forEach(color => {
        const tokenData = tokens[color];
        const tokenEl = document.getElementById(`token-${color}`);
        if (!tokenEl || !tokenData) return;

        // Siempre asegurar que el token activo sea visible
        tokenEl.style.display = '';
        tokenEl.style.visibility = 'visible';
        tokenEl.style.opacity = '1';

        if (tokenData.finished) {
            tokenEl.style.display = 'none';
            return;
        }
        if (tokenData.pathIndex === null && tokenData.homeIndex === null) {
            // in base
            const baseCircle = document.querySelector(`.base--${color} .base__circle`);
            if (baseCircle && tokenEl.parentNode !== baseCircle) {
                baseCircle.appendChild(tokenEl);
            }
        } else {
            let targetCell = null;
            if (tokenData.homeIndex !== null) {
                targetCell = getCellByHome(color, tokenData.homeIndex);
            } else if (tokenData.pathIndex !== null) {
                targetCell = getCellByPathIndex(tokenData.pathIndex);
            }
            
            if (targetCell && tokenEl.parentNode !== targetCell) {
                targetCell.appendChild(tokenEl);
            }
        }
    });
}

// ==========================================
// TURN BUTTON
// ==========================================

function updateTurnButton() {
    const btn = document.getElementById('turn-btn');
    const label = document.getElementById('turn-btn-label');
    if (!btn || !label) return;

    if (gameOver) {
        btn.style.display = 'none';
        return;
    }

    const color = turnOrder[currentTurnIdx];
    btn.style.display = 'flex';
    btn.dataset.color = color;

    // Update button color
    const colorMap = {
        green:  'var(--green)',
        yellow: 'var(--yellow)',
        red:    'var(--red)',
        blue:   'var(--blue)',
    };
    btn.style.background = colorMap[color];

    if (phase === 'roll-for-order') {
        label.textContent = 'Lanzar dado';
    } else {
        label.textContent = 'Lanzar dado';
    }
}

function setButtonDisabled(disabled) {
    const btn = document.getElementById('turn-btn');
    if (btn) btn.disabled = disabled;
    
    if (disabled) {
        stopTurnTimer();
    } else {
        startTurnTimer();
    }
}

// ==========================================
// TURN TIMER
// ==========================================
let turnTimerInterval = null;
let turnTimeRemaining = 10;
const TURN_TIME_LIMIT = 10;

function startTurnTimer() {
    stopTurnTimer();
    if (gameOver) return;
    
    // Only show timer during actual play, not during initial roll-for-order
    if (phase !== 'playing') return;
    
    const timerEl = document.getElementById('turn-timer');
    const barEl = document.getElementById('turn-timer-bar');
    if (!timerEl || !barEl) return;
    
    timerEl.classList.add('active');
    
    const color = turnOrder[currentTurnIdx];
    const colorMap = {
        green:  'var(--green)',
        yellow: 'var(--yellow)',
        red:    'var(--red)',
        blue:   'var(--blue)',
    };
    barEl.style.backgroundColor = colorMap[color];
    
    turnTimeRemaining = TURN_TIME_LIMIT;
    barEl.style.height = '100%';
    
    const updateInterval = 50; // ms for smooth animation
    const step = updateInterval / 1000;
    
    turnTimerInterval = setInterval(() => {
        turnTimeRemaining -= step;
        const pct = Math.max(0, (turnTimeRemaining / TURN_TIME_LIMIT) * 100);
        barEl.style.height = `${pct}%`;
        
        if (turnTimeRemaining <= 0) {
            stopTurnTimer();
            const btn = document.getElementById('turn-btn');
            if (btn && !btn.disabled) {
                // Auto roll
                btn.click();
            }
        }
    }, updateInterval);
}

function stopTurnTimer() {
    if (turnTimerInterval) {
        clearInterval(turnTimerInterval);
        turnTimerInterval = null;
    }
    const timerEl = document.getElementById('turn-timer');
    if (timerEl) timerEl.classList.remove('active');
}

function pauseTurnTimer() {
    // Just stop the interval, keep bar visible and turnTimeRemaining as-is
    if (turnTimerInterval) {
        clearInterval(turnTimerInterval);
        turnTimerInterval = null;
    }
}

function resumeTurnTimer() {
    if (gameOver || phase !== 'playing') return;
    if (turnTimeRemaining <= 0) return;
    
    const timerEl = document.getElementById('turn-timer');
    const barEl = document.getElementById('turn-timer-bar');
    if (!timerEl || !barEl) return;
    
    timerEl.classList.add('active');
    
    const updateInterval = 50;
    const step = updateInterval / 1000;
    
    // Check if there's a blinking cell (waiting for click)
    const blinkingCell = document.querySelector('.cell-blink');
    
    turnTimerInterval = setInterval(() => {
        turnTimeRemaining -= step;
        const pct = Math.max(0, (turnTimeRemaining / TURN_TIME_LIMIT) * 100);
        barEl.style.height = `${pct}%`;
        
        if (turnTimeRemaining <= 0) {
            stopTurnTimer();
            if (blinkingCell && blinkingCell._resolveClick) {
                blinkingCell._resolveClick();
            } else {
                const btn = document.getElementById('turn-btn');
                if (btn && !btn.disabled) {
                    btn.click();
                }
            }
        }
    }, updateInterval);
}

// ==========================================
// PHASE 1: ROLL FOR ORDER
// ==========================================

async function handleRollForOrder() {
    const color = turnOrder[currentTurnIdx];
    setButtonDisabled(true);

    const result = await rollDiceAnimated(color);
    rollForOrderResults[color] = result;

    showToast(`${COLOR_NAMES[color]} sacó ${result}`, color);

    await sleep(600);

    currentTurnIdx++;
    if (currentTurnIdx < turnOrder.length) {
        updateTurnButton();
        setButtonDisabled(false);
    } else {
        // All rolled — determine order
        await sleep(400);
        finalizeOrder();
    }
}

async function finalizeOrder() {
    const maxRoll = Math.max(...turnOrder.map(c => rollForOrderResults[c]));
    const winners = turnOrder.filter(c => rollForOrderResults[c] === maxRoll);

    // Si hay empate, los empatados vuelven a lanzar — con el flujo normal de click
    if (winners.length > 1) {
        showToast('¡Empate! Vuelven a lanzar', 'green', 2000);
        await sleep(2200);

        // Resetear resultados de los empatados y volver a fase de lanzamiento
        winners.forEach(c => { rollForOrderResults[c] = 0; });
        turnOrder = [...winners];
        currentTurnIdx = 0;
        phase = 'roll-for-order';

        updateTurnButton();
        setButtonDisabled(false);
        return;
    }

    const winner = winners[0];

    // Restaurar el orden original de jugadores antes de reordenar
    const counterClockwiseOrder = ['green', 'yellow', 'blue', 'red'].filter(c => originalTurnOrder.includes(c));
    const winnerIndex = counterClockwiseOrder.indexOf(winner);

    // Reordenar el arreglo para que empiece con el ganador y siga el sentido antihorario
    turnOrder = [
        ...counterClockwiseOrder.slice(winnerIndex),
        ...counterClockwiseOrder.slice(0, winnerIndex)
    ];

    currentTurnIdx = 0;
    phase = 'playing';

    const winnerNum = rollForOrderResults[winner];

    // Mostrar número más alto con el color del ganador
    showToast(`sacó ${winnerNum}`, winner, 1800);

    await sleep(2200);

    // ¡A jugar! sin fondo
    playBellSound();
    showToastPlain('¡A jugar!', winner, 1600);

    await sleep(1800);

    updateTurnButton();
    // Habilitar botón sin iniciar el timer — el timer empieza solo cuando hay celda destino
    const btn = document.getElementById('turn-btn');
    if (btn) btn.disabled = false;
    showEmojiPicker();
}

// ==========================================
// PHASE 2: PLAYING
// ==========================================

async function handlePlayerTurn() {
    const color = turnOrder[currentTurnIdx];
    const token = tokens[color];

    setButtonDisabled(true);

    // Handle skip turn
    if (skipNextTurn[color]) {
        skipNextTurn[color] = false;
        showToast(`${COLOR_NAMES[color]} pierde su turno`, color, 1800);
        await sleep(1200);
        advanceTurn();
        return;
    }

    const rolled = await rollDiceAnimated(color);
    
    // Find destination cell and wait for click
    const destCell = getDestinationCell(color, rolled);
    if (destCell) {
        // We can restart the turn timer here so they don't stall forever
        startTurnTimerForCell(destCell);
        await waitForCellClick(destCell, color);
        stopTurnTimer();
    }

    // Token is in base → need a 5 or 6 to exit (classic ludo rule)
    // But per the rules doc: first roll exits. Let's exit on any roll — just move
    // Actually rules say "lanza el dado y avanza", so any roll moves.
    // If token is in base → exit to start position
    if (token.pathIndex === null && token.homeIndex === null) {
        // Exit base and place at start, then advance remaining steps (rolled - 1)
        token.pathIndex = START_INDEX[color];
        checkCapture(color);
        renderAllTokens();
        await sleep(300);
        if (rolled > 1) {
            await moveTokenSteps(color, rolled - 1);
        }
    } else if (token.homeIndex !== null) {
        // Already in home stretch
        await moveTokenInHomeStretch(color, rolled);
    } else {
        // On the main path
        await moveTokenSteps(color, rolled);
    }

    // Check if landed on card cell
    await handleLandingEffects(color);
}

async function moveTokenSteps(color, steps) {
    const token = tokens[color];
    for (let i = 0; i < steps; i++) {
        await sleep(350);
        if (token.homeIndex !== null) {
            // Entered home stretch mid-move
            const remaining = steps - i;
            await moveTokenInHomeStretch(color, remaining);
            return;
        }

        const nextIndex = (token.pathIndex + 1) % MAIN_PATH.length;

        // Check if this color should enter home stretch
        const entryIdx = ENTRIES[color];
        if (token.pathIndex === entryIdx) {
            // Enter home stretch
            token.pathIndex = null;
            token.homeIndex = 0;
            renderAllTokens();
            const remaining = steps - i - 1;
            if (remaining > 0) {
                await sleep(350);
                await moveTokenInHomeStretch(color, remaining);
            }
            return;
        }

        token.pathIndex = nextIndex;
        renderAllTokens();
        checkCapture(color);
    }
}

async function moveTokenInHomeStretch(color, steps) {
    const token = tokens[color];
    const maxIndex = HOME_STRETCHES[color].length - 1; // 0-4, so max is 4

    for (let i = 0; i < steps; i++) {
        await sleep(350);
        const nextHomeIndex = token.homeIndex + 1;

        if (nextHomeIndex > maxIndex) {
            // Reached center — WIN!
            token.finished = true;
            token.homeIndex = null;
            renderAllTokens();
            await sleep(300);
            handleWin(color);
            return;
        }

        token.homeIndex = nextHomeIndex;
        renderAllTokens();
    }
}

function checkCapture(movingColor) {
    const movingToken = tokens[movingColor];
    COLORS.forEach(otherColor => {
        if (otherColor === movingColor) return;
        const otherToken = tokens[otherColor];
        if (otherToken.finished) return;
        if (otherToken.pathIndex === null) return;

        // Same path cell → capture (except X/safe cells and entry arrows)
        if (otherToken.pathIndex === movingToken.pathIndex) {
            const isXCell = X_CELLS[movingToken.pathIndex] !== undefined;
            const isEntryCell = Object.values(ENTRIES).includes(movingToken.pathIndex);
            if (!isXCell && !isEntryCell) {
                otherToken.pathIndex = null;
                otherToken.homeIndex = null;
                showToast(`¡${COLOR_NAMES[movingColor]} capturó a ${COLOR_NAMES[otherColor]}!`, movingColor, 2000);
            }
        }
    });
}

async function handleLandingEffects(color) {
    const token = tokens[color];
    if (token.homeIndex !== null || token.pathIndex === null) {
        advanceTurn();
        return;
    }

    if (CARD_INDICES.has(token.pathIndex)) {
        await sleep(300);
        const card = CARDS[Math.floor(Math.random() * CARDS.length)];
        pendingCardAction = { color, card };
        openCardModal(card);
        // Turn advances after modal closes (in closeCardModal)
    } else {
        advanceTurn();
    }
}

function applyCardAction(color, card) {
    const token = tokens[color];
    if (card.type === 'skip') {
        skipNextTurn[color] = true;
        advanceTurn();
        return;
    }
    if (card.steps === 0) {
        advanceTurn();
        return;
    }
    if (card.steps > 0) {
        moveTokenSteps(color, card.steps).then(() => advanceTurn());
    } else {
        // Retreat with animation
        const steps = Math.abs(card.steps);
        retreatTokenSteps(color, steps).then(() => advanceTurn());
    }
}

async function retreatTokenSteps(color, steps) {
    const token = tokens[color];
    if (token.pathIndex === null) return; // Cannot retreat if in base or home

    const startIdx = START_INDEX[color];

    for (let i = 0; i < steps; i++) {
        await sleep(350);

        // Si ya está en su casilla de inicio, no puede retroceder más
        if (token.pathIndex === startIdx) break;

        let newIndex = token.pathIndex - 1;
        if (newIndex < 0) newIndex = MAIN_PATH.length - 1;

        // Si el retroceso lo llevaría a su casilla de inicio o más atrás, se queda en el inicio
        const distFromStart = (token.pathIndex - startIdx + MAIN_PATH.length) % MAIN_PATH.length;
        if (distFromStart <= 1) {
            token.pathIndex = startIdx;
            renderAllTokens();
            checkCapture(color);
            break;
        }

        token.pathIndex = newIndex;
        renderAllTokens();
        checkCapture(color);
    }
}

function advanceTurn() {
    currentTurnIdx = (currentTurnIdx + 1) % turnOrder.length;
    updateTurnButton();
    setButtonDisabled(false);
}

function handleWin(color) {
    gameOver = true;
    const name = document.getElementById(`avatar-${color}`)?.querySelector('.avatar__name')?.textContent || COLOR_NAMES[color];
    showWinScreen(color, name);
}

// ==========================================
// CARD MODAL
// ==========================================

let isModalOpen = false;

function openCardModal(card) {
    playCardSound();
    const modal = document.getElementById('modal');
    const modalCard = document.getElementById('modal-card');
    document.getElementById('modal-text').textContent = card.text;
    document.getElementById('modal-action').textContent = card.action;

    if (card.type === 'retreat' || card.type === 'skip') {
        modalCard.classList.add('retreat');
        modalCard.classList.remove('advance');
    } else {
        modalCard.classList.add('advance');
        modalCard.classList.remove('retreat');
    }

    modal.classList.add('active');
    isModalOpen = true;
}

function closeCardModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('active');
    isModalOpen = false;

    if (pendingCardAction) {
        const { color, card } = pendingCardAction;
        pendingCardAction = null;
        applyCardAction(color, card);
    }
}

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================

function showToast(message, color, duration = 1600) {
    let toast = document.getElementById('game-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'game-toast';
        document.body.appendChild(toast);
    }
    const colorMap = {
        green: 'var(--green)', yellow: 'var(--yellow)',
        red: 'var(--red)', blue: 'var(--blue)',
    };
    toast.style.background = colorMap[color] || '#333';
    toast.style.color = 'white';

    const diceMatch = message.match(/sacó\s+(\d+)/);
    if (diceMatch) {
        const num = diceMatch[1];
        const label = message.replace(/sacó\s+\d+/, '').trim();
        // Si no hay label (viene de finalizeOrder), mostrar "Empieza [COLOR_NAME]"
        const topLine = label || '';
        const bottomLine = label === '' ? `Empieza ${COLOR_NAMES[color]}` : '';
        toast.innerHTML = `
            ${topLine ? `<div style="font-size:0.5em;font-weight:700;opacity:0.85;margin-bottom:4px;letter-spacing:1px;text-transform:uppercase">${topLine}</div>` : ''}
            <div style="font-size:2em;line-height:1;font-weight:900;letter-spacing:-1px">${num}</div>
            ${bottomLine ? `<div style="font-size:0.5em;font-weight:700;opacity:0.9;margin-top:6px;letter-spacing:0.5px;text-transform:uppercase">${bottomLine}</div>` : ''}
        `;
    } else {
        toast.innerHTML = `<span>${message}</span>`;
    }

    toast.classList.add('visible');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => toast.classList.remove('visible'), duration);
}

function showToastPlain(message, color, duration = 1600) {
    let toast = document.getElementById('game-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'game-toast';
        document.body.appendChild(toast);
    }
    const colorMap = {
        green: 'var(--green)', yellow: 'var(--yellow)',
        red: 'var(--red)', blue: 'var(--blue)',
    };
    toast.style.background = 'transparent';
    toast.style.boxShadow = 'none';
    toast.style.color = colorMap[color] || '#333';
    toast.innerHTML = `<span>${message}</span>`;
    
    if (message === '¡A jugar!') {
        toast.classList.add('toast--title');
    } else {
        toast.classList.remove('toast--title');
        toast.style.left = '';
        toast.style.top = '';
        toast.style.transform = '';
    }

    toast.classList.add('visible');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('visible');
        // Restaurar estilos para próximos toasts normales
        setTimeout(() => {
            toast.style.background = '';
            toast.style.boxShadow = '';
            toast.style.color = '';
            toast.classList.remove('toast--title');
        }, 350);
    }, duration);
}

// ==========================================
// WIN SCREEN
// ==========================================

function showWinScreen(color, name) {
    let win = document.getElementById('win-screen');
    if (!win) {
        win = document.createElement('div');
        win.id = 'win-screen';
        document.body.appendChild(win);
    }
    const colorMap = {
        green: 'var(--green)', yellow: 'var(--yellow)',
        red: 'var(--red)', blue: 'var(--blue)',
    };
    win.innerHTML = `
        <div class="win-card">
            <div class="win-emoji">🏆</div>
            <div class="win-title">¡${name} ganó!</div>
            <div class="win-sub">Completó el día de ventas primero</div>
            <button class="win-btn" onclick="goToMultiplayer()">Jugar de nuevo</button>
        </div>
    `;
    win.style.setProperty('--win-color', colorMap[color]);
    win.classList.add('visible');
}

// ==========================================
// UTILS
// ==========================================

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function initEvents() {
    // Main turn button
    document.getElementById('turn-btn').addEventListener('click', async () => {
        if (gameOver || isDiceRolling || isPaused) return;
        if (phase === 'roll-for-order') {
            handleRollForOrder();
        } else {
            handlePlayerTurn();
        }
    });

    // Modal close on backdrop
    document.getElementById('modal-backdrop').addEventListener('click', closeCardModal);

    // Modal close button (X)
    document.getElementById('modal-close-btn').addEventListener('click', closeCardModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isModalOpen) closeCardModal();
    });

    document.getElementById('modal-card').addEventListener('click', (e) => e.stopPropagation());

    // Deck click still works as manual card draw (decorative)
    document.getElementById('deck').addEventListener('click', () => {
        if (phase !== 'playing') return;
        // No-op in gameplay mode; cards are auto-drawn on landing
    });

    // Player count selection screen
    const countButtons = document.querySelectorAll('.btn-count');
    countButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            countButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            let count = parseInt(btn.dataset.count);
            // Limit 1 to 2 minimum for logic purposes
            if (count === 1) count = 2; 
            renderPlayerInputs(count);
        });
    });

    // Start Game button
    document.getElementById('btn-start-game').addEventListener('click', () => {
        const activeCountBtn = document.querySelector('.btn-count.active');
        let count = parseInt(activeCountBtn.dataset.count);
        if (count === 1) count = 2; // Min 2 players

        const inputs = document.querySelectorAll('.player-name-input');
        const customNames = [];
        inputs.forEach((input, index) => {
            customNames.push(input.value.trim() || `Jugador ${index + 1}`);
        });

        startGame(count, customNames);
    });

    // Start screen → multiplayer selection
    document.getElementById('btn-iniciar').addEventListener('click', () => {
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('multiplayer-screen').classList.remove('hidden');
        document.getElementById('global-nav').classList.remove('hidden');
        document.getElementById('global-nav-right').classList.remove('hidden');
        // Default select 4 players visually
        document.querySelector('.btn-count[data-count="4"]').click();
    });

    // Global Nav Buttons
    document.getElementById('nav-btn-home').addEventListener('click', () => {
        location.reload(); // Hard reset to home screen
    });

    document.getElementById('nav-btn-back').addEventListener('click', () => {
        const gameScreen = document.getElementById('game-screen');
        const multiplayerScreen = document.getElementById('multiplayer-screen');
        
        if (gameScreen.style.display !== 'none') {
            // In game -> go back to multiplayer
            gameScreen.style.display = 'none';
            multiplayerScreen.classList.remove('hidden');
            stopTurnTimer();
            // Reset game state to prevent bugs if they start again
            gameOver = true;
        } else if (!multiplayerScreen.classList.contains('hidden')) {
            // In multiplayer -> go back to home
            multiplayerScreen.classList.add('hidden');
            document.getElementById('start-screen').classList.remove('hidden');
            document.getElementById('global-nav').classList.add('hidden');
            document.getElementById('global-nav-right').classList.add('hidden');
        }
    });

    // Pause button
    document.getElementById('nav-btn-pause').addEventListener('click', () => {
        isPaused = !isPaused;
        const iconPause = document.getElementById('icon-pause');
        const iconPlay = document.getElementById('icon-play');
        
        document.body.classList.toggle('is-paused', isPaused);
        
        if (isPaused) {
            iconPause.classList.add('hidden-icon');
            iconPlay.classList.remove('hidden-icon');
            pauseTurnTimer(); // Freeze timer without resetting
        } else {
            iconPlay.classList.add('hidden-icon');
            iconPause.classList.remove('hidden-icon');
            resumeTurnTimer(); // Continue from where it left off
        }
    });

    // Volume button
    document.getElementById('nav-btn-vol').addEventListener('click', () => {
        isMuted = !isMuted;
        const iconVolOn = document.getElementById('icon-vol-on');
        const iconVolOff = document.getElementById('icon-vol-off');
        if (isMuted) {
            iconVolOn.classList.add('hidden-icon');
            iconVolOff.classList.remove('hidden-icon');
        } else {
            iconVolOff.classList.add('hidden-icon');
            iconVolOn.classList.remove('hidden-icon');
        }
        // Apply muting logic to all audio elements if they existed
        const audios = document.querySelectorAll('audio');
        audios.forEach(a => a.muted = isMuted);
    });

    // Emoji Picker
    document.getElementById('emoji-toggle').addEventListener('click', () => {
        const panel = document.getElementById('emoji-panel');
        panel.classList.toggle('hidden');
    });

    document.querySelectorAll('.emoji-pick').forEach(btn => {
        btn.addEventListener('click', () => {
            const emoji = btn.dataset.emoji;
            const color = turnOrder[currentTurnIdx];
            showEmojiBubble(color, emoji);
            document.getElementById('emoji-panel').classList.add('hidden');
        });
    });

    // Close emoji panel when clicking outside
    document.addEventListener('click', (e) => {
        const picker = document.getElementById('emoji-picker');
        if (picker && !picker.contains(e.target)) {
            document.getElementById('emoji-panel').classList.add('hidden');
        }
    });
}

// ==========================================
// EMOJI BUBBLE
// ==========================================

function showEmojiBubble(color, emoji) {
    const avatar = document.getElementById(`avatar-${color}`);
    if (!avatar) return;

    // Remove any existing bubble on this avatar
    const existing = avatar.querySelector('.emoji-bubble');
    if (existing) existing.remove();

    const bubble = document.createElement('span');
    bubble.className = 'emoji-bubble';
    bubble.textContent = emoji;
    avatar.appendChild(bubble);

    // Remove after animation ends (3.5s)
    setTimeout(() => bubble.remove(), 3600);
}

function showEmojiPicker() {
    const picker = document.getElementById('emoji-picker');
    if (picker && phase === 'playing') {
        picker.classList.add('active');
    }
}

function hideEmojiPicker() {
    const picker = document.getElementById('emoji-picker');
    if (picker) {
        picker.classList.remove('active');
        document.getElementById('emoji-panel').classList.add('hidden');
    }
}

// ==========================================
// INITIALIZATION
// ==========================================

let playerCount = 4; // default

// Active colors per player count
function getActiveColors(count) {
    if (count === 2) return ['yellow', 'red'];
    if (count === 3) return ['green', 'yellow', 'red'];
    return ['green', 'yellow', 'red', 'blue'];
}

function renderPlayerInputs(count) {
    const container = document.getElementById('player-names-container');
    container.innerHTML = '';

    const colors = getActiveColors(count);

    colors.forEach((color, i) => {
        const group = document.createElement('div');
        group.className = 'player-input-group';

        const indicator = document.createElement('div');
        indicator.className = `player-color-indicator indicator--${color}`;

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'player-name-input';
        input.placeholder = `Jugador ${i + 1}`;

        group.appendChild(indicator);
        group.appendChild(input);
        container.appendChild(group);
    });

    document.getElementById('btn-start-game').disabled = false;
}

function startGame(count, customNames) {
    playerCount = count;
    document.getElementById('multiplayer-screen').classList.add('hidden');
    document.getElementById('game-screen').style.display = '';

    const allColors = ['green', 'yellow', 'red', 'blue'];
    const activeColors = getActiveColors(count);
    const inactiveColors = allColors.filter(c => !activeColors.includes(c));

    // Show active avatars and bases
    activeColors.forEach(c => {
        document.getElementById(`avatar-${c}`).style.display = 'flex';
        document.querySelector(`.base--${c}`).style.visibility = 'visible';
        const tokenEl = document.getElementById(`token-${c}`);
        if (tokenEl) tokenEl.style.display = '';
    });

    // Hide inactive avatars, bases and tokens
    inactiveColors.forEach(c => {
        document.getElementById(`avatar-${c}`).style.display = 'none';
        document.querySelector(`.base--${c}`).style.visibility = 'hidden';
        const tokenEl = document.getElementById(`token-${c}`);
        if (tokenEl) tokenEl.style.display = 'none';
    });

    // Apply names: customNames[i] maps to activeColors[i]
    activeColors.forEach((color, i) => {
        const name = (customNames && customNames[i] && customNames[i].trim() !== '')
            ? customNames[i].trim()
            : `Jugador ${i + 1}`;
        const nameEl = document.querySelector(`#avatar-${color} .avatar__name`);
        if (nameEl) nameEl.textContent = name;
    });

    // Limpiar celdas del tablero antes de renderizar
    const board = document.getElementById('board');
    board.querySelectorAll('.cell').forEach(c => c.remove());

    renderBoard();
    renderDice(5, activeColors[0]);

    // Resetear TODOS los tokens: activos a su base, inactivos ocultos
    ['green', 'yellow', 'red', 'blue'].forEach(c => {
        const tokenEl = document.getElementById(`token-${c}`);
        const baseCircle = document.querySelector(`.base--${c} .base__circle`);
        if (tokenEl && baseCircle) {
            baseCircle.appendChild(tokenEl);
            if (activeColors.includes(c)) {
                tokenEl.style.display = '';
                tokenEl.style.visibility = 'visible';
                tokenEl.style.opacity = '1';
            } else {
                tokenEl.style.display = 'none';
            }
        }
    });

    initGameState();

    // Forzar render inicial de tokens en sus bases
    renderAllTokens();

    // Show intro banner then start the game flow
    showIntroBanner(() => {
        updateTurnButton();
    });
}

function showIntroBanner(callback) {
    const banner = document.getElementById('intro-banner');
    const box = banner.querySelector('.intro-banner__box');

    banner.classList.remove('hidden');
    box.classList.remove('hiding');

    // Auto-dismiss after 3.5 seconds
    setTimeout(() => {
        box.classList.add('hiding');
        setTimeout(() => {
            banner.classList.add('hidden');
            if (callback) callback();
        }, 380);
    }, 3500);
}

function createSnowfall() {
    const container = document.createElement('div');
    container.id = 'snow-container';
    document.body.prepend(container);

    // Array of different snowflake characters for variety
    const flakes = ['❄', '❅', '❆'];

    // Create 40 particles
    for (let i = 0; i < 40; i++) {
        const flake = document.createElement('div');
        flake.className = 'snowflake';
        flake.textContent = flakes[Math.floor(Math.random() * flakes.length)];
        
        // Randomize properties
        const size = Math.random() * 12 + 10; // 10px to 22px
        const left = Math.random() * 100; // 0 to 100%
        const duration = Math.random() * 10 + 12; // 12s to 22s
        const delay = Math.random() * 20; // 0 to 20s delay
        const opacity = Math.random() * 0.5 + 0.3; // 0.3 to 0.8

        flake.style.fontSize = `${size}px`;
        flake.style.left = `${left}%`;
        flake.style.animationDuration = `${duration}s`;
        flake.style.animationDelay = `-${delay}s`; // start midway
        flake.style.opacity = opacity;

        container.appendChild(flake);
    }
}

// ==========================================
// MANUAL MOVE CLICK LOGIC
// ==========================================

function getDestinationCell(color, rolled) {
    const token = tokens[color];
    let pathIndex = token.pathIndex;
    let homeIndex = token.homeIndex;
    let remainingSteps = rolled;
    
    // Si está en casa, sale a la posición inicial
    if (pathIndex === null && homeIndex === null) {
        pathIndex = START_INDEX[color];
        remainingSteps--;
    }
    
    // Si ya está en la recta final
    if (homeIndex !== null) {
        let targetHome = homeIndex + remainingSteps;
        if (targetHome > HOME_STRETCHES[color].length - 1) {
            return document.querySelector('.center');
        }
        return getCellByHome(color, targetHome);
    }
    
    // Avanzar por el camino principal
    for (let i = 0; i < remainingSteps; i++) {
        if (pathIndex === ENTRIES[color]) {
            pathIndex = null;
            homeIndex = remainingSteps - i - 1;
            if (homeIndex > HOME_STRETCHES[color].length - 1) {
                return document.querySelector('.center');
            }
            return getCellByHome(color, homeIndex);
        }
        pathIndex = (pathIndex + 1) % MAIN_PATH.length;
    }
    
    return getCellByPathIndex(pathIndex);
}

function waitForCellClick(cell, color) {
    return new Promise(resolve => {
        if (!cell) {
            resolve();
            return;
        }
        
        const tokenEl = document.getElementById(`token-${color}`);
        
        cell.classList.add('cell-blink');
        if (tokenEl) tokenEl.classList.add('token-blink');
        
        const onClick = () => {
            if (isPaused) return;
            cell.classList.remove('cell-blink');
            if (tokenEl) tokenEl.classList.remove('token-blink');
            
            cell.removeEventListener('click', onClick);
            if (tokenEl) tokenEl.removeEventListener('click', onClick);
            
            resolve();
        };
        
        cell.addEventListener('click', onClick);
        if (tokenEl) tokenEl.addEventListener('click', onClick);
        
        // Guardar referencia por si el timer auto-clickea
        cell._resolveClick = onClick;
    });
}

function startTurnTimerForCell(cell) {
    stopTurnTimer();
    if (gameOver) return;
    
    const timerEl = document.getElementById('turn-timer');
    const barEl = document.getElementById('turn-timer-bar');
    if (!timerEl || !barEl) return;
    
    timerEl.classList.add('active');
    
    const color = turnOrder[currentTurnIdx];
    const colorMap = {
        green:  'var(--green)',
        yellow: 'var(--yellow)',
        red:    'var(--red)',
        blue:   'var(--blue)',
    };
    barEl.style.backgroundColor = colorMap[color];
    
    turnTimeRemaining = TURN_TIME_LIMIT;
    barEl.style.height = '100%';
    
    const updateInterval = 50;
    const step = updateInterval / 1000;
    
    turnTimerInterval = setInterval(() => {
        turnTimeRemaining -= step;
        const pct = Math.max(0, (turnTimeRemaining / TURN_TIME_LIMIT) * 100);
        barEl.style.height = `${pct}%`;
        
        if (turnTimeRemaining <= 0) {
            stopTurnTimer();
            if (cell && cell._resolveClick) {
                cell._resolveClick(); // Auto click if time runs out
            }
        }
    }, updateInterval);
}

document.addEventListener('DOMContentLoaded', () => {
    initEvents();
    createSnowfall();
});

function goToMultiplayer() {
    // Ocultar win screen y game screen
    const winScreen = document.getElementById('win-screen');
    if (winScreen) winScreen.classList.remove('visible');

    document.getElementById('game-screen').style.display = 'none';

    // Resetear el tablero
    const board = document.getElementById('board');
    const cells = board.querySelectorAll('.cell');
    cells.forEach(c => c.remove());

    // Mover las fichas de vuelta a sus bases
    ['green', 'yellow', 'red', 'blue'].forEach(color => {
        const tokenEl = document.getElementById(`token-${color}`);
        const baseCircle = document.querySelector(`.base--${color} .base__circle`);
        if (tokenEl && baseCircle) baseCircle.appendChild(tokenEl);
    });

    // Mostrar la pantalla de multijugadores
    document.getElementById('multiplayer-screen').classList.remove('hidden');
}
