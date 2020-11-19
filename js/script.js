import * as THREE from "./three.module.js"
import { OrbitControls } from "./OrbitControls.js"
import Stats from "./stats.module.js"
import * as BOIDS from "./boids.js"

const GRID_COUNT = 40
const MAX_HEIGHT = 20

const BOID_COUNT = 20
const velocity = BOIDS.velocity

let scene

let renderer
let width, height

let camera_top
let camera_right

let stats

let grid = []
let boids = []

function generate_terrain() {
  noise.seed(Math.random())

  for (var i=0; i<GRID_COUNT; i++ ){
    let row = []
    for (var j=0; j<GRID_COUNT; j++ ){
      // Added one becuase it return from -1 to 1
      let magnitude = (noise.perlin2(i/(0.2 * GRID_COUNT), j/(0.2 * GRID_COUNT)) + 1)/2 * MAX_HEIGHT

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
  let mat = new THREE.MeshBasicMaterial({color: 0xf542da})

  for (var i=0;i<BOID_COUNT;i++) {
    let mesh = new THREE.Mesh(geom, mat)
    mesh.position.set(Math.random() * 50, Math.random() * 50, MAX_HEIGHT+10)
    mesh.velocity = new THREE.Vector3()
    mesh.velocity.x = Math.random() * velocity - velocity/2
    mesh.velocity.y = Math.random() * velocity - velocity/2


    mesh.layers.set(1)

    scene.add(mesh)
    boids.push(mesh)
  }
}

function drawBox() {
  const geom = new THREE.CylinderGeometry(0.1, 0.1, 40, 10)
  const mat = new THREE.MeshBasicMaterial({color: 0x00ffff})

  const left = new THREE.Mesh(geom, mat)
  left.position.y = 20
  left.layers.enable(1)
  left.layers.enable(2)

  const right = new THREE.Mesh(geom, mat)
  right.position.y = 20
  right.position.x = 40
  right.layers.enable(1)
  right.layers.enable(2)

  // const left = new THREE.Mesh(geom, mat)
  // left.position.y = 20
  // left.layers.enable(1)
  // left.layers.enable(2)
  //
  // const left = new THREE.Mesh(geom, mat)
  // left.position.y = 20
  // left.layers.enable(1)
  // left.layers.enable(2)


  scene.add(left)
  scene.add(right)
}

function init() {
  scene = new THREE.Scene()

  renderer = new THREE.WebGLRenderer()
  width = window.innerWidth
  height = window.innerHeight
  renderer.setSize(width, height)

  const container = document.getElementById('container')
  container.appendChild(renderer.domElement)

  camera_top = new THREE.OrthographicCamera(-width/2, width/2, -height/2, height/2, 1, 100)
  camera_top.position.x = GRID_COUNT/2
  camera_top.position.y = GRID_COUNT/2
  camera_top.position.z = -80

  camera_top.rotation.z = Math.PI
  camera_top.rotation.y = Math.PI
  // camera_top.lookAt(GRID_COUNT/2, GRID_COUNT/2, 0)
  camera_top.zoom = 12
  camera_top.updateProjectionMatrix()
  camera_top.layers.set(1)

  camera_right = new THREE.PerspectiveCamera(50, width/height, 0.1, 200)
 // Got these number from manual viewing
  camera_right.position.set(10, -20, 90)
  camera_right.layers.set(2)

  const controls = new OrbitControls(camera_right, renderer.domElement)
  controls.target = new THREE.Vector3(GRID_COUNT/2, GRID_COUNT/2, 0)
  controls.update()

  const helper = new THREE.AxesHelper(40);
  scene.add(helper)
  helper.layers.enable(2)
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

  // const x = Math.floor(Math.random() * GRID_COUNT)
  // const y = Math.floor(Math.random() * GRID_COUNT)


  // grid[x][y].material.color.setHex(0x00ff00)
  // grid[x][y].layers.set(2)

  moveBoids()
  render()
}

function render() {
  render_right()
  render_top()
}

function render_right() {
  renderer.setViewport(Math.floor(width/2), 0, Math.floor(width/2), height)
  camera_right.aspect = (width/2)/height
  camera_right.updateProjectionMatrix()

  renderer.setScissor(Math.floor(width/2), 0, Math.floor(width/2), height)
  renderer.setScissorTest(true)

  renderer.render(scene, camera_right)
  // console.log(camera_right.rotation, camera_right.position)

}

function render_top() {
  renderer.setViewport(0, Math.floor(height/2), Math.floor(width/2), Math.floor(height/2))
  camera_right.aspect = (width/2)/(height/2)
  camera_right.updateProjectionMatrix()

  renderer.setScissor(0, Math.floor(height/2), Math.floor(width/2), Math.floor(height/2))
  renderer.setScissorTest(true)

  renderer.render(scene, camera_top)
}

function moveBoids() {
  for (let boid of boids) {
    BOIDS.flyTowardsCenter(boid, boids)
    BOIDS.avoidOthers(boid, boids)
    BOIDS.matchVelocity(boid, boids)
    BOIDS.limitSpeed(boid, boids)
    BOIDS.keepWithinBounds(boid, boids)

    boid.position.add(boid.velocity)


    const x = Math.floor(boid.position.x)
    const y = Math.floor(boid.position.y)

    if (x < 0 || x >= GRID_COUNT || y < 0 || y >= GRID_COUNT) {
      continue
    }

    grid[x][y].layers.set(2)

  }
}

init()
timeStep()
