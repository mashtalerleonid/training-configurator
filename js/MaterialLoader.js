class MaterialLoader {
  constructor() {
    this.loaderGLTF = new GLTFLoader();
  }

  async fetchData(id) {
    const headers = {
      "x-lang": "ua",
      "Content-type": "application/x-www-form-urlencoded",
    };
    const json = {
      ids: id,
    };
    const body = `json=${JSON.stringify(json)}`;
    const response = await fetch(
      "https://dev.roomtodo.com/api/category/productsByIds?key=4500282e6846fe6650de81bd35d27540",
      {
        headers,
        method: "POST",
        body,
      }
    );
    const loadedData = await response.json();
    return loadedData;
  }

  async fetchModelGLB(src) {
    return new Promise((resolve, reject) => {
      this.loaderGLTF.load(src, (gltf) => {
        const obj3D = new THREE.Object3D();
        gltf.scene.traverse((el) => {
          if (el.type === "Mesh") {
            obj3D.add(el.clone());
          }
        });
        resolve(obj3D);
      });
    });
  }

  async fetchMaterialGLB(loadedData) {
    const src = loadedData.products[0].source.body.package;

    return new Promise((resolve, reject) => {
      this.loaderGLTF.load(`https://dev.roomtodo.com${src}`, (glb) => {
        const material = glb.scene.children[0].material;
        resolve(material);
      });
    });
  }

  setMaterialOnMesh(mesh, id) {
    this.fetchData(id)
      .then((data) => this.fetchMaterialGLB(data))
      .then((material) => {
        mesh.material = material;
        mesh.material.envMap = textureCube;
        render();
      });
  }

  setMaterialOnAllMeshes(model, id) {
    this.fetchData(id)
      .then((data) => this.fetchMaterialGLB(data))
      .then((material) => {
        model.children.forEach((mesh) => {
          this.dispose(mesh);
          // console.log(material);
          mesh.material = material;
          mesh.material.envMap = textureCube;
        });

        console.log(model);

        render();
      });
  }

  setTestMaterialOnMesh(mesh) {
    mesh.material = this.testMaterial;
    render();
  }

  loadMaterialGLB(id) {
    return new Promise((resolve, reject) => {
      this.fetchData(id)
        .then((data) => this.fetchMaterialGLB(data))
        .then((material) => {
          resolve(material);
        });
    });
  }

  generatePrevMarkup(idList) {
    const dataList = [];
    let markup = null;
    idList.forEach((id) => {
      this.fetchData(id).then((data) => {
        dataList.push({
          id: data.products[0].id,
          src: `https://dev.roomtodo.com${data.products[0].source.images.preview}`,
        });

        if (dataList.length === idList.length) {
          markup = dataList
            .map((el) => {
              return `<div class="item"><img data-id="${el.id}" src="${el.src}"></div>`;
            })
            .join("");

          frameImgCont.innerHTML = markup;
        }
      });
    });
  }

  generateButtonMarkup(data) {
    modelsCont.innerHTML = data
      .map((el) => {
        return `<div class="item" data-src="${el.src}">${el.name}</div>`;
      })
      .join("");
  }

  dispose(node) {
    // if (node.material.map) node.material.map.dispose();
    // if (node.material.lightMap) node.material.lightMap.dispose();
    // if (node.material.bumpMap) node.material.bumpMap.dispose();
    // if (node.material.normalMap) node.material.normalMap.dispose();
    // if (node.material.specularMap) node.material.specularMap.dispose();
    // if (node.material.envMap) node.material.envMap.dispose();
    // if (node.material.alphaMap) node.material.alphaMap.dispose();
    // if (node.material.aoMap) node.material.aoMap.dispose();
    // if (node.material.displacementMap) node.material.displacementMap.dispose();
    // if (node.material.emissiveMap) node.material.emissiveMap.dispose();
    // if (node.material.gradientMap) node.material.gradientMap.dispose();
    // if (node.material.metalnessMap) node.material.metalnessMap.dispose();
    // if (node.material.roughnessMap) node.material.roughnessMap.dispose();
    // node.material.dispose();
  }
}
