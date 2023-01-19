R2D.ModelUploader = function () {
    var me = this;
    EventDispatcher.call(this);

    var camera, scene, renderer, loader, controls;
    var lights = new R2D.Light3D(true);

    init();
    render();

    var content = null;
    var meshes = [];

    var modelWidth = 0;
    var modelHeight = 0;
    var modelDepth = 0;
    var modelElevation = 0;
    var modelPreview = null;
    var currentModelId = "";
    //var properties = {};
    var tags = [];
    var titles = [];
    var categoriesProduct = [];
    var appointment = "scene";
    var publicProduct = false;
    var configurationAppId = "";
    var isOriginalModel = 1;
    var originalEntityId = "";
    var addPostData = {};
    var autoPreview = true;

    var materialIds = [];

    var token = "";

    var batchMode = false;

    me.setToken = function (val) {
        token = val;
        R2D.token = val;
    };

    me.getToken = function () {
        return token;
    };

    function clear3D() {
        meshes = [];
        scene.remove(content);
        content = null;
        modelPreview = null;
        render();
    }

    me.clear = function () {
        clear3D();

        modelWidth = 0;
        modelHeight = 0;
        modelDepth = 0;
        modelElevation = 0;
        //modelPreview = null;
        //currentModelId = '';
        //properties = {};
        tags = [];
        titles = [];
        categoriesProduct = [];
        appointment = "scene";
        publicProduct = false;
        //    autoPreview = false;

        me.unselectParts();

        me.dispatchEvent(new Event(R2D.ModelUploader.CLEARED));
    };

    me.isEmpty = function () {
        return meshes.length == 0;
    };

    me.open = function (url, id) {
        me.dispatchEvent(new Event(R2D.ModelUploader.MODEL_START_OPEN));

        var method = "GET";
        var xhr = new XMLHttpRequest();

        xhr.open(method, url + "/" + id, true);
        xhr.responseType = "";
        xhr.withCredentials = false;

        xhr.setRequestHeader("x-token", token);
        xhr.setRequestHeader("x-lang", "en");

        xhr.addEventListener("load", xhrEventHandler);
        xhr.addEventListener("error", xhrErrorHandler);
        xhr.send();

        function xhrErrorHandler(e) {
            console.error(e);
            me.dispatchEvent(new Event(Event.ERROR, { info: "Error opening entity" }));
        }

        function xhrEventHandler(e) {
            var resp = null;
            try {
                resp = JSON.parse(e.currentTarget.response.match(/\{(.*)\}/)[0]);
            } catch (err) {
                console.error(err);
                me.dispatchEvent(
                    new Event(Event.ERROR, { info: "Error opening entity" })
                );
                return;
            }
            if (!resp || !resp.status || resp.status != "ok") {
                console.log(resp);
                me.dispatchEvent(
                    new Event(Event.ERROR, { info: "Error opening entity" })
                );
                return;
            }

            console.log("Down");
            console.log(resp.data);

            setData(resp.data);
            currentModelId = id;
        }
    };

    me.getModelId = function () {
        return currentModelId;
    };

    me.startUploadLocal = function () {
        var input = document.createElement("input");
        input.type = "file";
        input.webkitdirectory = true;

        input.onchange = function (e) {
            me.dispatchEvent(new Event(R2D.ModelUploader.MODEL_START_LOAD));
            loadLocalFiles(e.target.files);
        };

        input.click();
    };

    function loadLocalFiles(files) {
        clear3D();

        var urlDict = {};
        var mainFile = null;
        for (var i = 0; i < files.length; i++) {
            urlDict[files[i].name] = URL.createObjectURL(files[i]);
            if (files[i].name.endsWith("gltf")) mainFile = files[i];
        }

        if (!mainFile) {
            me.dispatchEvent(new Event(Event.ERROR, { info: "GLTF file not found" }));
            return;
        }

        var reader = new FileReader();
        reader.onload = function (e) {
            var sceneObj = JSON.parse(e.currentTarget.result);

            loadFromSrc(sceneObj, urlDict);
        };

        reader.readAsText(mainFile);
    }

    function loadFromSrc(sceneObj, urlDict) {
        for (const key in urlDict) {
            if (String(key).endsWith(".bin")) {
                sceneObj.buffers[0].uri = urlDict[key];
                break;
            }
        }

        if (sceneObj.images) {
            for (var i = 0; i < sceneObj.images.length; i++) {
                var parts = sceneObj.images[i].uri.split("/");
                var imgName = parts[parts.length - 1];

                for (var imgKey in urlDict) {
                    if (imgKey.endsWith(imgName)) {
                        sceneObj.images[i].uri = urlDict[imgKey];
                    }
                }
            }
        }

        var sceneString = JSON.stringify(sceneObj);

        loader = new THREE.GLTFLoader();

        function loadListener(gltf) {
            gltf.scene.traverse(function (obj) {
                if (obj.type == "Mesh") {
                    //obj.material = new THREE.MeshStandardMaterial({color: '#ff0000'});
                    //obj.castShadow = true;
                    if (obj.material.map)
                        obj.material.map.encoding = THREE.LinearEncoding;
                    if (obj.material.normalMap)
                        obj.material.normalMap.encoding = THREE.LinearEncoding;
                }
            });

            content = gltf.scene;
            scene.add(content);
            findMeshes();

            //modelElevation = 0;
            modelToCenter();

            if (modelWidth == 0 || modelHeight == 0 || modelDepth == 0 || !batchMode) {
                console.log("1");
                autoScaleModel();
            } else {
                console.log("2");
                changeModelSizes();
            }

            render();

            me.dispatchEvent(new Event(R2D.ModelUploader.MODEL_LOADED));

            //const geometry = new THREE.BoxGeometry( 10, 10, 10 );
            //const material = new THREE.MeshBasicMaterial( { color: 0xff4400 } );
            //const mesh = new THREE.Mesh( geometry, material );
            //scene.add( mesh );
        }

        loader.parse(sceneString, "", loadListener);
    }

    function changeModelSizes() {
        console.log("changeSize");
        var bbox = new THREE.Box3().setFromObject(content);
        var w = bbox.max.x - bbox.min.x;
        var h = bbox.max.y - bbox.min.y;
        var d = bbox.max.z - bbox.min.z;
        scaleModel(modelWidth / w, modelHeight / h, modelDepth / d);
    }

    function autoScaleModel() {
        var bbox = new THREE.Box3().setFromObject(content);
        var maxSize = Math.max(
            bbox.max.x - bbox.min.x,
            bbox.max.y - bbox.min.y,
            bbox.max.z - bbox.min.z
        );
        // -------- new
        if (maxSize > 5) {
            return;
        }

        var addScale = 100;
        console.log(maxSize);
        scaleModel(addScale, addScale, addScale);
        // -------- end new

        // -------- old
        // var addScale = 1;
        // if (maxSize <= 5) addScale = 100; // loaded in m

        // //var h = bbox.max.y - bbox.min.y;
        // //var p = Math.round(Math.log10(h)) - 2;
        // //var addScale = Math.pow(10, -p);
        // scaleModel(addScale, addScale, addScale);
        // -------- end old
    }

    function modelToCenter() {
        if (!content) return;

        var bbox = new THREE.Box3().setFromObject(content);
        var dx = -(bbox.max.x + bbox.min.x) / 2;
        var dy = -bbox.min.y;
        var dz = -(bbox.max.z + bbox.min.z) / 2;

        for (var i = 0; i < content.children.length; i++) {
            var ch = content.children[i];
            ch.position.set(ch.position.x + dx, ch.position.y + dy, ch.position.z + dz);
        }

        controls.target.set(0, (bbox.max.y - bbox.min.y) / 2, 0);
        controls.update();
    }

    function scaleModel(sx, sy, sz) {
        if (!content) return;
        if (sx <= 0 || sy <= 0 || sz <= 0) return;

        for (var i = 0; i < content.children.length; i++) {
            var ch = content.children[i];

            var newScaleX = ch.scale.x * sx;
            var newScaleY = ch.scale.y * sy;
            var newScaleZ = ch.scale.z * sz;

            ch.scale.set(newScaleX, newScaleY, newScaleZ);
            ch.position.set(ch.position.x * sx, ch.position.y * sy, ch.position.z * sz);
        }

        var bbox = new THREE.Box3().setFromObject(content);
        modelWidth = bbox.max.x - bbox.min.x;
        modelHeight = bbox.max.y - bbox.min.y;
        modelDepth = bbox.max.z - bbox.min.z;

        controls.target.set(0, modelHeight / 2, 0);
        controls.update();

        autoScaleUVs();
    }

    me.findPartScaleCoeff = function (hash) {
        if (!me.checkPartUV(hash)) return NaN;

        var mesh = getMeshByHash(hash);
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

            var uvDistAB = Math.sqrt(
                Math.pow(uvB[0] - uvA[0], 2) + Math.pow(uvB[1] - uvA[1], 2)
            );
            var uvDistBC = Math.sqrt(
                Math.pow(uvC[0] - uvB[0], 2) + Math.pow(uvC[1] - uvB[1], 2)
            );
            var uvDistCA = Math.sqrt(
                Math.pow(uvA[0] - uvC[0], 2) + Math.pow(uvA[1] - uvC[1], 2)
            );

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
        return (
            ((totalDistPos / totalDistUV) * (sumScaleX + sumScaleY + sumScaleZ)) / 3 / 100
        );
    };

    function autoScaleUVs() {
        var hashes = me.getPartsHashes();
        for (var h of hashes) {
            if (!me.checkPartUV(h)) continue;

            var k = me.findPartScaleCoeff(h);
            var mesh = getMeshByHash(h);

            if (mesh.userData.materialId == "0") continue;
            if (!mesh.geometry.attributes.uv) continue;
            if (mesh.material.userData.blockScalingUV) continue;

            mesh.geometry.attributes.uv.array.forEach(function (element, index) {
                mesh.geometry.attributes.uv.array.set([element * k], index);
            });
            mesh.geometry.attributes.uv.needsUpdate = true;
        }
    }

    function findMeshes() {
        meshes = [];
        content.traverse(function (obj) {
            if (obj.type == "Mesh") {
                meshes.push(obj);
            }
        });

        for (var i = 0; i < meshes.length; i++) {
            meshes[i].customScale = 1;

            if (!meshes[i].userData.md5) {
                var str = meshes[i].geometry.attributes.position.array.join(",");
                str +=
                    "," +
                    meshes[i].position.x +
                    "," +
                    meshes[i].position.y +
                    "," +
                    meshes[i].position.z;
                str +=
                    "," +
                    meshes[i].scale.x +
                    "," +
                    meshes[i].scale.y +
                    "," +
                    meshes[i].scale.z;
                str +=
                    "," +
                    meshes[i].rotation.x +
                    "," +
                    meshes[i].rotation.y +
                    "," +
                    meshes[i].rotation.z;

                meshes[i].userData.md5 = md5(str);
            }

            if (!meshes[i].userData.materialId) {
                meshes[i].embeddedMaterial = meshes[i].material;
                meshes[i].userData.materialId = 0;
            } else {
                //
            }

            if (!meshes[i].userData.source) meshes[i].userData.source = "none";
            if (!meshes[i].userData.name) meshes[i].userData.name = meshes[i].name;
        }
    }

    function getMeshByHash(md5) {
        for (var i = 0; i < meshes.length; i++) {
            if (meshes[i].userData.md5 == md5) return meshes[i];
        }
    }

    me.getDomElement = function () {
        return renderer.domElement;
    };

    function init() {
        camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            20,
            2000
        );
        camera.position.set(400, 400, 400);

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth - 120, window.innerHeight - 20);
        //renderer.outputEncoding = THREE.sRGBEncoding;

        //container.appendChild( renderer.domElement );

        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.addEventListener("change", controlsChangeListener); // use if there is no animation loop ???
        controls.enableKeys = false;
        controls.minDistance = 10;
        controls.maxDistance = 1000;
        controls.target.set(0, 0, 0);
        controls.update();

        //const geometry = new THREE.BoxGeometry(100, 100, 100);
        //const material = new THREE.MeshPhongMaterial( {color: 0x00ff00} );
        //const cube = new THREE.Mesh( geometry, material );
        //    scene.add( cube );

        scene.add(lights.getMiddle());

        // middleLight.rotation.set(0, rotation.y, 0);

        /*
        var ambientLight = new THREE.AmbientLight(0xcccccc);
        scene.add(ambientLight);
        var topLight = new THREE.DirectionalLight(0xffffff, 0.3);
        topLight.position.set(0, 350, 0);
        topLight.target.position.set(0, 0, 0);
        scene.add(topLight);
        scene.add(topLight.target);
        var frontLight = new THREE.DirectionalLight(0xffffff, 0.2);
        frontLight.position.set(0, 0, 350);
        frontLight.target.position.set(0, 0, 0);
        scene.add(frontLight);
        scene.add(frontLight.target);
        */

        renderer.domElement["position"] = "absolute";
        renderer.domElement["display"] = "inline-block";
    }

    function controlsChangeListener() {
        lights.getMiddle().rotation.set(0, camera.rotation.y, 0);
        render();
    }

    me.getModelSizes = function () {
        return [modelWidth, modelHeight, modelDepth, modelElevation];
    };

    me.setModelWidth = function (inp, fixProportion) {
        var val = parseFloat(inp);
        if (isNaN(val) || val == modelWidth || val <= 0) return;
        var scale = val / modelWidth;
        if (fixProportion) {
            scaleModel(scale, scale, scale);
        } else {
            scaleModel(scale, 1, 1);
        }

        render();
    };

    me.setModelHeight = function (inp, fixProportion) {
        var val = parseFloat(inp);
        if (isNaN(val) || val == modelHeight || val <= 0) return;
        var scale = val / modelHeight;
        if (fixProportion) {
            scaleModel(scale, scale, scale);
        } else {
            scaleModel(1, scale, 1);
        }
        render();
    };

    me.setModelDepth = function (inp, fixProportion) {
        var val = parseFloat(inp);
        if (isNaN(val) || val == modelDepth || val <= 0) return;
        var scale = val / modelDepth;
        if (fixProportion) {
            scaleModel(scale, scale, scale);
        } else {
            scaleModel(1, 1, scale);
        }
        render();
    };

    me.setModelElevation = function (inp) {
        var val = parseFloat(inp);
        if (isNaN(val) || val < -1000 || val > 1000) return;
        modelElevation = val;
        render();
    };

    me.setPartVisible = function (hash, val) {
        var mesh = getMeshByHash(hash);
        if (mesh) mesh.visible = val;
        render();
    };

    me.setPartScaleUV = function (hash, inp) {
        var mesh = getMeshByHash(hash);
        if (!mesh) return;

        if (!mesh.geometry.attributes.uv) return;
        var val = parseFloat(inp);
        if (isNaN(val) || val <= 0) return;

        var oldScale = mesh.customScale;
        mesh.customScale = val;
        var addScale = val / oldScale;

        mesh.geometry.attributes.uv.array.forEach(function (element, index) {
            mesh.geometry.attributes.uv.array.set([element * addScale], index);
        });
        mesh.geometry.attributes.uv.needsUpdate = true;

        render();
    };

    me.transformPartUVCW = function (hash) {
        var geom = getMeshByHash(hash).geometry;
        if (!geom.attributes.uv || geom.attributes.uv.length == 0) return;
        var arr = geom.attributes.uv.array;
        for (var i = 0; i < arr.length - 1; i += 2) {
            var u = arr[i];
            var v = arr[i + 1];
            arr[i] = v;
            arr[i + 1] = -u;
        }
        geom.attributes.uv.needsUpdate = true;
        render();
    };

    me.transformPartUVCCW = function (hash) {
        var geom = getMeshByHash(hash).geometry;
        if (!geom.attributes.uv || geom.attributes.uv.length == 0) return;
        var arr = geom.attributes.uv.array;
        for (var i = 0; i < arr.length - 1; i += 2) {
            var u = arr[i];
            var v = arr[i + 1];
            arr[i] = -v;
            arr[i + 1] = u;
        }
        geom.attributes.uv.needsUpdate = true;
        render();
    };

    me.transformPartUVFlipX = function (hash) {
        var geom = getMeshByHash(hash).geometry;
        if (!geom.attributes.uv || geom.attributes.uv.length == 0) return;
        var arr = geom.attributes.uv.array;
        for (var i = 0; i < arr.length - 1; i += 2) {
            arr[i] = -arr[i];
        }
        geom.attributes.uv.needsUpdate = true;
        render();
    };

    me.transformPartUVFlipY = function (hash) {
        var geom = getMeshByHash(hash).geometry;
        if (!geom.attributes.uv || geom.attributes.uv.length == 0) return;
        var arr = geom.attributes.uv.array;
        for (var i = 0; i < arr.length - 1; i += 2) {
            arr[i + 1] = -arr[i + 1];
        }
        geom.attributes.uv.needsUpdate = true;
        render();
    };

    me.getPartScaleUV = function (hash) {
        var mesh = getMeshByHash(hash);
        if (!mesh) return;
        return mesh.customScale;
    };

    me.getPartMatPreview = function (hash, size = 100) {
        var canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, size, size);

        var mesh = getMeshByHash(hash);
        if (!mesh) return;

        if (mesh.material.map) {
            ctx.drawImage(mesh.material.map.image, 0, 0, size, size);
        } else {
            var color = mesh.material.color;
            ctx.fillStyle =
                "rgba(" +
                color.r * 255 +
                ", " +
                color.g * 255 +
                ", " +
                color.b * 255 +
                ", 1)";
            ctx.fillRect(0, 0, size, size);
        }

        ctx = null;
        return canvas;
    };

    me.getPartMatId = function (hash) {
        var mesh = getMeshByHash(hash);
        if (!mesh) return;

        return mesh.userData.materialId;
    };

    me.partHasEmbeddedMaterial = function (hash) {
        var mesh = getMeshByHash(hash);
        if (!mesh) return false;
        return mesh.userData.materialId == "0";
    };

    me.getPartMaterial = function (hash) {
        var mesh = getMeshByHash(hash);
        if (!mesh) return;

        return mesh.material;
    };

    me.setPartMatId = function (hash, mat_id) {
        let materialViewer3d = R2D.PoolMaterials.getMaterial(mat_id);

        if (!materialViewer3d) {
            console.warn("Material is null!");
            return;
        }

        if (materialViewer3d.isReady()) {
            setPartMaterial(hash, mat_id, materialViewer3d.getMaterial());
        } else {
            materialViewer3d.addEventListener(Event.UPDATE, matViewerUpdateListener);
        }

        function matViewerUpdateListener(e) {
            //materialViewer3d.removeEventListener(Event.UPDATE, matViewerUpdateListener);
            setPartMaterial(hash, mat_id, materialViewer3d.getMaterial());
        }
    };

    function setPartMaterial(hash, matId, mat) {
        var mesh = getMeshByHash(hash);
        if (!mesh) return;

        if (matId == "" || matId == "0") {
            if (mesh.embeddedMaterial) {
                mesh.userData.materialId = matId;
                mesh.material = mesh.embeddedMaterial;
            }
        } else {
            mesh.userData.materialId = matId;
            mesh.material = mat;

            // autoScaleUVs();

            var k = me.findPartScaleCoeff(hash);
            if (!mat.userData.blockScalingUV) {
                mesh.geometry.attributes.uv.array.forEach(function (element, index) {
                    mesh.geometry.attributes.uv.array.set([element * k], index);
                });
                mesh.geometry.attributes.uv.needsUpdate = true;
            }
        }

        me.dispatchEvent(new Event(R2D.ModelUploader.PART_UPDATED, hash));
        render();
    }

    me.setPartName = function (hash, val) {
        var mesh = getMeshByHash(hash);
        if (!mesh) return;
        mesh.userData.name = val;
    };

    me.getPartName = function (hash) {
        var mesh = getMeshByHash(hash);
        if (!mesh) return;
        return mesh.userData.name;
    };

    me.setPartSource = function (hash, val, setId) {
        var mesh = getMeshByHash(hash);
        if (!mesh) return;

        mesh.userData.source = val;
        if (setId) {
            mesh.userData.setId = setId;
        } else {
            mesh.userData.setId = "";
        }
    };

    me.getPartSource = function (hash) {
        var mesh = getMeshByHash(hash);
        if (!mesh) return;
        return mesh.userData.source;
    };

    me.getPartSetId = function (hash) {
        var mesh = getMeshByHash(hash);
        if (!mesh) return;
        return mesh.userData.setId;
    };

    me.getPartInfo = function (hash) {
        var mesh = getMeshByHash(hash);
        if (!mesh) return;
        var numVert = mesh.geometry.attributes.position.count;
        var numTri = mesh.geometry.index.count / 3;
        return { vertices: numVert, triangles: numTri };
    };

    me.getPartsHashes = function () {
        var res = [];
        for (var i = 0; i < meshes.length; i++) {
            res.push(meshes[i].userData.md5);
        }
        return res;
    };

    me.checkPartUV = function (hash) {
        var mesh = getMeshByHash(hash);
        if (!mesh) return;
        if (mesh.geometry.attributes.uv) return true;
        return false;
    };

    me.setSize = function (w, h) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        render();
    };

    me.getCamera = function () {
        return camera;
    };

    function render() {
        renderer.render(scene, camera);
    }
    me.render = render;

    me.saveToFile = function () {
        createModelBlob(function () {
            FILE.saveFile(modelBlob, "model.glb");
        });
    };

    me.save = function (urlUploadFiles, urlUploadEntity) {
        var nameSource = "";
        var namePrev = "";

        if (content && content.userData) {
            content.userData.root = true;
            content.userData.autoPreview = autoPreview;
        }

        createModelBlob(function () {
            createPrevBlob(function () {
                sendFiles(function () {
                    sendModel(function () {
                        me.dispatchEvent(new Event(R2D.ModelUploader.MODEL_SAVED));
                    });
                });
            });
        });

        function sendFiles(callback) {
            var formdata = new FormData();
            formdata.append("preview", prevBlob, "prev.png");
            formdata.append("source", modelBlob, "scene.glb");

            var method = "POST";
            var xhr = new XMLHttpRequest();

            xhr.open(method, urlUploadFiles, true);
            xhr.responseType = "";
            xhr.withCredentials = false;

            xhr.setRequestHeader("x-token", token);
            xhr.setRequestHeader("x-lang", "en");

            xhr.addEventListener("load", filesLoadedListener);
            xhr.addEventListener("error", filesLoadedListener);
            xhr.send(formdata);

            function filesLoadedListener(e) {
                var resp = null;
                try {
                    resp = JSON.parse(e.currentTarget.response);
                } catch (e) {
                    console.log(e);
                    me.dispatchEvent(
                        new Event(Event.ERROR, { info: "Error sending files" })
                    );
                    return;
                }
                if (!resp || !resp.status || resp.status != "ok") {
                    console.log(resp);
                    me.dispatchEvent(
                        new Event(Event.ERROR, { info: "Error sending files" })
                    );
                    return;
                }

                nameSource = resp.data.source;
                namePrev = resp.data.preview;

                callback();
            }
        }

        function sendModel(callback) {
            var data = getData();

            data.source = nameSource;
            data.preview = namePrev;

            var url = urlUploadEntity;
            var method = "POST";
            if (currentModelId) {
                method = "PUT";
                url += "/" + currentModelId;
            }

            console.log("Up");
            console.log(data);

            data = JSON.stringify(data);

            var xhr = new XMLHttpRequest();

            xhr.open(method, url, true);
            xhr.responseType = "";
            xhr.withCredentials = false;

            xhr.setRequestHeader("x-token", token);
            xhr.setRequestHeader("x-lang", "en");
            xhr.setRequestHeader("Content-type", "application/json");

            xhr.addEventListener("load", modelLoadedListener);
            xhr.addEventListener("error", modelLoadedListener);
            xhr.send(data);

            function modelLoadedListener(e) {
                var resp = null;
                try {
                    resp = JSON.parse(e.currentTarget.response);
                } catch (e) {
                    console.error(e);
                    me.dispatchEvent(
                        new Event(Event.ERROR, { info: "Error sending entity" })
                    );
                    return;
                }
                if (!resp || !resp.status || resp.status != "ok") {
                    console.log(resp);
                    me.dispatchEvent(
                        new Event(Event.ERROR, { info: "Error sending entity" })
                    );
                    return;
                }

                currentModelId = resp.data.entityId;

                if (callback) callback();
            }
        }
    };

    var modelBlob = null;
    var prevBlob = null;

    var creating = false;
    function createModelBlob(callback) {
        if (creating) return;
        creating = true;

        for (var mesh of meshes) {
            if (mesh.userData.materialId != 0) {
                mesh.oldMaterial = mesh.material;
                mesh.material = new THREE.MeshStandardMaterial();
            }
        }

        const gltfExporter = new THREE.GLTFExporter();

        const options = {
            trs: false,
            onlyVisible: true,
            truncateDrawRange: true,
            binary: true,
            maxTextureSize: Infinity,
        };

        var meshesForExport = [];
        content.traverse((obj) => {
            if (obj.type === "Mesh") {
                obj.position.y = 0;
                meshesForExport.push(obj);
            }
        });

        gltfExporter.parse(
            meshesForExport,
            // content,
            function (result) {
                modelBlob = new Blob([result], { type: "application/octet-stream" });
                if (callback) callback();

                for (var mesh of meshes) {
                    if (mesh.userData.materialId != 0) {
                        mesh.material = mesh.oldMaterial;
                        delete mesh.oldMaterial;
                    }
                }
                creating = false;
            },
            options
        );
    }

    function createPrevBlob(callback) {
        var modelPreview = me.getModelPreview();

        if (modelPreview && modelPreview.toBlob)
            modelPreview.toBlob(function (res) {
                prevBlob = res;
                callback();
            }, "image/png");
    }

    function getData() {
        var res = { type: 2, geometries: [], properties: {} };
        Object.assign(res, addPostData);

        for (var mesh of meshes) {
            var partData = {};
            partData.md5 = mesh.userData.md5;
            partData.materialId = mesh.userData.materialId;
            partData.name = mesh.userData.name;
            partData.source = mesh.userData.source;
            if (mesh.userData.source == "set") partData.setId = mesh.userData.setId;
            res.geometries.push(partData);
        }

        var bbox = new THREE.Box3().setFromObject(content);
        res.properties.width = bbox.max.x - bbox.min.x;
        res.properties.height = bbox.max.y - bbox.min.y;
        res.properties.depth = bbox.max.z - bbox.min.z;
        res.properties.positionY = modelElevation;

        /*
        var contourTop = [res.properties.width / 2, res.properties.depth / 2,
                         -res.properties.width / 2, res.properties.depth / 2,
                         -res.properties.width / 2,-res.properties.depth / 2,
                          res.properties.width / 2,-res.properties.depth / 2];

        var contourCut = [res.properties.width / 2, res.properties.height,
                         -res.properties.width / 2, res.properties.height,
                         -res.properties.width / 2, 0,
                          res.properties.width / 2, 0];
    */
        var contourTop = CF.makeContour(content, CF.AXIS_Y);
        var contourCut = CF.makeContour(content, CF.AXIS_Z);

        res.properties.contourTop = contourTop.join();
        res.properties.contourCut = contourCut.join();

        res.properties.appointment = appointment;
        res.tags = tags;
        res.titles = titles;
        res.categoriesProduct = categoriesProduct;
        res.public = publicProduct;

        res.originalEntityId = originalEntityId;
        res.configurationAppId = configurationAppId;
        res.isOriginalModel = isOriginalModel;

        return res;
    }
    me.getScene = function () {
        return scene;
    };

    me.fixy = function () {
        // if (scene && scene.children && scene.children.length > 1) {
        //     scene.children[1].y = 0;
        //     // modelPreview = null;
        //     me.render();
        // }
    };
    var prevRenderer = new THREE.WebGLRenderer({ antialias: true });
    me.generateModelPreview = function (size = 250) {
        var previewFOV = 12;
        var radius = Math.sqrt(
            (modelWidth * modelWidth) / 4 +
                (modelHeight * modelHeight) / 4 +
                (modelDepth * modelDepth) / 4
        );
        var angle = ((previewFOV / 2) * Math.PI) / 180;
        var distance = (radius / Math.sin(angle)) * Math.cos(angle) + radius;

        var prevCamera = new THREE.PerspectiveCamera(previewFOV, 1, 10, distance + 1000);
        var pan = (30 * Math.PI) / 180;
        var tilt = (15 * Math.PI) / 180;
        var y = distance * Math.sin(tilt) + modelHeight / 2;
        var x = distance * Math.cos(tilt) * Math.sin(pan);
        var z = distance * Math.cos(tilt) * Math.cos(pan);
        prevCamera.position.set(x, y, z);
        prevCamera.lookAt(0, modelHeight / 2, 0);

        prevRenderer.setPixelRatio(window.devicePixelRatio);
        prevRenderer.setSize(size, size);
        prevRenderer.render(scene, prevCamera);

        modelPreview = prevRenderer.domElement;
    };

    me.removeBlanks = function (context, canvas, imgWidth, imgHeight) {
        var imageData = context.getImageData(0, 0, canvas.width, canvas.height),
            data = imageData.data,
            getRBG = function (x, y) {
                return {
                    red: data[(imgWidth * y + x) * 4],
                    green: data[(imgWidth * y + x) * 4 + 1],
                    blue: data[(imgWidth * y + x) * 4 + 2],
                };
            },
            isWhite = function (rgb) {
                return rgb.red == 255 && rgb.green == 255 && rgb.blue == 255;
            },
            scanY = function (fromTop) {
                var offset = fromTop ? 1 : -1;

                // loop through each row
                for (
                    var y = fromTop ? 0 : imgHeight - 1;
                    fromTop ? y < imgHeight : y > -1;
                    y += offset
                ) {
                    // loop through each column
                    for (var x = 0; x < imgWidth; x++) {
                        if (!isWhite(getRBG(x, y))) {
                            return y;
                        }
                    }
                }
                return null; // all image is white
            },
            scanX = function (fromLeft) {
                var offset = fromLeft ? 1 : -1;

                // loop through each column
                for (
                    var x = fromLeft ? 0 : imgWidth - 1;
                    fromLeft ? x < imgWidth : x > -1;
                    x += offset
                ) {
                    // loop through each row
                    for (var y = 0; y < imgHeight; y++) {
                        if (!isWhite(getRBG(x, y))) {
                            return x;
                        }
                    }
                }
                return null; // all image is white
            };

        var cropTop = scanY(true),
            cropBottom = scanY(false),
            cropLeft = scanX(true),
            cropRight = scanX(false);

        if (cropTop !== null) {
            var _canvas = document.createElement("canvas");
            var _context = canvas.getContext("2d");

            _context.drawImage(
                _canvas,
                cropLeft,
                cropTop,
                imgWidth,
                imgHeight,
                0,
                0,
                imgWidth,
                imgHeight
            );
            imageData = context.getImageData(
                cropLeft,
                cropTop,
                cropRight - cropLeft,
                cropBottom - cropTop
            );

            context.clearRect(0, 0, imgWidth, imgHeight);

            canvas.width = imageData.width;
            canvas.height = imageData.height;

            context.putImageData(imageData, 0, 0);
        }
    };

    me.getModelPreview = function () {
        if (!modelPreview) {
            me.generateModelPreview();
        }

        var canvas = document.createElement("canvas");
        canvas.width = modelPreview.width;
        canvas.height = modelPreview.height;
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, modelPreview.width, modelPreview.height);
        ctx.drawImage(modelPreview, 0, 0, modelPreview.width, modelPreview.height);
        me.removeBlanks(ctx, canvas, canvas.width, canvas.height);

        return canvas;
    };

    me.getModelPreviewBase64 = function () {
        var prevCanvas = me.getModelPreview();
        return prevCanvas.toDataURL();
    };

    me.setModelPreviewBase64 = function (val) {
        var image = new Image();

        image.onload = function () {
            var canvasSize = 200;
            modelPreview = document.createElement("canvas");
            modelPreview.width = canvasSize;
            modelPreview.height = canvasSize;

            var w, h, dx, dy;
            if (image.naturalWidth > image.naturalHeight) {
                w = canvasSize;
                h = (canvasSize / image.naturalWidth) * image.naturalHeight;
                dx = 0;
                dy = (canvasSize - h) / 2;
            } else {
                w = (canvasSize / image.naturalHeight) * image.naturalWidth;
                h = canvasSize;
                dx = (canvasSize - w) / 2;
                dy = 0;
            }

            var ctx = modelPreview.getContext("2d");
            //ctx.fillStyle = "white";
            //ctx.fillRect(0, 0, canvasSize, canvasSize);
            ctx.drawImage(image, dx, dy, w, h);

            me.dispatchEvent(new Event(R2D.ModelUploader.PREVIEW_LOADED));
        };
        image.onerror = function (e) {
            console.log(e);
            me.dispatchEvent(new Event(Event.ERROR, { info: "Error loading preview" }));
        };

        image.src = val;
    };

    me.setProperties = function (dataObj) {
        if ("appointment" in dataObj) appointment = dataObj.appointment;
        if ("tags" in dataObj) tags = dataObj.tags;
        if ("titles" in dataObj) titles = dataObj.titles;
        if ("categoriesProduct" in dataObj) categoriesProduct = dataObj.categoriesProduct;
        if ("public" in dataObj) publicProduct = dataObj.public;
        if ("isOriginalModel" in dataObj) isOriginalModel = dataObj.isOriginalModel;
        if ("configurationAppId" in dataObj)
            configurationAppId = dataObj.configurationAppId;
        if ("originalEntityId" in dataObj) originalEntityId = dataObj.originalEntityId;
        if ("addPostData" in dataObj) addPostData = dataObj.addPostData;
    };

    me.getProperties = function () {
        return {
            tags: tags,
            titles: titles,
            appointment: appointment,
            categoriesProduct: categoriesProduct,
            public: publicProduct,
            configurationAppId: configurationAppId,
            isOriginalModel: isOriginalModel,
            originalEntityId: originalEntityId,
            ...addPostData,
        };
    };

    me.setAutoPreview = function (val) {
        autoPreview = val;
    };

    me.getAutoPreview = function () {
        return autoPreview;
    };

    function setData(data) {
        me.clear();

        if (data.tags) tags = data.tags;
        if (data.titles) titles = data.titles;
        if (data.categoriesProduct) categoriesProduct = data.categoriesProduct;
        if (data.public) publicProduct = data.public;
        if (data.properties) {
            if (data.properties.appointment) appointment = data.properties.appointment;
            if (data.properties.positionY)
                modelElevation = parseFloat(data.properties.positionY);
            if (data.properties.width) modelWidth = parseFloat(data.properties.width);
            if (data.properties.depth) modelDepth = parseFloat(data.properties.depth);
            if (data.properties.height) modelHeight = parseFloat(data.properties.height);
        }

        if (data.geometries) {
            data.geometries.forEach((geometry) => {
                materialIds.push(geometry.materialId);
            });
        }

        if (data.preview) {
            me.addEventListener(R2D.ModelUploader.PREVIEW_LOADED, previewLoadedListener);
            me.addEventListener(Event.ERROR, previewLoadedListener);

            function previewLoadedListener() {
                me.removeEventListener(
                    R2D.ModelUploader.PREVIEW_LOADED,
                    previewLoadedListener
                );
                me.removeEventListener(Event.ERROR, previewLoadedListener);

                openGLTF(data.source);
            }

            me.setModelPreviewBase64(data.preview);
        } else {
            openGLTF(data.source);
        }

        if ("configurationAppId" in data) configurationAppId = data.configurationAppId;
        if ("isOriginalModel" in data) isOriginalModel = data.isOriginalModel;
        if ("originalEntityId" in data) originalEntityId = data.originalEntityId;
        if ("addPostData" in data) addPostData = data.addPostData;
    }

    me.startUploadLocalGLB = function () {
        var input = document.createElement("input");
        input.type = "file";
        input.accept = "glb";

        input.onchange = function (e) {
            clear3D();

            me.dispatchEvent(new Event(R2D.ModelUploader.MODEL_START_LOAD));
            openGLTF(URL.createObjectURL(e.target.files[0]));
            me.dispatchEvent(new Event(R2D.ModelUploader.MODEL_LOADED));
        };

        input.click();
    };

    me.openOld = function (id) {
        var dataLoader = R2D.Pool.loadProductData(id);

        dataLoader.addEventListener(Event.COMPLETE, loaderCompleteListener);

        function loaderCompleteListener() {
            var sceneObject = new R2D.SceneObjectModel(R2D.Pool.getProductData(id));

            var viewer = R2D.ObjectViewer3D.make(sceneObject); //    new R2D.ObjectViewer3DModel(sceneObject);

            content = viewer.getObject3d();

            content.traverse((obj) => {
                obj.position.y = 0;
            });

            console.log(content);

            scene.add(content);

            setTimeout(function () {
                findMeshes();

                var matData = sceneObject.getMaterials();
                var hashes = me.getPartsHashes();
                for (var i = 0; i < Math.min(matData.length, hashes.length); i++) {
                    // if (R2D.PoolMaterials.getMaterial(matData[i].current).scalability) {
                    var mesh = getMeshByHash(hashes[i]);
                    if (!R2D.PoolMaterials.getMaterial(matData[i].current)?.scalability) {
                        mesh.material.userData.blockScalingUV = true;
                    }

                    me.setPartMatId(hashes[i], matData[i].current);
                    me.setPartSource(hashes[i], matData[i].source, matData[i].setId);
                    me.setPartName(hashes[i], matData[i].name);
                    // } else {
                    //     console.log("no");
                    //     console.log(R2D.PoolMaterials.getMaterial(matData[i].current));

                    //     me.setPartSource(hashes[i], "none");
                    // }
                }

                setTimeout(function () {
                    render();
                    me.dispatchEvent(new Event(R2D.ModelUploader.MODEL_OPENED));
                }, 1000);
            }, 1000);
        }
    };

    function openGLTF(source) {
        if (
            source.endsWith(".mrtd") ||
            source.endsWith(".prtd") ||
            source.endsWith(".crtd")
        ) {
            me.openOld(currentModelId);
            return;
        }

        loader = new THREE.GLTFLoader();

        function loadListener(gltf) {
            var sceneFound = false;
            gltf.scene.traverse(function (obj) {
                if (sceneFound) return;
                if (obj.userData && obj.userData.root) {
                    content = obj;
                    sceneFound = true;
                }
            });

            if (!content) {
                content = gltf.scene;
            }

            content.position.y = 0;

            content.traverse(function (obj) {
                obj.position.y = 0;

                if (obj.type == "Mesh") {
                    //obj.material = new THREE.MeshStandardMaterial({color: '#ff0000'});
                    //obj.castShadow = true;
                    if (obj.material.map)
                        obj.material.map.encoding = THREE.LinearEncoding; // todo: add all maps
                    if (obj.material.normalMap)
                        obj.material.normalMap.encoding = THREE.LinearEncoding;
                }
            });

            console.log(content);

            scene.add(content);
            if (content.userData && "autoPreview" in content.userData)
                autoPreview = content.userData.autoPreview;

            findMeshes();

            modelToCenter();

            autoScaleModel();

            resetMaterials(function () {
                render();
                setTimeout(function () {
                    me.dispatchEvent(new Event(R2D.ModelUploader.MODEL_OPENED));
                }, 300);
            });
        }

        function errorListener(e) {
            me.dispatchEvent(new Event(Event.ERROR, { info: "Error parsing GLTF" }));
            console.log(e);
        }

        function resetMaterials(callback) {
            var meshNum = 0;
            me.addEventListener(R2D.ModelUploader.PART_UPDATED, resetOneMaterial);
            resetOneMaterial();

            function resetOneMaterial() {
                if (meshNum >= meshes.length) {
                    me.removeEventListener(
                        R2D.ModelUploader.PART_UPDATED,
                        resetOneMaterial
                    );
                    callback();
                    return;
                }

                var mesh = meshes[meshNum];
                var id = materialIds[meshNum];
                meshNum++;
                // var id = mesh.userData.materialId;
                if (id && id != "0") {
                    me.setPartMatId(mesh.userData.md5, id);
                } else {
                    resetOneMaterial();
                }
            }
        }

        loader.load(source, loadListener, function () {}, errorListener);
    }

    var selectedMesh = null;
    //var selectInterval = null;
    me.selectPart = function (hash) {
        var minEmiss = 0;
        var maxEmiss = 0.4;
        me.unselectParts();

        selectedMesh = getMeshByHash(hash);
        if (!selectedMesh) return;

        selectedMesh.material.emissive.r = 0.5;
        selectedMesh.material.needsUpdate = true;
        render();

        /*
        var t = 0;

        selectInterval = window.setInterval(function(){
            t += 0.03;
            var currentEmiss = minEmiss + Math.pow(Math.sin(t), 2) * (maxEmiss - minEmiss);
            selectedMesh.material.emissive.r = currentEmiss;
            selectedMesh.material.emissive.g = currentEmiss;
            selectedMesh.material.emissive.b = currentEmiss;
            selectedMesh.material.needsUpdate = true;
            render();

        }, 10);
    */
    };

    me.unselectParts = function () {
        if (!selectedMesh) return;
        //clearInterval(selectInterval);
        selectedMesh.material.emissive.r = 0;
        selectedMesh.material.emissive.g = 0;
        selectedMesh.material.emissive.b = 0;
        render();
    };

    me.uploadBatch = function (urlUploadFiles, urlEntity, dataList) {
        if (!dataList.length || dataList == 0) {
            me.dispatchEvent(new Event(Event.ERROR, { info: "No data to load" }));
        }

        batchMode = true;
        var currentNum = 0;

        function startLoadOne() {
            if (!dataList[currentNum].id) {
                me.dispatchEvent(new Event(Event.ERROR, { info: "No entity id" }));
            } else {
                me.addEventListener(R2D.ModelUploader.MODEL_OPENED, openedListener);
                me.open(urlEntity, dataList[currentNum].id);
            }
        }

        function openedListener() {
            me.removeEventListener(R2D.ModelUploader.MODEL_OPENED, openedListener);

            me.addEventListener(R2D.ModelUploader.MODEL_LOADED, modelLoadedListener);

            if (dataList[currentNum].url) {
                loadRemoteZip(dataList[currentNum].url);
            } else {
                modelLoadedListener();
            }
        }

        function modelLoadedListener() {
            me.removeEventListener(R2D.ModelUploader.MODEL_LOADED, modelLoadedListener);

            me.addEventListener(R2D.ModelUploader.PREVIEW_LOADED, previewLoadedListener);
            me.addEventListener(Event.ERROR, previewLoadedListener);

            if (dataList[currentNum].preview) {
                me.setModelPreviewBase64(dataList[currentNum].preview);
                autoPreview = false;
            } else {
                previewLoadedListener();
                autoPreview = true;
            }
        }

        function previewLoadedListener() {
            me.removeEventListener(
                R2D.ModelUploader.PREVIEW_LOADED,
                previewLoadedListener
            ); // event on error
            me.removeEventListener(Event.ERROR, previewLoadedListener); // event on error

            me.addEventListener(R2D.ModelUploader.MODEL_SAVED, savedListener);

            me.save(urlUploadFiles, urlEntity);
        }

        function savedListener() {
            me.removeEventListener(R2D.ModelUploader.MODEL_SAVED, savedListener);

            if (currentNum == dataList.length - 1) {
                batchMode = false;
                me.dispatchEvent(new Event(R2D.ModelUploader.BATCH_SAVED));
            } else {
                currentNum++;
                startLoadOne();
            }
        }

        startLoadOne();
    };

    function loadRemoteZip(url) {
        JSZipUtils.getBinaryContent(url, function (err, data) {
            if (err) {
                me.dispatchEvent(
                    new Event(Event.ERROR, { info: "Unable to get archive" })
                );
                console.log(err);
                return;
            }

            JSZip.loadAsync(data)
                .then(function (zip) {
                    var objUrlDict = {};
                    var mainObj = null;
                    var filesParsedNum = 0;
                    Object.keys(zip.files).forEach(function (filename) {
                        if (filename.endsWith("gltf")) {
                            zip.files[filename].async("text").then(function (content) {
                                mainObj = JSON.parse(content);
                                checkFinish();
                            });
                        } else {
                            zip.files[filename].async("blob").then(function (content) {
                                objUrlDict[filename] = URL.createObjectURL(content);
                                checkFinish();
                            });
                        }
                    });

                    function checkFinish() {
                        filesParsedNum++;
                        if (filesParsedNum != Object.keys(zip.files).length) return;

                        if (!mainObj) {
                            me.dispatchEvent(
                                new Event(Event.ERROR, { info: "GLTF file not found" })
                            );
                            return;
                        }

                        clear3D();
                        loadFromSrc(mainObj, objUrlDict);
                    }
                })
                .catch(function (err) {
                    me.dispatchEvent(
                        new Event(Event.ERROR, { info: "Unable to unpack archive" })
                    );
                    console.log(err);
                });
        });
    }
};

R2D.ModelUploader.prototype = Object.create(EventDispatcher.prototype);
R2D.ModelUploader.prototype.constructor = R2D.ModelUploader;

R2D.ModelUploader.MODEL_LOADED = "ModelUploaderModelLoaded";
R2D.ModelUploader.MODEL_OPENED = "ModelUploaderModelOpened";
R2D.ModelUploader.MODEL_SAVED = "ModelUploaderModelSaved";
R2D.ModelUploader.PART_UPDATED = "ModelUploaderPartUpdated";
R2D.ModelUploader.CLEARED = "ModelUploaderCleared";
R2D.ModelUploader.MODEL_START_LOAD = "ModelUploaderStartLoad";
R2D.ModelUploader.MODEL_START_OPEN = "ModelUploaderStartOpen";
R2D.ModelUploader.BATCH_SAVED = "BatchSaved";
R2D.ModelUploader.PREVIEW_LOADED = "PreviewLoaded";

R2D.ModelUploader.SOURCE_NONE = "none";
R2D.ModelUploader.SOURCE_BANK = "bank";
R2D.ModelUploader.SOURCE_SET = "set";
