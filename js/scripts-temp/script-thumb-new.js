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
const rangeXEl = document.querySelector("#rangeX");
const rangeYEl = document.querySelector("#rangeY");
const rangeZEl = document.querySelector("#rangeZ");
const rangeEl = document.querySelector("#range");

let scene = new THREE.Scene();
scene.background = new THREE.Color("white");

let axesHelper = new THREE.AxesHelper(1000);
scene.add(axesHelper);

let camera = new THREE.PerspectiveCamera(
  75,
  canvas.offsetWidth / canvas.offsetHeight,
  2,
  2000
);
camera.position.set(50, 50, 100);

let renderer = new THREE.WebGLRenderer({
  canvas,
});
renderer.setPixelRatio(window.devicePixelRatio);

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
  length: Number(rangeXEl.value),
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

const obj = new THREE.Object3D();

let geom = null;
let geomArr = [];
let geomArrInit = [];

loaderGLTF.load("../models/plate.glb", async function (gltf) {
  console.log(gltf.scene);

  gltf.scene.traverse((el) => {
    console.log("done");
    if (el.type === "Mesh") {
      obj.add(el.clone());
    }
  });
  // obj = gltf.scene.children[0].children[0];
  //   obj = new THREE.Object3D().add(obj.children[4]);

  //   obj.children[1].material = new THREE.MeshStandardMaterial({
  //     color: new THREE.Color(0xff0000),
  //   });

  console.log(obj);

  loaderTexture.load("../images/fon.jpg", (texture) => {
    // obj.scale.x = 1;
    // obj.scale.y = 1;
    // obj.scale.z = 1;
    obj.children.forEach((mesh, index) => {
      if (true) {
        // if (index === 0) {
        texture.wrapT = THREE.RepeatWrapping;
        texture.wrapS = THREE.RepeatWrapping;
        mesh.material = new THREE.MeshStandardMaterial({
          envMap: textureCube,
          map: texture,
          roughness: 0,
          metalness: 0,
        });
      } else {
        mesh.material = new THREE.MeshStandardMaterial({
          color: "green",
        });
      }

      geomArr.push(mesh.geometry.clone());
    });
    // obj.children[1].material.emissive.r = 0.8;

    scene.add(obj);
    // scene.add(new THREE.Object3D().add(obj.children[0]));

    renderer.render(scene, camera);
  });
});

let k = 200;
let pos = [];
let uv = [];
let normal = [];

let prevX = 1;
let prevY = 1;
let prevZ = 1;
let prev = 1;
let sc = 1;

function fooX(value) {
  sc = value / prevX;

  prevX = value;

  obj.children.forEach((mesh, index) => {
    // let geo = geomArr[index].clone();
    // uv = geomArr[index].attributes.uv.array;
    // normal = geomArr[index].attributes.normal.array;
    let geo = mesh.geometry;
    uv = geo.attributes.uv.array;
    normal = geo.attributes.normal.array;
    mesh.scale.x *= sc;

    // mesh.scale.set(value, 1, 1);

    for (let i = 0; i < uv.length; i += 2) {
      // if (normal[(i / 2) * 3] !== 1 && normal[(i / 2) * 3] !== -1) {
      if (Math.abs(normal[(i / 2) * 3]) > 0.9) {
        // geo.attributes.uv.array.set([uv[i], uv[i + 1] * value], i);
        geo.attributes.uv.array.set([uv[i], uv[i + 1]], i);
      } else if (Math.abs(normal[(i / 2) * 3 + 1]) > 0.9) {
        geo.attributes.uv.array.set([uv[i] * sc, uv[i + 1]], i);
      } else if (Math.abs(normal[(i / 2) * 3 + 2]) > 0.9) {
        geo.attributes.uv.array.set([uv[i] * sc, uv[i + 1]], i);
      } else {
        // geo.attributes.uv.array.set([uv[i], uv[i + 1]], i);
        geo.attributes.uv.array.set([uv[i] * sc, uv[i + 1]], i);
      }
    }
    geo.attributes.uv.needsUpdate = true;

    // mesh.geometry.copy(geo);
  });
}

