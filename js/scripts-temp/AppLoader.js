let token = null;
let lang = null;
let urlFiles = "";
let urlEntities = "";
let urlProducts = "";
let urlMaterials = "";
let urlApps = "";
let dx = 0;
let dz = 0;

let materialsList = []; //список всіх об'єктів матеріалів з ІД, витягнутих з категорій
let modelData = {}; //об'єкт - дані про модель - результат запиту за моделлю по ІД
// let figTextures = []; //масив завантажених текстур, які вже можна застосовувати
let figTextureSources = []; //масив ресурсів текстур, які на моделі
let complex3D = null; //3Д модель об'єднана з кількох 3Д
let model3D = null; //3Д модель, завантажена Loader-ом
let model3DFiltered = null; //3Д модель, тільки з mesh

let loaderGLTF = new THREE.GLTFLoader();
let loaderTexture = new THREE.TextureLoader();

window.addEventListener("DOMContentLoaded", loadHandler);
window.addEventListener("message", messageHandler);

function loadHandler(e) {
  window.parent.postMessage(JSON.stringify({ action: "app_ready" }), "*");
  appScene.render();
}

function messageHandler(e) {
  // let messageObj = {};
  // try {
  //   messageObj = JSON.parse(e.data);
  //   console.log(messageObj);
  // } catch (error) {
  //   console.error("Error parse JSON string!");
  //   return;
  // }

  const messageObj = {
    action: "set_data",
    lang: "ua",
    product_id: "",
    scene_data: {},
    // user: Rodion
    // token: "fdf6bce9338a77da10d6c02a518a0e61bb9ebc3e4291fbe16c70ae51e922beb3",
    token: "73e1c7705e1a3b721b0521f332a9830af48fd53779d1a6eac5aedebb09f3ce1c",
    // user
    url_apps: "https://dev.roomtodo.com/api/entities/apps",
    url_entities: "https://dev.roomtodo.com/api/entities",
    url_files: "https://dev.roomtodo.com/api/entities/upload",
    url_materials:
      "https://dev.roomtodo.com/api/category/public_materials?key=7d578cdc2b4287320c8c7db6a9c98912",
    url_products:
      "https://dev.roomtodo.com/api/category/tree?key=7d578cdc2b4287320c8c7db6a9c98912",

    scene_data: {
      construction: {
        cap: { wh: 280 },
        points: [],
        rooms: [],
        walls: [],
      },
    },
  };

  if (messageObj.action === "set_data") {
    urlFiles = messageObj.url_files;
    urlEntities = messageObj.url_entities;
    urlProducts = messageObj.url_products;
    urlMaterials = messageObj.url_materials;
    urlApps = messageObj.url_apps;
    token = messageObj.token;
    lang = messageObj.lang;

    if (messageObj.product_id) {
      appScene.currentModelId = messageObj.product_id;
    } else {
      appScene.currentModelId = "";
    }

    appScene.setSceneData(messageObj.scene_data);

    fetchCategoryTree(`${urlProducts}`).then((res) => {
      treeModel = res.tree;
      curLevelModel = treeModel;
      console.log(treeModel);

      renderCategories(treeModel, "to-left", categoriesListEl);

      setCategoryListeners();
    });

    loadAllMaterials().then((e) => {
      console.log(e);
      if (appScene.currentModelId) {
        openComplexEntity(appScene.currentModelId);
      }
    });
  }
}

async function loadAllMaterials() {
  const headers = {
    "x-token": token,
    "x-lang": lang,
  };

  let response = await fetch(urlMaterials, {
    headers,
    method: "GET",
  });

  let data = await response.json();
  let categories = data.materials;
  let urlList = [];

  categories.forEach((category) => {
    if (category.type === "category") {
      category.nodes.forEach((node) => {
        urlList.push(node.urlList);
      });
    } else if (category.type === "product") {
      urlList.push(category.urlList);
    }
  });

  for (let i = 0; i < urlList.length; i += 1) {
    const url = `https://dev.roomtodo.com${urlList[i]}`; //!!!!!!!!!!!!!!!!!!!!
    let response = await fetch(url, {
      headers,
      metod: "GET",
    });

    let data = await response.json();
    materialsList.push(...data.products);
  }

  return materialsList;
}

