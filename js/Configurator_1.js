class Configurator_1 {
    constructor(plannerContainer, R2D) {
        this.configId = "1";
        this.configType = "";
        this.openingType = "";

        this.modelData = null;
        this.meshesData = {};
        this.configData = null;
        this.configInfo = null;
        this.idsForLoad = [];
        this.model3d = null;
        this.hashesByIndex = [];
        this.removedMeshes = [];
        this.newMeshHash = "";
        this.newMeshId = "";
        this.newModelId = "";
        this.isPlanner = false;
        this.queue = {};
        this.sceneObject = null;
        this.objectViewer3D = null;
        this.protector = 0;

        this.productsDataLoader = new R2D.ProductsDataLoader();
        this.initProductDataLoadedListener = this.onInitProductDataLoaded.bind(this);
        this.init3DLoadedListener = this.onInit3DLoaded.bind(this);
        this.forReplace3DLoadedListener = this.forReplace3DLoaded.bind(this);

        this.PH = new PlannerHelper(plannerContainer, R2D, this);

        EventDispatcher.call(this);
    }

    customizePlanner() {
        this.PH.disableCameraMoving();
        this.PH.setBgdColor(0xffffff);
        this.PH.hideTerrain();
        this.PH.blockSelectAndDrag();
        this.PH.setMinElevation(-200);
        this.PH.setCameraSettings({
            minHeight: 0, //Мінімальна висота камери, сумується з якорем
            anchor: { x: 0, y: 0, z: 0 }, //Точка, навколо якої обертається камера (якір)
            isLookUp: false, //чи піднімається якір, коли камера опускається нижче minHeight (Щоб модель завжди була в полі зору)
            sensitiveZoom: 0.01, //Чутливість збільшення
            distance: 700, //відстань від моделі до камери
            pan: 0.5, //поворот камери вліво-вправо
            tilt: 0.6, //поворот камери вверх-вниз
        });
    }

    async loadProductData(id) {
        const json = { ids: id };
        const headers = {
            "Content-type": "application/x-www-form-urlencoded",
        };
        const body = `json=${JSON.stringify(json)}`;
        const response = await fetch(`${R2D.URL.DOMAIN}${R2D.URL.URL_GET_PRODUCT}`, {
            method: "POST",
            headers,
            body,
        });
        const data = await response.json();
        return data.products[0];
    }

    async getMatDataForMarkup() {
        const matData = [];
        const materialsData = this.sceneObject.getMaterials();

        for (let i = 0; i < materialsData.length; i++) {
            const data = materialsData[i];

            if (data.source === "none") continue;

            let productData = null;

            if (data.addMaterial) {
                productData = R2D.Pool.getProductData(data.addMaterial);
                if (!productData) {
                    productData = await this.loadProductData(data.addMaterial);
                }

                const canvas = await R2D.Tool.getMatPrevFromMatIdAndColor(
                    data.addMaterial,
                    data.current
                );
                matData.push({
                    prevSrc: canvas.toDataURL(),
                    id: data.addMaterial,
                    color: data.current,
                    source: data.source,
                    index: i,
                    setId: "0",
                    hash: data.hash,
                    isColorpicker: "1",
                    name: productData.name,
                });
            } else {
                productData = R2D.Pool.getProductData(data.current);
                if (!productData) {
                    productData = await this.loadProductData(data.current);
                }

                const categoryId = Object.keys(productData.categoryMaterial)[0];
                const treeArr = productData.categoryMaterial[categoryId];
                let curNodes = treeMaterial;
                for (let i = 0; i < treeArr.length - 1; i += 1) {
                    const curLevelId = treeArr[i].id;
                    curNodes = curNodes.find((el) => el.id === curLevelId).nodes;
                }
                if (treeArr.length > 0) {
                    curNodes = curNodes.find((el) => el.id === treeArr[treeArr.length - 1].id);
                }
                const partSrc = productData.source.images.preview;
                matData.push({
                    prevSrc: R2D.URL.DOMAIN + partSrc,
                    id: data.current,
                    source: data.source,
                    index: i,
                    setId: data.setId || "0",
                    hash: data.hash,
                    isColorpicker: "0",
                    urlList: curNodes.urlList || "",
                    name: curNodes.name || "",
                });
            }
        }

        return matData;
    }

    start(modelId, configInfo) {
        this.customizePlanner();
        this.startModelId = modelId;

        let idToPlace = modelId;
        const settings = {
            x: 0,
            y: 0,
            z: 0,
            isStartCoordInModelCenter: true,
            needUpdateCameraDist: true,
        };

        if (configInfo && configInfo.configType === "modelReplace") {
            idToPlace = configInfo.modelData.curId;
        }

        this.PH.placeModel(idToPlace, settings, () => {
            this.configInfo = configInfo;
            this.startConfigurate(this.startModelId);
        });
    }

    async startConfigurate(modelId) {
        this.configData = await this.getConfigData(modelId);
        if (!this.configData) {
            console.error("No config data!");
            return;
        }

        let allPossibleProductIds = [];

        if (this.configData.geometries?.length > 0) {
            // заміна мешей
            this.configType = "meshReplace";
            this.configData.geometries.forEach((data) => {
                const hash = this.model3d.children[data.geometryIndex].userData.md5;

                this.hashesByIndex.push(hash);
                this.meshesData[hash] = { ...data };
                this.meshesData[hash].curId =
                    this.configInfo?.meshesData[hash]?.curId || this.meshesData[hash].defaultId;
                if (this.meshesData[hash].modelsForReplace.some((data) => data.id == 0)) {
                    this.meshesData[hash].exists = true;
                }
                this.meshesData[hash].childrenPos = [];
                this.queue[this.meshesData[hash].curId] = true;
            });
            allPossibleProductIds = this.configData.geometries
                .flatMap((data) => data.modelsForReplace.map((data) => data.id))
                .filter((id) => id != 0);

            this.idsForLoad = Object.values(this.meshesData).map((meshData) => meshData.curId);
        } else {
            // заміна моделей
            this.configType = "modelReplace";
            this.modelData = this.configData.model;
            this.modelData.defaultId = modelId;
            if (this.configInfo) {
                this.modelData.curId = this.configInfo.modelData.curId;
                this.sceneObject.setMaterialsObjects(this.configInfo.materials);
            } else {
                this.modelData.curId = modelId;
            }

            this.sceneObject.update();

            allPossibleProductIds = this.modelData.modelsForReplace.map((data) => data.id);
        }

        this.productsDataLoader.addEventListener(
            Event.COMPLETE,
            this.initProductDataLoadedListener
        );

        this.productsDataLoader.load(allPossibleProductIds);
    }

    getPrevSrc(id) {
        if (id === "0") return hideImg.src;

        const productData = R2D.Pool.getProductData(id);
        if (!productData) return null;

        return `${R2D.URL.DOMAIN}${productData.source.images.preview}`;
    }

    async getConfigData(modelId) {
        const objectData =
            R2D.Pool.getProductData(modelId) || (await this.loadProductData(modelId));
        const metaZipSrc = `${R2D.URL.DOMAIN}${objectData.source.body.metaZip}`;

        const response = await fetch(metaZipSrc);
        const data = await response.blob();
        const zip = await JSZip.loadAsync(data);
        const json = await zip.files["main.json"].async("string");

        let obj = null;
        try {
            obj = JSON.parse(json);
        } catch (error) {
            console.log(error);
        }
        
        // delete this
        const jsonFile = await fetch("../33123/main.json");
        console.log(jsonFile);
        obj = await jsonFile.json();
        console.log(obj);
        // end delete this

        return obj;
    }

    onInitProductDataLoaded() {
        this.productsDataLoader.removeEventListener(
            Event.COMPLETE,
            this.initProductDataLoadedListener
        );

        if (this.idsForLoad.length) {
            R2D.Pool3D.addEventListener(Event.FINISH, this.init3DLoadedListener);
            this.idsForLoad.forEach((id) => {
                R2D.Pool.getProductData(id).isGLTF = true;
                R2D.Pool3D.load(id);
            });
        } else {
            this.dispatchEvent(new Event("renderSettingsContainer"));
        }
    }

    onInit3DLoaded(e) {
        if (
            !Object.values(this.meshesData)
                .map((data) => data.curId)
                .includes(e.data)
        ) {
            return;
        }

        delete this.queue[e.data];

        if (Object.keys(this.queue).length) return;

        R2D.Pool3D.removeEventListener(Event.FINISH, this.init3DLoadedListener);

        if (this.configInfo) {
            const hashesFromConfigInfo = Object.keys(this.configInfo.meshesData);
            for (const hash in this.meshesData) {
                if (hashesFromConfigInfo.includes(hash)) {
                    this.replaceMesh(this.meshesData[hash].curId, hash);
                } else {
                    this.removeMeshFromModel(hash);
                }
            }

            this.sceneObject.setMaterialsObjects(this.configInfo.materials);
        } else {
            for (const hash in this.meshesData) {
                this.replaceMesh(this.meshesData[hash].curId, hash);
            }
        }

        this.sceneObject.update();

        this.updateAllMeshes();

        this.PH.updateCameraDistance(this.model3d);

        this.updateModelPosition();

        this.dispatchEvent(new Event("renderSettingsContainer"));
    }

    startReplaceMesh(id, hash) {
        this.newMeshId = id;
        this.newMeshHash = hash;

        this.productsDataLoader.loadOne(id, () => {
            R2D.Pool.getProductData(id).isGLTF = true;

            if (R2D.Pool3D.isLoaded(id)) {
                this.forReplace3DLoadedListener();
            } else {
                R2D.Pool3D.addEventListener(Event.FINISH, this.forReplace3DLoadedListener);
                R2D.Pool3D.load(id);
            }
        });
    }

    forReplace3DLoaded(e) {
        R2D.Pool3D.removeEventListener(Event.FINISH, this.forReplace3DLoadedListener);
        this.replaceMesh(this.newMeshId, this.newMeshHash);
        this.updateAllMeshes();
    }

    replaceMesh(newMeshId, meshHash) {
        let mesh = null;

        R2D.Pool3D.getData(newMeshId).scene.traverse(function (obj) {
            if (obj.type == "Mesh") {
                mesh = obj.clone();
            }
        });

        const curMeshData = this.meshesData[meshHash];
        let curMesh = this.getMeshByHash(meshHash);

        if (curMesh) {
            this.model3d.remove(curMesh);
        } else {
            const deletedData = this.removedMeshes.find((data) => data.hash === meshHash);
            curMesh = deletedData.mesh;
            const oldIndex = deletedData.oldIndex;
            const sceneObjectMaterials = this.sceneObject.getMaterialsObjects();
            sceneObjectMaterials.splice(oldIndex, 0, deletedData.scObjMatDeletedData);
            this.removedMeshes = this.removedMeshes.filter((data) => data.hash !== meshHash);
            curMeshData.exists = true;

            this.dispatchEvent(new Event("updateCurMaterialsMarkup"));
        }

        curMeshData.curId = newMeshId;
        mesh.material = curMesh.material;
        mesh.userData.md5 = meshHash;

        const keys = Object.keys(mesh.userData);
        const hasPos = keys.some((key) => key.startsWith("childPos"));

        if (hasPos) {
            curMeshData.childrenPos = [];

            for (const key in mesh.userData) {
                if (key.startsWith("childPos")) {
                    const indexFromKey = key.split("_")[1];
                    const data = {
                        childHash: this.hashesByIndex[indexFromKey],
                        childPos: mesh.userData[key],
                    };
                    curMeshData.childrenPos.push(data);
                }
            }
        }
        this.model3d.add(mesh);
    }

    replaceModel(newModelId) {
        this.dispatchEvent(new Event("clearCurMaterialsMarkup"));
        R2D.scene.remove(this.sceneObject);
        this.modelData.curId = newModelId;

        const settings = {
            x: 0,
            y: 0,
            z: 0,
            isStartCoordInModelCenter: true,
            needUpdateCameraDist: false,
        };

        this.PH.placeModel(newModelId, settings, () => {
            this.sceneObject.update();

            this.dispatchEvent(new Event("updateCurMaterialsMarkup"));
        });
    }

    getMeshByHash(hash) {
        return this.model3d.children.find((child) => child.userData.md5 === hash);
    }

    updateAllMeshes() {
        this.protector = 0;

        this.model3d.children.forEach((mesh) => {
            mesh.position.set(0, 0, 0);
        });

        Object.values(this.meshesData).forEach((meshData) => {
            if (meshData.childrenPos.length === 0) return;

            if (meshData.hasOwnProperty("exists") && !meshData.exists) return;

            meshData.childrenPos.forEach((data) => {
                const child = this.getMeshByHash(data.childHash);
                if (!child) return;

                child.position.set(
                    data.childPos[0] * child.scale.x,
                    data.childPos[2] * child.scale.y,
                    -data.childPos[1] * child.scale.z
                );

                this.updatePosDependChildren(data.childHash, child);
            });
        });

        this.PH.render();
    }

    updatePosDependChildren(parentHash, parent) {
        let curChildPos = this.meshesData[parentHash].childrenPos;

        while (curChildPos.length > 0 && this.protector < 100) {
            this.protector += 1;

            curChildPos.forEach((data) => {
                const child = this.getMeshByHash(data.childHash);

                if (child) {
                    child.position.x += parent.position.x;
                    child.position.y += parent.position.y;
                    child.position.z += parent.position.z;
                }
            });

            curChildPos = this.meshesData[curChildPos[0].childHash].childrenPos;
        }
    }

    updateModelPosition() {
        const bbox = new THREE.Box3().setFromObject(this.model3d);
        this.sceneObject.y = -(bbox.max.y - bbox.min.y) / 2;
        this.sceneObject.update();
    }

    hideMesh(hash) {
        this.dispatchEvent(new Event("clearCurMaterialsMarkup"));

        this.removeMeshFromModel(hash);
        this.updateAllMeshes();
        this.PH.render();

        this.dispatchEvent(new Event("updateCurMaterialsMarkup"));
    }

    removeMeshFromModel(hash) {
        const mesh = this.getMeshByHash(hash);
        if (!mesh) return;

        const sceneObjectMaterials = this.sceneObject.getMaterialsObjects();
        const oldIndex = sceneObjectMaterials.findIndex((mo) => mo.hash === hash);
        const scObjMatDeletedData = sceneObjectMaterials.splice(oldIndex, 1)[0];
        this.removedMeshes.push({ hash, mesh, scObjMatDeletedData, oldIndex });
        this.model3d.remove(mesh);
        this.meshesData[hash].exists = false;
        this.meshesData[hash].curId = 0;
    }

    setMaterialAt(hash, materialId, type) {
        const materials = this.sceneObject.getMaterialsObjects();
        const material = materials.find((mo) => mo.hash === hash);
        if (material) material[type] = materialId;

        this.sceneObject.update();
    }

    setColor(hash, color) {
        const materials = this.sceneObject.getMaterialsObjects();
        const material = materials.find((mo) => mo.hash === hash);
        if (material) material.current = color;

        this.sceneObject.update();
    }

    setMeshActive(hash) {
        if (R2D.mouseInteractionHelper.setActiveMesh) {
            const currentMesh = this.objectViewer3D.getMeshByHash(hash);
            if (!currentMesh) return;

            R2D.mouseInteractionHelper.setActiveMesh(currentMesh);
            this.PH.render();
        }
    }

    unsetMeshActive() {
        if (R2D.mouseInteractionHelper.unsetActiveMesh) {
            R2D.mouseInteractionHelper.unsetActiveMesh();
            this.PH.render();
        }
    }

    copyModelToGlobalClipboard() {
        console.log("copyModelToGlobalClipboard");
        const configInfo = {
            configId: this.configId,
            startModelId: this.startModelId,
            materials: this.sceneObject.getMaterialsObjects(),
            configType: this.configType,
        };

        if (this.configType === "modelReplace") {
            configInfo.modelData = {
                curId: this.modelData.curId,
            };
        }
        if (this.configType === "meshReplace") {
            configInfo.meshesData = {};

            this.model3d.children.forEach((mesh, index) => {
                const hash = mesh.userData.md5;

                configInfo.meshesData[hash] = {
                    curId: this.meshesData[hash].curId,
                    pos: mesh.position,
                    possibleIds: this.meshesData[hash].modelsForReplace
                        .map((data) => data.id)
                        .filter((id) => id != 0),
                };
            });
        }

        this.sceneObject.configInfo = configInfo;
        const dataModel = R2D.Scene.makeSceneObjectData(this.sceneObject);
        dataModel.y = 0;

        window.parent.postMessage(
            JSON.stringify({
                action: "copy_to_clipboard",
                model: dataModel,
            }),
            "*"
        );

        Notiflix.Notify.success("Model copied", {
            timeout: 1500,
            width: "200px",
            cssAnimationDuration: 300,
            cssAnimationStyle: "from-right",
            fontSize: "16px",
            success: { background: "#66acf4", textColor: "#fff", notiflixIconColor: "#fff" },
        });
    }

    insertToPlanner() {
        const configInfo = {
            configId: this.configId,
            startModelId: this.startModelId,
            materials: this.sceneObject.getMaterialsObjects(),
            configType: this.configType,
        };

        if (this.configType === "modelReplace") {
            configInfo.modelData = {
                curId: this.modelData.curId,
            };
        }
        if (this.configType === "meshReplace") {
            configInfo.meshesData = {};

            this.model3d.children.forEach((mesh, index) => {
                const hash = mesh.userData.md5;

                configInfo.meshesData[hash] = {
                    curId: this.meshesData[hash].curId,
                    pos: mesh.position,
                    possibleIds: this.meshesData[hash].modelsForReplace
                        .map((data) => data.id)
                        .filter((id) => id != 0),
                };
            });
        }

        window.parent.postMessage(
            JSON.stringify({
                action: "insert_to_planner",
                configInfo,
            }),
            "*"
        );

        this.PH.disposeRenderers();
    }

    close() {
        window.parent.postMessage(
            JSON.stringify({
                action: "close",
            }),
            "*"
        );

        this.PH.disposeRenderers();
    }
}
