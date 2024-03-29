const canvas = document.querySelector("#canvas-3d");
const rangeXEl = document.querySelector("#rangeX");
const rangeYEl = document.querySelector("#rangeY");
const rangeDistEl = document.querySelector("#rangeDist");
const rangeThicknessEl = document.querySelector("#rangeTh");

const frameImgCont = document.querySelector("#frame-img");
frameImgCont.addEventListener("click", (e) => {
  const id = e.target.dataset.id;
  materialLoader.setMaterialOnMesh(frameMesh, id);
  // materialLoader.setMaterialOnAllMeshes(model3D, id);
});

const loaderCubeText = new THREE.CubeTextureLoader();
const loaderGLTF = new GLTFLoader();
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
const model3D = new THREE.Object3D();
let frontMesh = null;
let backMesh = null;
let frameMesh = null;

const curParams = {};

let frameUpdater = null;
let frontUpdater = null;
let backUpdater = null;

const materialLoader = new MaterialLoader();
materialLoader.frameMaterialIds = ["32729", "32611", "738", "2053", "386", "108", "109"];
materialLoader.frontMaterialIds = ["32506", "774"];
materialLoader.backMaterialIds = ["32716"];
materialLoader.lampMaterialIds = ["1555"];

materialLoader.generatePrevMarkup(materialLoader.frameMaterialIds);

initScene();

loaderGLTF.load("./models/frame-lamp-fixed.glb", async function (gltf) {
  gltf.scene.traverse((el) => {
    if (el.type === "Mesh") {
      model3D.add(el.clone());
    }
  });

  frontMesh = model3D.children.find((el) => el.name === "front");
  backMesh = model3D.children.find((el) => el.name === "back");
  frameMesh = model3D.children.find((el) => el.name === "frame");
  lampMesh = model3D.children.find((el) => el.name === "lamp");

  frameUpdater = new GeometryUpdater(frameMesh);
  frameUpdater.setInitParams = setInitParamsFrame;
  frameUpdater.getUpdatedGeometry = getUpdatedGeometryFrame;
  frameUpdater.setInitParams(data);

  frontUpdater = new GeometryUpdater(frontMesh);
  frontUpdater.getUpdatedGeometry = getUpdatedGeometryFront;

  backUpdater = new GeometryUpdater(backMesh);
  backUpdater.getUpdatedGeometry = getUpdatedGeometryBack;

  lampUpdater = new GeometryUpdater(lampMesh);
  lampUpdater.updateGeometry = updateGeometryLamp;
  lampUpdater.setInitParams = setInitParamsLamp;
  lampUpdater.setInitParams(data);

  materialLoader.setMaterialOnMesh(frameMesh, materialLoader.frameMaterialIds[0]);
  materialLoader.setMaterialOnMesh(backMesh, materialLoader.backMaterialIds[0]);
  materialLoader.setMaterialOnMesh(frontMesh, materialLoader.frontMaterialIds[0]);
  materialLoader.setMaterialOnMesh(lampMesh, materialLoader.lampMaterialIds[0]);

  curParams.width = Math.round(frameUpdater.size.width);
  curParams.height = Math.round(frameUpdater.size.height);
  curParams.lampDistTop = Math.round(lampUpdater.distTop);

  curParams.thickness = Math.round(frameUpdater.thicknessX);

  rangeXEl.value = curParams.width;
  rangeYEl.value = curParams.height;
  rangeDistEl.value = curParams.lampDistTop;
  rangeThicknessEl.value = curParams.thickness;

  updateAllGeometries();

  rangeXEl.parentNode.querySelector("span").textContent = `Width = ${rangeXEl.value}`;
  rangeYEl.parentNode.querySelector("span").textContent = `Height = ${rangeYEl.value}`;
  rangeDistEl.parentNode.querySelector(
    "span"
  ).textContent = `Lamp top dist = ${rangeDistEl.value}`;
  rangeThicknessEl.parentNode.querySelector(
    "span"
  ).textContent = `Thickness = ${rangeThicknessEl.value}`;

  scene.add(model3D);
  renderer.render(scene, camera);
});

rangeXEl.addEventListener("input", (e) => {
  curParams.width = Number(rangeXEl.value);
  updateAllGeometries();
  renderer.render(scene, camera);
  rangeXEl.parentNode.querySelector("span").textContent = `Width = ${rangeXEl.value}`;
});

rangeYEl.addEventListener("input", (e) => {
  curParams.height = Number(rangeYEl.value);
  updateAllGeometries();
  renderer.render(scene, camera);
  rangeYEl.parentNode.querySelector("span").textContent = `Height = ${rangeYEl.value}`;
});

