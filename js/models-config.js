const canvas = document.querySelector("#canvas-3d");
const rangeXEl = document.querySelector("#rangeX");
const rangeYEl = document.querySelector("#rangeY");
const rangeZEl = document.querySelector("#rangeZ");
const rangeAllEl = document.querySelector("#rangeAll");

const frameImgCont = document.querySelector("#frame-img");

frameImgCont.addEventListener("click", (e) => {
  const src = e.target.dataset.src;
  console.log(src);
  const len = model3D.children.length;

  for (let i = 0; i < len; i += 1) {
    model3D.children.pop();
  }
  // const id = e.target.dataset.id;
  // const localSrc = materialLoader.modelsLocalSrc[materialLoader.modelsIds.indexOf(id)];
  // materialLoader.fetchData(id).then((data) =>
  materialLoader
    // .fetchModelGLB(`https://dev.roomtodo.com${data.products[0].source.body.package}`)
    .fetchModelGLB(src)
    .then((model) => {
      const len = model.children.length;
      for (let i = 0; i < len; i += 1) {
        const mesh = model.children[0];
        model3D.add(mesh);
        materialLoader.setTestMaterialOnMesh(mesh);
      }
      onNewModelLoaded(model3D);
    });
  // );
});

const loaderCubeText = new THREE.CubeTextureLoader();
const loaderGLTF = new THREE.GLTFLoader();
const loaderTexture = new THREE.TextureLoader();

loaderCubeText.setPath("./images/textures/metal/");
const textureCube = loaderCubeText.load([
  "px.jpg",
  "nx.jpg",
  "py.jpg",
  "ny.jpg",
  "pz.jpg",
  "nz.jpg",
]);

let scene = null;
let axesHelper = null;
let camera = null;
let renderer = null;
let light = null;
let light1 = null;
let controls = null;
// ----------------------------------
initScene();
const model3D = new THREE.Object3D();
scene.add(model3D);

const curParams = {};

let geometryUpdater = new ModelGeometryUpdater();

const materialLoader = new MaterialLoader();
materialLoader.modelsIds = ["2964", "2821", "2313", "1707"];
materialLoader.modelsLocalSrc = [
  "./models/polka1.glb",
  "./models/tumba.glb",
  "./models/chair.glb",
  "./models/table-fixed.glb",
];

const data = [
  { name: "Шкаф", src: "./models/shkaf.glb" },
  { name: "Стіл", src: "./models/table-fixed.glb" },
  { name: "Тумба", src: "./models/polka.glb" },
  { name: "Крісло", src: "./models/chair.glb" },
  { name: "Диван", src: "./models/sofa2.glb" },
  { name: "Камін", src: "./models/kamin.glb" },
  { name: "Вікно", src: "./models/window.glb" },
  { name: "Двері_1", src: "./models/door2.glb" },
  { name: "Софа", src: "./models/sofa.glb" },
  { name: "Двері_2", src: "./models/door.glb" },
  { name: "Ліжко", src: "./models/bed.glb" },
];

// materialLoader.generatePrevMarkup(materialLoader.modelsIds);
materialLoader.generateButtonMarkup(data);

loaderGLTF.load("./models/testCubeAdmin.glb", async function (gltf) {
  materialLoader.testMaterial = gltf.scene.children[0].material;

  loaderGLTF.load("./models/shkaf.glb", async function (gltf) {
    gltf.scene.traverse((el) => {
      if (el.type === "Mesh") {
        model3D.add(el.clone());
      }
    });
    console.log(model3D);
    model3D.children.forEach((mesh) => {
      materialLoader.setTestMaterialOnMesh(mesh);
    });

    onNewModelLoaded(model3D);
  });
});

rangeXEl.addEventListener("input", (e) => {
  curParams.width = Number(rangeXEl.value);
  // geometryUpdater.setModelSize(model3D, curParams);
  geometryUpdater.setWidth(model3D, curParams.width);
  renderer.render(scene, camera);
  rangeXEl.parentNode.querySelector("span").textContent = `Width = ${rangeXEl.value}`;
});

rangeYEl.addEventListener("input", (e) => {
  curParams.height = Number(rangeYEl.value);
  // geometryUpdater.setModelSize(model3D, curParams);
  geometryUpdater.setHeight(model3D, curParams.height);
  renderer.render(scene, camera);
  rangeYEl.parentNode.querySelector("span").textContent = `Height = ${rangeYEl.value}`;
});

rangeZEl.addEventListener("input", (e) => {
  curParams.depth = Number(rangeZEl.value);
  // geometryUpdater.setModelSize(model3D, curParams);
  geometryUpdater.setDepth(model3D, curParams.depth);
  renderer.render(scene, camera);
  rangeZEl.parentNode.querySelector("span").textContent = `Depth = ${rangeZEl.value}`;
});

