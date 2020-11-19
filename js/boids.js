
const BOID_COUNT = 100;
const visualRange = 80

function distance(boid1, boid2) {
  var temp = boid1.position.clone()
  temp.sub(boid2.position)
  var dist = temp.length()
  temp = null
  return dist
}

function nClosestBoids(boid, n) {
  const sorted = boids.slice()
  sorted.sort((a, b) => distance(boid, a) - distance(boid, b))
  return sorted.slice(1, n+1);
}

function keepWithinBounds(boid) {
  const margin = 50
  const turnFactor = 1

  if (boid.position.x < -window.innerWidth/2 + margin) {
    boid.velocity.x += turnFactor
  }
  if (boid.position.x > window.innerWidth/2 - margin) {
    boid.velocity.x -= turnFactor
  }
  if (boid.position.y < -window.innerHeight/2 + margin) {
    boid.velocity.y += turnFactor
  }
  if (boid.position.y > window.innerHeight/2 - margin) {
    boid.velocity.y -= turnFactor
  }
}

function flyTowardsCenter(boid) {
  const centeringFactor = 0.005

  let center = new THREE.Vector3()
  let numNeighbors = 0

  for (let otherBoid of boids) {
    if (distance(boid, otherBoid) < visualRange) {
      center.x += otherBoid.position.x
      center.y += otherBoid.position.y

      numNeighbors += 1
    }
  }

  if (numNeighbors > 0) {
    center.divideScalar(numNeighbors)
    center.sub(boid.position)
    center.multiplyScalar(centeringFactor)

    boid.velocity.add(center)
  }
}

function avoidOthers(boid) {
  const minDistance = 25
  const avoidFactor = 0.05

  let move = new THREE.Vector3()
  for (let otherBoid of boids) {
    if (otherBoid !== boid) {
      if (distance(boid, otherBoid) < minDistance) {
        let temp = boid.position.clone()
        temp.sub(otherBoid.position)

        move.add(temp)
        temp = null
      }
    }
  }

  move.multiplyScalar(avoidFactor)
  boid.velocity.add(move)
}

function matchVelocity(boid) {
  const matchingFactor = 0.05

  let avg = new THREE.Vector3()
  let numNeighbors = 0

  for (let otherBoid of boids) {
    if (distance(boid, otherBoid) < visualRange) {
      avg.add(otherBoid.velocity)
      numNeighbors += 1
    }
  }

  if (numNeighbors > 0) {
    avg.divideScalar(numNeighbors)
    avg.sub(boid.velocity)
    avg.multiplyScalar(matchingFactor)

    boid.velocity.add(avg)
  }
}

function limitSpeed(boid) {
  const speedLimit = velocity/1.5;

  const speed = boid.velocity.length()

  if (speed > speedLimit) {
    boid.velocity.divideScalar(speed)
    boid.velocity.multiplyScalar(speedLimit)
  }
}
