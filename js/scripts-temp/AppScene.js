const appScene = {
  refs: {
    optionsContainerEl: document.querySelector(".options__container"),
    optionsGroupEl: document.querySelector(".options__group"),
    optionsTextEl: document.querySelector(".options__text"),
    optionsTextContent: document.querySelector(".options__text > span"),
    optionLeftToRightBtn: document.querySelector(".option--left-to-right"),
    optionUpToDownBtn: document.querySelector(".option--up-to-down"),
    optionCopyBtn: document.querySelector(".option--copy"),
    optionDeleteBtn: document.querySelector(".option--delete"),
    optionMoveBtn: document.querySelector(".option--move"),
    optionRotateBtn: document.querySelector(".option--rotate"),
  },

  mouse: new THREE.Vector2(),
  mouseDown: new THREE.Vector2(),
  mouseUp: new THREE.Vector2(),

  meshForDrag: new THREE.Mesh(
    new THREE.BoxBufferGeometry(2000, 1, 2000),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.0 })
  ),

  isMousePressed: false,
  isBuilded: false,
  isFirstDraggind: false,
  isDragging: false,
  selectedObject: null,
  contour: null,
  shift: {},
  startHeight: 0,
  startPoint: {},
  angle: { first: 0, second: 0, delta: 0, curRotation: 0, curDelta: 0 },

  currentModelId: "",
  modelBlob: null,
  previewBlob: null,
  previewCanvas: null,
  tmpProductData: {},
  preview: null,
  meshes: [],

  ground: new THREE.Mesh(
    new THREE.CircleBufferGeometry(5000, 32),
    new THREE.MeshBasicMaterial({
      color: 0xf3f3f3,
      side: THREE.DoubleSide,
    })
  ),
  // ----------------Methods--------------------

  render() {
    this.renderer.render(this.scene, this.camera);
  },

  initScene(canvas3d) {
    this.canvas3d = canvas3d;
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: this.canvas3d,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0xffffff);

    this.camera = new THREE.PerspectiveCamera(40, 3 / 5, 10, 5500);
    this.camera.position.z = 1000;
    this.camera.position.x = 0;
    this.camera.position.y = 800;

    this.controls = new THREE.OrbitControls(this.camera, this.canvas3d);
    this.controls.target.set(0, 50, 0);
    this.controls.maxPolarAngle = Math.PI * 0.5;
    this.controls.minDistance = 100;
    this.controls.maxDistance = 3000;
    this.controls.update();

    this.light = new THREE.AmbientLight(0xdddddd);
    this.dirLight1 = new THREE.DirectionalLight(0xffffff, 0.4);
    this.dirLight1.position.set(600, 1400, 1000);

    this.raycaster = new THREE.Raycaster();

    this.construction = new THREE.Object3D();
    this.container = new THREE.Object3D();
    this.container.name = "configurator_container";

    this.scene = new THREE.Scene();
    this.scene.add(this.light);
    this.scene.add(this.dirLight1);
    this.scene.add(this.construction);
    this.scene.add(this.container);

    this.ground.rotateX(Math.PI / 2);
    this.ground.translateY(-5);
    this.ground.name = "ground";
    this.scene.add(this.ground);

    this.render();
  },

  setListeners() {
    const {
      optionMoveBtn,
      optionDeleteBtn,
      optionLeftToRightBtn,
      optionUpToDownBtn,
      optionCopyBtn,
      optionRotateBtn,
    } = this.refs;

    window.addEventListener("mouseup", this.onOptionHeightBtnUp.bind(this));
    window.addEventListener("mouseup", this.onOptionRotateBtnUp.bind(this));

    this.controls.addEventListener("change", (e) => {
      if (this.camera.position.y < 50) {
        this.camera.position.y = 50;
      }
      this.render();
    });

    this.canvas3d.addEventListener("mousedown", this.onMouseDown.bind(this));
    this.canvas3d.addEventListener("mouseup", this.onMouseUp.bind(this));

    this.listenerDragModel = this.onMouseMoveDragModel.bind(this);
    this.listenerOptionHeightMove = this.onOptionHeightBtnMove.bind(this);
    this.listenerOptionRotateMove = this.onOptionRotateBtnMove.bind(this);

    optionMoveBtn.addEventListener(
      "mousedown",
      this.onOptionHeightBtnDown.bind(this)
    );

    optionDeleteBtn.addEventListener(
      "click",
      this.onOptionDeleteBtnClick.bind(this)
    );

    optionLeftToRightBtn.addEventListener(
      "click",
      this.onOptionLeftToRightBtnClick.bind(this)
    );

    optionUpToDownBtn.addEventListener(
      "click",
      this.onOptionUpToDownBtnClick.bind(this)
    );

    optionCopyBtn.addEventListener(
      "click",
      this.onOptionCopyBtnClick.bind(this)
    );

    optionRotateBtn.addEventListener(
      "mousedown",
      this.onOptionRotateBtnDown.bind(this)
    );
  },

  setSize(width, height) {
    this.renderer.setSize(width, height);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.render();
  },

  build3d(obj) {
    this.container.add(obj);
    this.render();
  },

  buildComplex3d(obj) {
    this.container.add(...obj.children);

    this.container.children.forEach((child) => {
      child.position.x += child.userData.dx ?? 0;
      child.position.z += child.userData.dz ?? 0;
    });

    this.render();
  },

  buildPrevBox(pozX, pozZ, width, height, depth) {
    this.selectedObject = new THREE.Mesh(
      new THREE.BoxBufferGeometry(width, height, depth),
      new THREE.MeshStandardMaterial({
        color: 0xfaca0f,
        transparent: true,
        opacity: 0.4,
      })
    );

    this.selectedObject.position.x = pozX;
    this.selectedObject.position.z = pozZ;
    this.selectedObject.position.y = height / 2;
    this.build3d(this.selectedObject);
  },

  setSceneData(data) {
    const lineMat = new THREE.LineBasicMaterial({ color: 0xdddddd });

    for (let wall of data.construction.walls) {
      for (let cont of wall.contours) {
        let points = [];

        for (let p of cont) points.push(new THREE.Vector3(p.x, p.y, -p.z));

        points.push(new THREE.Vector3(cont[0].x, cont[0].y, -cont[0].z));

        let lineGeom = new THREE.BufferGeometry().setFromPoints(points);

        this.construction.add(new THREE.Line(lineGeom, lineMat));
      }
    }

    this.render();
  },

  setProductData(model, data) {
    model.userData.productData = data;
  },

  radToDeg(rad) {
    return Math.round((rad * 180) / Math.PI);
  },

  setContour(obj) {
    const k = 0;
    // const k = 2;

    const bbox = new THREE.Box3().setFromObject(obj);

    const top = bbox.max.y + k - obj.position.y;
    const bottom = bbox.min.y - k - obj.position.y;
    const left = bbox.min.x - k - obj.position.x;
    const right = bbox.max.x + k - obj.position.x;
    const front = bbox.max.z + k - obj.position.z;
    const back = bbox.min.z - k - obj.position.z;

    const lineMat = new THREE.LineBasicMaterial({
      color: 0xff8700,
    });

    let points = [
      new THREE.Vector3(left, top, front),
      new THREE.Vector3(right, top, front),

      new THREE.Vector3(right, top, front),
      new THREE.Vector3(right, top, back),

      new THREE.Vector3(right, top, back),
      new THREE.Vector3(left, top, back),

      new THREE.Vector3(left, top, back),
      new THREE.Vector3(left, top, front),

      new THREE.Vector3(left, bottom, front),
      new THREE.Vector3(right, bottom, front),

      new THREE.Vector3(right, bottom, front),
      new THREE.Vector3(right, bottom, back),

      new THREE.Vector3(right, bottom, back),
      new THREE.Vector3(left, bottom, back),

      new THREE.Vector3(left, bottom, back),
      new THREE.Vector3(left, bottom, front),

      new THREE.Vector3(left, top, front),
      new THREE.Vector3(left, bottom, front),

      new THREE.Vector3(right, top, front),
      new THREE.Vector3(right, bottom, front),

      new THREE.Vector3(right, top, back),
      new THREE.Vector3(right, bottom, back),

      new THREE.Vector3(left, top, back),
      new THREE.Vector3(left, bottom, back),
    ];

    let lineGeom = new THREE.BufferGeometry().setFromPoints(points);

    const contourObj = new THREE.Object3D();

    contourObj.add(new THREE.LineSegments(lineGeom, lineMat));
    contourObj.name = "contour";
    contourObj.visible = false;

    obj.add(contourObj);
  },

  setContours(objects) {
    objects.forEach((obj) => {
      let currentRotation = obj.rotation.y;
      obj.rotateY(-currentRotation);
      this.setContour(obj);
      obj.rotateY(currentRotation);
    });
  },

  // Listeners
  getGroundIntersrct(e) {
    const {
      ground,
      meshForDrag,
      mouseDown,
      mouse,
      camera,
      scene,
      raycaster,
      canvas3d,
      controls,
      startPoint,
    } = this;

    mouseDown.x = e.clientX;
    mouseDown.y = e.clientY;

    mouse.x = (e.clientX / canvas3d.width) * 2 - 1;
    mouse.y = -(e.clientY / canvas3d.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    let intersects = raycaster.intersectObject(ground, true);
    console.log(intersects);
    controls.enabled = false;

    if (intersects[0] && intersects[0].distance < 3600) {
      startPoint.x = intersects[0].point.x;
      startPoint.y = intersects[0].point.y;
      startPoint.z = intersects[0].point.z;
    } else {
      startPoint.x = 0;
      startPoint.y = 0;
      startPoint.z = 0;
    }

    meshForDrag.position.x = startPoint.x;
    meshForDrag.position.y = startPoint.y;
    meshForDrag.position.z = startPoint.z;

    scene.add(meshForDrag);

    canvas3d.addEventListener("mousemove", this.listenerDragModel);

    this.isFirstDragging = true;
    this.isMousePressed = true;

    return { x: startPoint.x, z: startPoint.z };
  },

  onMouseDown(e) {
    const {
      selectedObject,
      meshForDrag,
      mouseDown,
      mouse,
      camera,
      scene,
      raycaster,
      canvas3d,
      controls,
      startPoint,
      refs: { optionsContainerEl },
    } = this;

    mouseDown.x = e.clientX;
    mouseDown.y = e.clientY;

    if (selectedObject) {
      optionsContainerEl.classList.add("visually-hidden");

      mouse.x = (e.clientX / canvas3d.width) * 2 - 1;
      mouse.y = -(e.clientY / canvas3d.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      let intersects = raycaster.intersectObject(selectedObject, true);

      if (intersects.length > 0) {
        controls.enabled = false;

        startPoint.x = intersects[0].point.x;
        startPoint.y = intersects[0].point.y;
        startPoint.z = intersects[0].point.z;

        meshForDrag.position.x = startPoint.x;
        meshForDrag.position.y = startPoint.y;
        meshForDrag.position.z = startPoint.z;

        scene.add(meshForDrag);

        canvas3d.addEventListener("mousemove", this.listenerDragModel);

        this.isDragging = true;
      }
    }

    this.render();
  },

  onMouseMoveDragModel(e) {
    const {
      selectedObject,
      meshForDrag,
      mouse,
      camera,
      raycaster,
      canvas3d,
      startPoint,
      shift,
    } = this;

    mouse.x = (e.clientX / canvas3d.width) * 2 - 1;
    mouse.y = -(e.clientY / canvas3d.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    let intersects = raycaster.intersectObject(meshForDrag);

    if (intersects[0] && intersects[0].distance < 4000) {
      let newPoint = {
        x: intersects[0].point.x,
        y: intersects[0].point.y,
        z: intersects[0].point.z,
      };

      shift.dx = newPoint.x - startPoint.x;
      shift.dy = newPoint.y - startPoint.y;
      shift.dz = newPoint.z - startPoint.z;

      startPoint.x = newPoint.x;
      startPoint.y = newPoint.y;
      startPoint.z = newPoint.z;

      if (selectedObject) {
        selectedObject.position.x += shift.dx;
        selectedObject.position.z += shift.dz;

        meshForDrag.position.x += shift.dx;
        meshForDrag.position.z += shift.dz;
      }
    }

    this.render();
  },

  onMouseUp(e) {
    const {
      canvas3d,
      meshForDrag,
      mouseUp,
      mouse,
      mouseDown,
      scene,
      camera,
      raycaster,
      controls,
      container,
      refs: { optionsContainerEl },
    } = this;

    if (this.isFirstDragging) {
      canvas3d.removeEventListener("mousemove", this.listenerDragModel);

      scene.remove(meshForDrag);

      this.isFirstDragging = false;
      this.isMousePressed = false;

      if (this.isBuilded) {
        appScene.selectedObject = null;
        appScene.isBuilded = false;
      }

      controls.enabled = true;

      return;
    }

    if (this.isDragging) {
      canvas3d.removeEventListener("mousemove", this.listenerDragModel);

      scene.remove(meshForDrag);

      this.isDragging = false;
      controls.enabled = true;

      optionsContainerEl.classList.remove("visually-hidden");
      optionsContainerEl.style.left = `${e.clientX - 50}px`;
      optionsContainerEl.style.top = `${e.clientY - 80}px`;

      return;
    }

    mouseUp.x = e.clientX;
    mouseUp.y = e.clientY;

    if (mouseDown.x === mouseUp.x && mouseDown.y === mouseUp.y) {
      if (this.selectedObject) {
        this.selectedObject.getObjectByName("contour").visible = false;
        this.selectedObject = null;
        optionsContainerEl.classList.add("visually-hidden");

        hideModelSettings();
      } else {
        mouse.x = (e.clientX / canvas3d.width) * 2 - 1;
        mouse.y = -(e.clientY / canvas3d.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        let intersects = raycaster.intersectObjects(container.children, true);

        if (
          intersects.length > 0 &&
          intersects[0].object.parent.name !== "contour"
        ) {
          this.selectedObject = intersects[0].object.parent;
          console.log(this.selectedObject);

          renderModelSettings(this.selectedObject, "to-left");

          this.selectedObject.getObjectByName("contour").visible = true;

          optionsContainerEl.classList.remove("visually-hidden");
          optionsContainerEl.style.left = `${e.clientX - 50}px`;
          optionsContainerEl.style.top = `${e.clientY - 80}px`;
        }
      }
    }

    this.render();
  },

  onOptionHeightBtnDown(e) {
    const {
      selectedObject,
      mouseDown,
      shift,
      refs: {
        optionsContainerEl,
        optionsTextContent,
        optionsGroupEl,
        optionRotateBtn,
        optionsTextEl,
      },
    } = this;

    shift.dh = optionsContainerEl.offsetTop - e.clientY;

    mouseDown.x = e.clientX;
    mouseDown.y = e.clientY;

    this.startHeight = selectedObject.position.y;

    optionsTextContent.textContent = `${selectedObject.position.y}`;
    optionsContainerEl.style.top = `${e.clientY + shift.dh}px`;

    optionsGroupEl.style.visibility = "hidden";
    optionRotateBtn.classList.add("visually-hidden");
    optionsTextEl.classList.remove("visually-hidden");

    window.addEventListener("mousemove", this.listenerOptionHeightMove);
  },

  onOptionHeightBtnMove(e) {
    const {
      selectedObject,
      mouseDown,
      shift,
      refs: { optionsContainerEl, optionsTextContent },
    } = this;

    let newHeight = this.startHeight + (mouseDown.y - e.clientY);

    if (newHeight <= 0) {
      selectedObject.position.y = 0;
      optionsTextContent.textContent = `${0}`;
      return;
    }

    selectedObject.position.y = newHeight - 1;
    optionsTextContent.textContent = `${newHeight - 1}`;
    optionsContainerEl.style.top = `${e.clientY + shift.dh}px`;

    this.render();
  },

  onOptionHeightBtnUp(e) {
    const {
      optionsTextContent,
      optionsGroupEl,
      optionRotateBtn,
      optionsTextEl,
    } = this.refs;

    window.removeEventListener("mousemove", this.listenerOptionHeightMove);

    optionsGroupEl.style.visibility = "visible";
    optionRotateBtn.classList.remove("visually-hidden");
    optionsTextEl.classList.add("visually-hidden");

    optionsTextContent.textContent = "";
  },

  onOptionDeleteBtnClick(e) {
    this.container.remove(this.selectedObject);
    this.selectedObject = null;

    this.refs.optionsContainerEl.classList.add("visually-hidden");

    hideModelSettings();

    this.render();
  },

  onOptionLeftToRightBtnClick(e) {
    this.selectedObject.scale.x *= -1;
    this.render();
  },

  onOptionUpToDownBtnClick(e) {
    this.selectedObject.scale.z *= -1;
    this.render();
  },

  onOptionCopyBtnClick(e) {
    const { selectedObject, container } = this;

    const { userData } = selectedObject;

    if (!userData.copyDirection || userData.copyDirection === 4) {
      userData.copyDirection = 1;
    } else {
      userData.copyDirection += 1;
    }

    const copiedObj = selectedObject.clone();
    for (let i = 0; i < copiedObj.children.length; i += 1) {
      const el = copiedObj.children[i];
      if (el.name === "contour") {
        el.visible = false;
        break;
      }
    }

    copiedObj.userData.copyDirection = 0;

    const bbox = new THREE.Box3().setFromObject(copiedObj);
    const modelWidth = bbox.max.x - bbox.min.x;
    const modelDepth = bbox.max.z - bbox.min.z;

    switch (userData.copyDirection) {
      case 1:
        copiedObj.translateX(modelWidth);
        break;

      case 2:
        copiedObj.translateX(-modelWidth);
        break;

      case 3:
        copiedObj.translateZ(modelDepth);
        break;

      case 4:
        copiedObj.translateZ(-modelDepth);
        break;

      default:
        break;
    }

    container.add(copiedObj);

    this.render();
  },

  onOptionRotateBtnDown(e) {
    const {
      selectedObject,
      angle,
      refs: {
        optionsGroupEl,
        optionMoveBtn,
        optionsTextEl,
        optionsTextContent,
      },
    } = this;

    if (!selectedObject.userData.rotationY) {
      selectedObject.userData.rotationY = 0;
    }

    optionsTextContent.textContent = `${this.radToDeg(
      selectedObject.userData.rotationY
    )}°`;

    angle.first = 0;
    angle.second = 0;

    optionsGroupEl.style.visibility = "hidden";
    optionMoveBtn.classList.add("visually-hidden");
    optionsTextEl.classList.remove("visually-hidden");

    window.addEventListener("mousemove", this.listenerOptionRotateMove);
  },

  onOptionRotateBtnMove(e) {
    const {
      angle,
      selectedObject,
      refs: { optionsContainerEl, optionRotateBtn, optionsTextContent },
    } = this;

    const { userData } = selectedObject;

    function getAngleFromClick(x, y) {
      const tgAngle = (y - yCenter) / (x - xCenter);

      if (x > xCenter && y >= yCenter) {
        return Math.atan(tgAngle);
      }
      if (x < xCenter && y >= yCenter) {
        return Math.PI + Math.atan(tgAngle);
      }
      if (x < xCenter && y <= yCenter) {
        return Math.PI + Math.atan(tgAngle);
      }
      if (x > xCenter && y <= yCenter) {
        return Math.PI * 2 + Math.atan(tgAngle);
      }
    }

    function isAngleNearValue(value, radToDeg) {
      const d = 3;

      return (
        radToDeg(userData.rotationY) > value - d &&
        radToDeg(userData.rotationY) < value + d &&
        radToDeg(angle.curRotation) >= value - d &&
        radToDeg(angle.curRotation) <= value + d
      );
    }

    function saveRotationAtValue(value) {
      selectedObject.rotateY(-(value - userData.rotationY));
      userData.rotationY = value;

      angle.curRotation += angle.delta;
      angle.curDelta += angle.delta;
    }

    let xCenter =
      optionsContainerEl.offsetLeft + optionsContainerEl.offsetWidth / 2;

    let yCenter =
      optionsContainerEl.offsetTop + optionsContainerEl.offsetHeight / 2;

    let radius =
      optionRotateBtn.offsetLeft -
      optionsContainerEl.offsetWidth / 2 +
      optionRotateBtn.offsetWidth / 2;

    let curAngle = getAngleFromClick(e.clientX, e.clientY);

    let distanceX = radius - radius * Math.cos(curAngle);
    let distanceY = radius * Math.sin(curAngle);

    optionRotateBtn.style.transform = `translate(${-distanceX}px, ${distanceY}px)`;

    angle.first = angle.second;
    angle.second = curAngle;

    // ---------------корекція переходу 0-360 і 360-0
    if (angle.second - angle.first > 1) {
      angle.delta = angle.second - Math.PI * 2 - angle.first;
    } else if (angle.second - angle.first < -1) {
      angle.delta = Math.PI * 2 - angle.first + angle.second;
    } else {
      angle.delta = angle.second - angle.first;
    }
    // -----------------------------

    //---------------прилипання кута
    if (isAngleNearValue(90, this.radToDeg)) {
      saveRotationAtValue(Math.PI / 2);
    } else if (isAngleNearValue(180, this.radToDeg)) {
      saveRotationAtValue(Math.PI);
    } else if (isAngleNearValue(270, this.radToDeg)) {
      saveRotationAtValue((Math.PI * 3) / 2);
    } else if (
      isAngleNearValue(360, this.radToDeg) ||
      isAngleNearValue(0, this.radToDeg)
    ) {
      saveRotationAtValue(0);
      // --------------------------------------
    } else {
      userData.rotationY =
        (userData.rotationY + angle.delta + angle.curDelta) % (Math.PI * 2);

      if (userData.rotationY < 0) {
        userData.rotationY = Math.PI * 2 + userData.rotationY;
      }

      selectedObject.rotateY(-(angle.delta + angle.curDelta));
      angle.curRotation = userData.rotationY;

      angle.curDelta = 0;
    }

    optionsTextContent.textContent = `${this.radToDeg(userData.rotationY)}°`;

    this.render();
  },

  onOptionRotateBtnUp(e) {
    this.refs.optionMoveBtn.classList.remove("visually-hidden");

    this.refs.optionsGroupEl.style.visibility = "visible";
    this.refs.optionRotateBtn.style.transform = `translate(0px, 0px)`;

    window.removeEventListener("mousemove", this.listenerOptionRotateMove);
  },
};