function fooY(value) {
  sc = value / prevY;

  prevY = value;

  obj.children.forEach((mesh, index) => {
    // if (index !== 1) {
    // let geo = geomArr[index].clone();
    // uv = geomArr[index].attributes.uv.array;
    // normal = geomArr[index].attributes.normal.array;
    // geo.scale(1, value, 1);

    let geo = mesh.geometry;
    uv = geo.attributes.uv.array;
    normal = geo.attributes.normal.array;

    mesh.scale.y = value;

    for (let i = 0; i < uv.length; i += 2) {
      // if (normal[(i / 2) * 3 + 1] !== 1 && normal[(i / 2) * 3 + 1] !== -1) {
      if (Math.abs(normal[(i / 2) * 3 + 1]) > 0.9) {
        geo.attributes.uv.set([uv[i], uv[i + 1]], i);
      } else if (Math.abs(normal[(i / 2) * 3 + 2]) > 0.9) {
        geo.attributes.uv.array.set([uv[i] * sc, uv[i + 1]], i);
      } else {
        geo.attributes.uv.set([uv[i] * sc, uv[i + 1]], i);
      }
    }
    // mesh.geometry.copy(geo);
    geo.attributes.uv.needsUpdate = true;
  });

  // obj.children.forEach((mesh, index) => {
  //   let geo = geomArr[index].clone();
  //   uv = geomArr[index].attributes.uv.array;
  //   normal = geomArr[index].attributes.normal.array;

  //   geo.scale(1, value, 1);

  //   for (let i = 0; i < uv.length; i += 2) {
  //     if (normal[(i / 2) * 3 + 1] !== 1 && normal[(i / 2) * 3 + 1] !== -1) {
  //       geo.attributes.uv.array.set([uv[i] * value, uv[i + 1]], i);
  //     } else {
  //       geo.attributes.uv.array.set([uv[i], uv[i + 1]], i);
  //     }
  //   }

  //   mesh.geometry.copy(geo);
  // });
}

function fooZ(value) {
  sc = value / prevZ;
  prevZ = value;
  obj.children.forEach((mesh, index) => {
    // if (index !== 1) {
    // let geo = geomArr[index].clone();
    // uv = geomArr[index].attributes.uv.array;
    // normal = geomArr[index].attributes.normal.array;
    // geo.scale(1, 1, value);
    let geo = mesh.geometry;
    uv = geo.attributes.uv.array;
    normal = geo.attributes.normal.array;

    mesh.scale.z = value;
    for (let i = 0; i < uv.length; i += 2) {
      // if (normal[(i / 2) * 3 + 2] !== 1 && normal[(i / 2) * 3 + 2] !== -1) {
      if (Math.abs(normal[(i / 2) * 3 + 2]) > 0.9) {
        geo.attributes.uv.array.set([uv[i], uv[i + 1]], i);
      } else if (Math.abs(normal[(i / 2) * 3 + 1]) > 0.9) {
        geo.attributes.uv.array.set([uv[i] * sc, uv[i + 1]], i);
      } else {
        geo.attributes.uv.array.set([uv[i], uv[i + 1] * sc], i);
      }
    }
    // mesh.geometry.copy(geo);
    geo.attributes.uv.needsUpdate = true;

    // } else {
    // mesh.geometry.translate(0, 0, value);
    // }
  });
  // --------------------------------

  // obj.children.forEach((mesh) => {
  //   // const k = findPartScaleCoeff(mesh);
  //   mesh.scale.set(value, value, value);

  // mesh.geometry.attributes.uv.array.forEach(function (element, index) {
  //   mesh.geometry.attributes.uv.array.set([element * value], index);
  // });
  // mesh.geometry.attributes.uv.needsUpdate = true;
  // });
}

function fooAll(value) {
  // -------правильне збільшення UV при масштабування всіх вимірів
  sc = value / prev;
  prev = value;

  obj.children.forEach((mesh, index) => {
    // let geo = geomArr[index].clone();
    // geo.scale(value, value, value);
    // mesh.geometry.copy(geo);
    //   // mesh.scale.set(1, 1, value);
    mesh.scale.set(value, value, value);
    mesh.geometry.attributes.uv.array.forEach(function (element, index) {
      mesh.geometry.attributes.uv.array.set([element * sc], index);
    });
    mesh.geometry.attributes.uv.needsUpdate = true;
  });
  // -------END правильне збільшення UV при масштабування всіх вимірів
}

function fooZOld(value) {
  for (let i = 0; i < obj.children.length; i++) {
    if (i !== 2) {
      continue;
    }
    geom = geomArr[i].clone();

    geom.scale(value, value, value);
    console.log(
      geom.attributes.position.array[0 * 2],
      geom.attributes.position.array[1 * 2],
      geom.attributes.position.array[2 * 2]
    );
    console.log(
      geom.attributes.position.array[3 * 2],
      geom.attributes.position.array[4 * 2],
      geom.attributes.position.array[5 * 2]
    );

    console.log(geom);
    let posOld = geomArr.positions;
    let posNew = geom.positions;
    let countVert = geom.attributes.position.count;
    console.log(countVert);

    for (let i = 0; i < countVert.length; i += 3) {
      let distOld = Math.sqrt(
        Math.pow(posOld[i * 3] - posOld[i * 3], 2) +
          Math.pow(posOld[i * 3 + 1] - posOld[i * 3 + 1], 2) +
          Math.pow(posOld[i * 3 + 2] - posOld[i * 3 + 2], 2)
      );
    }
    // --------------------------
    // geom.scale(value, value, value);

    geom.attributes.uv.array.forEach((coord, j) => {
      geom.attributes.uv.set([geomArr[i].attributes.uv.array[j] * value], j);
    });

    obj.children[i].geometry = geom;
  }
}

