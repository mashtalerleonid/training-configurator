class ModelGeometryUpdater {
  setModelSize(model3D, params) {
    const addScale = this.calcAddScale(model3D, params);

    this.scaleModel(model3D, addScale);

    this.updateModelUV(model3D, "All");
  }

  scaleAll(model3D, scale) {
    model3D.children.forEach((mesh) => {
      const initScale = mesh.scale.x > 10 ? 100 : 1;

      mesh.scale.x = scale * initScale;
      mesh.scale.y = scale * initScale;
      mesh.scale.z = scale * initScale;
    });

    this.updateModelUV(model3D, "All");
  }

  setWidth(model3D, width) {
    const curWidth = this.getModelSize(model3D).width;

    const addScale = {
      x: width / curWidth,
      y: 1,
      z: 1,
    };

    this.scaleModel(model3D, addScale);

    this.updateModelUV(model3D, "X");
  }

  setHeight(model3D, height) {
    const curHeight = this.getModelSize(model3D).height;

    const addScale = {
      x: 1,
      y: height / curHeight,
      z: 1,
    };

    this.scaleModel(model3D, addScale);

    this.updateModelUV(model3D, "Y");
  }

  setDepth(model3D, depth) {
    const curDepth = this.getModelSize(model3D).depth;

    const addScale = {
      x: 1,
      y: 1,
      z: depth / curDepth,
    };

    this.scaleModel(model3D, addScale);

    this.updateModelUV(model3D, "Z");
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

  updateModelUV(model3D, scaleDir) {
    model3D.children.forEach((mesh, index) => {
      this.updateMeshUV(mesh, scaleDir);
    });
  }

  updateMeshUV(mesh, scaleDir) {
    class Point {
      constructor(index, pos, uv) {
        this.x = pos[index * 3];
        this.y = pos[index * 3 + 1];
        this.z = pos[index * 3 + 2];
        this.u = uv[index * 2];
        this.v = uv[index * 2 + 1];
      }
    }

    function checkAngles(XYZ, UV) {
      return (
        Math.abs(XYZ.AB - UV.AB) < limRad &&
        Math.abs(XYZ.BC - UV.BC) < limRad &&
        Math.abs(XYZ.CA - UV.CA) < limRad
      );
    }

    // --------------------

    if (!mesh.userData.initUV) {
      mesh.userData.initUV = mesh.geometry.clone().attributes.uv.array;
    }

    const pos = mesh.geometry.attributes.position.array;
    const uv = mesh.geometry.attributes.uv.array;
    const uvInit = mesh.userData.initUV;

    const scale = { x: mesh.scale.x, y: mesh.scale.y, z: mesh.scale.z };

    const index = [];
    for (let i = 0; i < mesh.geometry.attributes.position.count; i++) {
      index[i] = i;
    }

    const initScale = scale.x > 10 ? 100 : 1;
    const limGrad = 10;
    const limRad = (limGrad * Math.PI) / 180;
    const limN = 0.7;
    let unknownTriangles = 0;

    const UPos = new THREE.Vector3(10, 0, 0);
    const UNeg = new THREE.Vector3(-10, 0, 0);
    const VPos = new THREE.Vector3(0, 0, 10);
    const VNeg = new THREE.Vector3(0, 0, -10);

    const axisX = new THREE.Vector3(10, 0, 0);
    const axisY = new THREE.Vector3(0, 10, 0);
    const axisZ = new THREE.Vector3(0, 0, 10);

    for (let i = 0; i < index.length; i += 3) {
      let dir = "check dir";
      let axis = null;
      let sc = null;

      const indA = index[i];
      const indB = index[i + 1];
      const indC = index[i + 2];

      if (scaleDir === "All") {
        uv.set(
          [
            (uvInit[indA * 2] * scale.x) / initScale,
            (uvInit[indA * 2 + 1] * scale.x) / initScale,
          ],
          indA * 2
        );
        uv.set(
          [
            (uvInit[indB * 2] * scale.x) / initScale,
            (uvInit[indB * 2 + 1] * scale.x) / initScale,
          ],
          indB * 2
        );
        uv.set(
          [
            (uvInit[indC * 2] * scale.x) / initScale,
            (uvInit[indC * 2 + 1] * scale.x) / initScale,
          ],
          indC * 2
        );

        continue;
      }

      const p = {
        A: new Point(indA, pos, uvInit),
        B: new Point(indB, pos, uvInit),
        C: new Point(indC, pos, uvInit),
      };

      const A = new THREE.Vector3(p.A.x, p.A.y, p.A.z);
      const B = new THREE.Vector3(p.B.x, p.B.y, p.B.z);
      const C = new THREE.Vector3(p.C.x, p.C.y, p.C.z);

      const AB = new THREE.Vector3().subVectors(B, A);
      const BC = new THREE.Vector3().subVectors(C, B);
      const CA = new THREE.Vector3().subVectors(A, C);

      const Auv = new THREE.Vector3(p.A.u, 0, p.A.v);
      const Buv = new THREE.Vector3(p.B.u, 0, p.B.v);
      const Cuv = new THREE.Vector3(p.C.u, 0, p.C.v);

      const ABuv = new THREE.Vector3().subVectors(Buv, Auv);
      const BCuv = new THREE.Vector3().subVectors(Cuv, Buv);
      const CAuv = new THREE.Vector3().subVectors(Auv, Cuv);

      const angUPosToABC = {
        AB: UPos.angleTo(ABuv),
        BC: UPos.angleTo(BCuv),
        CA: UPos.angleTo(CAuv),
      };

      const angUNegToABC = {
        AB: UNeg.angleTo(ABuv),
        BC: UNeg.angleTo(BCuv),
        CA: UNeg.angleTo(CAuv),
      };

      const angVPosToABC = {
        AB: VPos.angleTo(ABuv),
        BC: VPos.angleTo(BCuv),
        CA: VPos.angleTo(CAuv),
      };

      const angVNegToABC = {
        AB: VNeg.angleTo(ABuv),
        BC: VNeg.angleTo(BCuv),
        CA: VNeg.angleTo(CAuv),
      };

      const plane = new THREE.Plane();
      plane.setFromCoplanarPoints(A, B, C);

      if (scaleDir === "X") {
        if (Math.abs(plane.normal.x) > limN) {
          continue;
        }

        axis = axisX;
        sc = scale.x;
      } else if (scaleDir === "Y") {
        if (Math.abs(plane.normal.y) > limN) {
          continue;
        }

        axis = axisY;
        sc = scale.y;
      } else if (scaleDir === "Z") {
        if (Math.abs(plane.normal.z) > limN) {
          continue;
        }

        axis = axisZ;
        sc = scale.z;
      }

      const OProj = new THREE.Vector3();
      const AxisProj = new THREE.Vector3();

      plane.projectPoint(new THREE.Vector3(0, 0, 0), OProj);
      plane.projectPoint(axis, AxisProj);

      const axisVector = new THREE.Vector3().subVectors(AxisProj, OProj);

      const angAxisToABC = {
        AB: axisVector.angleTo(AB),
        BC: axisVector.angleTo(BC),
        CA: axisVector.angleTo(CA),
      };

      if (checkAngles(angAxisToABC, angUPosToABC)) {
        dir = "UP";
      } else if (checkAngles(angAxisToABC, angUNegToABC)) {
        dir = "UN";
      } else if (checkAngles(angAxisToABC, angVPosToABC)) {
        dir = "VP";
      } else if (checkAngles(angAxisToABC, angVNegToABC)) {
        dir = "VN";
      } else {
        unknownTriangles += 1;
      }

      if (dir === "UP" || dir === "UN") {
        uv.set([(p.A.u * sc) / initScale], indA * 2);
        uv.set([(p.B.u * sc) / initScale], indB * 2);
        uv.set([(p.C.u * sc) / initScale], indC * 2);
      } else if (dir === "VP" || dir === "VN") {
        uv.set([(p.A.v * sc) / initScale], indA * 2 + 1);
        uv.set([(p.B.v * sc) / initScale], indB * 2 + 1);
        uv.set([(p.C.v * sc) / initScale], indC * 2 + 1);
      }
    }

    mesh.geometry.attributes.uv.needsUpdate = true;
    // console.log(unknownTriangles);
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