rangeDistEl.addEventListener("input", (e) => {
  curParams.lampDistTop = Number(rangeDistEl.value);
  updateAllGeometries();
  renderer.render(scene, camera);
  rangeDistEl.parentNode.querySelector(
    "span"
  ).textContent = `Lamp top dist = ${rangeDistEl.value}`;
});

rangeThicknessEl.addEventListener("input", (e) => {
  curParams.thickness = Number(rangeThicknessEl.value);
  updateAllGeometries();
  renderer.render(scene, camera);
  rangeThicknessEl.parentNode.querySelector(
    "span"
  ).textContent = `Thickness = ${rangeThicknessEl.value}`;
});

// -------functions
function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color("white");

  // axesHelper = new THREE.AxesHelper(500);
  // scene.add(axesHelper);

  camera = new THREE.PerspectiveCamera(
    75,
    canvas.offsetWidth / canvas.offsetHeight,
    2,
    2000
  );
  camera.position.set(50, 250, 200);

  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);

  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
  renderer.setClearColor(0xffffff);

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

  scene.add(backLight);
  scene.add(leftLight);
  scene.add(rightLight);
  scene.add(ambientLight);

  controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 70, 0);
  controls.addEventListener("change", () => {
    renderer.render(scene, camera);
  });
  controls.update();
}

function render() {
  renderer.render(scene, camera);
}

function updateAllGeometries() {
  frameMesh.geometry = frameUpdater.getUpdatedGeometry(curParams);
  frontMesh.geometry = frontUpdater.getUpdatedGeometry(curParams);
  backMesh.geometry = backUpdater.getUpdatedGeometry(curParams);
  lampUpdater.updateGeometry(curParams);
}

// ------------- updater's methods ---------------
// frame
function setInitParamsFrame(data) {
  this.initParams.fixedPoints = data.frameFixedPoints;
  const { topLeft, topRight, bottomRight, bottomLeft } = data.frameFixedPoints;

  const A = topLeft[0];
  const B = topRight[topRight.length - 1];
  const C = bottomRight[0];
  const D = bottomLeft[bottomLeft.length - 1];
  const L = topLeft[topLeft.length - 1];
  const M = topRight[0];
  const N = bottomRight[bottomRight.length - 1];
  const O = bottomLeft[0];

  const k = 1; //щоб захопити точки, які виходять за "лінії"

  this.initParams.topPolygon = [
    { x: A.x - k, y: A.y + k },
    ...this.initParams.fixedPoints.topLeft,
    { x: L.x + k, y: L.y - k },
    { x: M.x - k, y: M.y - k },
    ...this.initParams.fixedPoints.topRight,
    { x: B.x + k, y: B.y + k },
  ];

  this.initParams.bottomPolygon = [
    { x: D.x - k, y: D.y - k },
    { x: C.x + k, y: C.y - k },
    ...this.initParams.fixedPoints.bottomRight,
    { x: N.x - k, y: N.y + k },
    { x: O.x + k, y: O.y + k },
    ...this.initParams.fixedPoints.bottomLeft,
  ];

  this.initParams.leftPolygon = [
    { x: A.x - k, y: A.y + k },
    ...this.initParams.fixedPoints.topLeft,
    { x: L.x + k, y: L.y - k },
    { x: O.x + k, y: O.y + k },
    ...this.initParams.fixedPoints.bottomLeft,
    { x: D.x - k, y: D.y - k },
  ];

  this.initParams.rightPolygon = [
    { x: B.x + k, y: B.y + k },
    { x: C.x + k, y: C.y - k },
    ...this.initParams.fixedPoints.bottomRight,
    { x: N.x - k, y: N.y + k },
    { x: M.x - k, y: M.y - k },
    ...this.initParams.fixedPoints.topRight,
  ];

  // this.thickness = B.x - M.x;
  this.thicknessX = B.x - M.x;
  this.thicknessY = B.y - M.y;
}