rangeXEl.addEventListener("input", (e) => {
  //   geomArr.forEach((g, i) => {
  // if (i !== 4) {
  fooX(Number(rangeXEl.value) / 1000);
  // }
  //   });
  // console.log(Number(rangeEl.value) / 1000);
  renderer.render(scene, camera);
});

rangeYEl.addEventListener("input", (e) => {
  fooY(Number(rangeYEl.value) / 1000);

  renderer.render(scene, camera);
});

rangeZEl.addEventListener("input", (e) => {
  //   geomArr.forEach((g, i) => {
  fooZ(Number(rangeZEl.value) / 1000);
  //   console.log(obj.children[0].geometry.attributes.position);
  //   });
  //   fooZ(Number(rangeZEl.value) / 1000);
  renderer.render(scene, camera);
});
rangeEl.addEventListener("input", (e) => {
  fooAll(Number(rangeEl.value) / 1000);
  renderer.render(scene, camera);
});

// ---
const findPartScaleCoeff = function (mesh) {
  if (!mesh) return;
  if (!mesh.geometry.attributes.uv) return;

  var totalDistUV = 0;
  var totalDistPos = 0;
  for (var i = 0; i < mesh.geometry.index.array.length / 3; i++) {
    var indA = mesh.geometry.index.array.at(i * 3);
    var indB = mesh.geometry.index.array.at(i * 3 + 1);
    var indC = mesh.geometry.index.array.at(i * 3 + 2);

    var uvA = [
      mesh.geometry.attributes.uv.array.at(indA * 2),
      mesh.geometry.attributes.uv.array.at(indA * 2 + 1),
    ];
    var uvB = [
      mesh.geometry.attributes.uv.array.at(indB * 2),
      mesh.geometry.attributes.uv.array.at(indB * 2 + 1),
    ];
    var uvC = [
      mesh.geometry.attributes.uv.array.at(indC * 2),
      mesh.geometry.attributes.uv.array.at(indC * 2 + 1),
    ];

    var posA = [
      mesh.geometry.attributes.position.array.at(indA * 3),
      mesh.geometry.attributes.position.array.at(indA * 3 + 1),
      mesh.geometry.attributes.position.array.at(indA * 3 + 2),
    ];
    var posB = [
      mesh.geometry.attributes.position.array.at(indB * 3),
      mesh.geometry.attributes.position.array.at(indB * 3 + 1),
      mesh.geometry.attributes.position.array.at(indB * 3 + 2),
    ];
    var posC = [
      mesh.geometry.attributes.position.array.at(indC * 3),
      mesh.geometry.attributes.position.array.at(indC * 3 + 1),
      mesh.geometry.attributes.position.array.at(indC * 3 + 2),
    ];

    var uvDistAB = Math.sqrt(Math.pow(uvB[0] - uvA[0], 2) + Math.pow(uvB[1] - uvA[1], 2));
    var uvDistBC = Math.sqrt(Math.pow(uvC[0] - uvB[0], 2) + Math.pow(uvC[1] - uvB[1], 2));
    var uvDistCA = Math.sqrt(Math.pow(uvA[0] - uvC[0], 2) + Math.pow(uvA[1] - uvC[1], 2));

    var posDistAB = Math.sqrt(
      Math.pow(posB[0] - posA[0], 2) +
        Math.pow(posB[1] - posA[1], 2) +
        Math.pow(posB[2] - posA[2], 2)
    );
    var posDistBC = Math.sqrt(
      Math.pow(posC[0] - posB[0], 2) +
        Math.pow(posC[1] - posB[1], 2) +
        Math.pow(posC[2] - posB[2], 2)
    );
    var posDistCA = Math.sqrt(
      Math.pow(posA[0] - posC[0], 2) +
        Math.pow(posA[1] - posC[1], 2) +
        Math.pow(posA[2] - posC[2], 2)
    );

    totalDistUV = totalDistUV + uvDistAB + uvDistBC + uvDistCA;
    totalDistPos = totalDistPos + posDistAB + posDistBC + posDistCA;
  }

  var sumScaleX = 1;
  var sumScaleY = 1;
  var sumScaleZ = 1;
  var obj = mesh;
  while (obj) {
    sumScaleX *= obj.scale.x;
    sumScaleY *= obj.scale.y;
    sumScaleZ *= obj.scale.z;
    obj = obj.parent;
  }
  return ((totalDistPos / totalDistUV) * (sumScaleX + sumScaleY + sumScaleZ)) / 3 / 100;
};