// rangeAllEl.addEventListener("input", (e) => {
//   curParams.width *= 1.1;
//   curParams.height *= 1.1;
//   curParams.depth *= 1.1;
//   // geometryUpdater.updateModelGeom
//   geometryUpdater.setModelSize(model3D, curParams);
//   // etry(curParams);
//   renderer.render(scene, camera);
// });

// -------functions
function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color("white");

  axesHelper = new THREE.AxesHelper(500);
  scene.add(axesHelper);

  camera = new THREE.PerspectiveCamera(
    75,
    canvas.offsetWidth / canvas.offsetHeight,
    2,
    2000
  );
  camera.position.set(150, 150, 250);

  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);

  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
  renderer.setClearColor(0xffffff);

  let topLight = new THREE.DirectionalLight(0xffffff, 0.7);
  topLight.position.set(0, 2, 0);
  let backLight = new THREE.DirectionalLight(0xffffff, 0.7);
  backLight.position.set(0, 0, -2);
  let leftLight = new THREE.DirectionalLight(0xffffff, 0.7);
  leftLight.position.set(-1, 0, 1);
  let rightLight = new THREE.DirectionalLight(0xffffff, 0.7);
  rightLight.position.set(1, 0, 1);

  backLight.target.position.set(0, 0.8, 0);
  leftLight.target.position.set(0, 0.8, 0);
  rightLight.target.position.set(0, 0.8, 0);

  let ambientLight = new THREE.AmbientLight(0x555555);

  scene.add(topLight);
  scene.add(backLight);
  scene.add(leftLight);
  scene.add(rightLight);
  scene.add(ambientLight);

  controls = new THREE.OrbitControls(camera, canvas);
  // controls.target.set(0, 70, 0);
  controls.addEventListener("change", () => {
    renderer.render(scene, camera);
  });
  controls.update();
}

function render() {
  renderer.render(scene, camera);
}

function onNewModelLoaded(model3D) {
  const size = geometryUpdater.getModelSize(model3D);
  const mesh = model3D.children[0];
  const xMin = mesh.geometry.boundingBox.min.x;
  const xMax = mesh.geometry.boundingBox.max.x;
  const yMin = mesh.geometry.boundingBox.min.y;
  const yMax = mesh.geometry.boundingBox.max.y;
  const zMin = mesh.geometry.boundingBox.min.z;
  const zMax = mesh.geometry.boundingBox.max.z;

  // model3D.children.forEach((mesh, index) => {
  //   mesh.geometry.translate(size.width / 2 + 10, 0, size.depth / 2 + 10);
  // });

  // model3D.children.forEach((mesh, index) => {
  //   mesh.geometry.translate(0, -size.height / 2, 0);
  // });

  // model3D.remove(model3D.children[2]);

  curParams.width = Math.round(size.width);
  curParams.height = Math.round(size.height);
  curParams.depth = Math.round(size.depth);

  rangeXEl.min = curParams.width - 10;
  rangeXEl.max = curParams.width + 100;
  rangeYEl.min = curParams.height - 10;
  rangeYEl.max = curParams.height + 100;
  rangeZEl.min = curParams.depth - 10;
  rangeZEl.max = curParams.depth + 100;

  rangeXEl.value = curParams.width;
  rangeYEl.value = curParams.height;
  rangeZEl.value = curParams.depth;

  // geometryUpdater.setModelSize(model3D, curParams);
  rangeXEl.parentNode.querySelector("span").textContent = `Width = ${rangeXEl.value}`;
  rangeYEl.parentNode.querySelector("span").textContent = `Height = ${rangeYEl.value}`;
  rangeZEl.parentNode.querySelector("span").textContent = `Depth = ${rangeZEl.value}`;
  render();
}

const v1 = new THREE.Vector3(0, -1, 0);
const v2 = new THREE.Vector3(10, 10, 0);
// console.log((v2.angleTo(v1) / Math.PI) * 180);
const A = { x: 5, y: 0, z: 0 };
const B = { x: 0, y: 5, z: 0 };
const C = { x: 0, y: 0, z: 5 };
const vectorAB = { x: B.x - A.x, y: B.y - A.y, z: B.z - A.z };

function getAngle(v1, v2) {
  const fi = Math.acos(
    (v1.x * v2.x + v1.y * v2.y + v1.z * v2.z) /
      (Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z) *
        Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z))
  );
  const fiRad = (fi * 180) / Math.PI;

  return fiRad;
}

// console.log(getAngle(v1, v2));
// console.log((Math.atan(-1 / -2) * 180) / Math.PI);
const plane = new THREE.Plane();
plane.setFromCoplanarPoints(
  new THREE.Vector3(5, 0, 0),
  new THREE.Vector3(0, 5, -5),
  new THREE.Vector3(0, 0, -5)
);