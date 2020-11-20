import * as THREE from "./three.module.js"
import { OrbitControls } from "./OrbitControls.js"
import Stats from "./stats.module.js"
import * as BOIDS from "./boids.js"

const GRID_COUNT_ROW = 60
const GRID_COUNT_COL = 30

const MAX_HEIGHT = 20

const BOID_COUNT = 20
const velocity = BOIDS.velocity

let scene

let renderer
let width, height

let tick_count = 0
const TICK_LIMIT = 200
let chosen_boid

let camera_top
let camera_right
let camera_boid

let stats

let grid = []
let boids = []

function generate_terrain() {
  noise.seed(Math.random())

  for (var i=0; i<GRID_COUNT_ROW; i++ ){
    let row = []
    for (var j=0; j<GRID_COUNT_COL; j++ ){
      // Added one becuase it return from -1 to 1
      let magnitude = (noise.perlin2(i/(0.2 * GRID_COUNT_ROW), j/(0.2 * GRID_COUNT_ROW)) + 1)/2 * MAX_HEIGHT

      // var geom = new THREE.CubeGeometry(0.8, 0.8, magnitude)
      var geom = new THREE.CylinderGeometry(0.5, 0.5, magnitude, 6)
      var mat = new THREE.MeshBasicMaterial({color: `rgb(${Math.floor(magnitude * 255 / MAX_HEIGHT )}, 0, 0)`})
      var mesh = new THREE.Mesh(geom, mat)

      mesh.rotation.x = Math.PI/2

      mesh.position.x = i
      mesh.position.y = j
      mesh.position.z = magnitude/2
      mesh.layers.set(3)


      scene.add(mesh)
      row.push(mesh)
    }
    grid.push(row)
  }
}

function init_boids() {
  let geom = new THREE.SphereGeometry(0.2, 8, 8)

  for (var i=0;i<BOID_COUNT;i++) {
    let mat = new THREE.MeshBasicMaterial({color: 0xf542da})
    let mesh = new THREE.Mesh(geom, mat)
    mesh.position.set(Math.random() * 50, Math.random() * 50, MAX_HEIGHT+10)

    mesh.velocity = new THREE.Vector3()
    mesh.velocity.x = Math.random() * velocity - velocity/2
    mesh.velocity.y = Math.random() * velocity - velocity/2

    mesh.layers.enable(1)
    mesh.layers.enable(2)

    scene.add(mesh)
    boids.push(mesh)
  }
}

function drawBox() {
  const mat = new THREE.MeshBasicMaterial({color: 0x00ffff})

  const geom_vert = new THREE.CylinderGeometry(0.1, 0.1, GRID_COUNT_COL, 10)
  const geom_hori = new THREE.CylinderGeometry(0.1, 0.1, GRID_COUNT_ROW, 10)


  const left = new THREE.Mesh(geom_vert, mat)
  left.position.y = GRID_COUNT_COL/2
  left.layers.enable(1)
  left.layers.enable(2)

  const right = new THREE.Mesh(geom_vert, mat)
  right.position.x = GRID_COUNT_ROW
  right.position.y = GRID_COUNT_COL/2
  right.layers.enable(1)
  right.layers.enable(2)

  const up = new THREE.Mesh(geom_hori, mat)
  up.position.x = GRID_COUNT_ROW/2
  up.rotation.z = Math.PI/2
  up.layers.enable(1)
  up.layers.enable(2)

  const down = new THREE.Mesh(geom_hori, mat)
  down.position.x = GRID_COUNT_ROW/2
  down.position.y = GRID_COUNT_COL
  down.rotation.z = Math.PI/2
  down.layers.enable(1)
  down.layers.enable(2)

  scene.add(left)
  scene.add(right)
  scene.add(up)
  scene.add(down)
}

