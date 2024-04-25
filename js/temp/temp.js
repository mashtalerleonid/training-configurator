const modelsForReplaceData = {
    3226: {
        title: "Cabinet with id = 3226",
        imgSrs: "www.my-site.com",
        text: "Some additional info",
        idsForReplace: [],
        meshesData: [],
    },

    3225: {
        title: "Cabinet with id = 3225",
        imgSrs: "www.my-site.com",
        text: "Some additional info",
        idsForReplace: [],
        meshesData: [],
    },

    3216: {
        title: "Cabinet with id = 3216",
        imgSrs: "www.my-site.com",
        text: "Some additional info",
        idsForReplace: [],
        meshesData: [],
    },
};

// ----------------------------

function getModelPropItemEl(data) {
    const propItemEl = document.createElement("div");
    propItemEl.classList.add("prop__item");
    const propItemTitleEl = document.createElement("div");
    propItemTitleEl.classList.add("subprop__tltle");
    propItemTitleEl.textContent = data.title;
    propItemEl.append(propItemTitleEl);
    const subpropListEl = getModelSubpropListEl(data);
    propItemEl.append(subpropListEl);

    return propItemEl;

    function getModelSubpropListEl(data) {
        const subpropListEl = document.createElement("div");
        subpropListEl.classList.add("subprop__list");
        const markup = data.modelsForReplace
            .map(
                (itemData) =>
                    `<div class="subprop__item" data-id="${itemData.id}">
                    <div class="subprop__item__thumb">
                        <img src=${itemData.imgSrc} alt="" />
                    </div>
                    <div class="subprop__item__descr">
                        <div class="subprop__item__title">
                            ${itemData.title}
                        </div>
                        <div class="subprop__item__text">${itemData.text}</div>
                    </div>
                </div>`
            )
            .join("");

        subpropListEl.insertAdjacentHTML("beforeend", markup);
        return subpropListEl;
    }
}

// ---------------------------

// BED

const configDataFor33123 = {
    title: "Super Bed",
    imgSrs: "www.my-site.com",
    text: "Some additional info",
    idsForReplace: [],
    meshesData: [
        {
            title: "Type of mattresse",
            idsForReplace: ["33126", "33130"],
            defaultId: "33126",
            canDelete: false,
        },
        {
            title: "Type of carcasse",
            idsForReplace: ["33125", "33129"],
            defaultId: "33125",
            canDelete: false,
        },
        {
            title: "Type of legs",
            idsForReplace: ["33124", "33128"],
            defaultId: "33124",
            canDelete: true,
        },
        {
            // title: "Decor",
            // idsForReplace: [],
            // defaultId: "",
            // // defaultId: "33127",
            // canDelete: true,
            title: "",
            idsForReplace: [],
            defaultId: "33127",
            canDelete: false,
        },
    ],
};

//mattresses
const configDataFor33126 = {
    title: "Mattress 1",
    imgSrs: "www.my-site.com",
    text: "Standard type",
    idsForReplace: [],
    meshesData: [],
};
const configDataFor33130 = {
    title: "Mattress 2",
    imgSrs: "www.my-site.com",
    text: "Orthopedic",
    idsForReplace: [],
    meshesData: [],
};

//carcasses
const configDataFor33125 = {
    title: "Carcass 1",
    imgSrs: "www.my-site.com",
    text: "Width: 160 cm, Length: 200 cm, Height: 10 cm",
    idsForReplace: [],
    meshesData: [],
};
const configDataFor33129 = {
    title: "Carcass 2",
    imgSrs: "www.my-site.com",
    text: "Width: 160 cm, Length: 200 cm, Height: 20 cm",
    idsForReplace: [],
    meshesData: [],
};

//legs
const configDataFor33124 = {
    title: "Legs 1",
    imgSrs: "www.my-site.com",
    text: "Height: 10 cm",
    idsForReplace: [],
    meshesData: [],
};
const configDataFor33128 = {
    title: "Legs 2",
    imgSrs: "www.my-site.com",
    text: "Height: 5 cm",
    idsForReplace: [],
    meshesData: [],
};

