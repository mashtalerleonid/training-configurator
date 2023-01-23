class ModelGeometryUpdater {
  setModelSize(model3D, params) {
    const addScale = this.calcAddScale(model3D, params);

    this.scaleModel(model3D, addScale);

    this.updateModelUV(model3D, addScale);
  }

  setWidth(model3D, width) {
    const curWidth = this.getModelSize(model3D).width;

    const addScale = {
      x: width / curWidth,
      y: 1,
      z: 1,
    };

    this.scaleModel(model3D, addScale);

    this.updateModelUV(model3D, addScale);
  }

  setHeight(model3D, height) {
    const curHeight = this.getModelSize(model3D).height;

    const addScale = {
      x: 1,
      y: height / curHeight,
      z: 1,
    };

    this.scaleModel(model3D, addScale);

    this.updateModelUV(model3D, addScale);
  }

  setDepth(model3D, depth) {
    const curDepth = this.getModelSize(model3D).depth;

    const addScale = {
      x: 1,
      y: 1,
      z: depth / curDepth,
    };

    this.scaleModel(model3D, addScale);

    this.updateModelUV(model3D, addScale);
  }

  calcAddScale(model3D, params) {
    const curSize = this.getModelSize(model3D);

    return {
      x: params.width / curSize.width,
      y: params.height / curSize.height,
      z: params.depth / curSize.depth,
    };
  }

  scaleModel(model3D, addScale) {
    model3D.children.forEach((mesh) => {
      mesh.scale.x *= addScale.x;
      mesh.scale.y *= addScale.y;
      mesh.scale.z *= addScale.z;
    });
  }

  updateModelUV(model3D, addScale) {
    model3D.children.forEach((mesh) => {
      this.updateMeshUV(mesh, addScale);
    });
  }

  updateMeshUV(mesh, addScale) {
    function calcDelta(mesh, point, addScale) {
      return {
        dx: point.x * mesh.scale.x - (point.x * mesh.scale.x) / addScale.x,
        dy: point.y * mesh.scale.y - (point.y * mesh.scale.y) / addScale.y,
        dz: point.z * mesh.scale.z - (point.z * mesh.scale.z) / addScale.z,
      };
    }

    const uv = mesh.geometry.attributes.uv.array;
    const pos = mesh.geometry.attributes.position.array;
    const normal = mesh.geometry.attributes.normal.array;

    const ratioUV = mesh.ratioUV;

    for (let i = 0; i < pos.length; i += 3) {
      const point = {
        x: pos[i],
        y: pos[i + 1],
        z: pos[i + 2],
      };

      const iUV = (i / 3) * 2;

      const { dx, dy, dz } = calcDelta(mesh, point, addScale);

      const lim = 0.7;

      const kx = normal[i] > 0 ? 1 : -1;
      const ky = normal[i + 1] > 0 ? 1 : -1;
      const kz = normal[i + 2] > 0 ? 1 : -1;

      if (Math.abs(normal[i]) > lim) {
        uv.set([uv[iUV] - kx * dz * ratioUV, uv[iUV + 1] - dy * ratioUV], iUV);
      } else if (Math.abs(normal[i + 1]) > lim) {
        uv.set([uv[iUV] + dx * ratioUV, uv[iUV + 1] + ky * dz * ratioUV], iUV);
      } else if (Math.abs(normal[i + 2]) > lim) {
        uv.set([uv[iUV] + kz * dx * ratioUV, uv[iUV + 1] - dy * ratioUV], iUV);
      }
    }

    mesh.geometry.attributes.uv.needsUpdate = true;
  }

  setRatioUVToMeshes(model3D) {
    model3D.children.forEach((mesh) => {
      mesh.ratioUV = this.calcRatioUV(mesh);
    });
  }

  calcRatioUV(mesh) {
    const index = mesh.geometry.index.array;
    const pos = mesh.geometry.attributes.position.array;
    const uv = mesh.geometry.attributes.uv.array;

    const indA = index[0];
    const indB = index[1];

    const uvA = { u: uv[indA * 2], v: uv[indA * 2 + 1] };
    const uvB = { u: uv[indB * 2], v: uv[indB * 2 + 1] };

    const posA = {
      x: pos[indA * 3],
      y: pos[indA * 3 + 1],
      z: pos[indA * 3 + 2],
    };
    const posB = {
      x: pos[indB * 3],
      y: pos[indB * 3 + 1],
      z: pos[indB * 3 + 2],
    };

    const posDistAB = Math.sqrt(
      Math.pow(posB.x - posA.x, 2) +
        Math.pow(posB.y - posA.y, 2) +
        Math.pow(posB.z - posA.z, 2)
    );

    const uvDistAB = Math.sqrt(Math.pow(uvB.u - uvA.u, 2) + Math.pow(uvB.v - uvA.v, 2));

    const ratioUV = uvDistAB / posDistAB;

    return ratioUV;
  }

  getModelSize(model3D) {
    const bbox = new THREE.Box3().setFromObject(model3D);
    return {
      width: bbox.max.x - bbox.min.x,
      height: bbox.max.y - bbox.min.y,
      depth: bbox.max.z - bbox.min.z,
    };
  }
}
