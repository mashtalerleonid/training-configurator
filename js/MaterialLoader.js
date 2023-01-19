class MaterialLoader {
  constructor() {
    this.loaderGLTF = new THREE.GLTFLoader();

    this.frameMaterialIds = ["32729", "32611", "738", "2053"];
    this.frontMaterialIds = ["32506", "774"];
    this.backMaterialIds = ["32716"];
    this.lampMaterialIds = ["1555"];
  }

  async fetchMaterialData(id) {
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

  async fetchMaterialGLB(loadedData) {
    const src = loadedData.products[0].source.body.package;

    return new Promise((resolve, reject) => {
      this.loaderGLTF.load(`https://dev.roomtodo.com${src}`, (glb) => {
        const material = glb.scene.children[0].material;
        resolve(material);
      });
    });
  }

  setMaterial(mesh, id) {
    this.fetchMaterialData(id)
      .then((data) => this.fetchMaterialGLB(data))
      .then((material) => {
        mesh.material = material;
        mesh.material.envMap = textureCube;
        render();
      });
  }

  generateMarkup(idList) {
    const dataList = [];
    let markup = null;
    idList.forEach((id) => {
      this.fetchMaterialData(id).then((data) => {
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
}