// ---------------------------

const configBedDataOldVersion = {
    model: {
        mainTitle: "Super bed",
        title: "",
        modelsForReplace: [],
        defaultId: "",
    },
    geometries: [
        {
            geometryIndex: 0,
            title: "Mattresses",
            modelsForReplace: [
                {
                    id: "33126",
                    imgSrc: "../images/example.webp",
                    title: "Mattress 1",
                    text: "Standard type",
                },
                {
                    id: "33130",
                    imgSrc: "../images/example.webp",
                    title: "Mattress 2",
                    text: "Orthopedic",
                },
            ],
            defaultId: "33126",
            // canDelete: false,
        },
        {
            geometryIndex: 1,
            title: "Carcasses",
            modelsForReplace: [
                {
                    id: "33125",
                    imgSrc: "../images/example.webp",
                    title: "Carcass 1",
                    text: "Width: 160 cm, Length: 200 cm, Height: 20 cm",
                },
                {
                    id: "33129",
                    imgSrc: "../images/example.webp",
                    title: "Carcass 2",
                    text: "Width: 160 cm, Length: 200 cm, Height: 10 cm",
                },
            ],
            defaultId: "33125",
            // canDelete: false,
        },
        {
            geometryIndex: 2,
            title: "Legs",
            modelsForReplace: [
                {
                    id: "0",
                    imgSrc: "../images/hide.webp",
                    title: "No legs",
                    text: "",
                },
                {
                    id: "33124",
                    imgSrc: "../images/example.webp",
                    title: "Legs 1",
                    text: "Height: 10 cm",
                },
                {
                    id: "33128",
                    imgSrc: "../images/example.webp",
                    title: "Legs 2",
                    text: "Height: 5 cm",
                },
            ],
            defaultId: "33124",
            // canDelete: true,
        },
        {
            geometryIndex: 3,
            title: "Add decor",
            modelsForReplace: [
                {
                    id: "0",
                    imgSrc: "../images/hide.webp",
                    title: "No decor",
                    text: "",
                },
                {
                    id: "33127",
                    imgSrc: "../images/example.webp",
                    title: "Decor",
                    text: "",
                },
            ],
            defaultId: "33127",
            // canDelete: true,
        },
    ],
};

// CABINETS

const configDataFor3119 = {
    model: {
        mainTitle: "Bottom cabinets",
        title: "Corner cabinets series A",
        modelsForReplace: [
            {
                id: "3119",
                imgSrc: "../images/example.webp",
                title: "First cabinet with id = 3119",
                text: "Some additional info",
            },
            {
                id: "3118",
                imgSrc: "../images/example.webp",
                title: "Second cabinet with id = 3118",
                text: "Some additional info",
            },
            {
                id: "3113",
                imgSrc: "../images/example.webp",
                title: "Third cabinet with id = 3113",
                text: "Some additional info",
            },
            {
                id: "3114",
                imgSrc: "../images/example.webp",
                title: "Fourth cabinet with id = 3114",
                text: "Some additional info",
            },
        ],
        defaultId: "3119",
    },
    geometries: [],
};

// const configData = configDataFor33123;
// const configData = configDataFor3119;
// const configData = configBedDataOldVersion;

// ---------------------------------------------------------------------------

// addModelToCenter(modelId, callback) {

//     // -----------------

//     placeObject(modelId, settings).then((sceneObject) => {
// this.materialsOnModelMap = new Map();
// const materials = sceneObject.objectData.source.body.materials;

// materials.forEach((material) => {
//     const id = material.addMaterial || material.default;
//     this.materialsOnModelMap.set(id, true);
// });
// const fov = R2D.mouseInteractionHelper._currentCamera.fov;
// const width = sceneObject.defaultWidth;
// const height = sceneObject.defaultHeight;
// const depth = sceneObject.defaultDepth;

// const cameraDist = findCameraDist(width, height, depth, fov);
// R2D.Viewers.getCurrentViewer().updateCameraDistance(cameraDist);

