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
    if (!mesh.userData.initUV) {
      mesh.userData.initUV = mesh.geometry.clone().attributes.uv.array;
    }
    const scale = { x: mesh.scale.x, y: mesh.scale.y, z: mesh.scale.z };
    const uv = mesh.geometry.attributes.uv.array;
    // const uv = [...mesh.userData.initUV];
    // const uvInit = [...uv];
    const uvInit = mesh.userData.initUV;
    const pos = mesh.geometry.attributes.position.array;
    const normal = mesh.geometry.attributes.normal.array;
    const index = mesh.geometry.index.array;

    const ratioUV = 0.01;
    const lim = 20;
    const limN = 0.6;

    let dir = "check dir";

    let k = 0;

    // mesh.geometry.translate(size.width / 2 + 10, 0, size.depth / 2 + 10);

    const UPos = new THREE.Vector3(0, 10, 0);
    const UNeg = new THREE.Vector3(0, -10, 0);
    const VPos = new THREE.Vector3(10, 0, 0);
    const VNeg = new THREE.Vector3(-10, 0, 0);

    const axisX = new THREE.Vector3(10, 0, 0);
    const axisY = new THREE.Vector3(0, 10, 0);
    const axisZ = new THREE.Vector3(0, 0, 10);

    for (let i = 0; i < index.length; i += 3) {
      const indA = index[i];
      const indB = index[i + 1];
      const indC = index[i + 2];

      const p = {
        A: {
          x: pos[indA * 3],
          y: pos[indA * 3 + 1],
          z: pos[indA * 3 + 2],
          u: uvInit[indA * 2],
          v: uvInit[indA * 2 + 1],
          n: { x: normal[indA * 3], y: normal[indA * 3 + 1], z: normal[indA * 3 + 2] },
        },

        B: {
          x: pos[indB * 3],
          y: pos[indB * 3 + 1],
          z: pos[indB * 3 + 2],
          u: uvInit[indB * 2],
          v: uvInit[indB * 2 + 1],
          n: { x: normal[indB * 3], y: normal[indB * 3 + 1], z: normal[indB * 3 + 2] },
        },

        C: {
          x: pos[indC * 3],
          y: pos[indC * 3 + 1],
          z: pos[indC * 3 + 2],
          u: uvInit[indC * 2],
          v: uvInit[indC * 2 + 1],
          n: { x: normal[indC * 3], y: normal[indC * 3 + 1], z: normal[indC * 3 + 2] },
        },
      };

      const A = new THREE.Vector3(p.A.x, p.A.y, p.A.z);
      const B = new THREE.Vector3(p.B.x, p.B.y, p.B.z);
      const C = new THREE.Vector3(p.C.x, p.C.y, p.C.z);

      const AB = new THREE.Vector3().subVectors(B, A);
      const BC = new THREE.Vector3().subVectors(C, B);
      const CA = new THREE.Vector3().subVectors(A, C);

      const Auv = new THREE.Vector3(p.A.v, p.A.u, 0);
      const Buv = new THREE.Vector3(p.B.v, p.B.u, 0);
      const Cuv = new THREE.Vector3(p.C.v, p.C.u, 0);

      const ABuv = new THREE.Vector3().subVectors(Buv, Auv);
      const BCuv = new THREE.Vector3().subVectors(Cuv, Buv);
      const CAuv = new THREE.Vector3().subVectors(Auv, Cuv);

      const angUPosToABC = {
        AB: (UPos.angleTo(ABuv) * 180) / Math.PI,
        BC: (UPos.angleTo(BCuv) * 180) / Math.PI,
        CA: (UPos.angleTo(CAuv) * 180) / Math.PI,
      };

      const angUNegToABC = {
        AB: (UNeg.angleTo(ABuv) * 180) / Math.PI,
        BC: (UNeg.angleTo(BCuv) * 180) / Math.PI,
        CA: (UNeg.angleTo(CAuv) * 180) / Math.PI,
      };

      const angVPosToABC = {
        AB: (VPos.angleTo(ABuv) * 180) / Math.PI,
        BC: (VPos.angleTo(BCuv) * 180) / Math.PI,
        CA: (VPos.angleTo(CAuv) * 180) / Math.PI,
      };

      const angVNegToABC = {
        AB: (VNeg.angleTo(ABuv) * 180) / Math.PI,
        BC: (VNeg.angleTo(BCuv) * 180) / Math.PI,
        CA: (VNeg.angleTo(CAuv) * 180) / Math.PI,
      };

      const plane = new THREE.Plane();
      plane.setFromCoplanarPoints(A, B, C);

      let axis = null;

      if (scaleDir === "X") {
        if (Math.abs(plane.normal.x) > limN) {
          continue;
        }
        axis = axisX;
      } else if (scaleDir === "Y") {
        if (Math.abs(plane.normal.y) > limN) {
          continue;
        }
        axis = axisY;
      } else if (scaleDir === "Z") {
        if (Math.abs(plane.normal.z) > limN) {
          continue;
        }
        axis = axisZ;
      }
      // mesh.geometry.translate(size.width / 2 + 10, 0, size.depth / 2 + 10);
      // mesh.geometry.translate(10, 10, 10);

      const OProj = new THREE.Vector3();
      const AxisProj = new THREE.Vector3();

      plane.projectPoint(new THREE.Vector3(0, 0, 0), OProj);
      plane.projectPoint(axis, AxisProj);

      const axisVector = new THREE.Vector3().subVectors(AxisProj, OProj);

      const angAxisToABC = {
        AB: (axisVector.angleTo(AB) * 180) / Math.PI,
        BC: (axisVector.angleTo(BC) * 180) / Math.PI,
        CA: (axisVector.angleTo(CA) * 180) / Math.PI,
      };

      if (
        Math.abs(angAxisToABC.AB - angUPosToABC.AB) < lim &&
        Math.abs(angAxisToABC.BC - angUPosToABC.BC) < lim &&
        Math.abs(angAxisToABC.CA - angUPosToABC.CA) < lim
      ) {
        dir = "UP";
      } else if (
        Math.abs(angAxisToABC.AB - angUNegToABC.AB) < lim &&
        Math.abs(angAxisToABC.BC - angUNegToABC.BC) < lim &&
        Math.abs(angAxisToABC.CA - angUNegToABC.CA) < lim
      ) {
        dir = "UN";
      } else if (
        Math.abs(angAxisToABC.AB - angVPosToABC.AB) < lim &&
        Math.abs(angAxisToABC.BC - angVPosToABC.BC) < lim &&
        Math.abs(angAxisToABC.CA - angVPosToABC.CA) < lim
      ) {
        dir = "VP";
      } else if (
        Math.abs(angAxisToABC.AB - angVNegToABC.AB) < lim &&
        Math.abs(angAxisToABC.BC - angVNegToABC.BC) < lim &&
        Math.abs(angAxisToABC.CA - angVNegToABC.CA) < lim
      ) {
        dir = "VN";
      }
      // else if (
      //   (Math.abs(angAxisToABC.AB - angUPosToABC.AB) < lim &&
      //     Math.abs(angAxisToABC.BC - angUPosToABC.BC) < lim) ||
      //   (Math.abs(angAxisToABC.BC - angUPosToABC.BC) < lim &&
      //     Math.abs(angAxisToABC.CA - angUPosToABC.CA) < lim) ||
      //   (Math.abs(angAxisToABC.AB - angUPosToABC.AB) < lim &&
      //     Math.abs(angAxisToABC.CA - angUPosToABC.CA) < lim)
      // ) {
      //   dir = "UP";
      // } else if (
      //   (Math.abs(angAxisToABC.AB - angUNegToABC.AB) < lim &&
      //     Math.abs(angAxisToABC.BC - angUNegToABC.BC) < lim) ||
      //   (Math.abs(angAxisToABC.BC - angUNegToABC.BC) < lim &&
      //     Math.abs(angAxisToABC.CA - angUNegToABC.CA) < lim) ||
      //   (Math.abs(angAxisToABC.AB - angUNegToABC.AB) < lim &&
      //     Math.abs(angAxisToABC.CA - angUNegToABC.CA) < lim)
      // ) {
      //   dir = "UN";
      // } else if (
      //   (Math.abs(angAxisToABC.AB - angVPosToABC.AB) < lim &&
      //     Math.abs(angAxisToABC.BC - angVPosToABC.BC) < lim) ||
      //   (Math.abs(angAxisToABC.BC - angVPosToABC.BC) < lim &&
      //     Math.abs(angAxisToABC.CA - angVPosToABC.CA) < lim) ||
      //   (Math.abs(angAxisToABC.AB - angVPosToABC.AB) < lim &&
      //     Math.abs(angAxisToABC.CA - angVPosToABC.CA) < lim)
      // ) {
      //   dir = "VP";
      // } else if (
      //   (Math.abs(angAxisToABC.AB - angVNegToABC.AB) < lim &&
      //     Math.abs(angAxisToABC.BC - angVNegToABC.BC) < lim) ||
      //   (Math.abs(angAxisToABC.BC - angVNegToABC.BC) < lim &&
      //     Math.abs(angAxisToABC.CA - angVNegToABC.CA) < lim) ||
      //   (Math.abs(angAxisToABC.AB - angVNegToABC.AB) < lim &&
      //     Math.abs(angAxisToABC.CA - angVNegToABC.CA) < lim)
      // ) {
      //   dir = "VN";
      // }
      else {
        // console.log("out of range");
        // console.log(angAxisToABC);
        // console.log(angUPosToABC);
        // console.log(angUNegToABC);
        // console.log(angVPosToABC);
        // console.log(angVNegToABC);
        console.log(plane.normal);
        k += 1;
      }

      if (scaleDir === "X") {
        if (dir === "UP") {
          uv.set([p.A.x * scale.x * ratioUV], indA * 2);
          uv.set([p.B.x * scale.x * ratioUV], indB * 2);
          uv.set([p.C.x * scale.x * ratioUV], indC * 2);
        } else if (dir === "UN") {
          uv.set([-p.A.x * scale.x * ratioUV], indA * 2);
          uv.set([-p.B.x * scale.x * ratioUV], indB * 2);
          uv.set([-p.C.x * scale.x * ratioUV], indC * 2);
        } else if (dir === "VP") {
          uv.set([p.A.x * scale.x * ratioUV], indA * 2 + 1);
          uv.set([p.B.x * scale.x * ratioUV], indB * 2 + 1);
          uv.set([p.C.x * scale.x * ratioUV], indC * 2 + 1);
        } else if (dir === "VN") {
          uv.set([-p.A.x * scale.x * ratioUV], indA * 2 + 1);
          uv.set([-p.B.x * scale.x * ratioUV], indB * 2 + 1);
          uv.set([-p.C.x * scale.x * ratioUV], indC * 2 + 1);
        }
      } else if (scaleDir === "Y") {
        if (dir === "UP") {
          uv.set([p.A.y * scale.y * ratioUV], indA * 2);
          uv.set([p.B.y * scale.y * ratioUV], indB * 2);
          uv.set([p.C.y * scale.y * ratioUV], indC * 2);
        } else if (dir === "UN") {
          uv.set([-p.A.y * scale.y * ratioUV], indA * 2);
          uv.set([-p.B.y * scale.y * ratioUV], indB * 2);
          uv.set([-p.C.y * scale.y * ratioUV], indC * 2);
        } else if (dir === "VP") {
          uv.set([p.A.y * scale.y * ratioUV], indA * 2 + 1);
          uv.set([p.B.y * scale.y * ratioUV], indB * 2 + 1);
          uv.set([p.C.y * scale.y * ratioUV], indC * 2 + 1);
        } else if (dir === "VN") {
          uv.set([-p.A.y * scale.y * ratioUV], indA * 2 + 1);
          uv.set([-p.B.y * scale.y * ratioUV], indB * 2 + 1);
          uv.set([-p.C.y * scale.y * ratioUV], indC * 2 + 1);
        }
      } else if (scaleDir === "Z") {
        if (dir === "UP") {
          uv.set([p.A.z * scale.z * ratioUV], indA * 2);
          uv.set([p.B.z * scale.z * ratioUV], indB * 2);
          uv.set([p.C.z * scale.z * ratioUV], indC * 2);
        } else if (dir === "UN") {
          uv.set([-p.A.z * scale.z * ratioUV], indA * 2);
          uv.set([-p.B.z * scale.z * ratioUV], indB * 2);
          uv.set([-p.C.z * scale.z * ratioUV], indC * 2);
        } else if (dir === "VP") {
          uv.set([p.A.z * scale.z * ratioUV], indA * 2 + 1);
          uv.set([p.B.z * scale.z * ratioUV], indB * 2 + 1);
          uv.set([p.C.z * scale.z * ratioUV], indC * 2 + 1);
        } else if (dir === "VN") {
          uv.set([-p.A.z * scale.z * ratioUV], indA * 2 + 1);
          uv.set([-p.B.z * scale.z * ratioUV], indB * 2 + 1);
          uv.set([-p.C.z * scale.z * ratioUV], indC * 2 + 1);
        }
      }
      // ----------------
    }

    mesh.geometry.attributes.uv.needsUpdate = true;
    console.log(k);
    // mesh.geometry.translate(-size.width / 2 - 10, 0, -size.depth / 2 - 10);
    // mesh.geometry.translate(0, size.height / 2, 0);
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
