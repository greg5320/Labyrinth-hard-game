const colors = ['black', 'purple', 'orange', 'blue', 'red', 'cyan'];
let currentLevel = 0;
let mazeSize = 25;
const maze = [];
const directions = [
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 }
];
let finish = false;
let intervalId;
let prevTapTime = Date.now()


let playerPosition = { x: mazeSize - 1, y: Math.floor(mazeSize / 2) };
let enemyPosition = { x: 0, y: Math.floor(mazeSize / 2) };

function createMaze() {
  for (let i = 0; i < mazeSize; i++) {
    maze[i] = [];
    for (let j = 0; j < mazeSize; j++) {
      maze[i][j] = { x: i, y: j, wall: true };
    }
  }
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function updateLevelDisplay() {
  const levelDisplay = document.getElementById('level-display');
  levelDisplay.textContent = `Level: ${currentLevel + 1}`;
}


function generateMaze(x, y) {
  maze[x][y].wall = false;
  shuffle(directions);

  for (let dir of directions) {
    const newX = x + dir.x * 2;
    const newY = y + dir.y * 2;

    if (newX > 0 && newX < mazeSize && newY > 0 && newY < mazeSize && maze[newX][newY].wall) {
      maze[x + dir.x][y + dir.y].wall = false;
      generateMaze(newX, newY);
    }
  }
}


function addRoomsAndExtraPaths() {
  const roomSize = 1; 
  const numRooms = Math.floor(mazeSize / 5); 

  for (let i = 0; i < numRooms; i++) {
    const roomX = Math.floor(Math.random() * (mazeSize - roomSize - 1)) + 1;
    const roomY = Math.floor(Math.random() * (mazeSize - roomSize - 1)) + 1;

    
    for (let dx = 0; dx < roomSize; dx++) {
      for (let dy = 0; dy < roomSize; dy++) {
        maze[roomX + dx][roomY + dy].wall = false;
      }
    }
  }

  
  const extraPaths = Math.floor(mazeSize / 3); 

  for (let i = 0; i < extraPaths; i++) {
    const startX = Math.floor(Math.random() * mazeSize);
    const startY = Math.floor(Math.random() * mazeSize);
    const direction = directions[Math.floor(Math.random() * directions.length)];

    const endX = startX + direction.x;
    const endY = startY + direction.y;

    if (
      endX > 0 && endX < mazeSize &&
      endY > 0 && endY < mazeSize &&
      !maze[endX][endY].wall
    ) {
      maze[startX][startY].wall = false;
    }
  }
}

function drawMaze() {
  const mazeContainer = document.getElementById('maze');
  mazeContainer.innerHTML = '';
  
 
  const cellSize = mazeSize > 45 ? 15 : 20; 
  mazeContainer.style.gridTemplateColumns = `repeat(${mazeSize}, ${cellSize}px)`;
  mazeContainer.style.gridTemplateRows = `repeat(${mazeSize}, ${cellSize}px)`;

  for (let i = 0; i < mazeSize; i++) {
    for (let j = 0; j < mazeSize; j++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      if (maze[i][j].wall) {
        cell.style.backgroundColor = colors[Math.min(currentLevel, colors.length - 1)];
        cell.classList.add('wall');
      } else {
        cell.classList.add('path');
      }
      mazeContainer.appendChild(cell);
    }
  }
}

function createEntranceAndExit() {
  const entrance = { x: mazeSize - 1, y: Math.floor(mazeSize / 2) };
  maze[entrance.x][entrance.y].start = true;
  maze[entrance.x][entrance.y].wall = false;
  const entrance1 = { x: mazeSize - 2, y: Math.floor(mazeSize / 2) };
  maze[entrance1.x][entrance1.y].start = true;
  maze[entrance1.x][entrance1.y].wall = false;

  const exit = { x: 0, y: Math.floor(mazeSize / 2) };
  maze[exit.x][exit.y].end = true;
  maze[exit.x][exit.y].wall = false;
  const exit1 = { x: 1, y: Math.floor(mazeSize / 2) };
  maze[exit1.x][exit1.y].end = false;
  maze[exit1.x][exit1.y].wall = false;
  drawMaze();
  drawPlayer();
  drawEnemy();
}

function drawPlayer() {
  const oldPlayerCell = document.querySelector('.player');
  if (oldPlayerCell) {
    oldPlayerCell.classList.remove('player');
    oldPlayerCell.style.width = '';  
    oldPlayerCell.style.height = '';
    oldPlayerCell.style.borderRadius = '';
  }

  const newPlayerIndex = playerPosition.y + 1 + mazeSize * playerPosition.x;
  const newPlayerCell = document.querySelector(`#maze div:nth-child(${newPlayerIndex})`);

  const cellSize = mazeSize > 45 ? 15 : 20;
  const playerSize = cellSize * 0.8; 

  newPlayerCell.classList.add('player');
  newPlayerCell.style.width = `${playerSize}px`; 
  newPlayerCell.style.height = `${playerSize}px`;
  newPlayerCell.style.borderRadius = `${playerSize / 2}px`; 
}

function drawEnemy() {
  const oldEnemyCell = document.querySelector('.enemy');
  if (oldEnemyCell) {
    oldEnemyCell.classList.remove('enemy');
    oldEnemyCell.style.width = '';  // сбрасываем измененные стили
    oldEnemyCell.style.height = '';
    oldEnemyCell.style.borderRadius = '';
  }

  const newEnemyIndex = enemyPosition.y + 1 + mazeSize * enemyPosition.x;
  const newEnemyCell = document.querySelector(`#maze div:nth-child(${newEnemyIndex})`);

 
  const cellSize = mazeSize > 45 ? 15 : 20;
  const enemySize = cellSize * 0.8; 

  newEnemyCell.classList.add('enemy');
  newEnemyCell.style.width = `${enemySize}px`; 
  newEnemyCell.style.height = `${enemySize}px`;
  newEnemyCell.style.borderRadius = `${enemySize / 2}px`;
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function movePlayer(dx, dy) {
  const newX = playerPosition.x + dx;
  const newY = playerPosition.y + dy;

  if (newX >= 0 && newX < mazeSize && newY >= 0 && newY < mazeSize && !maze[newX][newY].wall) {
    playerPosition.x = newX;
    playerPosition.y = newY;
    drawPlayer();

    if (maze[playerPosition.x][playerPosition.y].end) {
      currentLevel++;
      mazeSize += 4;
      updateLevelDisplay(); 
      resetGame();
    } else {
      let timeDelta = Date.now() - prevTapTime
      let delta = getRandomArbitrary(timeDelta / 2,timeDelta*2)
      if (delta > 200) {
        delta =  getRandomArbitrary(150, 250)
      } else if (delta < 50) {
        delta =  getRandomArbitrary(50, 75)
      }
      prevTapTime = Date.now()
      clearInterval(intervalId)
      intervalId = setInterval(moveEnemy, delta);
    }
  }
}

document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'ArrowUp':
      movePlayer(-1, 0);
      break;
    case 'ArrowDown':
      movePlayer(1, 0);
      break;
    case 'ArrowLeft':
      movePlayer(0, -1);
      break;
    case 'ArrowRight':
      movePlayer(0, 1);
      break;
  }
});



