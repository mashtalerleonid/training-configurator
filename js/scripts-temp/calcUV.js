// import * as THREE from "https://cdn.skypack.dev/three@0.134.0";
// import { OrbitControls } from "https://cdn.skypack.dev/three@0.134.0/examples/jsm/controls/OrbitControls.js";

const loader = new THREE.CubeTextureLoader();
loader.setPath("./images/textures/metal/");
const textureCube = loader.load([
  "px.jpg",
  "nx.jpg",
  "py.jpg",
  "ny.jpg",
  "pz.jpg",
  "nz.jpg",
]);

const texture = new THREE.TextureLoader().load("./images/fon.jpg", animate);
texture.wrapT = THREE.RepeatWrapping;
texture.wrapS = THREE.RepeatWrapping;

const canvas = document.querySelector("canvas");
const rangeXEl = document.querySelector("#rangeX");
const rangeYEl = document.querySelector("#rangeY");

let scene = new THREE.Scene();
scene.background = new THREE.Color("black");

let axesHelper = new THREE.AxesHelper(1000);
scene.add(axesHelper);

let camera = new THREE.PerspectiveCamera(
  75,
  canvas.offsetWidth / canvas.offsetHeight,
  2,
  2000
);
camera.position.set(200, 500, 1000);

let renderer = new THREE.WebGLRenderer({
  canvas,
});
renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);

const light = new THREE.DirectionalLight(0x404040);
light.position.set(100, 500, 2000);
scene.add(light);
const light1 = new THREE.AmbientLight(0xffffff);
scene.add(light1);

const controls = new THREE.OrbitControls(camera, canvas);
controls.addEventListener("change", animate);
controls.update();

// ----------------------------------

let fig = {
  length: Number(rangeXEl.value),
  width: 600,
  height: Number(rangeYEl.value),
  lipHeight: Number(rangeYEl.value)+20,
  lipThickness: 10,
  lipInnerHeight: 0,
  innerLength: 0,
  innerWidth: 0,
  countLipInnerHeight() {
    return this.lipHeight - this.height;
  },
  countInnerLength() {
    return this.length - 2 * this.lipThickness;
  },
  countInnerWidth() {
    return this.width - 2 * this.lipThickness;
  },
};

fig.lipInnerHeight = fig.countLipInnerHeight();
fig.innerLength = fig.countInnerLength();
fig.innerWidth = fig.countInnerWidth();

let k = 150;
let pos = [];
let uv = [];