// this.configurator.objectViewer3D =
//     R2D.commonSceneHelper.productHelper.findObjectView3dBySceneObject(sceneObject);
// this.configurator.sceneObject = sceneObject;

// if (R2D.Pool3D.isLoaded(modelId)) {
//     onPool3DFinishListener.call(this);
// } else {
//     R2D.Pool3D.addEventListener(Event.FINISH, onPool3DFinishListener);
// }
//     });

//     // -------------------

//     // this.productsDataLoader.loadOne(modelId, () => {
//     //     const productData = R2D.Pool.getProductData(modelId);

//     // this.materialsOnModelMap = new Map();
//     // const materials = productData.source.body.materials;

//     // materials.forEach((material) => {
//     //     const id = material.addMaterial || material.default;
//     //     this.materialsOnModelMap.set(id, true);
//     // });

//     //     productData.isGLTF = true;

//     //     this.sceneObject = R2D.Creator.makeSceneObject(productData);

//     // const fov = R2D.mouseInteractionHelper._currentCamera.fov;
//     // const width = this.sceneObject.defaultWidth;
//     // const height = this.sceneObject.defaultHeight;
//     // const depth = this.sceneObject.defaultDepth;

//     // const cameraDist = findCameraDist(width, height, depth, fov);
//     // R2D.Viewers.getCurrentViewer().updateCameraDistance(cameraDist);

//     //     this.sceneObject.x = 0;
//     //     this.sceneObject.y = -height / 2;
//     //     this.sceneObject.z = 0;
//     //     this.sceneObject.update();

//     //     R2D.scene.add(this.sceneObject);

//     // this.configurator.objectViewer3D =
//     //     R2D.commonSceneHelper.productHelper.findObjectView3dBySceneObject(this.sceneObject);
//     // this.configurator.sceneObject = this.sceneObject;

//     // if (R2D.Pool3D.isLoaded(modelId)) {
//     //     onPool3DFinishListener.call(this);
//     // } else {
//     //     R2D.Pool3D.addEventListener(Event.FINISH, onPool3DFinishListener);
//     // }
//     // });

//     // -------------------

// function findCameraDist(w, h, d, fov) {
//     // шукає найближчу відстань до моделі, щоб вся модель була в полі зору, і поля (k)
//     console.log(w, h, d, fov);
//     const canvasSize = R2D.Viewers.getSize();
//     console.log(canvasSize);
//     const maxSide = Math.max(w, h, d);
//     const fovRad = (Math.PI / 180) * fov;
//     const base = maxSide < 100 ? 700 : 650;

//     return (maxSide / 2 / Math.tan(fovRad / 2)) * (base / (canvasSize.width / 2));
// }

// function onPool3DFinishListener(e) {
//     const materialsOnModelIds = Array.from(this.materialsOnModelMap.keys());
//     const isAllMaterialsLoaded = materialsOnModelIds.every((id) =>
//         R2D.Pool.isProductData(id)
//     );

//     if (isAllMaterialsLoaded) {
//         R2D.Pool3D.removeEventListener(Event.FINISH, onPool3DFinishListener);
//         if (callback) callback();
//     }
// }
// onPool3DFinishListener = onPool3DFinishListener.bind(this);
// }

// --------------------------------------------------------------------------------------------

