// Assumes THREE.js is already loaded

// ----- Scene Setup -----
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfd1e5);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 30, 40);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.style.margin = '0';
document.body.appendChild(renderer.domElement);

// Lights
const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(50, 100, -50);
scene.add(dirLight);

// ----- Helper Functions -----
function createTerrain(tile, offsetX) {
  const geom = new THREE.PlaneGeometry(50, 50, 2, 2); // 3x3 vertices
  const verts = geom.attributes.position.array;
  // height_points order matches vertices order (row‑major)
  for (let i = 0; i < tile.height_points.length; i++) {
    const h = tile.height_points[i][2];
    verts[i * 3 + 2] = h; // Z component (plane is XY, Z up before rotation)
  }
  geom.computeVertexNormals();
  geom.rotateX(-Math.PI / 2); // make Y the up‑axis

  const colorMap = {
    suburban: 0x8c8c8c,
    grassland: 0x5c9e56,
    urban: 0x7d7d7d,
    grass: 0x6aab5d,
  };
  const mat = new THREE.MeshLambertMaterial({
    color: colorMap[tile.terrain_type] || 0x888888,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.x = offsetX;
  scene.add(mesh);

  // Roads
  tile.road_segments.forEach(seg => {
    const [x1, y1, x2, y2] = seg;
    const dx = x2 - x1;
    const dz = y2 - y1; // note: y in data maps to Z axis
    const length = Math.hypot(dx, dz);
    const roadGeom = new THREE.BoxGeometry(length, 0.15, 2);
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const road = new THREE.Mesh(roadGeom, roadMat);
    // midpoint
    road.position.set(
      offsetX + (x1 + x2) / 2 - 25,
      0.05,
      (y1 + y2) / 2 - 25
    );
    // rotation
    const angle = Math.atan2(dz, dx);
    road.rotation.y = -angle;
    scene.add(road);
  });
}

// ----- Terrain Data (5 tiles) -----
const terrainData = [
  {"tile_id":"t7","terrain_type":"suburban","height_points":[[0,0,0],[25,0,0.5],[50,0,0],[0,25,0.2],[25,25,0.3],[50,25,0.2],[0,50,0],[25,50,0.5],[50,50,0]],"road_segments":[[0,25,50,25]]},
  {"tile_id":"t3","terrain_type":"grassland","height_points":[[0,0,0],[0,25,0.2],[0,50,0],[25,0,0.1],[25,25,0.15],[25,50,0.1],[50,0,0],[50,25,0.2],[50,50,0]],"road_segments":[[0,25,50,25],[25,0,25,50]]},
  {"tile_id":"t6","terrain_type":"urban","height_points":[[0,0,0],[0,25,0.5],[0,50,0],[25,0,0.2],[25,25,0],[25,50,0.3],[50,0,0],[50,25,0.1],[50,50,0]],"road_segments":[[0,0,50,0],[0,25,50,25]]},
  {"tile_id":"t1","terrain_type":"urban","height_points":[[0,0,0],[25,0.2,0],[50,0,0],[0,0,25],[25,0.1,25],[50,0,25],[0,0,50],[25,0.3,50],[50,0,50]],"road_segments":[[0,25,50,25],[25,0,25,50]]},
  {"tile_id":"t8","terrain_type":"grass","height_points":[[0,0,0],[25,0,0.8],[50,0,0],[0,25,0.3],[25,25,1.4],[50,25,0.3],[0,50,0],[25,50,0.9],[50,50,0]],"road_segments":[[0,25,50,25],[25,0,25,50]]}
];

// Place tiles side‑by‑side along X axis (spacing 60 units)
terrainData.forEach((t, i) => createTerrain(t, i * 60));

// ----- Detail Objects -----
const detailLists = [
  [
    {"type":"tree","position":[-12.3,0,-23.5],"scale":1.2},
    {"type":"tree","position":[8.5,0,15.1],"scale":1.0},
    {"type":"rock","position":[-30.0,0,5.0],"scale":0.7},
    {"type":"rock","position":[25.4,0,-12.2],"scale":0.9},
    {"type":"lamp","position":[-5.0,0,40.0],"scale":1.5},
    {"type":"building","position":[10.0,0,-40.0],"scale":3.0},
    {"type":"tree","position":[-20.0,0,30.0],"scale":1.4},
    {"type":"lamp","position":[35.0,0,10.0],"scale":1.2}
  ],
  [
    {"type":"tree","position":[-12.4,0.0,-23.1],"scale":1.3},
    {"type":"tree","position":[8.7,0.0,15.5],"scale":0.9},
    {"type":"rock","position":[20.3,0.0,-5.6],"scale":0.6},
    {"type":"rock","position":[-30.1,0.0,22.8],"scale":0.8},
    {"type":"lamp","position":[5.0,0.0,5.0],"scale":1.0},
    {"type":"building","position":[-10.0,0.0,10.0],"scale":2.5},
    {"type":"tree","position":[12.0,0.0,-8.0],"scale":1.2}
  ],
  [
    {"type":"tree","position":[2.3,0,4.7],"scale":1.4},
    {"type":"rock","position":[5.8,0,2.1],"scale":0.8},
    {"type":"lamp","position":[7.0,0,7.5],"scale":1.0},
    {"type":"building","position":[1.2,0,1.5],"scale":2.5},
    {"type":"tree","position":[6.4,0,5.9],"scale":1.1},
    {"type":"rock","position":[3.7,0,8.2],"scale":0.6},
    {"type":"lamp","position":[9.1,0,3.3],"scale":0.9}
  ],
  [
    {"type":"tree","position":[-3.2,0,4.5],"scale":1.2},
    {"type":"rock","position":[2.1,0,-5.3],"scale":0.8},
    {"type":"lamp","position":[0,0,0],"scale":1.0},
    {"type":"building","position":[5.5,0,-2.0],"scale":1.5},
    {"type":"tree","position":[-6.8,0,-1.2],"scale":0.9},
    {"type":"rock","position":[3.7,0,3.3],"scale":0.6},
    {"type":"tree","position":[1.0,0,7.0],"scale":1.4}
  ],
  [
    {"type":"tree","position":[12.3,0,45.6],"scale":2.1},
    {"type":"rock","position":[-30.5,0,20.1],"scale":1.4},
    {"type":"lamp","position":[5.0,0,5.0],"scale":0.9},
    {"type":"building","position":[-10.2,0,-15.3],"scale":8.5},
    {"type":"tree","position":[22.7,0,-30.8],"scale":1.8},
    {"type":"rock","position":[-40.0,0,10.0],"scale":0.7},
    {"type":"tree","position":[-5.5,0,30.0],"scale":2.5}
  ]
];

function addTree(pos, scale) {
  const trunkGeo = new THREE.CylinderGeometry(0.2 * scale, 0.2 * scale, 1 * scale, 8);
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x8b5a2b });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.set(pos[0], 0.5 * scale, pos[2]);

  const foliageGeo = new THREE.ConeGeometry(0.8 * scale, 2 * scale, 8);
  const foliageMat = new THREE.MeshLambertMaterial({ color: 0x228b22 });
  const foliage = new THREE.Mesh(foliageGeo, foliageMat);
  foliage.position.set(pos[0], 1.5 * scale + 0.5 * scale, pos[2]);

  scene.add(trunk);
  scene.add(foliage);
}
function addRock(pos, scale) {
  const geo = new THREE.DodecahedronGeometry(0.8 * scale);
  const mat = new THREE.MeshLambertMaterial({ color: 0x777777 });
  const rock = new THREE.Mesh(geo, mat);
  rock.position.set(pos[0], 0.8 * scale, pos[2]);
  scene.add(rock);
}
function addLamp(pos, scale) {
  const poleGeo = new THREE.CylinderGeometry(0.1 * scale, 0.1 * scale, 3 * scale, 8);
  const poleMat = new THREE.MeshLambertMaterial({ color: 0x555555 });
  const pole = new THREE.Mesh(poleGeo, poleMat);
  pole.position.set(pos[0], 1.5 * scale, pos[2]);

  const light = new THREE.PointLight(0xffddaa, 1, 30);
  light.position.set(pos[0], 3 * scale, pos[2]);
  scene.add(pole);
  scene.add(light);
}
function addBuilding(pos, scale) {
  const geo = new THREE.BoxGeometry(5 * scale, 5 * scale, 5 * scale);
  const mat = new THREE.MeshLambertMaterial({ color: 0x999999 });
  const building = new THREE.Mesh(geo, mat);
  building.position.set(pos[0], 2.5 * scale, pos[2]);
  scene.add(building);
}