function calcPos() {
  pos = [
    { x: 0, y: 0, z: fig.width }, //0
    { x: fig.length, y: 0, z: fig.width }, //1
    { x: fig.length, y: fig.lipHeight, z: fig.width }, //2
    { x: 0, y: fig.lipHeight, z: fig.width }, //3

    { x: fig.length, y: 0, z: fig.width }, //4
    { x: fig.length, y: 0, z: 0 }, //5
    { x: fig.length, y: fig.lipHeight, z: 0 }, //6
    { x: fig.length, y: fig.lipHeight, z: fig.width }, //7

    { x: fig.length, y: 0, z: 0 }, //8
    { x: 0, y: 0, z: 0 }, //9
    { x: 0, y: fig.lipHeight, z: 0 }, //10
    { x: fig.length, y: fig.lipHeight, z: 0 }, //11

    { x: 0, y: 0, z: 0 }, //12
    { x: 0, y: 0, z: fig.width }, //13
    { x: 0, y: fig.lipHeight, z: fig.width }, //14
    { x: 0, y: fig.lipHeight, z: 0 }, //15

    { x: 0, y: fig.lipHeight, z: fig.width }, //16
    { x: fig.length, y: fig.lipHeight, z: fig.width }, //17
    { x: fig.length, y: fig.lipHeight, z: 0 }, //18
    { x: 0, y: fig.lipHeight, z: 0 }, //19
    { x: fig.lipThickness, y: fig.lipHeight, z: fig.width - fig.lipThickness }, //20
    {
      x: fig.length - fig.lipThickness,
      y: fig.lipHeight,
      z: fig.width - fig.lipThickness,
    }, //21
    {
      x: fig.length - fig.lipThickness,
      y: fig.lipHeight,
      z: fig.lipThickness,
    }, //22
    { x: fig.lipThickness, y: fig.lipHeight, z: fig.lipThickness }, //23

    { x: fig.lipThickness, y: fig.height, z: fig.lipThickness }, //24
    { x: fig.length - fig.lipThickness, y: fig.height, z: fig.lipThickness }, //25
    { x: fig.length - fig.lipThickness, y: fig.lipHeight, z: fig.lipThickness }, //26
    { x: fig.lipThickness, y: fig.lipHeight, z: fig.lipThickness }, //27

    { x: fig.lipThickness, y: fig.height, z: fig.width - fig.lipThickness }, //28
    { x: fig.lipThickness, y: fig.height, z: fig.lipThickness }, //29
    { x: fig.lipThickness, y: fig.lipHeight, z: fig.lipThickness }, //30
    { x: fig.lipThickness, y: fig.lipHeight, z: fig.width - fig.lipThickness }, //31

    {
      x: fig.length - fig.lipThickness,
      y: fig.height,
      z: fig.lipThickness,
    }, //32
    {
      x: fig.length - fig.lipThickness,
      y: fig.height,
      z: fig.width - fig.lipThickness,
    }, //33
    {
      x: fig.length - fig.lipThickness,
      y: fig.lipHeight,
      z: fig.width - fig.lipThickness,
    }, //34
    {
      x: fig.length - fig.lipThickness,
      y: fig.lipHeight,
      z: fig.lipThickness,
    }, //35

    {
      x: fig.length - fig.lipThickness,
      y: fig.height,
      z: fig.width - fig.lipThickness,
    }, //36
    {
      x: fig.lipThickness,
      y: fig.height,
      z: fig.width - fig.lipThickness,
    }, //37
    { x: fig.lipThickness, y: fig.lipHeight, z: fig.width - fig.lipThickness }, //38
    {
      x: fig.length - fig.lipThickness,
      y: fig.lipHeight,
      z: fig.width - fig.lipThickness,
    }, //39

    { x: fig.lipThickness, y: fig.height, z: fig.width - fig.lipThickness }, //40
    {
      x: fig.length - fig.lipThickness,
      y: fig.height,
      z: fig.width - fig.lipThickness,
    }, //41
    { x: fig.length - fig.lipThickness, y: fig.height, z: fig.lipThickness }, //42
    { x: fig.lipThickness, y: fig.height, z: fig.lipThickness }, //43

    { x: 0, y: 0, z: 0 }, //44
    { x: fig.length, y: 0, z: 0 }, //45
    { x: fig.length, y: 0, z: fig.width }, //46
    { x: 0, y: 0, z: fig.width }, //47
  ];
}

function calcUV() {
  uv = [
    [0, 0], //0
    [fig.length / k, 0], //1
    [fig.length / k, fig.lipHeight / k], //2
    [0, fig.lipHeight / k], //3

    [0, 0], //4
    [fig.width / k, 0], //5
    [fig.width / k, fig.lipHeight / k], //6
    [0, fig.lipHeight / k], //7

    [0, 0], //8
    [fig.length / k, 0], //9
    [fig.length / k, fig.lipHeight / k], //10
    [0, fig.lipHeight / k], //11

    [0, 0], //12
    [fig.width / k, 0], //13
    [fig.width / k, fig.lipHeight / k], //14
    [0, fig.lipHeight / k], //15

    [0, 0], //16
    [fig.length / k, 0], //17
    [fig.length / k, fig.width / k], //18
    [0, fig.width / k], //19
    [fig.lipThickness / k, fig.lipThickness / k], //20
    [(fig.length - fig.lipThickness) / k, fig.lipThickness / k], //21
    [(fig.length - fig.lipThickness) / k, (fig.width - fig.lipThickness) / k], //22
    [fig.lipThickness / k, (fig.width - fig.lipThickness) / k], //23

    [fig.innerWidth / k, 0], //24
    [(fig.innerWidth + fig.innerLength) / k, 0], //25
    [(fig.innerWidth + fig.innerLength) / k, fig.lipInnerHeight / k], //26
    [fig.innerWidth / k, fig.lipInnerHeight / k], //27

    [0, 0], //28
    [fig.innerWidth / k, 0], //29
    [fig.innerWidth / k, fig.lipInnerHeight / k], //30
    [0, fig.lipInnerHeight / k], //31

    [(fig.innerWidth + fig.innerLength) / k, 0], //32
    [(fig.innerWidth * 2 + fig.innerLength) / k, 0], //33
    [(fig.innerWidth * 2 + fig.innerLength) / k, fig.lipInnerHeight / k], //34
    [(fig.innerWidth + fig.innerLength) / k, fig.lipInnerHeight / k], //35

    [(fig.innerWidth * 2 + fig.innerLength) / k, 0], //36
    [(fig.innerWidth * 2 + fig.innerLength * 2) / k, 0], //37
    [(fig.innerWidth * 2 + fig.innerLength * 2) / k, fig.lipInnerHeight / k], //38
    [(fig.innerWidth * 2 + fig.innerLength) / k, fig.lipInnerHeight / k], //39

    [fig.lipThickness / k, fig.lipThickness / k], //40
    [(fig.length - fig.lipThickness) / k, fig.lipThickness / k], //41
    [(fig.length - fig.lipThickness) / k, (fig.width - fig.lipThickness) / k], //42
    [fig.lipThickness / k, (fig.width - fig.lipThickness) / k], //43

    [0, 0], //44
    [fig.length / k, 0], //45
    [fig.length / k, fig.width / k], //46
    [0, fig.width / k], //47
  ];
}

