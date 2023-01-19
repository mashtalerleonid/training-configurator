const canvas3d = document.querySelector("#canvas-3d");

const canvasResult = document.querySelector("#canvas-result");
let ctxRes = canvasResult.getContext("2d");

const canvasResultN = document.querySelector("#canvas-result-n");
let ctxResN = canvasResultN.getContext("2d");

const cwBtn = document.querySelector("#cw");
const ccwBtn = document.querySelector("#ccw");
const fxBtn = document.querySelector("#fx");
const fyBtn = document.querySelector("#fy");
const applyBtn = document.querySelector("#apply");

let cubeTexture = null;

let scene = new THREE.Scene();
scene.background = new THREE.Color("black");

let camera = new THREE.PerspectiveCamera(
    75,
    canvas3d.offsetWidth / canvas3d.offsetHeight,
    2,
    2000
);
camera.position.set(100, 200, 300);

let renderer = new THREE.WebGLRenderer({
    canvas: canvas3d,
});
renderer.setSize(canvas3d.offsetWidth, canvas3d.offsetHeight);
// renderer.setClearColor(0xff0000);

const light = new THREE.DirectionalLight(0xffffff);
light.position.set(2, 4, 2);
scene.add(light);

const light1 = new THREE.AmbientLight(0xffffff);
scene.add(light1);

const controls = new THREE.OrbitControls(camera, canvas3d);
controls.addEventListener("change", () => {
    renderer.render(scene, camera);
});
controls.update();

const axesHelper = new THREE.AxesHelper(1000);
scene.add(axesHelper);

let loaderGLTF = new THREE.GLTFLoader();
let loaderTexture = new THREE.TextureLoader();

//--------------
loaderTexture.load("../images/romb_d.jpg", (texture) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    // texture.flipY = false;

    cubeMaterial.map = texture;
    cubeMaterial.map.repeat.set(0.5, 0.5);
    cubeMaterial.metalness = 0.5;
    cubeMaterial.roughness = 0.2;
    cubeMaterial.needsUpdate = true;

    renderer.render(scene, camera);

    canvasResult.width = cubeMesh.material.map.image.width / 2;
    canvasResult.height = cubeMesh.material.map.image.height / 2;

    ctxRes.drawImage(
        cubeMesh.material.map.image,
        0,
        0,
        cubeMesh.material.map.image.width,
        cubeMesh.material.map.image.height
    );
});

loaderTexture.load("../images/romb_n.jpg", (texture) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    // texture.flipY = false;

    cubeMaterial.normalMap = texture;
    cubeMaterial.normalMap.repeat.set(0.5, 0.5);

    cubeMaterial.needsUpdate = true;

    renderer.render(scene, camera);

    canvasResultN.width = cubeMesh.material.map.image.width / 2;
    canvasResultN.height = cubeMesh.material.map.image.height / 2;

    ctxResN.drawImage(
        cubeMesh.material.normalMap.image,
        0,
        0,
        cubeMesh.material.map.image.width,
        cubeMesh.material.map.image.height
    );
});
//------------------

const cubeObj = new THREE.Object3D();
const cubeGeom = new THREE.BoxBufferGeometry(100, 100, 100);
const cubeMaterial = new THREE.MeshStandardMaterial({});
const cubeMesh = new THREE.Mesh(cubeGeom, cubeMaterial);

const maps = [
    "alphaMap",
    "aoMap",
    "bumpMap",
    "emissiveMap",
    "envMap",
    "lightMap",
    "map",
    "metalnessMap",
    "normalMap",
    "roughnessMap",
    "displacementMap",
];

// var geom = cubeMesh.geometry;
// if (geom.attributes.uv && geom.attributes.uv.length !== 0) {
//     var arr = geom.attributes.uv.array;
//     for (var i = 0; i < arr.length - 1; i += 2) {
//         arr[i + 1] = -arr[i + 1];
//     }
//     geom.attributes.uv.needsUpdate = true;
// }

cubeObj.add(cubeMesh);
scene.add(cubeObj);
renderer.render(scene, camera);

// --------

cwBtn.addEventListener("click", (e) => transformCW(e));

function transformCW(e) {
    console.log(e.target.dataset.type);
    function generateNewImg(map) {
        const canvasTemp = document.createElement("canvas");

        const ctx = canvasTemp.getContext("2d");
        canvasTemp.width = cubeMesh.material[map].image.width;
        canvasTemp.height = cubeMesh.material[map].image.height;

        ctx.translate(canvasTemp.width / 2, canvasTemp.height / 2);
        ctx.rotate(Math.PI / 2);
        // ctx.scale(1, -1);

        ctx.translate(-canvasTemp.width / 2, -canvasTemp.height / 2);

        ctx.drawImage(
            cubeMesh.material[map].image,
            0,
            0,
            cubeMesh.material[map].image.width,
            cubeMesh.material[map].image.height
        );

        return canvasTemp;
    }

    // const canvasTemp = document.createElement("canvas");

    // const ctx = canvasTemp.getContext("2d");
    // canvasTemp.width = cubeMesh.material.map.image.width;
    // canvasTemp.height = cubeMesh.material.map.image.height;

    // ctx.translate(canvasTemp.width / 2, canvasTemp.height / 2);
    // ctx.rotate(Math.PI / 2);
    // // ctx.scale(-1, 1);

    // ctx.translate(-canvasTemp.width / 2, -canvasTemp.height / 2);

    // ctx.drawImage(
    //     cubeMesh.material.map.image,
    //     0,
    //     0,
    //     cubeMesh.material.map.image.width,
    //     cubeMesh.material.map.image.height
    // );
    // const canvasDiffBase64URL = generateNewImg("map").toDataURL();
    // const canvasNormBase64URL = generateNewImg("normalMap").toDataURL();

    function setNewTexture(texture, map) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        cubeMesh.material[map] = texture;
        cubeMaterial[map].repeat.set(0.5, 0.5);

        cubeMesh.material.needsUpdate = true;
    }

    // let texture = new THREE.CanvasTexture(generateNewImg("map"));

    // setNewTexture(texture, "map");

    for (let i = 0; i < maps.length; i += 1) {
        const map = maps[i];
        if (!cubeMesh.material[map]?.image) {
            console.log("ret");
            continue;
        }

        let texture = new THREE.CanvasTexture(generateNewImg(map));

        setNewTexture(texture, map);

        console.log(cubeMesh);
    }

    // loaderTexture.load(canvasDiffBase64URL, (texture) => {
    // texture.wrapS = THREE.RepeatWrapping;
    // texture.wrapT = THREE.RepeatWrapping;
    // texture.flipY = false;

    // cubeMesh.material.map = texture;
    // cubeMesh.material.needsUpdate = true;

    // renderer.render(scene, camera);

    ctxRes.drawImage(
        cubeMesh.material.map.image,
        0,
        0,
        cubeMesh.material.map.image.width,
        cubeMesh.material.map.image.height
    );

    // });

    // texture = new THREE.CanvasTexture(generateNewImg("normalMap"));

    // setNewTexture(texture, "normalMap");

    // loaderTexture.load(canvasNormBase64URL, (texture) => {
    // texture.wrapS = THREE.RepeatWrapping;
    // texture.wrapT = THREE.RepeatWrapping;

    // cubeMesh.material.normalMap = texture;
    // cubeMesh.material.needsUpdate = true;

    renderer.render(scene, camera);

    ctxResN.drawImage(
        cubeMesh.material.normalMap.image,
        0,
        0,
        cubeMesh.material.normalMap.image.width,
        cubeMesh.material.normalMap.image.height
    );
    // });
}