// Parse all detail lists
detailLists.forEach(list => {
  list.forEach(item => {
    const p = item.position;
    const s = item.scale;
    switch (item.type) {
      case 'tree': addTree(p, s); break;
      case 'rock': addRock(p, s); break;
      case 'lamp': addLamp(p, s); break;
      case 'building': addBuilding(p, s); break;
    }
  });
});

// ----- Simple Drivable Car -----
const car = new THREE.Group();

// body
const bodyGeo = new THREE.BoxGeometry(2, 1, 4);
const bodyMat = new THREE.MeshLambertMaterial({ color: 0xff0000 });
const body = new THREE.Mesh(bodyGeo, bodyMat);
car.add(body);

// wheels (simple cylinders)
function createWheel() {
  const geo = new THREE.CylinderGeometry(0.4, 0.4, 0.5, 12);
  const mat = new THREE.MeshLambertMaterial({ color: 0x333333 });
  const wheel = new THREE.Mesh(geo, mat);
  wheel.rotation.z = Math.PI / 2;
  return wheel;
}
const wheelPositions = [
  [-0.9, -0.5, 1.5],
  [0.9, -0.5, 1.5],
  [-0.9, -0.5, -1.5],
  [0.9, -0.5, -1.5],
];
wheelPositions.forEach(p => {
  const w = createWheel();
  w.position.set(p[0], p[1], p[2]);
  car.add(w);
});