calcPos();
calcUV();

const numVertices = pos.length;
const positions = new Float32Array(numVertices * 3);
const uvs = new Float32Array(numVertices * 2);

function setNewPos() {
  let index = 0;
  pos.forEach((p) => {
    positions.set([p.x, p.y, p.z], index);
    index += 3;
  });
}

function setNewUV() {
  let index = 0;
  uv.forEach((p) => {
    uvs.set([p[0], p[1]], index);
    index += 2;
  });
}

setNewPos();
setNewUV();

// ---------------------
const figGeometry = new THREE.BufferGeometry();
figGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
figGeometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
figGeometry.setIndex([
  0, 1, 2, 2, 3, 0, 4, 5, 6, 6, 7, 4, 8, 9, 10, 10, 11, 8, 12, 13, 14, 14, 15,
  12, 16, 17, 21, 21, 20, 16, 17, 18, 22, 22, 21, 17, 18, 19, 23, 23, 22, 18,
  19, 16, 20, 20, 23, 19, 24, 25, 26, 26, 27, 24, 28, 29, 30, 30, 31, 28, 32,
  33, 34, 34, 35, 32, 36, 37, 38, 38, 39, 36, 40, 41, 42, 42, 43, 40, 44, 45,
  46, 46, 47, 44,
]);

rangeXEl.addEventListener("input", () => {
  fig.length = Number(rangeXEl.value);
  fig.lipInnerHeight = fig.countLipInnerHeight();
  fig.innerLength = fig.countInnerLength();
  fig.innerWidth = fig.countInnerWidth();

  calcPos();
  calcUV();
  setNewPos();
  setNewUV();

  figGeometry.attributes.position.set(positions);
  figGeometry.attributes.uv.set(uvs);
  figGeometry.attributes.position.needsUpdate = true;
  figGeometry.attributes.uv.needsUpdate = true;
  animate();
});

rangeYEl.addEventListener("input", () => {
  // fig.height = Number(rangeYEl.value);
  fig.lipHeight = Number(rangeYEl.value);
  fig.lipInnerHeight = fig.countLipInnerHeight();
  fig.innerLength = fig.countInnerLength();
  fig.innerWidth = fig.countInnerWidth();

  calcPos();
  calcUV();
  setNewPos();
  setNewUV();

  figGeometry.attributes.position.set(positions);
  figGeometry.attributes.uv.set(uvs);
  figGeometry.attributes.position.needsUpdate = true;
  figGeometry.attributes.uv.needsUpdate = true;
  animate();
});

figGeometry.computeVertexNormals();

// ----------------------------------

const figMaterial = new THREE.MeshStandardMaterial({
  envMap: textureCube,
  map: texture,
  // color: 0xffffff,
  roughness: 0,
  metalness: 0,
});

let mesh = new THREE.Mesh(figGeometry, figMaterial);
mesh.translateX(-fig.length / 2);
mesh.translateZ(-fig.width / 2);
scene.add(mesh);

function animate() {
  // requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

// -----------------------
// geometry = new THREE.PlaneBufferGeometry(200, 200);
// material = new THREE.MeshBasicMaterial({
//   color: 0xffffff,
//   // side: THREE.DoubleSide,
// });
// const plane = new THREE.Mesh(geometry, material);
// plane.rotation.x = -Math.PI / 2;
// plane.position.set(200, thickness / 2 + 1, 100);
// // scene.add(plane);
// --------------------------
