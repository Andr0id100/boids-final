import * as THREE from "./three.module.js"
import { OrbitControls } from "./OrbitControls.js"
import Stats from "./stats.module.js"
import "./boids.js"

const GRID_COUNT = 40
const MAX_HEIGHT = 20

const BOID_COUNT = 9

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
  let geom = new THREE.SphereGeometry(0.8, 8, 8)
  let mat = new THREE.MeshBasicMaterial({color: 0xffffff})

  for (var i=0;i<BOID_COUNT;i++) {
    let mesh = new THREE.Mesh(geom, mat)
    mesh.position.set(Math.random() * 20, Math.random() * 20, 0)
    mesh.layers.set(1)

    scene.add(mesh)
    boids.push(mesh)
  }
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
  camera_top.position.z = 80
  camera_top.lookAt(GRID_COUNT/2, GRID_COUNT/2, 0)
  camera_top.zoom = 10
  camera_top.updateProjectionMatrix()
  camera_top.layers.set(1)

  camera_right = new THREE.PerspectiveCamera(50, width/height, 0.1, 200)
 // Got these number from manual viewing
  camera_right.position.set(10, -20, 90)
  camera_right.layers.set(2)

  const controls = new OrbitControls(camera_right, renderer.domElement)
  controls.target = new THREE.Vector3(GRID_COUNT/2, GRID_COUNT/2, 0)
  controls.update()

  // const helper = new THREE.AxesHelper(20);
  // scene.add(helper)
  // helper.layers.set(1)

  stats = new Stats()
  container.appendChild(stats.dom)

  generate_terrain()
  init_boids()
}


function timeStep() {
  requestAnimationFrame(timeStep)
  stats.update()

  const x = Math.floor(Math.random() * GRID_COUNT)
  const y = Math.floor(Math.random() * GRID_COUNT)
  // grid[x][y].material.color.setHex(0x00ff00)
  grid[x][y].layers.set(2)

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

init()
timeStep()