R2D.replaceCurrentObjectWithConfigModelOLD = function (configInfo) {
    let productsDataLoader = null;
    let meshesIds = null;
    let queue = {};
    const curView3DObject = R2D.scene.currentView3DObject;
    const curObject3d = curView3DObject.object3d;
    const curSceneObject = curView3DObject.sceneObject;

    if (configInfo.configType === "modelReplace") {
        let dataLoader = R2D.Pool.isLoaderProductData(configInfo.modelData.curId);
        if (!dataLoader) dataLoader = R2D.Pool.loadProductData(configInfo.modelData.curId);
        dataLoader.addEventListener(Event.COMPLETE, loaderCompleteListener);
        dataLoader.addEventListener(Event.ERROR, loaderErrorListener);

        function loaderCompleteListener(e) {
            const oldSceneObj = R2D.scene.currentView3DObject?.sceneObject;

            R2D.scene.currentView3DObject && R2D.scene.remove(oldSceneObj);

            const productData = R2D.Pool.getProductData(configInfo.modelData.curId);
            const sceneObject = R2D.Creator.makeSceneObject(productData);
            R2D.scene.add(sceneObject);

            sceneObject.x = oldSceneObj.x;
            sceneObject.y = oldSceneObj.y;
            sceneObject.z = oldSceneObj.z;
            sceneObject.flipX = oldSceneObj.flipX;
            sceneObject.flipY = oldSceneObj.flipY;
            sceneObject.flipZ = oldSceneObj.flipZ;
            sceneObject.rotationX = oldSceneObj.rotationX;
            sceneObject.rotationY = oldSceneObj.rotationY;
            sceneObject.rotationZ = oldSceneObj.rotationZ;

            sceneObject.configInfo = { ...configInfo };
            delete sceneObject.configInfo.materials;
            sceneObject.setMaterials(configInfo.materials);

            sceneObject.update();

            if (sceneObject.forWall) {
                let dropData = R2D.Scene.getObjectDataForWallElement(sceneObject);
                let dropResult = constructor.dropElement(dropData, 10);
                dropResult && R2D.Scene.setDropDataToWallElement(sceneObject, dropResult);
            }

            R2D.scene.history.saveState();

            R2D.mouseInteractionHelper.unsetActiveObject();
            R2D.mouseInteractionHelper.api.dispatchEvent(
                new Event(R2D.mouseInteractionHelper.api.QUICK_PANELS_HIDE, {})
            );
            R2D.mouseInteractionHelper.api.dispatchEvent(
                new Event(R2D.mouseInteractionHelper.api.OBJECT_DRAG_OUT_OF_WALL, {})
            );
        }

        function loaderErrorListener(e) {
            console.log("Error loading product ", id);
            console.log(e);
        }
    } else if (configInfo.configType === "meshReplace") {
        console.log(configInfo);

        meshesIds = Object.values(configInfo.meshesData).map((meshData) => meshData.curId);

        productsDataLoader = new R2D.ProductsDataLoader();
        productsDataLoader.addEventListener(Event.COMPLETE, onProductsDataLoaded);
        productsDataLoader.load(meshesIds);
    }

    // ----------------------------------------

    function updateCurModel() {
        curObject3d.clear();

        meshesIds.forEach((id) => {
            let mesh = null;
            let pos = null;
            let meshHash = null;

            R2D.Pool3D.getData(id).scene.traverse(function (obj) {
                if (obj.type == "Mesh") {
                    mesh = obj.clone();
                }
            });

            for (const hash in configInfo.meshesData) {
                const data = configInfo.meshesData[hash];

                if (data.possibleIds.includes(id)) {
                    meshHash = hash;
                    pos = data.pos;
                    break;
                }
            }
            mesh.position.set(pos.x, pos.y, pos.z);
            mesh.userData.md5 = meshHash;
            curObject3d.add(mesh);

            curSceneObject.configInfo = { ...configInfo };
            delete curSceneObject.configInfo.materials;
            console.log("meshReplace", configInfo.materials);

            curSceneObject.setMaterialsObjects(configInfo.materials);

            curSceneObject.update();
        });
    }

    function onProductsDataLoaded(e) {
        console.log("onProductsDataLoaded Complete");
        productsDataLoader.removeEventListener(Event.COMPLETE, onProductsDataLoaded);
        productsDataLoader.dispose();
        productsDataLoader = null;

        meshesIds.forEach((id) => {
            if (!R2D.Pool3D.isLoaded(id)) {
                queue[id] = true;
            }
        });

        if (Object.keys(queue).length) {
            R2D.Pool3D.addEventListener(Event.FINISH, onMesh3DLoaded);
            Object.keys(queue).forEach((id) => {
                R2D.Pool.getProductData(id).isGLTF = true;
                R2D.Pool3D.load(id);
            });
        } else {
            updateCurModel();
        }
    }

    function onMesh3DLoaded(e) {
        console.log("onMesh3DLoaded FInish");

        if (Object.values(configInfo.meshesData).every((data) => data.curId !== e.data)) {
            return;
        } //change якщо загрузило не з списку моделей (н-д матеріал)

        delete queue[e.data];
        if (Object.keys(queue).length) return;

        R2D.Pool3D.removeEventListener(Event.FINISH, onMesh3DLoaded);

        updateCurModel();
    }
};