function init() {
  scene = new THREE.Scene()

  renderer = new THREE.WebGLRenderer()

  width = window.innerWidth
  height = window.innerHeight
  renderer.setSize(width, height)

  const container = document.getElementById('container')
  container.appendChild(renderer.domElement)

  camera_top = new THREE.OrthographicCamera(-width/2, width/2, -height/2, height/2, 1, 200)
  camera_top.position.x = GRID_COUNT_ROW/2
  camera_top.position.y = GRID_COUNT_COL/2
  camera_top.position.z = -80

  camera_top.rotation.z = Math.PI
  camera_top.rotation.y = Math.PI

  camera_top.zoom = 12
  camera_top.updateProjectionMatrix()
  camera_top.layers.set(1)

  camera_right = new THREE.PerspectiveCamera(50, width/height, 0.1, 200)

  camera_right.position.set(10, -20, 90)
  camera_right.layers.set(2)

  const controls = new OrbitControls(camera_right, renderer.domElement)
  controls.target = new THREE.Vector3(GRID_COUNT_ROW/2, GRID_COUNT_COL/2, 0)
  controls.update()

  camera_boid = new THREE.PerspectiveCamera(90, (width/2)/(height/2), 0.1, 50)
  camera_boid.layers.enable(1)
  camera_boid.layers.enable(2)
  camera_boid.layers.enable(3)

  // const helper = new THREE.AxesHelper(40);
  // scene.add(helper)
  // helper.layers.enable(2)
  // helper.layers.enable(1)

  stats = new Stats()
  container.appendChild(stats.dom)

  generate_terrain()
  init_boids()
  drawBox()
}

function timeStep() {
  requestAnimationFrame(timeStep)
  stats.update()

  // const x = Math.floor(Math.random() * GRID_COUNT_ROW)
  // const y = Math.floor(Math.random() * GRID_COUNT_COL)


  // grid[x][y].material.color.setHex(0x00ff00)
  // grid[x][y].layers.set(2)
  // vect.position.copy(boids[BOID_COUNT-1].position)


  moveBoids()
  render()
}

function render() {
  render_right()
  render_top()
  render_boid_cam()
}

function render_right() {
  renderer.setViewport(Math.floor(width/2), 0, Math.floor(width/2), height)
  camera_right.aspect = (width/2)/height
  camera_right.updateProjectionMatrix()

  renderer.setScissor(Math.floor(width/2), 0, Math.floor(width/2), height)
  renderer.setScissorTest(true)

  renderer.render(scene, camera_right)
}

function render_top() {
  renderer.setViewport(0, Math.floor(height/2), Math.floor(width/2), Math.floor(height/2))
  camera_right.aspect = (width/2)/(height/2)
  camera_right.updateProjectionMatrix()

  renderer.setScissor(0, Math.floor(height/2), Math.floor(width/2), Math.floor(height/2))
  renderer.setScissorTest(true)

  renderer.render(scene, camera_top)
}

function render_boid_cam() {
  if (tick_count > TICK_LIMIT) {
    tick_count = 0
    chosen_boid.material.color.setHex(0xf542da)

  }

  if (tick_count == 0) {
    chosen_boid = boids[Math.floor(Math.random()*BOID_COUNT)]
    chosen_boid.material.color.setHex(0x00ff00)
  }
  var temp1 = chosen_boid.velocity.clone()
  var temp2 = chosen_boid.position.clone()

  temp1.add(temp2)
  temp2.z = 0
  temp1.add(temp2)
  temp1.divideScalar(2)

  camera_boid.position.copy(chosen_boid.position)
  camera_boid.lookAt(temp1)
  camera_boid.up.set(0, 0, 1)

  renderer.setViewport(0, 0, Math.floor(width/2), Math.floor(height/2))

  renderer.setScissor(0, 0, Math.floor(width/2), Math.floor(height/2))
  renderer.setScissorTest(true)

  renderer.render(scene, camera_boid)
  tick_count++
}

function moveBoids() {
  for (let boid of boids) {
    BOIDS.flyTowardsCenter(boid, boids)
    BOIDS.avoidOthers(boid, boids)
    BOIDS.matchVelocity(boid, boids)
    BOIDS.limitSpeed(boid, boids)
    BOIDS.keepWithinBounds(boid, boids)

    boid.velocity.z /= 10

    boid.position.add(boid.velocity)

    const x = Math.floor(boid.position.x)
    const y = Math.floor(boid.position.y)

    if (x < 0 || x >= GRID_COUNT_ROW || y < 0 || y >= GRID_COUNT_COL) {
      continue
    }
    grid[x][y].layers.set(2)
  }
}

init()
timeStep()