car.position.set(0, 2, 0);
scene.add(car);

// Car movement parameters
let carSpeed = 0;
let carSteer = 0;
const maxSpeed = 0.4;
const acceleration = 0.02;
const deceleration = 0.03;
const steerSpeed = 0.03;

// ----- Input Handling (Keyboard) -----
const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };
window.addEventListener('keydown', e => {
  if (e.key in keys) keys[e.key] = true;
});
window.addEventListener('keyup', e => {
  if (e.key in keys) keys[e.key] = false;
});

// ----- Touch Joystick -----
const joystickContainer = document.createElement('div');
joystickContainer.style.position = 'absolute';
joystickContainer.style.bottom = '80px';
joystickContainer.style.left = '80px';
joystickContainer.style.width = '120px';
joystickContainer.style.height = '120px';
joystickContainer.style.background = 'rgba(200,200,200,0.4)';
joystickContainer.style.borderRadius = '50%';
joystickContainer.style.touchAction = 'none';
document.body.appendChild(joystickContainer);

const joystickKnob = document.createElement('div');
joystickKnob.style.position = 'absolute';
joystickKnob.style.width = '60px';
joystickKnob.style.height = '60px';
joystickKnob.style.background = 'rgba(100,100,100,0.6)';
joystickKnob.style.borderRadius = '50%';
joystickKnob.style.left = '30px';
joystickKnob.style.top = '30px';
joystickContainer.appendChild(joystickKnob);

let joystickActive = false;
let joystickDir = new THREE.Vector2(0, 0);

function onTouchStart(event) {
  joystickActive = true;
  updateJoystick(event.touches[0]);
}
function onTouchMove(event) {
  if (!joystickActive) return;
  updateJoystick(event.touches[0]);
}
function onTouchEnd() {
  joystickActive = false;
  joystickDir.set(0, 0);
  joystickKnob.style.left = '30px';
  joystickKnob.style.top = '30px';
}
function updateJoystick(touch) {
  const rect = joystickContainer.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = touch.clientX - cx;
  const dy = touch.clientY - cy;
  const max = rect.width / 2;
  const distance = Math.min(max, Math.hypot(dx, dy));
  const angle = Math.atan2(dy, dx);
  const nx = Math.cos(angle) * distance;
  const ny = Math.sin(angle) * distance;
  joystickKnob.style.left = `${30 + nx}px`;
  joystickKnob.style.top = `${30 + ny}px`;
  joystickDir.set(nx / max, ny / max);
}
joystickContainer.addEventListener('touchstart', onTouchStart, { passive: false });
joystickContainer.addEventListener('touchmove', onTouchMove, { passive: false });
joystickContainer.addEventListener('touchend', onTouchEnd);
joystickContainer.addEventListener('touchcancel', onTouchEnd);

// ----- Animation Loop -----
function animate() {
  requestAnimationFrame(animate);

  // Keyboard controls
  if (keys.ArrowUp) {
    carSpeed = Math.min(maxSpeed, carSpeed + acceleration);
  } else if (keys.ArrowDown) {
    carSpeed = Math.max(-maxSpeed / 2, carSpeed - acceleration);
  } else {
    // natural deceleration
    if (carSpeed > 0) {
      carSpeed = Math.max(0, carSpeed - deceleration);
    } else if (carSpeed < 0) {
      carSpeed = Math.min(0, carSpeed + deceleration);
    }
  }
  if (keys.ArrowLeft) carSteer = Math.max(-1, carSteer - steerSpeed);
  else if (keys.ArrowRight) carSteer = Math.min(1, carSteer + steerSpeed);
  else carSteer = THREE.MathUtils.lerp(carSteer, 0, 0.1);

  // Touch joystick overrides keyboard when active
  if (joystickActive) {
    // y component (up = -) controls forward/backward
    if (joystickDir.y < -0.1) {
      carSpeed = Math.min(maxSpeed, carSpeed + acceleration);
    } else if (joystickDir.y > 0.1) {
      carSpeed = Math.max(-maxSpeed / 2, carSpeed - acceleration);
    } else {
      if (carSpeed > 0) carSpeed = Math.max(0, carSpeed - deceleration);
      else if (carSpeed < 0) carSpeed = Math.min(0, carSpeed + deceleration);
    }
    // x component controls steering
    carSteer = joystickDir.x;
  }

  // Apply steering
  car.rotation.y -= carSteer * 0.03;
  // Move forward in local Z direction
  const forward = new THREE.Vector3(
    Math.sin(car.rotation.y),
    0,
    Math.cos(car.rotation.y)
  );
  car.position.addScaledVector(forward, carSpeed);

  // Camera follow (simple third‑person)
  const camOffset = new THREE.Vector3(0, 10, -20);
  const camPos = car.position.clone().add(camOffset.clone().applyAxisAngle(new THREE.Vector3(0,1,0), -car.rotation.y));
  camera.position.lerp(camPos, 0.1);
  camera.lookAt(car.position);

  renderer.render(scene, camera);
}
animate();

// ----- Handle Resize -----
window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
});