function bfs(start, goal) {
  const queue = [start];
  const cameFrom = {};
  const visited = new Set();
  visited.add(`${start.x},${start.y}`);

  while (queue.length > 0) {
    const current = queue.shift();

    for (const { x, y } of directions) {
      const neighbor = { x: current.x + x, y: current.y + y };

      if (neighbor.x < 0 || neighbor.x >= mazeSize || neighbor.y < 0 || neighbor.y >= mazeSize) {
        continue;
      }

      if (!maze[neighbor.x] || !maze[neighbor.x][neighbor.y]) {
        continue;
      }

      if (maze[neighbor.x][neighbor.y].wall) {
        continue;
      }

      if (!visited.has(`${neighbor.x},${neighbor.y}`)) {
        visited.add(`${neighbor.x},${neighbor.y}`);
        queue.push(neighbor);
        cameFrom[`${neighbor.x},${neighbor.y}`] = current;
      }
    }
  }

  return reconstructPath(goal, cameFrom);
}



function reconstructPath(goal, cameFrom) {
  const path = [];
  let current = goal;

  while (current) {
    path.push(current);
    current = cameFrom[`${current.x},${current.y}`];
  }

  path.reverse();
  return path.length > 1 ? path : null;
}
function moveEnemy() {

  const path = bfs(enemyPosition, playerPosition);
  
  if (path && path.length > 1) {
    enemyPosition = path[1];
    drawEnemy();
  }

  if (enemyPosition.x === playerPosition.x && enemyPosition.y === playerPosition.y && !finish) {
    alert('Вас поймал враг! Возвращаем на первый уровень.');
    finish = true
    location.reload();
  }
}

function resetGame() {
  currentLevel = Math.min(currentLevel, colors.length - 1);
  playerPosition = { x: mazeSize - 1, y: Math.floor(mazeSize / 2) };
  enemyPosition = { x: 0, y: Math.floor(mazeSize / 2) };
  createMaze();
  generateMaze(1, 1);
  addRoomsAndExtraPaths();
  createEntranceAndExit();
  updateLevelDisplay(); 
  prevTapTime = Date.now()
  finish = false
}

function updateWallColors() {
  document.querySelectorAll('.cell.wall').forEach(cell => {
    cell.style.backgroundColor = colors[(currentLevel) % colors.length];
  });
}

resetGame();