// -------------------------------------------------------------------------

// fetch(`${R2D.URL.DOMAIN}/src_designer/js/three.min.js?v=${getRandomInt(100)}`).then(
// async (response) => {
// const blob = await response.blob();
// const url = URL.createObjectURL(blob);
const script = document.createElement("script");
// script.src = url;
// script.src = "http://localhost:9000/src_designer/js/three.min.js"; //для локальної розробки
script.src = `${R2D.URL.DOMAIN}/src_designer/js/three.min.js?v=${getRandomInt(100)}`; //для dev.roomtodo
document.body.appendChild(script);
script.onload = onTHREELoaded;
// }
// );

function onTHREELoaded() {
    // const params = {
    //     headers:{
    //         // "Content-Type": "application/json",
    //         // "Access-Control-Allow-Origin": "*",
    //     },

    //     mode: "no-cors",
    // };

    // fetch(`http://localhost:9000/src_designer/js/plannercore.js`, params).then(
    // fetch(`${R2D.URL.DOMAIN}/src_designer/js/plannercore.js?v=${getRandomInt(100)}`).then(
    // async (response) => {
    // const blob = await response.blob();
    // const url = URL.createObjectURL(blob);
    const script = document.createElement("script");
    // script.src = url;
    // script.src = "http://localhost:9000/src_designer/js/plannercore.js"; //для локальної розробки
    script.src = `${R2D.URL.DOMAIN}/src_designer/js/plannercore.js?v=${getRandomInt(100)}`; //для dev.roomtodo
    document.body.appendChild(script);
    script.onload = onPlannercoreLoaded;
    // }
    // );
}

// -------------------------------------------------------------------------

startConfigurate(modelId) {
    console.log("startConfigurate");

    this.configData = this.getConfigDataBymodelId(modelId);
    if (!this.configData) {
        console.error("No config data!");
        return;
    }

    if (this.configData.geometries?.length > 0) {
        // заміна мешей
        this.configType = "meshReplace";
        this.configData.geometries.forEach((data) => {
            const hash = this.model3d.children[data.geometryIndex].userData.md5;
            this.hashesByIndex.push(hash);

            this.meshesData[hash] = { ...data };
            this.meshesData[hash].curId = this.meshesData[hash].defaultId;
            if (this.meshesData[hash].modelsForReplace.some((data) => data.id == 0)) {
                this.meshesData[hash].exists = true;
            }
            this.meshesData[hash].childrenPos = [];
            this.queue[this.meshesData[hash].defaultId] = true;
        });

        this.idsForLoad = Object.values(this.meshesData).map((meshData) => meshData.defaultId);

        this.productsDataLoader.addEventListener(
            Event.COMPLETE,
            this.productDataLoadedListener
        );

        this.productsDataLoader.load(this.idsForLoad);
    } else {
        // заміна моделей
        this.configType = "modelReplace";
        this.modelData = this.configData.model;
        this.modelData.curId = this.modelData.defaultId;

        this.sceneObject.update(); //

        // this.dispatchEvent(new Event("renderSettingsContainer"));
    }
}

// -------------------------------------------------------------------------

updatePosDependChildrenOld(parentHash, parent) {
    const childrenPos = this.meshesData[parentHash].childrenPos;
    if (childrenPos.length === 0) return;

    childrenPos.forEach((data) => {
        const child = this.getMeshByHash(data.childHash);
        if (!child) return;

        child.position.x += parent.position.x;
        child.position.y += parent.position.y;
        child.position.z += parent.position.z;
    });
}

// -------------------------------------------------------------------------