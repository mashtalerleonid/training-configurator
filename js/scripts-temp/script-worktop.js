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

// const texture = new THREE.TextureLoader().load("./images/fon.jpg", animate);
// texture.wrapT = THREE.RepeatWrapping;
// texture.wrapS = THREE.RepeatWrapping;

const canvas = document.querySelector("#canvas-3d");
const rangeEl = document.querySelector("#rangeX");

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
camera.position.set(100, 200, 400);

let renderer = new THREE.WebGLRenderer({
  canvas,
});
renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
renderer.setClearColor(0xffffff);

const light = new THREE.DirectionalLight(0x404040);
light.position.set(100, 500, 1000);
scene.add(light);
const light1 = new THREE.AmbientLight(0xffffff);
scene.add(light1);

const controls = new THREE.OrbitControls(camera, canvas);
controls.addEventListener("change", () => {
  renderer.render(scene, camera);
});
controls.update();
// ---------------------------------
let fig = {
  length: Number(rangeEl.value),
  width: 600,
  height: 30,
  lipHeight: 50,
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

// ----------------------------------
let loaderGLTF = new THREE.GLTFLoader();
let loaderTexture = new THREE.TextureLoader();

let obj = null;
let geom = null;

loaderGLTF.load("../models/worktop.glb", async function (gltf) {
  obj = gltf.scene.children[0].children[0].children[0];
  console.log(obj);

  loaderTexture.load("../images/fon-1.png", (texture) => {
    texture.wrapT = THREE.RepeatWrapping;
    texture.wrapS = THREE.RepeatWrapping;
    // texture.repeat.x = 1;
    // texture.repeat.y = 1;
    // texture.mapping = THREE.EquirectangularReflectionMapping;
    obj.material = new THREE.MeshStandardMaterial({
      envMap: textureCube,
      map: texture,
      // color: 0xffffff,
      roughness: 0,
      metalness: 0,
    });
  });

  scene.add(obj);
  geom = obj.geometry.clone();
  console.log(geom);

  foo(1);
  setTimeout(() => {
    renderer.render(scene, camera);
  }, 300);
});

let k = 150;
let pos = [];
let uv = [];
let normal = [];

function foo(value) {
  // console.log(...obj.geometry.attributes.position.array);
  let geo = geom.clone();
  uv = [...geo.attributes.uv.array];
  normal = [...geo.attributes.normal.array];

  // for (let i = 0; i < normal.length; i += 3) {
  //   console.log(normal[i], normal[i + 1], normal[i + 2]);
  // }

  // geo.scale(value, 1, 1);

  // console.log(...obj.geometry.attributes.position.array);

  // // pos = [...geo.attributes.position.array];
  // uv = [...geo.attributes.uv.array];
  // console.log(uv);
  // uv.forEach((el) => {
  //   el = el + 1;
  // });
  // calcPos();
  // calcUV();

  const numVertices = uv.length / 2;
  // const positions = new Float32Array(numVertices * 3);
  const uvs = new Float32Array(numVertices * 2);
  // for (let i = 0; i < uv.length; i += 2) {
  //     if (normal[(i / 2) * 3] !== 1 && normal[(i / 2) * 3] !== -1) {
  //         uvs.set([uv[i], uv[i + 1] * value], i);
  //     } else {
  //         uvs.set([uv[i], uv[i + 1]], i);
  //     }
  // }

  for (let i = 0; i < uv.length; i += 2) {
    if (normal[(i / 2) * 3] !== 1 && normal[(i / 2) * 3] !== -1) {
      uvs.set([uv[i], uv[i + 1] * 2], i);
    } else {
      uvs.set([uv[i], uv[i + 1]], i);
    }
  }

  // setNewPos();
  // setNewUV();

  // obj.geometry.attributes.position.set(positions);
  geo.attributes.uv.set(uvs);

  // obj.geometry.setIndex([
  //   0, 1, 2, 2, 3, 0, 4, 5, 6, 6, 7, 4, 8, 9, 10, 10, 11, 8, 12, 13, 14, 14, 15,
  //   12, 16, 17, 21, 21, 20, 16, 17, 18, 22, 22, 21, 17, 18, 19, 23, 23, 22, 18,
  //   19, 16, 20, 20, 23, 19, 24, 25, 26, 26, 27, 24, 28, 29, 30, 30, 31, 28, 32,
  //   33, 34, 34, 35, 32, 36, 37, 38, 38, 39, 36, 40, 41, 42, 42, 43, 40, 44, 45,
  //   46, 46, 47, 44,
  // ]);

  geo.computeVertexNormals();

  geo.attributes.position.needsUpdate = true;
  geo.attributes.uv.needsUpdate = true;

  // console.log();
  obj.geometry.copy(geo);
  renderer.render(scene, camera);

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
}

// setTimeout(() => {
// console.log(obj.geometry.attributes.position.array);

// }, 400);

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

// setNewPos();
// setNewUV();

// ---------------------
// const figGeometry = new THREE.BufferGeometry();
// figGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
// figGeometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
// figGeometry.setIndex([
//   0, 1, 2, 2, 3, 0, 4, 5, 6, 6, 7, 4, 8, 9, 10, 10, 11, 8, 12, 13, 14, 14, 15,
//   12, 16, 17, 21, 21, 20, 16, 17, 18, 22, 22, 21, 17, 18, 19, 23, 23, 22, 18,
//   19, 16, 20, 20, 23, 19, 24, 25, 26, 26, 27, 24, 28, 29, 30, 30, 31, 28, 32,
//   33, 34, 34, 35, 32, 36, 37, 38, 38, 39, 36, 40, 41, 42, 42, 43, 40, 44, 45,
//   46, 46, 47, 44,
// ]);

// figGeometry.attributes.position.set(positions);
// figGeometry.attributes.uv.set(uvs);
// figGeometry.attributes.position.needsUpdate = true;
// figGeometry.attributes.uv.needsUpdate = true;

rangeEl.addEventListener(
  "input",
  (e) => {
    foo(Number(rangeEl.value) / 1000);
  }

  // fig.length = Number(rangeEl.value);
  // fig.lipInnerHeight = fig.countLipInnerHeight();
  // fig.innerLength = fig.countInnerLength();
  // fig.innerWidth = fig.countInnerWidth();

  // calcPos();
  // calcUV();
  // setNewPos();
  // setNewUV();

  // figGeometry.attributes.position.set(positions);
  // figGeometry.attributes.uv.set(uvs);
  // figGeometry.attributes.position.needsUpdate = true;
  // figGeometry.attributes.uv.needsUpdate = true;
);

// figGeometry.computeVertexNormals();

// -----------------------OLD
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
