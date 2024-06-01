class PlannerHelper {
    constructor(plannerContainer, R2D, configurator) {
        this.configurator = configurator;

        this.planner = new R2D.PlannerCore();
        R2D.view3d.setSize(plannerContainer.offsetWidth, plannerContainer.offsetHeight);
        this.plannerDom = this.planner.getDomElement();
        plannerContainer.appendChild(this.plannerDom);

        R2D.usedByConfigurator = true;

        this.productsDataLoader = new R2D.ProductsDataLoader();
        this.materialsOnModelMap = new Map();

        this.isCameraMoveEnabled = true;
        this.sceneObject = null;

        // -------------------- Listeners -------------------
        window.addEventListener("resize", () => {
            this.planner.setSize(plannerContainer.offsetWidth, plannerContainer.offsetHeight);
        });

        this.plannerDom.addEventListener("mousedown", this.planner.scene.mousedown);

        this.plannerDom.addEventListener("mousemove", this.planner.scene.mousemove);

        this.planner.apiScene.addEventListener(this.planner.apiScene.CAMERA_MOVE, (e) => {
            if (!this.isCameraMoveEnabled) return;

            R2D.Viewers.cameraMove(e.data.x, e.data.y);
        });

        this.plannerDom.addEventListener("mouseup", this.planner.scene.mouseup);

        this.plannerDom.addEventListener("wheel", (e) => {
            if (e.deltaY < 0) {
                this.planner.zoomIn();
            } else {
                this.planner.zoomOut();
            }
        });
        // -------------------- end Listeners -------------------
    }

    disableCameraMoving() {
        // Заборонити рух камери правою кнопкою миші і клавіатурою
        this.isCameraMoveEnabled = false;
        R2D.keyboardInteractionHelper.updateComponents(null, null);
    }

    enableCameraMoving() {
        // Дозволити рух камери правою кнопкою миші і клавіатуроюф
        this.isCameraMoveEnabled = true;
        R2D.keyboardInteractionHelper.updateComponents(document.body, R2D.view3d);
    }

    setBgdColor(color) {
        // Встановити фон сцени (колір неба)
        R2D.scene3d.middle.background = new THREE.Color(color);
    }

    hideTerrain() {
        // Забрати сіру землю (не буде працювати лінійка)
        R2D.commonSceneObject.hideTerrain();
    }

    blockSelectAndDrag() {
        //Заборонити виділення і перетягування моделі
        R2D.mouseInteractionHelper.state.setIsSelectingModel(false);
    }

    setMinElevation(minElevation) {
        // Встановити мінімальну відстань від підлоги для моделі
        R2D.scene.setMinElevation(minElevation);
    }

    setCameraSettings(settings) {
        // Встановити налаштування камери
        R2D.view3d.setCameraSettings(settings);
    }

    placeModel(id, settings, callback) {
        R2D.scene.placeObject(id, settings).then((sceneObject) => {
            this.materialsOnModelMap = new Map();
            const materials = sceneObject.objectData.source.body.materials;

            materials.forEach((material) => {
                const id = material.addMaterial || material.default;
                this.materialsOnModelMap.set(id, true);
            });

            this.configurator.objectViewer3D =
                R2D.commonSceneHelper.productHelper.findObjectView3dBySceneObject(sceneObject);
            this.configurator.sceneObject = sceneObject;
            this.configurator.model3d = this.configurator.objectViewer3D.object3d;

            if (settings.needUpdateCameraDist) this.updateCameraDistance(this.configurator.model3d);

            if (R2D.Pool3D.isLoaded(id)) {
                onPool3DFinishListener.call(this);
            } else {
                R2D.Pool3D.addEventListener(Event.FINISH, onPool3DFinishListener);
            }
        });

        function onPool3DFinishListener(e) {
            const materialsOnModelIds = Array.from(this.materialsOnModelMap.keys());
            const isAllMaterialsLoaded = materialsOnModelIds.every((id) =>
                R2D.Pool.isProductData(id)
            );

            if (isAllMaterialsLoaded) {
                R2D.Pool3D.removeEventListener(Event.FINISH, onPool3DFinishListener);
                if (callback) callback();
            }
        }
        onPool3DFinishListener = onPool3DFinishListener.bind(this);
    }

    updateCameraDistance(model3d) {
        // щоб вся модель була в полі зору
        const bbox = new THREE.Box3().setFromObject(model3d);
        const width = bbox.max.x - bbox.min.x;
        const height = bbox.max.y - bbox.min.y;
        const depth = bbox.max.z - bbox.min.z;
        const fov = R2D.mouseInteractionHelper._currentCamera.fov;
        const angle = ((fov / 2) * Math.PI) / 180;
        const radius = Math.sqrt(width ** 2 / 4 + height ** 2 / 4 + depth ** 2 / 4);
        const distance = (radius / Math.sin(angle)) * Math.cos(angle) + radius;

        R2D.Viewers.getCurrentViewer().updateCameraDistance(distance);
    }

    render() {
        R2D.Viewers.getCurrentViewer().rendererUpdate();
    }

    disposeRenderers() {
        R2D.sharedRenderer.disposeWebGLRenderers();
    }

    configurateParametric() {
        R2D.Tool.ps.configurate(this.configurator.objectViewer3D);
    }

    clearParametricScaler() {
        R2D.Tool.ps.clear();
    }
}
