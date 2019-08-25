const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

// scale everything 20 times (to see shapes - T)
context.scale(20, 20);

function draw() {
    // specifies the color, gradient, or pattern to use inside shapes. The default style is #000 (black).
    context.fillStyle = '#000';
    // fill a rectangle of size starting from (0, 0)
    context.fillRect(0, 0, canvas.width, canvas.height)

    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.tetrominoes, player.pos);
}

function drawMatrix(matrix, {x: offsetX, y: offsetY}) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value === 0) return;
    
            context.fillStyle = colors[value];
            context.fillRect(x + offsetX,
                            y + offsetY,
                            1, 1);
        });
    });
}

function createPiece(type) {
    if (type === 'T') {
        return [
            // extra 0 row for rotation
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0],
        ];
    } else if (type === 'O') {
        return [
          // extra 0 row for rotation
          [2, 2],
          [2, 2],
        ];
    } else if (type === 'L') {
        return [
            // extra 0 row for rotation
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3],
        ];
    } else if (type === 'J') {
        return [
            // extra 0 row for rotation
            [0, 4, 0],
            [0, 4, 0],
            [4, 4, 0],
        ];
    } else if (type === 'I') {
        return [
            // extra 0 row for rotation
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            // extra 0 row for rotation
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'Z') {
        return [
            // extra 0 row for rotation
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0],
        ];
    }
}

const colors = [
    null, // 0 is nothing
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
]

const player = {
    pos: {x: 0, y: 0},
    tetrominoes: null,
    score: 0,
}

function createTetrominoes(w, h) {
    const tetros = [];
    while(h--) {
        tetros.push(new Array(w).fill(0));
    }
    return tetros;
}

const arena = createTetrominoes(12, 20);

function arenaSweep() {
    let rowCount = 1;

    outer: for (let y = arena.length - 1; y >= 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) continue outer;
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        player.score += rowCount * 10;
        rowCount *= 2;
    }
}

function collide(arena, player) {
    const [m, o] = [player.tetrominoes, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0
                && (arena[y + o.y]
                    && arena[y + o.y][x + o.x]) !== 0) return true;
        }
    }
    return false;
}

function merge(arena, player) {
    player.tetrominoes.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value === 0) return;

            arena[y + player.pos.y][x + player.pos.x] = value;
        });
    });
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if(collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function playerReset() {
    const pieces = 'ILJOTSZ';
    player.tetrominoes = createPiece(pieces[pieces.length * Math.random() | 0]); //floor using 0
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) 
                    - (player.tetrominoes[0].length / 2 | 0);

    if(collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
}

function playerRotate(dir) {
    const posX = player.pos.x;
    let offset = 1;
    rotate(player.tetrominoes, dir);
    while(collide(arena, player)) {
        player.pos.x += offset;
        offset = - (offset + (offset > 0 ? 1 : -1));
        if (offset > player.tetrominoes[0].length) {
            rotate(player.tetrominoes, -dir);
            player.pos.x = posX;
            return;
        }
    }
}


function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            // swap syntactic sugar
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }
    if (dir > 0) {
        matrix.forEach((row => row.reverse()));
    } else {
        matrix.reverse();
    }
}

let dropCounter = 0;
let dropInterval = 1000; // 1 sec
function dropPlayer(deltaTime) {
    dropCounter += deltaTime;
    if(dropCounter < dropInterval) return;

    playerDrop();
}

// called on every repaint
let lastTime = 0;
function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropPlayer(deltaTime);

    draw();
    // tells the browser that you wish to perform an animation and requests that the browser call a specified function to update an animation before the next repaint. The method takes a callback as an argument to be invoked before the repaint.
    requestAnimationFrame(update);
}

document.addEventListener('keydown', event => {
    if (event.keyCode === 37) { // left
        playerMove(-1);
    } else if (event.keyCode === 39) { // right
        playerMove(1);
    } else if (event.keyCode === 40) { // down
        playerDrop();
    } else if (event.keyCode === 81) { // Q
        playerRotate(-1);
    } else if (event.keyCode === 87) { // W
        playerRotate(1);
    }
})

function updateScore() {
    document.getElementById('score').innerText = player.score;
}

playerReset();
updateScore();
update();