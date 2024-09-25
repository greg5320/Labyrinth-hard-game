const colors = ['black', 'red', 'green', 'cyan', 'blue', 'purple'];
let currentLevel = 0;
let mazeSize = 21;
const maze = [];
const directions = [
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 }
];
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
  const entranceY = Math.floor(mazeSize / 2);
  if (maze[mazeSize - 2][entranceY].wall) {
    maze[mazeSize - 2][entranceY].wall = false;
  }
  if (maze[1][entranceY].wall) {
    maze[1][entranceY].wall = false;
  }
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function drawMaze() {
  const mazeContainer = document.getElementById('maze');
  mazeContainer.innerHTML = '';
  mazeContainer.style.gridTemplateColumns = `repeat(${mazeSize}, 20px)`;
  mazeContainer.style.gridTemplateRows = `repeat(${mazeSize}, 20px)`;
  
  for (let i = 0; i < mazeSize; i++) {
    for (let j = 0; j < mazeSize; j++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      if (maze[i][j].wall) {
        cell.style.backgroundColor = colors[currentLevel];
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

  const exit = { x: 0, y: Math.floor(mazeSize / 2) };
  maze[exit.x][exit.y].end = true;
  maze[exit.x][exit.y].wall = false;

  drawMaze();
  drawPlayer();
  drawEnemy();
}

function drawPlayer() {
  const oldPlayerCell = document.querySelector('.player');
  if (oldPlayerCell) {
    oldPlayerCell.classList.remove('player');
  }

  const newPlayerIndex = playerPosition.y + 1 + mazeSize * playerPosition.x;
  const newPlayerCell = document.querySelector(`#maze div:nth-child(${newPlayerIndex})`);
  newPlayerCell.classList.add('player');
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
      if (currentLevel < colors.length) {
        mazeSize += 4;
        resetGame();
      } else {
        alert('Вы прошли все уровни!');
      }
    } else {
      moveEnemy();
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

function drawEnemy() {
  const oldEnemyCell = document.querySelector('.enemy');
  if (oldEnemyCell) {
    oldEnemyCell.classList.remove('enemy');
  }

  const newEnemyIndex = enemyPosition.y + 1 + mazeSize * enemyPosition.x;
  const newEnemyCell = document.querySelector(`#maze div:nth-child(${newEnemyIndex})`);
  newEnemyCell.classList.add('enemy');
}

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

  if (enemyPosition.x === playerPosition.x && enemyPosition.y === playerPosition.y) {
    alert('Вас поймал враг! Возвращаем на первый уровень.');
    location.reload();
  }
}

function resetGame() {
  currentLevel = Math.min(currentLevel, colors.length - 1);
  mazeSize = 21 + (currentLevel * 4);
  playerPosition = { x: mazeSize - 1, y: Math.floor(mazeSize / 2) };
  enemyPosition = { x: 0, y: Math.floor(mazeSize / 2) };
  createMaze();
  generateMaze(1, 1);
  drawMaze();
  createEntranceAndExit();
  document.getElementById('level').textContent = `Текущий уровень: ${currentLevel+1}`;
  updateWallColors();
}

function updateWallColors() {
  document.querySelectorAll('.cell.wall').forEach(cell => {
    cell.style.backgroundColor = colors[(level - 1) % colors.length];
  });
}

resetGame();
