async function setup(canvas) {
  let objLoader = new THREE.OBJLoader();
  let mtlLoader = new THREE.MTLLoader();

  // RENDERER
  let renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(canvas.width, canvas.height);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // SCENE
  let scene = new THREE.Scene();

  // LIGHTS
  let mainLight = new THREE.PointLight(0x7a90f6, 1, 0, 5);
  mainLight.position.set(0, 200, 0);
  mainLight.castShadow = true;
  scene.add(mainLight);

  let ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

  // LASERS
  let lasers = new THREE.Group();
  scene.add(lasers);
  lasers.update = updateLasers;

  // PLAYER
  let player = new THREE.Group();
  scene.add(player);
  player.update = updatePlayer;

  // CAMERA
  let camera = new THREE.PerspectiveCamera(
    45,
    canvas.width / canvas.height,
    1,
    4000
  );
  camera.position.set(-3, 0, 0);
  camera.lookAt(500, 0, 0);
  player.add(camera);

  // SHIP
  let shipMaterials = await new Promise(resolve => {
    mtlLoader.load('./assets/ship/ship.mtl', materials => {
      resolve(materials);
    });
  });

  shipMaterials.preload();

  let ship = await new Promise(resolve => {
    objLoader
      .setMaterials(shipMaterials)
      .load('./assets/ship/ship.obj', object => {
        resolve(object);
      });
  });

  ship.scale.set(0.002, 0.002, 0.002);
  ship.rotation.set(0, Math.PI / 2, 0);
  ship.position.set(0, 0, 0);
  ship.box = new THREE.Box3();
  ship.update = updateShip.bind(ship, lasers);

  player.add(ship);

  // OBSTACLES
  let obstacleMaterials = await new Promise(resolve => {
    mtlLoader.load('./assets/obstacle/obstacle.mtl', materials => {
      resolve(materials);
    });
  });

  obstacleMaterials.preload();

  let obstacleModel = await new Promise(resolve => {
    objLoader
      .setMaterials(obstacleMaterials)
      .load('./assets/obstacle/obstacle.obj', object => {
        resolve(object);
      });
  });

  // ENEMIES
  let enemyMaterials = await new Promise(resolve => {
    mtlLoader.load('./assets/enemy/enemy.mtl', materials => {
      resolve(materials);
    });
  });

  enemyMaterials.preload();

  let enemyModel = await new Promise(resolve => {
    objLoader
      .setMaterials(enemyMaterials)
      .load('./assets/enemy/enemy.obj', object => {
        resolve(object);
      });
  });

  // OBSTACLES AND ENEMIES
  let obstaclesAndEnemies = new THREE.Group();
  obstaclesAndEnemies.update = updateObstaclesAndEnemies.bind(
    obstaclesAndEnemies,
    obstacleModel,
    enemyModel,
    ship,
    lasers
  );
  scene.add(obstaclesAndEnemies);

  return { renderer, scene, camera };
}

function run(game, prevTime) {
  let round = game.rounds[0];

  let time = Date.now();
  let gameTimeLeft = 300000 - time + round.start;
  let delta = time - prevTime;

  $('.time-value').text(`${Math.round(gameTimeLeft / 1000)} segundos`);
  $('.score-value').text(Math.round(round.score));
  $('.life-value').text(Math.round(round.life));

  game.elements.scene.traverse(child => {
    if (child.update) {
      child.update(game, delta);
    }
  });

  game.elements.renderer.render(game.elements.scene, game.elements.camera);

  requestAnimationFrame(function() {
    if (gameTimeLeft > 0) {
      run(game, time);
    } else {
      let highScore = Math.round(
        Math.max(
          ...game.map(el => {
            return el.score;
          })
        )
      );
      $('body').off('keydown');
      $('.info').hide();
      $('.restart').css('display', 'flex');
      $('.high-score-value').text(highScore);
    }
  });
}

$(document).ready(() => {
  let canvas = document.getElementById('robots');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let game = {
    rounds: [],
    elements: {},
    controls: {}
  };

  $('button').click(async () => {
    $('.start').hide();
    $('.restart').hide();
    $('.info').show();

    let round = {
      life: 1000,
      score: 0,
      start: Date.now()
    };
    game.rounds.unshift(round);

    game.controls = {
      up: false,
      down: false,
      left: false,
      right: false,
      space: false
    };

    $('body').keydown(event => {
      if (event.key === 'ArrowUp') {
        game.controls.up = true;
      }
      if (event.key === 'ArrowDown') {
        game.controls.down = true;
      }
      if (event.key === 'ArrowLeft') {
        game.controls.left = true;
      }
      if (event.key === 'ArrowRight') {
        game.controls.right = true;
      }
      if (event.key === ' ') {
        game.controls.space = true;
      }
    });

    $('body').keyup(event => {
      if (event.key === 'ArrowUp') {
        game.controls.up = false;
      }
      if (event.key === 'ArrowDown') {
        game.controls.down = false;
      }
      if (event.key === 'ArrowLeft') {
        game.controls.left = false;
      }
      if (event.key === 'ArrowRight') {
        game.controls.right = false;
      }
    });

    game.elements = await setup(canvas);
    run(game, Date.now());
  });
});