function getUpdatedGeometryFrame(params) {
  const updatedGeometry = this.geometry.clone();
  const pos = updatedGeometry.attributes.position.array;
  const uv = updatedGeometry.attributes.uv.array;
  const initPos = this.pos;

  this.delta = this.calcDelta(params);
  this.scale = this.calcScale(params);

  const scaleX = this.scale.x;
  const scaleY = this.scale.y;

  const ratioUV = this.ratioUV;

  //
  const A = this.initParams.fixedPoints.topLeft[0];
  const B =
    this.initParams.fixedPoints.topRight[this.initParams.fixedPoints.topRight.length - 1];
  const C = this.initParams.fixedPoints.bottomRight[0];
  const D =
    this.initParams.fixedPoints.bottomLeft[
      this.initParams.fixedPoints.bottomLeft.length - 1
    ];
  const L =
    this.initParams.fixedPoints.topLeft[this.initParams.fixedPoints.topLeft.length - 1];
  const M = this.initParams.fixedPoints.topRight[0];
  const N =
    this.initParams.fixedPoints.bottomRight[
      this.initParams.fixedPoints.bottomRight.length - 1
    ];
  const O = this.initParams.fixedPoints.bottomLeft[0];

  const scaleTX = params.thickness / this.thicknessX;
  const scaleTY = params.thickness / this.thicknessY;
  const kx = params.width / 2 - params.thickness;
  const ky = params.height - params.thickness;

  //

  let dx = 0;
  let dy = 0;

  for (let i = 0; i < pos.length; i += 3) {
    const point = {
      x: pos[i],
      y: pos[i + 1],
      z: pos[i + 2],
    };

    const iUV = (i / 3) * 2;

    if (this.isPointAtPointsList(this.initParams.fixedPoints.bottomLeft, point)) {
      // зміщуєм вліво
      pos.set(
        [
          (point.x + Math.abs(O.x)) * scaleTX - kx,
          (point.y - Math.abs(O.y)) * scaleTY + params.thickness,
          point.z,
        ],
        i
      );
      dx = pos[i] - initPos[i];
      dy = pos[i + 1] - initPos[i + 1];
      uv.set([uv[iUV] + dx * ratioUV, uv[iUV + 1] - dy * ratioUV], iUV);
    } else if (this.isPointAtPointsList(this.initParams.fixedPoints.topLeft, point)) {
      //зміщуєм вверх і вліво
      pos.set(
        [
          (point.x + Math.abs(L.x)) * scaleTX - kx,
          (point.y - Math.abs(L.y)) * scaleTY + ky,
          point.z,
        ],
        i
      );
      dx = pos[i] - initPos[i];
      dy = pos[i + 1] - initPos[i + 1];
      uv.set([uv[iUV] + dx * ratioUV, uv[iUV + 1] - dy * ratioUV], iUV);
    } else if (this.isPointAtPointsList(this.initParams.fixedPoints.topRight, point)) {
      //зміщуєм вверх і вправо
      pos.set(
        [
          (point.x - Math.abs(M.x)) * scaleTX + kx,
          (point.y - Math.abs(M.y)) * scaleTY + ky,
          point.z,
        ],
        i
      );
      dx = pos[i] - initPos[i];
      dy = pos[i + 1] - initPos[i + 1];
      uv.set([uv[iUV] + dx * ratioUV, uv[iUV + 1] - dy * ratioUV], iUV);
    } else if (this.isPointAtPointsList(this.initParams.fixedPoints.bottomRight, point)) {
      //зміщуєм вправо
      pos.set(
        [
          (point.x - Math.abs(N.x)) * scaleTX + kx,
          (point.y - Math.abs(N.y)) * scaleTY + params.thickness,
          point.z,
        ],
        i
      );
      dx = pos[i] - initPos[i];
      dy = pos[i + 1] - initPos[i + 1];
      uv.set([uv[iUV] + dx * ratioUV, uv[iUV + 1] - dy * ratioUV], iUV);
    } else if (this.isPointInPolygon(point, this.initParams.topPolygon)) {
      // розтягуємо по ОХ і зміщуємо вверх
      pos.set([point.x * scaleX, (point.y - M.y) * scaleTY + ky, point.z], i);
      dx = pos[i] - initPos[i];
      dy = pos[i + 1] - initPos[i + 1];
      uv.set([uv[iUV] + dx * ratioUV, uv[iUV + 1] - dy * ratioUV], iUV);
    } else if (this.isPointInPolygon(point, this.initParams.bottomPolygon)) {
      // розтягуємо по ОХ
      pos.set(
        [point.x * scaleX, (point.y - N.y) * scaleTY + params.thickness, point.z],
        i
      );
      dx = pos[i] - initPos[i];
      dy = pos[i + 1] - initPos[i + 1];
      uv.set([uv[iUV] + dx * ratioUV, uv[iUV + 1] - dy * ratioUV], iUV);
    } else if (this.isPointInPolygon(point, this.initParams.leftPolygon)) {
      // розтягуємо по ОY і зміщуєм вліво
      pos.set([(point.x + Math.abs(L.x)) * scaleTX - kx, point.y * scaleY, point.z], i);
      dx = pos[i] - initPos[i];
      dy = pos[i + 1] - initPos[i + 1];
      uv.set([uv[iUV] + dx * ratioUV, uv[iUV + 1] - dy * ratioUV], iUV);
    } else if (this.isPointInPolygon(point, this.initParams.rightPolygon)) {
      // розтягуємо по ОY і зміщуємо вправо
      pos.set([(point.x - M.x) * scaleTX + kx, point.y * scaleY, point.z], i);
      dx = pos[i] - initPos[i];
      dy = pos[i + 1] - initPos[i + 1];
      uv.set([uv[iUV] + dx * ratioUV, uv[iUV + 1] - dy * ratioUV], iUV);
    } else {
      console.log("lost point:");
      console.log(point);
    }
  }

  return updatedGeometry;
}