async function openEntity1(id) {
  //відкриває модель по ІД і добавляє матеріали
  // await fetchEntityExample(id);
  await fetchEntity(id);

  loaderGLTF.load(modelData.source, async function (gltf) {
    figTextureSources = [];
    model3D = gltf.scene.children[0].clone();
    let model3DFiltered = new THREE.Object3D();

    getTextures();

    let k = 0;

    while (k === 0) {
      model3D.children.forEach((mesh) => {
        if (mesh.type === "Mesh") {
          mesh.name = "";
          model3DFiltered.add(mesh.clone());
          k += 1;
        }
      });

      if (k === 0) {
        model3D = model3D.children[0].clone();
      }
    }

    model3DFiltered.position.y = Number(modelData.properties.positionY);
    model3DFiltered.position.x = appScene.meshForDrag.position.x;
    model3DFiltered.position.z = appScene.meshForDrag.position.z;

    appScene.container.remove(appScene.selectedObject);
    appScene.selectedObject = model3DFiltered;
    appScene.build3d(appScene.selectedObject);

    appScene.isBuilded = true;
    if (!appScene.isMousePressed) {
      appScene.selectedObject = null;
      appScene.isBuilded = false;
    }

    k = 0;
    model3DFiltered.children.forEach((child, index) => {
      if (figTextureSources[index] !== "") {
        loaderTexture.load(figTextureSources[index], (texture) => {
          //!!!!!!!!!
          onLoad(texture, child, index);
        });
      }
    });

    if (figTextureSources.some((el) => el === "")) {
      appScene.setProductData(model3DFiltered, modelData);
      appScene.setContour(model3DFiltered);
      appScene.build3d(model3DFiltered);
    }
    // -------func
    function onLoad(texture, child) {
      texture.wrapT = THREE.RepeatWrapping;
      texture.wrapS = THREE.RepeatWrapping;
      child.material = new THREE.MeshStandardMaterial({
        map: texture,
      });

      k += 1;

      if (k === figTextureSources.length) {
        appScene.setProductData(model3DFiltered, modelData);
        appScene.setContour(model3DFiltered);
        appScene.build3d(model3DFiltered);
      }
    }

    function getTextures() {
      for (let i = 0; i < modelData.geometries.length; i += 1) {
        const mat = materialsList.find(
          (e) => e.id === modelData.geometries[i].materialId
        );

        figTextureSources.push(mat ? mat.source.images.preview : "");
      }
    }
  });
  //   return resp.data.metaZip;
}

async function openComplexEntity(id) {
  //відкриває комплексну модель по ІД і добавляє матеріали
  let cur = new THREE.Object3D();

  await fetchEntity(id);

  loaderGLTF.load(modelData.source, async function (gltf) {
    figTextureSources = [];
    complex3D =
      gltf.scene.children[0].name === "configurator_container"
        ? gltf.scene.children[0].clone()
        : gltf.scene.children[0].children[0].clone();

    if (complex3D.children.some((el) => el.type === "Mesh")) {
      complex3D.children.forEach((el) => {
        if (el.type === "Mesh") {
          cur.add(el.clone());
        }
      });
      complex3D = new THREE.Object3D().add(cur.clone());
    }

    getTextures();

    let k = 0;

    complex3D.children.forEach((obj, i) => {
      obj.children.forEach((mesh, j) => {
        mesh.name = "";

        const index =
          complex3D.children
            .slice(0, i)
            .reduce((prev, child) => prev + child.children.length, 0) + j;

        if (figTextureSources[index] !== "") {
          loaderTexture.load(figTextureSources[index], (texture) => {
            onLoad(texture, mesh, index);
          });
        }
      });
    });

    if (figTextureSources.some((el) => el === "")) {
      appScene.tmpProductData = modelData;
      appScene.setContours(complex3D.children);
      appScene.buildComplex3d(complex3D);
    }

    // ----func
    function onLoad(texture, mesh) {
      texture.wrapT = THREE.RepeatWrapping;
      texture.wrapS = THREE.RepeatWrapping;
      mesh.material = new THREE.MeshStandardMaterial({
        map: texture,
      });

      k += 1;

      if (k === figTextureSources.length) {
        appScene.tmpProductData = modelData;
        appScene.setContours(complex3D.children);
        appScene.buildComplex3d(complex3D);
      }
    }

    function getTextures() {
      complex3D.children.forEach((obj, i) => {
        obj.children.forEach((mesh, j) => {
          const mat = materialsList.find(
            (e) => e.id === mesh.userData.materialId
          );

          figTextureSources.push(mat ? mat.source.images.preview : "");
        });
      });
    }
  });
  //   return resp.data.metaZip;
}

