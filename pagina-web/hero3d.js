import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";

/* ─── SETUP ────────────────────────────────────── */
const container = document.getElementById("hero-canvas");
const W = () => window.innerWidth;
const H = () => window.innerHeight;

const scene    = new THREE.Scene();
scene.background = null; // fully transparent

const camera = new THREE.PerspectiveCamera(55, W() / H(), 0.1, 1000);
camera.position.set(0, 0, 6.5);

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(W(), H());
renderer.setClearColor(0x000000, 0);
container.appendChild(renderer.domElement);

/* ─── GEOMETRY ─────────────────────────────────── */
const group = new THREE.Group();

// Outer wireframe shell
const geoOuter = new THREE.IcosahedronGeometry(2.6, 1);
const matOuter = new THREE.MeshStandardMaterial({
  color:       0x5aad9c,
  emissive:    0x1a4d56,
  wireframe:   true,
  transparent: true,
  opacity:     0.22,
});
const meshOuter = new THREE.Mesh(geoOuter, matOuter);
group.add(meshOuter);

// Mid solid glass sphere
const geoMid = new THREE.SphereGeometry(2.0, 32, 32);
const matMid = new THREE.MeshPhysicalMaterial({
  color:       0x397b9c,
  emissive:    0x0d2a38,
  metalness:   0.2,
  roughness:   0.1,
  transmission: 0.55,
  thickness:   1.5,
  transparent: true,
  opacity:     0.12,
  side:        THREE.FrontSide,
});
const meshMid = new THREE.Mesh(geoMid, matMid);
group.add(meshMid);

// Inner icosahedron (solid, subtle)
const geoInner = new THREE.IcosahedronGeometry(1.5, 2);
const matInner = new THREE.MeshStandardMaterial({
  color:       0x49949c,
  emissive:    0x0f3040,
  metalness:   0.6,
  roughness:   0.2,
  transparent: true,
  opacity:     0.18,
});
const meshInner = new THREE.Mesh(geoInner, matInner);
group.add(meshInner);

/* ring */
const geoRing = new THREE.TorusGeometry(3.2, 0.012, 8, 80);
const matRing = new THREE.MeshBasicMaterial({
  color:       0x5aad9c,
  transparent: true,
  opacity:     0.18,
});
const ring = new THREE.Mesh(geoRing, matRing);
ring.rotation.x = Math.PI * 0.2;
group.add(ring);

const geoRing2 = new THREE.TorusGeometry(3.5, 0.008, 8, 90);
const matRing2 = new THREE.MeshBasicMaterial({
  color:       0x397b9c,
  transparent: true,
  opacity:     0.10,
});
const ring2 = new THREE.Mesh(geoRing2, matRing2);
ring2.rotation.x = Math.PI * 0.45;
ring2.rotation.y = Math.PI * 0.1;
group.add(ring2);

scene.add(group);

/* ─── PARTICLES ────────────────────────────────── */
const particleCount = 180;
const pPositions   = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  const theta = Math.random() * Math.PI * 2;
  const phi   = Math.acos(2 * Math.random() - 1);
  const r     = 3.8 + Math.random() * 3;
  pPositions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
  pPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
  pPositions[i * 3 + 2] = r * Math.cos(phi);
}
const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));
const pMat = new THREE.PointsMaterial({
  color:       0x5aad9c,
  size:        0.045,
  transparent: true,
  opacity:     0.5,
  sizeAttenuation: true,
});
const particles = new THREE.Points(pGeo, pMat);
scene.add(particles);

/* ─── LIGHTS ───────────────────────────────────── */
const ambientLight = new THREE.AmbientLight(0xacd6ce, 0.6);
scene.add(ambientLight);

const light1 = new THREE.PointLight(0x5aad9c, 3.5, 18);
light1.position.set(6, 6, 6);
scene.add(light1);

const light2 = new THREE.PointLight(0x397b9c, 2.5, 16);
light2.position.set(-5, -4, 4);
scene.add(light2);

const light3 = new THREE.PointLight(0xacd6ce, 1.2, 12);
light3.position.set(0, 8, 2);
scene.add(light3);

/* ─── POSITION OFFSET (desktop) ────────────────── */
function positionScene() {
  if (W() > 900) {
    // shift toward right side so text on left isn't covered
    group.position.x     =  1.6;
    particles.position.x =  1.6;
  } else {
    // centre on mobile — sits below text via CSS z-index stacking
    group.position.x     = 0;
    particles.position.x = 0;
    group.scale.setScalar(0.8);
  }
}
positionScene();

/* ─── ANIMATE ──────────────────────────────────── */
let time = 0;
function animate() {
  requestAnimationFrame(animate);
  time += 0.006;

  // gentle rotations at different speeds for depth
  meshOuter.rotation.y += 0.0018;
  meshOuter.rotation.x += 0.0008;
  meshMid.rotation.y   -= 0.001;
  meshInner.rotation.y += 0.0024;
  meshInner.rotation.x += 0.0012;
  ring.rotation.z      += 0.0014;
  ring2.rotation.x     += 0.0006;

  // floating bob
  group.position.y = Math.sin(time * 0.7) * 0.22;

  // light pulse
  light1.intensity = 3.5 + Math.sin(time * 1.1) * 0.6;
  light2.intensity = 2.5 + Math.cos(time * 0.8) * 0.4;

  particles.rotation.y += 0.0004;

  renderer.render(scene, camera);
}
animate();

/* ─── RESIZE ───────────────────────────────────── */
window.addEventListener("resize", () => {
  camera.aspect = W() / H();
  camera.updateProjectionMatrix();
  renderer.setSize(W(), H());
  positionScene();
}, { passive: true });