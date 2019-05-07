function updateObstaclesAndEnemies(obstacleModel, enemyModel, ship, lasers) {
  for (let element of this.children) {
    if (element.destroyed || element.position.x < -50) {
      this.remove(element);
    }
  }

  if (this.children.length < 10) {
    if (Math.random() > 0.5) {
      let newObstacle = cloneFbx(obstacleModel);
      newObstacle.position.set(
        500,
        Math.random() * 50 - 25,
        Math.random() * 50 - 25
      );
      newObstacle.scale.set(0.01, 0.01, 0.01);
      newObstacle.rotation.set(Math.PI / 2, 0, -Math.PI / 2);
      newObstacle.box = new THREE.Box3();
      newObstacle.update = updateObstacle.bind(newObstacle, ship, lasers);

      this.add(newObstacle);
    } else {
      let newEnemy = cloneFbx(enemyModel);
      newEnemy.position.set(
        500,
        Math.random() * 50 - 25,
        Math.random() * 50 - 25
      );
      newEnemy.rotation.set(0, Math.PI / 2, 0);
      newEnemy.box = new THREE.Box3();
      newEnemy.update = updateEnemy.bind(newEnemy, ship, lasers);

      newEnemy.destroyed = false;

      this.add(newEnemy);
    }
  }
}

function updateObstacle(ship, lasers, game, delta) {
  this.box.setFromObject(this);
  this.position.x -= 0.02 * delta;
  if (this.box.intersectsBox(ship.box)) {
    game.rounds[0].life -= 10;
  }
}

function updateEnemy(ship, lasers, game, delta) {
  this.box.setFromObject(this);
  this.position.x -= 0.06 * delta;
  if (this.box.intersectsBox(ship.box)) {
    game.rounds[0].life -= 10;
  }
  for (let laser of lasers.children) {
    if (this.box.intersectsBox(laser.box)) {
      game.rounds[0].score += 100;
      this.destroyed = true;
      break;
    }
  }
}

function updatePlayer(game, delta) {
  if (game.controls.up && this.position.y < 25) {
    this.position.y += 0.01 * delta;
  }
  if (game.controls.down && this.position.y > -25) {
    this.position.y -= 0.01 * delta;
  }
  if (game.controls.left && this.position.z > -25) {
    this.position.z -= 0.01 * delta;
  }
  if (game.controls.right && this.position.z < 25) {
    this.position.z += 0.01 * delta;
  }
}

function updateShip(lasers, game) {
  this.box.setFromObject(this);
  if (game.controls.up) {
    this.position.y = 0.5;
  }
  if (game.controls.down && !game.controls.up) {
    this.position.y = -0.5;
  }
  if (!game.controls.up && !game.controls.down) {
    this.position.y = 0;
  }
  if (game.controls.right) {
    this.position.z = 0.5;
  }
  if (game.controls.left && !game.controls.right) {
    this.position.z = -0.5;
  }
  if (!game.controls.right && !game.controls.left) {
    this.position.z = 0;
  }
  if (game.controls.space) {
    game.controls.space = false;
    fireFromShip.bind(this, lasers)();
  }
}

function fireFromShip(lasers) {
  for (let i = 0; i < 2; i++) {
    let laser = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 10, 16),
      new THREE.MeshBasicMaterial({ color: 0xff00ff })
    );
    laser.position.set(
      this.parent.position.x + this.position.x + 5,
      this.parent.position.y + this.position.y + 0.15,
      this.parent.position.z + this.position.z + Math.pow(-1, i) / 3
    );
    laser.rotation.set(0, 0, Math.PI / 2);
    laser.box = new THREE.Box3();
    laser.update = updateLaser;

    lasers.add(laser);
  }
}

function updateLaser(game, delta) {
  this.box.setFromObject(this);
  this.position.x += 0.2 * delta;
}

function updateLasers() {
  for (let element of this.children) {
    if (Math.abs(element.position.x) > 300) {
      this.remove(element);
    }
  }
}