async function fetchEntity(id) {
  let response = await fetch(`${urlEntities}/${id}`, {
    headers: {
      "x-token": token,
      "x-lang": lang,
    },
    method: "GET",
  });

  let resp = await response.json();

  if (appScene.selectedObject) {
    appScene.selectedObject.scale.x = resp.data.properties.width / 100;
    appScene.selectedObject.scale.y = resp.data.properties.height / 100;
    appScene.selectedObject.scale.z = resp.data.properties.depth / 100;
  }

  console.log(resp);

  modelData = resp.data;
}

// Saving
async function createModelBlob() {
  const gltfExporter = new THREE.GLTFExporter();

  const options = {
    trs: false,
    onlyVisible: true,
    truncateDrawRange: true,
    binary: true,
    maxTextureSize: Infinity,
  };

  appScene.container.children.forEach((ob) => {
    ob.remove(ob.getObjectByName("contour"));
  });

  const bbox = new THREE.Box3().setFromObject(appScene.container);

  dx = (bbox.max.x + bbox.min.x) / 2;
  dz = (bbox.max.z + bbox.min.z) / 2;

  appScene.container.children.forEach((child) => {
    child.position.x -= dx;
    child.position.z -= dz;
    child.userData.dx = dx;
    child.userData.dz = dz;
  });

  appScene.container.children.forEach((obj, i) => {
    obj.children.forEach((mesh, j) => {
      const index =
        appScene.container.children
          .slice(0, i)
          .reduce((prev, child) => prev + child.children.length, 0) + j;
      mesh.name = `mesh_${index}`;
      mesh.userData.md5 = `${index}`;
    });
  });

  await new Promise((resolve, reject) => {
    gltfExporter.parse(
      appScene.container,
      function (result) {
        appScene.modelBlob = new Blob([result], {
          type: "application/octet-stream",
        });
        resolve();
      },
      options
    );
  });
}

function getPreview(size = 150) {
  let prevRenderer = new THREE.WebGLRenderer({ antialias: true });
  let preview = document.createElement("canvas");

  appScene.scene.remove(appScene.construction);
  appScene.scene.remove(appScene.ground);

  let bbox = new THREE.Box3().setFromObject(appScene.container);
  let modelWidth = bbox.max.x - bbox.min.x;
  let modelHeight = bbox.max.y - bbox.min.y;
  let modelDepth = bbox.max.z - bbox.min.z;

  let previewFOV = 12;
  let radius = Math.sqrt(
    (modelWidth * modelWidth) / 4 +
      (modelHeight * modelHeight) / 4 +
      (modelDepth * modelDepth) / 4
  );
  let angle = ((previewFOV / 2) * Math.PI) / 180;
  let distance = (radius / Math.sin(angle)) * Math.cos(angle) + radius;

  let prevCamera = new THREE.PerspectiveCamera(
    previewFOV,
    1,
    10,
    distance + 1000
  );
  let pan = (30 * Math.PI) / 180;
  let tilt = (15 * Math.PI) / 180;
  let y = distance * Math.sin(tilt) + modelHeight / 2;
  let x = distance * Math.cos(tilt) * Math.sin(pan);
  let z = distance * Math.cos(tilt) * Math.cos(pan);
  prevCamera.position.set(x, y, z);
  prevCamera.lookAt(0, (bbox.max.y + bbox.min.y) / 2, 0);

  prevRenderer.setPixelRatio(window.devicePixelRatio);
  prevRenderer.setSize(size, size);
  prevRenderer.setClearColor(0xffffff);
  prevRenderer.render(appScene.scene, prevCamera);

  let renderDom = prevRenderer.domElement;

  preview.width = renderDom.width;
  preview.height = renderDom.height;
  let ctx = preview.getContext("2d");
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, renderDom.width, renderDom.height);

  ctx.drawImage(renderDom, 0, 0, renderDom.width, renderDom.height);

  appScene.scene.add(appScene.construction);
  appScene.scene.add(appScene.ground);

  return preview;
}

async function createPreviewBlob() {
  const previewCanvas = getPreview();

  await new Promise((resolve, reject) => {
    previewCanvas.toBlob(function (res) {
      appScene.previewBlob = res;
      resolve();
    }, "image/png");
  });
}