// front
function getUpdatedGeometryFront(params) {
  const updatedGeometry = this.geometry.clone();
  const pos = updatedGeometry.attributes.position.array;
  const uv = updatedGeometry.attributes.uv.array;
  const initPos = this.pos;

  const fixedParams = { width: params.width - 5, height: params.height - 5 };

  this.delta = this.calcDelta(fixedParams);
  this.scale = this.calcScale(fixedParams);

  const scaleX = this.scale.x;
  const scaleY = this.scale.y;

  const ratioUV = this.ratioUV;

  let dx = 0;
  let dy = 0;

  for (let i = 0; i < pos.length; i += 3) {
    const point = {
      x: pos[i],
      y: pos[i + 1],
      z: pos[i + 2],
    };

    const iUV = (i / 3) * 2;

    pos.set([point.x * scaleX, point.y * scaleY, point.z], i);
    dx = pos[i] - initPos[i];
    dy = pos[i + 1] - initPos[i + 1];
    uv.set([uv[iUV] + dx * ratioUV, uv[iUV + 1] - dy * ratioUV], iUV);
  }

  return updatedGeometry;
}

//back
function getUpdatedGeometryBack(params) {
  const updatedGeometry = this.geometry.clone();
  const pos = updatedGeometry.attributes.position.array;
  const uv = updatedGeometry.attributes.uv.array;
  const initPos = this.pos;

  this.delta = this.calcDelta(params);
  this.scale = this.calcScale(params);

  const scaleX = this.scale.x;
  const scaleY = this.scale.y;

  const ratioUV = this.ratioUV;

  let dx = 0;
  let dy = 0;

  for (let i = 0; i < pos.length; i += 3) {
    const point = {
      x: pos[i],
      y: pos[i + 1],
      z: pos[i + 2],
    };

    const iUV = (i / 3) * 2;

    pos.set([point.x * scaleX, point.y * scaleY, point.z], i);
    dx = pos[i] - initPos[i];
    dy = pos[i + 1] - initPos[i + 1];
    uv.set([uv[iUV] - dx * ratioUV, uv[iUV + 1] - dy * ratioUV], iUV);
  }

  return updatedGeometry;
}

// lamp
function updateGeometryLamp(params) {
  const deltaX = frameUpdater.delta.dx;
  const deltaY = frameUpdater.delta.dy;

  lampMesh.position.x = deltaX / 2 + this.distRight - params.thickness / 2 + 1;
  lampMesh.position.y = deltaY + this.distTop - params.lampDistTop;
}

function setInitParamsLamp(data) {
  const E = data.lampCenterCoord;
  const B = data.frameFixedPoints.topRight[data.frameFixedPoints.topRight.length - 1];

  this.distTop = B.y - E.y;
  this.distRight = B.x - E.x;
}

// ---------деякі ф-ї, що можуть знадобитися
function indexToArr(indexArr, arr, quantity) {
  let res = new Float32Array(indexArr.length * quantity);
  let iCur = 0;

  for (let i = 0; i < indexArr.length; i += 1) {
    let arrCur = [];

    for (let j = 0; j < quantity; j += 1) {
      arrCur.push(arr[indexArr[i] * quantity + j]);
    }

    res.set(arrCur, iCur);
    iCur += quantity;
  }

  return res;
}
function updateFrontGeometryFixIndex() {
  const geo = initParams.geometry.front.clone();
  const index = geo.index.array;

  const pos = indexToArr(index, geo.attributes.position.array, 3);
  const uv = indexToArr(index, geo.attributes.uv.array, 2);

  const fixedGeo = new THREE.BufferGeometry();
  fixedGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  fixedGeo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  fixedGeo.attributes.position.array = pos;
  fixedGeo.attributes.uv.array = uv;
  fixedGeo.computeVertexNormals();

  initParams.geometry.frontFixed = fixedGeo.clone();
}