async function sendFiles() {
  let formData = new FormData();

  formData.append("source", appScene.modelBlob, "scene.glb");
  formData.append("preview", appScene.previewBlob, "prev.png");

  let response = await fetch(`${urlFiles}`, {
    headers: {
      "x-token": token,
      "x-lang": lang,
    },
    method: "POST",
    body: formData,
  });

  let resp = await response.json();
  return resp.data;
}

function getProductData() {
  let res = { type: 2, geometries: [], properties: {} };

  appScene.container.children.forEach((obj, i) => {
    obj.children.forEach((mesh, j) => {
      const index =
        appScene.container.children
          .slice(0, i)
          .reduce((prev, child) => prev + child.children.length, 0) + j;

      let partData = {};
      partData.md5 = `${index}`;
      // partData.md5 = `${mesh.userData.md5}`;
      partData.materialId = `${mesh.userData.materialId}`;
      partData.name = `${mesh.userData.name}`;
      partData.source = "none";
      //if (mesh.userData.source == 'set') partData.setId = mesh.userData.setId;
      res.geometries.push(partData);
    });
  });

  let bbox = new THREE.Box3().setFromObject(appScene.container);
  res.properties.width = bbox.max.x - bbox.min.x;
  res.properties.height = bbox.max.y - bbox.min.y;
  res.properties.depth = bbox.max.z - bbox.min.z;
  res.properties.positionY = 0;

  let contourTop = CF.makeContour(appScene.container, CF.AXIS_Y);
  let contourCut = CF.makeContour(appScene.container, CF.AXIS_Z);

  res.properties.contourTop = contourTop.join();
  res.properties.contourCut = contourCut.join();

  res.properties.appointment = "scene";
  res.tags = appScene.tmpProductData.tags ? appScene.tmpProductData.tags : [];
  res.titles = appScene.tmpProductData.titles
    ? appScene.tmpProductData.titles
    : { en: "Kitchen", ua: "Кухня" };
  res.categoriesProduct = appScene.tmpProductData.categoriesProduct
    ? appScene.tmpProductData.categoriesProduct
    : ["9013"];

  res.public = true;

  // ---

  res.isOriginalModel = appScene.tmpProductData.isOriginalModel
    ? appScene.tmpProductData.isOriginalModel
    : 0;

  if (appScene.tmpProductData.isOriginalModel) {
    res.originalEntityId = appScene.currentModelId;
  } else {
    res.originalEntityId = appScene.tmpProductData.originalEntityId
      ? appScene.tmpProductData.originalEntityId
      : "";
  }

  if (appScene.tmpProductData.configurationAppId) {
    res.configurationAppId = appScene.tmpProductData.configurationAppId;
  } else {
    res.configurationAppId = "1";
  }

  res.roomtodo = "0";

  return res;
}

async function sendEntity({ source, preview }) {
  let data = getProductData();

  data.source = source;
  data.preview = preview;
  data.metaZip = "";
  console.log(data);

  let method = "";
  let url = urlEntities;

  if (!appScene.tmpProductData.isOriginalModel && appScene.currentModelId) {
    method = "PUT";
    url += "/" + appScene.currentModelId;
  } else {
    method = "POST";
    data.isOriginalModel = 0;
  }

  data = JSON.stringify(data);

  let response = await fetch(`${url}`, {
    headers: {
      "x-token": token,
      "x-lang": lang,
    },
    method,
    body: data,
  });

  let resp = await response.json();
  console.log(resp);

  if (resp.data) {
    appScene.currentModelId = resp.data.entityId;
  }

  // -------------------------
  appScene.container.children.forEach((child) => {
    child.position.x += dx;
    child.position.z += dz;
  });

  appScene.setContours(appScene.container.children);
  appScene.selectedObject = null;
  optionsContainerEl.classList.add("visually-hidden");
  appScene.render();

  hideModelSettings();
}

async function addToPlanner() {
  window.parent.postMessage(
    JSON.stringify({
      action: "app_save",
      product_id: appScene.currentModelId,
      settings: {
        x: dx,
        y: 0,
        z: dz,
        rotationY: 0,
        flipX: false,
        flipY: false,
        flipZ: false,
        scaleX: 1,
        scaleY: 1,
        scaleZ: 1,
      },
    }),
    "*"
  );
}
