if (
  (Math.abs(anglesOY.OY_AB - anglesUP.AB) < lim &&
    Math.abs(anglesOY.OY_BC - anglesUP.BC) < lim) ||
  (Math.abs(anglesOY.OY_BC - anglesUP.BC) < lim &&
    Math.abs(anglesOY.OY_CA - anglesUP.CA) < lim) ||
  (Math.abs(anglesOY.OY_AB - anglesUP.AB) < lim &&
    Math.abs(anglesOY.OY_CA - anglesUP.CA) < lim)
) {
  dir = "UP";
} else if (
  (Math.abs(anglesOY.OY_AB - anglesUN.AB) < lim &&
    Math.abs(anglesOY.OY_BC - anglesUN.BC) < lim) ||
  (Math.abs(anglesOY.OY_BC - anglesUN.BC) < lim &&
    Math.abs(anglesOY.OY_CA - anglesUN.CA) < lim) ||
  (Math.abs(anglesOY.OY_AB - anglesUN.AB) < lim &&
    Math.abs(anglesOY.OY_CA - anglesUN.CA) < lim)
) {
  dir = "UN";
} else if (
  (Math.abs(anglesOY.OY_AB - anglesVP.AB) < lim &&
    Math.abs(anglesOY.OY_BC - anglesVP.BC) < lim) ||
  (Math.abs(anglesOY.OY_BC - anglesVP.BC) < lim &&
    Math.abs(anglesOY.OY_CA - anglesVP.CA) < lim) ||
  (Math.abs(anglesOY.OY_AB - anglesVP.AB) < lim &&
    Math.abs(anglesOY.OY_CA - anglesVP.CA) < lim)
) {
  dir = "VP";
} else if (
  (Math.abs(anglesOY.OY_AB - anglesVN.AB) < lim &&
    Math.abs(anglesOY.OY_BC - anglesVN.BC) < lim) ||
  (Math.abs(anglesOY.OY_BC - anglesVN.BC) < lim &&
    Math.abs(anglesOY.OY_CA - anglesVN.CA) < lim) ||
  (Math.abs(anglesOY.OY_AB - anglesVN.AB) < lim &&
    Math.abs(anglesOY.OY_CA - anglesVN.CA) < lim)
) {
  dir = "VN";
} else {
  console.log("out of range");
}

// ----------------------------------------------

if (getAngle(plane.normal, OY) < 90) {
  angleOYandABC = (getAngle(plane.normal, OY) * Math.PI) / 180;
  if (plane.normal.z > 0) {
    OYinYOZ = {
      x: 0,
      y: Math.sin(angleOYandABC),
      z: -Math.cos(angleOYandABC),
    };
  } else if (plane.normal.z < 0) {
    OYinYOZ = {
      x: 0,
      y: Math.sin(angleOYandABC),
      z: Math.cos(angleOYandABC),
    };
  }
} else if (getAngle(plane.normal, OY) > 90) {
  angleOYandABC = ((getAngle(plane.normal, OY) - 90) * Math.PI) / 180;

  if (plane.normal.z > 0) {
    OYinYOZ = {
      x: 0,
      y: Math.cos(angleOYandABC),
      z: Math.sin(angleOYandABC),
    };
  } else if (plane.normal.z < 0) {
    OYinYOZ = {
      x: 0,
      y: Math.cos(angleOYandABC),
      z: -Math.sin(angleOYandABC),
    };
  }
} else if (getAngle(plane.normal, OY) === 0) {
  OYinYOZ = {
    x: 0,
    y: 0,
    z: 1,
  };
} else if (getAngle(plane.normal, OY) === 90) {
  OYinYOZ = {
    x: 0,
    y: 1,
    z: 0,
  };
}

// ---------------------------------------------

updateMeshUVWork(mesh, addScale) {
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
  
// ---------------------------------------------------

updateMeshUV(mesh, addScale) {
    function calcDelta(mesh, point, addScale) {
      return {
        dx: point.x * mesh.scale.x - (point.x * mesh.scale.x) / addScale.x,
        dy: point.y * mesh.scale.y - (point.y * mesh.scale.y) / addScale.y,
        dz: point.z * mesh.scale.z - (point.z * mesh.scale.z) / addScale.z,
      };
    }
    // const updatedGeo = this.initGeo.clone();
    // const uv = updatedGeo.attributes.uv.array;
    const uv = mesh.geometry.attributes.uv.array;
    // const uvInit = this.initGeo.attributes.uv.array;
    const uvInit = [...uv];
    const pos = mesh.geometry.attributes.position.array;
    // const normal = mesh.geometry.attributes.normal.array;
    const index = mesh.geometry.index.array;

    for (let i = 0; i < index.length; i += 3) {
      const indA = index[i];
      const indB = index[i + 1];
      const indC = index[i + 2];
      // console.log("indA", indA, "indB", indB, "indC", indC);

      const A = {
        x: pos[indA * 3],
        y: pos[indA * 3 + 1],
        z: pos[indA * 3 + 2],
        u: uvInit[indA * 2],
        v: uvInit[indA * 2 + 1],
      };

      const B = {
        x: pos[indB * 3],
        y: pos[indB * 3 + 1],
        z: pos[indB * 3 + 2],
        u: uvInit[indB * 2],
        v: uvInit[indB * 2 + 1],
      };

      const C = {
        x: pos[indC * 3],
        y: pos[indC * 3 + 1],
        z: pos[indC * 3 + 2],
        u: uvInit[indC * 2],
        v: uvInit[indC * 2 + 1],
      };

      const arr = [A, B, C];

      let dir = "";

      let scale = 1;
      // let scaleY = 1;
      // let scaleZ = 1;
      let k = 1000;
      let scaleDir = "";

      if (addScale.x !== 1) {
        scaleDir = "X";
      } else if (addScale.y !== 1) {
        scaleDir = "Y";
      } else if (addScale.z !== 1) {
        scaleDir = "Z";
      } else {
        return;
      }

      // console.log(scaleDir);

      // if (A.x === B.x && B.x === C.x) {
      //   scaleX = 1;
      // } else if (A.x !== B.x) {
      //   scaleX = (A.x * mesh.scale.x - B.x * mesh.scale.x) / (A.x - B.x);
      // } else if (B.x !== C.x) {
      //   scaleX = (B.x * mesh.scale.x - C.x * mesh.scale.x) / (B.x - C.x);
      // } else {
      //   console.log("lost point");
      //   scaleX = 1;
      // }

      if (scaleDir === "X") {
        if (A.x === B.x && B.x === C.x) {
          scale = 1;
          // } else if (true) {
        } else if (A.x !== B.x) {
          scale =
            (A.x * mesh.scale.x - B.x * mesh.scale.x) /
            ((A.x * mesh.scale.x) / addScale.x - (B.x * mesh.scale.x) / addScale.x);
        } else if (B.x !== C.x) {
          scale =
            (B.x * mesh.scale.x - C.x * mesh.scale.x) /
            ((B.x * mesh.scale.x) / addScale.x - (C.x * mesh.scale.x) / addScale.x);
        } else {
          console.log("lost point");
          scale = 1;
        }

        // if (A.x === B.x) {
        //   if (A.u === B.u) {
        //     dir = "XU";
        //   } else {
        //     dir = "XV";
        //   }
        // } else if (B.x === C.x) {
        //   if (B.u === C.u) {
        //     dir = "XU";
        //   } else {
        //     dir = "XV";
        //   }
        // } else if (A.x === C.x) {
        //   if (A.u === C.u) {
        //     dir = "XU";
        //   } else {
        //     dir = "XV";
        //   }
        // } else
        {
          arr.sort((a, b) => a.x - b.x);
          if (
            (arr[0].u <= arr[1].u && arr[1].u <= arr[2].u) ||
            (arr[0].u >= arr[1].u && arr[1].u >= arr[2].u)
          ) {
            dir = "XU";
          } else {
            dir = "XV";
          }
        }
      } else if (scaleDir === "Y") {
        if (A.y === B.y && B.y === C.y) {
          scale = 1;
        } else if (A.y !== B.y) {
          scale =
            (A.y * mesh.scale.y - B.y * mesh.scale.y) /
            ((A.y * mesh.scale.y) / addScale.y - (B.y * mesh.scale.y) / addScale.y);
        } else if (B.y !== C.y) {
          scale =
            (B.y * mesh.scale.y - C.y * mesh.scale.y) /
            ((B.y * mesh.scale.y) / addScale.y - (C.y * mesh.scale.y) / addScale.y);
        } else {
          console.log("lost point");
          scale = 1;
        }

        if (A.y === B.y) {
          if (A.u === B.u) {
            dir = "XU";
          } else {
            dir = "XV";
          }
        } else if (B.y === C.y) {
          if (B.u === C.u) {
            dir = "XU";
          } else {
            dir = "XV";
          }
        } else if (A.y === C.y) {
          if (A.u === C.u) {
            dir = "XU";
          } else {
            dir = "XV";
          }
        } else {
          arr.sort((a, b) => a.y - b.y);
          if (
            (Math.round(arr[0].u * k) / k <= Math.round(arr[1].u * k) / k &&
              Math.round(arr[1].u * k) / k <= Math.round(arr[2].u * k) / k) ||
            (Math.round(arr[0].u * k) / k >= Math.round(arr[1].u * k) / k &&
              Math.round(arr[1].u * k) / k >= Math.round(arr[2].u * k) / k)
          ) {
            dir = "XU";
          } else {
            dir = "XV";
          }
        }
      } else if (scaleDir === "Z") {
        if (A.z === B.z && B.z === C.z) {
          scale = 1;
        } else if (A.z !== B.z) {
          scale =
            (A.z * mesh.scale.z - B.z * mesh.scale.z) /
            ((A.z * mesh.scale.z) / addScale.z - (B.z * mesh.scale.z) / addScale.z);
        } else if (B.z !== C.z) {
          scale =
            (B.z * mesh.scale.z - C.z * mesh.scale.z) /
            ((B.z * mesh.scale.z) / addScale.z - (C.z * mesh.scale.z) / addScale.z);
        } else {
          console.log("lost point");
          scale = 1;
        }

        if (A.z === B.z) {
          if (A.u === B.u) {
            dir = "XU";
          } else {
            dir = "XV";
          }
        } else if (B.z === C.z) {
          if (B.u === C.u) {
            dir = "XU";
          } else {
            dir = "XV";
          }
        } else if (A.z === C.z) {
          if (A.u === C.u) {
            dir = "XU";
          } else {
            dir = "XV";
          }
        } else {
          arr.sort((a, b) => a.z - b.z);
          if (
            (Math.round(arr[0].u * k) / k <= Math.round(arr[1].u * k) / k &&
              Math.round(arr[1].u * k) / k <= Math.round(arr[2].u * k) / k) ||
            (Math.round(arr[0].u * k) / k >= Math.round(arr[1].u * k) / k &&
              Math.round(arr[1].u * k) / k >= Math.round(arr[2].u * k) / k)
          ) {
            dir = "XU";
          } else {
            dir = "XV";
          }
        }
      }

      if (dir === "XU") {
        uv.set([A.u * scale], indA * 2);
        uv.set([B.u * scale], indB * 2);
        uv.set([C.u * scale], indC * 2);
      } else {
        uv.set([A.v * scale], indA * 2 + 1);
        uv.set([B.v * scale], indB * 2 + 1);
        uv.set([C.v * scale], indC * 2 + 1);
      }
    }

    // mesh.geometry.attributes.uv = updatedGeo.attributes.uv;
    mesh.geometry.attributes.uv.needsUpdate = true;
}
  
// -----------------------

  const ABV3 = new THREE.Vector3(B.x - A.x, B.y - A.y, B.z - A.z);

        const AB = { x: p.B.x - p.A.x, y: p.B.y - p.A.y, z: p.B.z - p.A.z };
        const BC = { x: p.C.x - p.B.x, y: p.C.y - p.B.y, z: p.C.z - p.B.z };
        const CA = { x: p.A.x - p.C.x, y: p.A.y - p.C.y, z: p.A.z - p.C.z };

        const AV3 = new THREE.Vector3(p.A.x, p.A.y, p.A.z);
        const BV3 = new THREE.Vector3(p.B.x, p.B.y, p.B.z);
        const CV3 = new THREE.Vector3(p.C.x, p.C.y, p.C.z);

        const ABinXY = { x: p.B.v - p.A.v, y: p.B.u - p.A.u, z: 0 };
        const BCinXY = { x: p.C.v - p.B.v, y: p.C.u - p.B.u, z: 0 };
        const CAinXY = { x: p.A.v - p.C.v, y: p.A.u - p.C.u, z: 0 };
        ----------------------
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
        -------------------------

        const ABinXY = { x: p.B.v - p.A.v, y: p.B.u - p.A.u, z: 0 };
        const BCinXY = { x: p.C.v - p.B.v, y: p.C.u - p.B.u, z: 0 };
        const CAinXY = { x: p.A.v - p.C.v, y: p.A.u - p.C.u, z: 0 };

        // -----------------------------

         if (scaleDir === "XX") {
        // const angUPosToABC = {
        //   AB: (UPos.angleTo(ABuv) * 180) / Math.PI,
        //   BC: (UPos.angleTo(BCuv) * 180) / Math.PI,
        //   CA: (UPos.angleTo(CAuv) * 180) / Math.PI,
        // };
        // const angUNegToABC = {
        //   AB: (UNeg.angleTo(ABuv) * 180) / Math.PI,
        //   BC: (UNeg.angleTo(BCuv) * 180) / Math.PI,
        //   CA: (UNeg.angleTo(CAuv) * 180) / Math.PI,
        // };
        // const angVPosToABC = {
        //   AB: (VPos.angleTo(ABuv) * 180) / Math.PI,
        //   BC: (VPos.angleTo(BCuv) * 180) / Math.PI,
        //   CA: (VPos.angleTo(CAuv) * 180) / Math.PI,
        // };
        // const angVNegToABC = {
        //   AB: (VNeg.angleTo(ABuv) * 180) / Math.PI,
        //   BC: (VNeg.angleTo(BCuv) * 180) / Math.PI,
        //   CA: (VNeg.angleTo(CAuv) * 180) / Math.PI,
        // };
        // const plane = new THREE.Plane();
        // plane.setFromCoplanarPoints(A, B, C);
        // if (Math.abs(plane.normal.x) > 0.95) {
        //   continue;
        // }
        // const OProj = new THREE.Vector3();
        // const AxisProj = new THREE.Vector3();
        // plane.projectPoint(new THREE.Vector3(0, 0, 0), OProj);
        // plane.projectPoint(axisX, AxisProj);
        // const axisVector = new THREE.Vector3().subVectors(AxisProj, OProj);
        // const angOXToABC = {
        //   AB: (axisVector.angleTo(AB) * 180) / Math.PI,
        //   BC: (axisVector.angleTo(BC) * 180) / Math.PI,
        //   CA: (axisVector.angleTo(CA) * 180) / Math.PI,
        // };
        // if (
        //   Math.abs(angOXToABC.AB - angUPosToABC.AB) < lim &&
        //   Math.abs(angOXToABC.BC - angUPosToABC.BC) < lim &&
        //   Math.abs(angOXToABC.CA - angUPosToABC.CA) < lim
        // ) {
        //   dir = "UP";
        // } else if (
        //   Math.abs(angOXToABC.AB - angUNegToABC.AB) < lim &&
        //   Math.abs(angOXToABC.BC - angUNegToABC.BC) < lim &&
        //   Math.abs(angOXToABC.CA - angUNegToABC.CA) < lim
        // ) {
        //   dir = "UN";
        // } else if (
        //   Math.abs(angOXToABC.AB - angVPosToABC.AB) < lim &&
        //   Math.abs(angOXToABC.BC - angVPosToABC.BC) < lim &&
        //   Math.abs(angOXToABC.CA - angVPosToABC.CA) < lim
        // ) {
        //   dir = "VP";
        // } else if (
        //   Math.abs(angOXToABC.AB - angVNegToABC.AB) < lim &&
        //   Math.abs(angOXToABC.BC - angVNegToABC.BC) < lim &&
        //   Math.abs(angOXToABC.CA - angVNegToABC.CA) < lim
        // ) {
        //   dir = "VN";
        // } else {
        //   // console.log("out of range");
        // }
        // if (dir === "check dir") {
        //   kx = 0;
        // } else if (dir === "UP" || dir === "VP") {
        //   kx = 1;
        // } else {
        //   kx = -1;
        // }
      }
      if (scaleDir === "YY") {
        // const OY = { x: 0, y: 10, z: 0 };
        // const OUP = { x: 0, y: 10, z: 0 };
        // const OUN = { x: 0, y: -10, z: 0 };
        // const OVP = { x: 10, y: 0, z: 0 };
        // const OVN = { x: -10, y: 0, z: 0 };

        // const AV3 = new THREE.Vector3(A.x, A.y, A.z);
        // const BV3 = new THREE.Vector3(B.x, B.y, B.z);
        // const CV3 = new THREE.Vector3(C.x, C.y, C.z);

        // const ABV3 = new THREE.Vector3(B.x - A.x, B.y - A.y, B.z - A.z);
        // const AB = { x: B.x - A.x, y: B.y - A.y, z: B.z - A.z };
        // const BC = { x: C.x - B.x, y: C.y - B.y, z: C.z - B.z };
        // const CA = { x: A.x - C.x, y: A.y - C.y, z: A.z - C.z };

        // const ABinXY = { x: B.v - A.v, y: B.u - A.u, z: 0 };
        // const BCinXY = { x: C.v - B.v, y: C.u - B.u, z: 0 };
        // const CAinXY = { x: A.v - C.v, y: A.u - C.u, z: 0 };

        // const anglesUP = {
        //   AB: getAngle(OUP, ABinXY),
        //   BC: getAngle(OUP, BCinXY),
        //   CA: getAngle(OUP, CAinXY),
        // };

        // const anglesUN = {
        //   AB: getAngle(OUN, ABinXY),
        //   BC: getAngle(OUN, BCinXY),
        //   CA: getAngle(OUN, CAinXY),
        // };

        // const anglesVP = {
        //   AB: getAngle(OVP, ABinXY),
        //   BC: getAngle(OVP, BCinXY),
        //   CA: getAngle(OVP, CAinXY),
        // };

        // const anglesVN = {
        //   AB: getAngle(OVN, ABinXY),
        //   BC: getAngle(OVN, BCinXY),
        //   CA: getAngle(OVN, CAinXY),
        // };

        // let anglesOY = {};

        // const plane = new THREE.Plane();
        // plane.setFromCoplanarPoints(AV3, BV3, CV3);
        // console.log(plane);

        if (Math.abs(plane.normal.y) > 0.95) {
          continue;
        }

        const Y0 = plane.projectPoint(new THREE.Vector3(0, 0, 0));
        const Y1 = plane.projectPoint(new THREE.Vector3(0, 10, 0));
        const Y0Y1 = { x: Y1.x - Y0.x, y: Y1.y - Y0.y, z: Y1.z - Y0.z };

        anglesOY = {
          OY_AB: getAngle(Y0Y1, AB),
          OY_BC: getAngle(Y0Y1, BC),
          OY_CA: getAngle(Y0Y1, CA),
        };

        if (
          Math.abs(anglesOY.OY_AB - anglesUP.AB) < lim &&
          Math.abs(anglesOY.OY_BC - anglesUP.BC) < lim &&
          Math.abs(anglesOY.OY_CA - anglesUP.CA) < lim
        ) {
          dir = "UP";
        } else if (
          Math.abs(anglesOY.OY_AB - anglesUN.AB) < lim &&
          Math.abs(anglesOY.OY_BC - anglesUN.BC) < lim &&
          Math.abs(anglesOY.OY_CA - anglesUN.CA) < lim
        ) {
          dir = "UN";
        } else if (
          Math.abs(anglesOY.OY_AB - anglesVP.AB) < lim &&
          Math.abs(anglesOY.OY_BC - anglesVP.BC) < lim &&
          Math.abs(anglesOY.OY_CA - anglesVP.CA) < lim
        ) {
          dir = "VP";
        } else if (
          Math.abs(anglesOY.OY_AB - anglesVN.AB) < lim &&
          Math.abs(anglesOY.OY_BC - anglesVN.BC) < lim &&
          Math.abs(anglesOY.OY_CA - anglesVN.CA) < lim
        ) {
          dir = "VN";
        } else {
          console.log("out 1");

          if (
            (Math.abs(anglesOY.OY_AB - anglesUP.AB) < lim &&
              Math.abs(anglesOY.OY_BC - anglesUP.BC) < lim) ||
            (Math.abs(anglesOY.OY_BC - anglesUP.BC) < lim &&
              Math.abs(anglesOY.OY_CA - anglesUP.CA) < lim) ||
            (Math.abs(anglesOY.OY_AB - anglesUP.AB) < lim &&
              Math.abs(anglesOY.OY_CA - anglesUP.CA) < lim)
          ) {
            dir = "UP";
          } else if (
            (Math.abs(anglesOY.OY_AB - anglesUN.AB) < lim &&
              Math.abs(anglesOY.OY_BC - anglesUN.BC) < lim) ||
            (Math.abs(anglesOY.OY_BC - anglesUN.BC) < lim &&
              Math.abs(anglesOY.OY_CA - anglesUN.CA) < lim) ||
            (Math.abs(anglesOY.OY_AB - anglesUN.AB) < lim &&
              Math.abs(anglesOY.OY_CA - anglesUN.CA) < lim)
          ) {
            dir = "UN";
          } else if (
            (Math.abs(anglesOY.OY_AB - anglesVP.AB) < lim &&
              Math.abs(anglesOY.OY_BC - anglesVP.BC) < lim) ||
            (Math.abs(anglesOY.OY_BC - anglesVP.BC) < lim &&
              Math.abs(anglesOY.OY_CA - anglesVP.CA) < lim) ||
            (Math.abs(anglesOY.OY_AB - anglesVP.AB) < lim &&
              Math.abs(anglesOY.OY_CA - anglesVP.CA) < lim)
          ) {
            dir = "VP";
          } else if (
            (Math.abs(anglesOY.OY_AB - anglesVN.AB) < lim &&
              Math.abs(anglesOY.OY_BC - anglesVN.BC) < lim) ||
            (Math.abs(anglesOY.OY_BC - anglesVN.BC) < lim &&
              Math.abs(anglesOY.OY_CA - anglesVN.CA) < lim) ||
            (Math.abs(anglesOY.OY_AB - anglesVN.AB) < lim &&
              Math.abs(anglesOY.OY_CA - anglesVN.CA) < lim)
          ) {
            dir = "VN";
          } else {
            console.log("out of range");
          }
        }

        if (dir === "check dir") {
          ky = 0;
        } else if (dir === "UP" || dir === "VP") {
          ky = 1;
        } else {
          ky = -1;
        }
      } else if (scaleDir === "XX") {
        // if (Math.abs(A.n.x) > 0.9) {
        //   continue;
        // }

        const lim = 1;
        const XY = { x: B.x - A.x, y: B.y - A.y, z: B.z - A.z };
        const UV = { u: B.u - A.u, v: B.v - A.v };
        // const UV = { x: B.u - A.u, y: B.v - A.v, z: 0 };
        const angleX = getAngle(XY, { x: 10, y: 0, z: 0 });
        const angleU = getAngle({ x: UV.u, y: UV.v, z: 0 }, { x: 10, y: 0, z: 0 });
        const angleV = getAngle({ x: UV.u, y: UV.v, z: 0 }, { x: 0, y: -10, z: 0 });

        // if (Math.abs(angleX - angleU) < lim) {
        //   dir = "UP";
        // } else if (Math.abs(angleX - angleV) < lim) {
        //   dir = "VP";
        // } else if (Math.abs(angleX - (180 - angleU)) < lim) {
        //   dir = "UN";
        // } else if (Math.abs(angleX - (180 - angleV)) < lim) {
        //   dir = "VN";
        // } else if (angleX < 45 && angleU < 45) {
        //   dir = "UP";
        // } else if (angleX < 45 && angleV < 45) {
        //   dir = "VP";
        // } else if (angleX < 90 && angleU < 45) {
        //   dir = "VP";
        // } else if (angleX < 90 && angleV < 45) {
        //   dir = "UN";
        // }

        // console.log(angleX);
        // console.log(angleU, angleV);

        // ---------------end work------------------------------------------------------

        if (A.n.y > 0.95) {
          // if (
          //   Math.abs(angleX - angleU) < lim &&
          //   XY.z < 0 &&
          //   XY.x > 0 &&
          //   UV.u > 0 &&
          //   UV.v < 0
          // ) {
          //   dir = "UP";
          // } else if (
          //   Math.abs(angleX - angleV) < lim &&
          //   XY.z < 0 &&
          //   XY.x > 0 &&
          //   UV.u > 0 &&
          //   UV.v > 0
          // ) {
          //   dir = "VP";
          // } else if (
          //   Math.abs(angleX - angleU) < lim &&
          //   XY.z < 0 &&
          //   XY.x < 0 &&
          //   UV.u < 0 &&
          //   UV.v < 0
          // ) {
          //   dir = "UP";
          // } else if (
          //   Math.abs(angleX - angleV) < lim &&
          //   XY.z < 0 &&
          //   XY.x < 0 &&
          //   UV.u > 0 &&
          //   UV.v < 0
          // ) {
          //   dir = "VP";
          // } else if (
          //   Math.abs(angleX - angleU) < lim &&
          //   XY.z > 0 &&
          //   XY.x < 0 &&
          //   UV.u < 0 &&
          //   UV.v > 0
          // ) {
          //   dir = "UP";
          // } else if (
          //   Math.abs(angleX - angleV) < lim &&
          //   XY.z > 0 &&
          //   XY.x < 0 &&
          //   UV.u < 0 &&
          //   UV.v < 0
          // ) {
          //   dir = "VP";
          // } else if (
          //   Math.abs(angleX - angleU) < lim &&
          //   XY.z > 0 &&
          //   XY.x > 0 &&
          //   UV.u > 0 &&
          //   UV.v > 0
          // ) {
          //   dir = "UP";
          // } else if (
          //   Math.abs(angleX - angleV) < lim &&
          //   XY.z > 0 &&
          //   XY.x > 0 &&
          //   UV.u < 0 &&
          //   UV.v > 0
          // ) {
          //   dir = "VP";
          // }

          if (XY.z < 0 && XY.x > 0) {
            if (UV.u > 0 && UV.v < 0) {
              dir = "UP";
            } else if (UV.u < 0 && UV.v < 0) {
              dir = "VN";
            } else if (UV.u < 0 && UV.v < 0) {
              dir = "UN";
            } else if (UV.u > 0 && UV.v > 0) {
              dir = "VP";
            }
          } else if (XY.z < 0 && XY.x < 0) {
            if (UV.u > 0 && UV.v < 0) {
              dir = "VP";
            } else if (UV.u < 0 && UV.v < 0) {
              dir = "UP";
            } else if (UV.u < 0 && UV.v < 0) {
              dir = "VN";
            } else if (UV.u > 0 && UV.v > 0) {
              dir = "UN";
            }
          } else if (XY.z > 0 && XY.x < 0) {
            if (UV.u > 0 && UV.v < 0) {
              dir = "UN";
            } else if (UV.u < 0 && UV.v < 0) {
              dir = "VP";
            } else if (UV.u < 0 && UV.v < 0) {
              dir = "UP";
            } else if (UV.u > 0 && UV.v > 0) {
              dir = "VN";
            }
          } else if (XY.z > 0 && XY.x > 0) {
            if (UV.u > 0 && UV.v < 0) {
              dir = "VN";
            } else if (UV.u < 0 && UV.v < 0) {
              dir = "UN";
            } else if (UV.u < 0 && UV.v < 0) {
              dir = "VP";
            } else if (UV.u > 0 && UV.v > 0) {
              dir = "UP";
            }
          }
        } else if (A.n.y < -0.95 && false) {
          if (XY.z > 0 && XY.x > 0) {
            if (UV.u > 0 && UV.v < 0) {
              dir = "UP";
            } else if (UV.u < 0 && UV.v < 0) {
              dir = "VN";
            } else if (UV.u < 0 && UV.v < 0) {
              dir = "UN";
            } else if (UV.u > 0 && UV.v > 0) {
              dir = "VP";
            }
          } else if (XY.z > 0 && XY.x < 0) {
            if (UV.u > 0 && UV.v < 0) {
              dir = "VP";
            } else if (UV.u < 0 && UV.v < 0) {
              dir = "UP";
            } else if (UV.u < 0 && UV.v < 0) {
              dir = "VN";
            } else if (UV.u > 0 && UV.v > 0) {
              dir = "UN";
            }
          } else if (XY.z < 0 && XY.x < 0) {
            if (UV.u > 0 && UV.v < 0) {
              dir = "UN";
            } else if (UV.u < 0 && UV.v < 0) {
              dir = "VP";
            } else if (UV.u < 0 && UV.v < 0) {
              dir = "UP";
            } else if (UV.u > 0 && UV.v > 0) {
              dir = "VN";
            }
          } else if (XY.z < 0 && XY.x > 0) {
            if (UV.u > 0 && UV.v < 0) {
              dir = "VN";
            } else if (UV.u < 0 && UV.v < 0) {
              dir = "UN";
            } else if (UV.u < 0 && UV.v < 0) {
              dir = "VP";
            } else if (UV.u > 0 && UV.v > 0) {
              dir = "UP";
            }
          }
        }
        // ------------------------------
        // const arrX = [...arr].sort((a, b) => a.x - b.x);
        // let a = arrX[0];
        // let b = arrX[1];
        // let c = arrX[2];

        // if (a.u <= b.u && b.u <= c.u) {
        //   dir = "UP";
        // } else if (c.u <= b.u && b.u <= a.u) {
        //   dir = "UN";
        // } else if (a.v <= b.v && b.v <= c.v) {
        //   dir = "VP";
        // } else if (c.v <= b.v && b.v <= a.v) {
        //   dir = "VN";
        // } else {
        //   console.log("loose");
        //   console.log(arr);
        // }
        if (dir === "check") {
          kx = 0;
        } else if (dir === "UP" || dir === "VP") {
          kx = 1;
        } else {
          kx = -1;
        }
        console.log(dir, kx);
        // console.log(dxA, dxB, dxC);
        // ---------------------------------------------------------------------

        // if (A.n.y === 1) {
        //   if (A.x !== B.x) {
        //     if (A.x < B.x) {
        // firstPoint = A;
        // secondPoint = B;
        //     } else {
        //       firstPoint = B;
        //       secondPoint = A;
        //     }
        //   } else {
        // if (A.x < C.x) {
        //   firstPoint = A;
        //   secondPoint = C;
        // } else {
        //   firstPoint = C;
        //   secondPoint = A;
        // }
        //   }
        //   if (firstPoint.u < secondPoint.u) {
        //     kx = 1;
        //   } else {
        //     kx = -1;
        //   }
        // } else {
        // }
        // ---------
        // if (A.y === B.y && B.y === C.y && (A.x === B.x || B.x === C.x || A.x === C.x)) {
        //   if (A.x !== B.x) {
        //     if (A.x < B.x) {
        //       firstPoint = A;
        //       secondPoint = B;
        //     } else {
        //       firstPoint = B;
        //       secondPoint = A;
        //     }
        //   } else {
        //     if (A.x < C.x) {
        //       firstPoint = A;
        //       secondPoint = C;
        //     } else {
        //       firstPoint = C;
        //       secondPoint = A;
        //     }
        //   }
        // } else {
        // }

        // if (
        //   false
        //   // (Math.abs(A.n.y) === 1 || Math.abs(A.n.z) === 1) &&
        //   // (A.x === B.x || B.x === C.x || A.x === C.x)
        // ) {
        //   console.log("yesss");
        // if (A.x === B.x) {
        //   if (A.u === B.u) {
        //     if (C.x < A.x) {
        //       if (C.u < A.u) {
        //         dir = "UP";
        //       } else {
        //         dir = "UN";
        //       }
        //     } else {
        //       if (C.u > A.u) {
        //         dir = "UP";
        //       } else {
        //         dir = "UN";
        //       }
        //     }
        //   } else if (A.v === B.v) {
        //     if (C.x < A.x) {
        //       if (C.v < A.v) {
        //         dir = "VP";
        //       } else {
        //         dir = "VN";
        //       }
        //     } else {
        //       if (C.v > A.v) {
        //         dir = "VP";
        //       } else {
        //         dir = "VN";
        //       }
        //     }
        //   }
        // } else if (B.x === C.x) {
        //   if (B.u === C.u) {
        //     if (A.x < B.x) {
        //       if (A.u < B.u) {
        //         dir = "UP";
        //       } else {
        //         dir = "UN";
        //       }
        //     } else {
        //       if (A.u > B.u) {
        //         dir = "UP";
        //       } else {
        //         dir = "UN";
        //       }
        //     }
        //   } else if (B.v === C.v) {
        //     if (A.x < B.x) {
        //       if (A.v < B.v) {
        //         dir = "VP";
        //       } else {
        //         dir = "VN";
        //       }
        //     } else {
        //       if (A.v > B.v) {
        //         dir = "VP";
        //       } else {
        //         dir = "VN";
        //       }
        //     }
        //   }
        // } else if (A.x === C.x) {
        //   if (A.u === C.u) {
        //     if (B.x < A.x) {
        //       if (B.u < A.u) {
        //         dir = "UP";
        //       } else {
        //         dir = "UN";
        //       }
        //     } else {
        //       if (B.u > A.u) {
        //         dir = "UP";
        //       } else {
        //         dir = "UN";
        //       }
        //     }
        //   } else if (A.v === C.v) {
        //     if (B.x < A.x) {
        //       if (B.v < A.v) {
        //         dir = "VP";
        //       } else {
        //         dir = "VN";
        //       }
        //     } else {
        //       if (B.v > A.v) {
        //         dir = "VP";
        //       } else {
        //         dir = "VN";
        //       }
        //     }
        //   }
        // } else {
        //     console.log("noooooooo");
        //   }
        //   // -------------

        //   // if (A.u === B.u) {
        //   //   dir = "UP";
        //   // } else {
        //   //   dir = "VP";
        //   // }
        // }
        // else if (B.x === C.x) {
        //   if (B.u === C.u) {
        //     dir = "UP";
        //   } else {
        //     dir = "VP";
        //   }
        // } else if (A.x === C.x) {
        //   if (A.u === C.u) {
        //     dir = "UP";
        //   } else {
        //     dir = "VP";
        //   }
        // }
        // else {
        // console.log("sorting");
        // const arrX = [...arr].sort((a, b) => a.x - b.x);
        // const arrY = [...arr].sort((a, b) => a.y - b.y);
        // const arrZ = [...arr].sort((a, b) => a.z - b.z);
        // let aX = arrX[0];
        // let bX = arrX[1];
        // let cX = arrX[2];
        // let aY = arrY[0];
        // let bY = arrY[1];
        // let cY = arrY[2];
        // let aZ = arrZ[0];
        // let bZ = arrZ[1];
        // let cZ = arrZ[2];
        //
        // if (aX.x === bX.x) {
        //   if (aX.u === bX.u) {
        //     if (aX.u < cX.u) {
        //       dir = "UP";
        //     } else {
        //       dir = "UN";
        //     }
        //   } else {
        //     //av===bv
        //     if (aX.v < cX.v) {
        //       dir = "VP";
        //     } else {
        //       dir = "VN";
        //     }
        //   }
        // } else if (bX.x === cX.x) {
        //   if (bX.u === cX.u) {
        //     if (aX.u < bX.u) {
        //       dir = "UP";
        //     } else {
        //       dir = "UN";
        //     }
        //   } else {
        //     if (aX.v < bX.v) {
        //       dir = "VP";
        //     } else {
        //       dir = "VN";
        //     }
        //   }
        // } else if (aY.y === bY.y) {
        //   if (aY.u === bY.u) {
        //     if (aY.u < cY.u) {
        //       dir = "UP";
        //     } else {
        //       dir = "UN";
        //     }
        //   } else {
        //     if (aY.v < cY.v) {
        //       dir = "VP";
        //     } else {
        //       dir = "VN";
        //     }
        //   }
        // } else if (bY.y === cY.y) {
        //   if (bY.u === cY.u) {
        //     if (aY.u < bY.u) {
        //       dir = "UP";
        //     } else {
        //       dir = "UN";
        //     }
        //   } else {
        //     if (aY.v < bY.v) {
        //       dir = "VP";
        //     } else {
        //       dir = "VN";
        //     }
        //   }
        // } else if (aZ.z === bZ.z) {
        //   if (aZ.u === bZ.u) {
        //     if (aZ.u < cZ.u) {
        //       dir = "UP";
        //     } else {
        //       dir = "UN";
        //     }
        //   } else {
        //     if (aZ.v < cZ.v) {
        //       dir = "VP";
        //     } else {
        //       dir = "VN";
        //     }
        //   }
        // } else if (bZ.z === cZ.z) {
        //   if (bZ.u === cZ.u) {
        //     if (aZ.u < bZ.u) {
        //       dir = "UP";
        //     } else {
        //       dir = "UN";
        //     }
        //   } else {
        //     if (bZ.v < aZ.v) {
        //       dir = "VP";
        //     } else {
        //       dir = "VN";
        //     }
        //   }
        // if (aX.u <= bX.u && bX.u <= cX.u) {
        //   dir = "UP";
        // } else if (cX.u <= bX.u && bX.u <= aX.u) {
        //   dir = "UN";
        // } else if (aX.v <= bX.v && bX.v <= cX.v) {
        //   dir = "VP";
        // } else if (cX.v <= bX.v && bX.v <= aX.v) {
        //   dir = "VN";
        //   // } else if (aX.u <= bX.u && bX.u <= cX.u) {
        //   //   dir = "UP";
        //   // } else if (cX.u <= bX.u && bX.u <= aX.u) {
        //   //   dir = "UN";
        //   // } else if (bX.u <= cX.u && cX.u <= aX.u) {
        //   //   dir = "UN";
        //   // } else if (cX.u <= aX.u && aX.u <= bX.u) {
        //   //   dir = "VP";
        //   // } else if (aX.u <= cX.u && cX.u <= bX.u) {
        //   //   dir = "UP";
        //   // } else if (bX.u <= aX.u && aX.u <= cX.u) {
        //   //   dir = "VN";
        //   // if (arr[0].u <= arr[1].u && arr[1].u <= arr[2].u) {
        //   //   dir = "U";
        //   // } else if (arr[0].u >= arr[1].u && arr[1].u >= arr[2].u) {
        //   //   dir = "U";
        //   // } else if (arr[0].v <= arr[1].v && arr[1].v <= arr[2].v) {
        //   //   dir = "V";
        //   // } else if (arr[0].v >= arr[1].v && arr[1].v >= arr[2].v) {
        //   //   dir = "V";
        // } else {
        //   console.log("loose");
        //   console.log(arr);
        // }
        // }

        // if (A.x !== B.x) {
        //   if (A.x < B.x) {
        //     firstPoint = A;
        //     secondPoint = B;
        //   } else {
        //     firstPoint = B;
        //     secondPoint = A;
        //   }
        // } else {
        //   if (A.x < C.x) {
        //     firstPoint = A;
        //     secondPoint = C;
        //   } else {
        //     firstPoint = C;
        //     secondPoint = A;
        //   }
        // }

        // if (dir === "UP" || dir === "VP") {
        //   kx = 1;
        // } else {
        //   kx = -1;
        // }

        // // if (dir === "UP" || dir === "UN" || dir === "U") {
        // //   if (firstPoint.u < secondPoint.u) {
        // //     kx = 1;
        // //   } else {
        // //     kx = -1;
        // //   }
        // // } else {
        // //   if (firstPoint.v < secondPoint.v) {
        // //     kx = 1;
        // //   } else {
        // //     kx = -1;
        // //   }
        // // }
        // console.log(dir, kx);
        // console.log(dxA, dxB, dxC);
      } else if (scaleDir === "YY") {
        // if (Math.abs(A.n.y) > 0.9) {
        //   continue;
        // }

        // // ---------------------------------------------------------------------
        // const arrY = [...arr].sort((a, b) => a.y - b.y);
        // let a = arrY[0];
        // let b = arrY[1];
        // let c = arrY[2];

        // // if (a.y === b.y) {
        // //   if (a.u === b.u) {
        // //     if (c.u > a.u) {
        // //       dir = "UP";
        // //     } else {
        // //       dir = "UN";
        // //     }
        // //   } else {
        // //     if (c.v > a.v) {
        // //       dir = "VP";
        // //     } else {
        // //       dir = "VN";
        // //     }
        // //   }
        // // } else if (b.y === c.y) {
        // //   if (b.u === c.u) {
        // //     if (a.u < b.u) {
        // //       dir = "UP";
        // //     } else {
        // //       dir = "UN";
        // //     }
        // //   } else {
        // //     if (a.v < b.v) {
        // //       dir = "VP";
        // //     } else {
        // //       dir = "VN";
        // //     }
        // //   }
        // // } else
        // if (a.u < b.u && b.u < c.u) {
        //   dir = "UP";
        // } else if (c.u < b.u && b.u < a.u) {
        //   dir = "UN";
        // } else if (a.v < b.v && b.v < c.v) {
        //   dir = "VP";
        // } else if (c.v < b.v && b.v < a.v) {
        //   dir = "VN";
        // } else {
        //   console.log("loose");
        //   console.log(arr);
        // }

        // if (dir === "UP" || dir === "VP") {
        //   ky = 1;
        // } else {
        //   ky = -1;
        // }

        // -----new
        const lim = 0.00001;
        const vectorABXY = { x: B.x - A.x, y: B.y - A.y, z: B.z - A.z };
        const vectorABUV = { x: B.u - A.u, y: B.v - A.v, z: 0 };
        const angleY = getAngle(vectorABXY, { x: 0, y: 10, z: 0 });
        const angleU = getAngle(vectorABUV, { x: 10, y: 0, z: 0 });
        const angleV = getAngle(vectorABUV, { x: 0, y: -10, z: 0 });

        // if (angleY === 0) {
        //   if (angleU === 0 && angleV === 90) {
        //     dir = "UP";
        //   } else if (angleU === 90 && angleV === 0) {
        //     dir = "VP";
        //   } else if (angleU === 180 && angleV === 90) {
        //     dir = "UN";
        //   } else if (angleU === 90 && angleV === 180) {
        //     dir = "VN";
        //   }
        // } else if (angleY === 90) {
        //   if (Math.abs(A.n.x) > 0.9) {
        //     if (angleU === 0 && angleV === 90) {
        //       dir = "VP";
        //     } else if (angleU === 90 && angleV === 0) {
        //       dir = "UN";
        //     } else if (angleU === 180 && angleV === 90) {
        //       dir = "VN";
        //     } else if (angleU === 90 && angleV === 180) {
        //       dir = "UP";
        //     }
        //   } else if (Math.abs(A.n.z) > 0.9) {
        //     if (angleU === 0 && angleV === 90) {
        //       dir = "VP";
        //     } else if (angleU === 90 && angleV === 0) {
        //       dir = "UN";
        //     } else if (angleU === 180 && angleV === 90) {
        //       dir = "VN";
        //     } else if (angleU === 90 && angleV === 180) {
        //       dir = "UP";
        //     }
        //   }
        // } else if (angleY === 180) {
        //   if (angleU === 0 && angleV === 90) {
        //     dir = "UN";
        //   } else if (angleU === 90 && angleV === 0) {
        //     dir = "VN";
        //   } else if (angleU === 180 && angleV === 90) {
        //     dir = "UP";
        //   } else if (angleU === 90 && angleV === 180) {
        //     dir = "VP";
        //   }
        // } else

        // work
        if (Math.abs(angleY - angleU) < lim) {
          dir = "UP";
        } else if (Math.abs(angleY - angleV) < lim) {
          dir = "VP";
        } else if (Math.abs(angleY - (180 - angleU)) < lim) {
          dir = "UN";
        } else if (Math.abs(angleY - (180 - angleV)) < lim) {
          dir = "VN";
        } else {
          // console.log("nooooooooo");
        }
        // end work

        console.log("-------------------");
        console.log(dir);

        if (dir === "UP" || dir === "VP") {
          ky = 1;
        } else {
          ky = -1;
        }
        console.log(angleY);
        console.log(angleU, angleV);
      } else if (scaleDir === "ZZ") {
        // if (Math.abs(A.n.z) > 0.9) {
        //   continue;
        // }

        const lim = 0.00001;
        const vectorABXY = { x: B.x - A.x, y: B.y - A.y, z: B.z - A.z };
        const vectorABUV = { x: B.u - A.u, y: B.v - A.v, z: 0 };
        const angleZ = getAngle(vectorABXY, { x: 0, y: 0, z: 10 });
        const angleU = getAngle(vectorABUV, { x: 10, y: 0, z: 0 });
        const angleV = getAngle(vectorABUV, { x: 0, y: -10, z: 0 });

        if (Math.abs(angleZ - angleU) < lim) {
          dir = "UP";
        } else if (Math.abs(angleZ - angleV) < lim) {
          dir = "VP";
        } else if (Math.abs(angleZ - (180 - angleU)) < lim) {
          dir = "UN";
        } else if (Math.abs(angleZ - (180 - angleV)) < lim) {
          dir = "VN";
        } else {
          // console.log("nooooooooo");
        }

        // ---------------------------------------------------------------------
        // const arrZ = [...arr].sort((a, b) => a.z - b.z);
        // let a = arrZ[0];
        // let b = arrZ[1];
        // let c = arrZ[2];

        // if (a.u <= b.u && b.u <= c.u) {
        //   dir = "UP";
        // } else if (c.u <= b.u && b.u <= a.u) {
        //   dir = "UN";
        // } else if (a.v <= b.v && b.v <= c.v) {
        //   dir = "VP";
        // } else if (c.v <= b.v && b.v <= a.v) {
        //   dir = "VN";
        // } else {
        //   console.log("loose");
        //   console.log(arr);
        // }

        if (dir === "UP" || dir === "VP") {
          kz = 1;
        } else {
          kz = -1;
        }
}
      
// ---------------------------------

// const A = {
      //   x: (pos[indA * 3] * scale.x) / addScale.x,
      //   y: (pos[indA * 3 + 1] * scale.y) / addScale.y,
      //   z: (pos[indA * 3 + 2] * scale.z) / addScale.z,
      //   u: uvInit[indA * 2],
      //   v: uvInit[indA * 2 + 1],
      //   n: { x: normal[indA * 3], y: normal[indA * 3 + 1], z: normal[indA * 3 + 2] },
      // };

      // const B = {
      //   x: (pos[indB * 3] * scale.x) / addScale.x,
      //   y: (pos[indB * 3 + 1] * scale.y) / addScale.y,
      //   z: (pos[indB * 3 + 2] * scale.z) / addScale.z,
      //   u: uvInit[indB * 2],
      //   v: uvInit[indB * 2 + 1],
      //   n: { x: normal[indB * 3], y: normal[indB * 3 + 1], z: normal[indB * 3 + 2] },
      // };

      // const C = {
      //   x: (pos[indC * 3] * scale.x) / addScale.x,
      //   y: (pos[indC * 3 + 1] * scale.y) / addScale.y,
      //   z: (pos[indC * 3 + 2] * scale.z) / addScale.z,
      //   u: uvInit[indC * 2],
      //   v: uvInit[indC * 2 + 1],
      //   n: { x: normal[indC * 3], y: normal[indC * 3 + 1], z: normal[indC * 3 + 2] },
      // };

      // ----------------------------------------

      // if (dir === "UP" || dir === "UN") {
      //   uv.set([p.A.u * addSc * kk * kU], indA * 2);
      //   uv.set([p.B.u * addSc * kk * kU], indB * 2);
      //   uv.set([p.C.u * addSc * kk * kU], indC * 2);
      // } else if (dir === "VP" || dir === "VN") {
      //   uv.set([p.A.v * addSc * kk * kV], indA * 2 + 1);
      //   uv.set([p.B.v * addSc * kk * kV], indB * 2 + 1);
      //   uv.set([p.C.v * addSc * kk * kV], indC * 2 + 1);
      // }

      // if (dir === "UP" || dir === "UN") {
      //   uv.set(
      //     [
      //       p.A.u +
      //         kx.val * dxA * ratioUV +
      //         ky.val * dyA * ratioUV +
      //         kz.val * dzA * ratioUV,
      //     ],
      //     indA * 2
      //   );

      //   uv.set(
      //     [
      //       p.B.u +
      //         kx.val * dxB * ratioUV +
      //         ky.val * dyB * ratioUV +
      //         kz.val * dzB * ratioUV,
      //     ],
      //     indB * 2
      //   );

      //   uv.set(
      //     [
      //       p.C.u +
      //         kx.val * dxC * ratioUV +
      //         ky.val * dyC * ratioUV +
      //         kz.val * dzC * ratioUV,
      //     ],
      //     indC * 2
      //   );
      // } else if (dir === "VP" || dir === "VN") {
      //   uv.set(
      //     [
      //       p.A.v +
      //         kx.val * dxA * ratioUV +
      //         ky.val * dyA * ratioUV +
      //         kz.val * dzA * ratioUV,
      //     ],
      //     indA * 2 + 1
      //   );

      //   uv.set(
      //     [
      //       p.B.v +
      //         kx.val * dxB * ratioUV +
      //         ky.val * dyB * ratioUV +
      //         kz.val * dzB * ratioUV,
      //     ],
      //     indB * 2 + 1
      //   );

      //   uv.set(
      //     [
      //       p.C.v +
      //         kx.val * dxC * ratioUV +
      //         ky.val * dyC * ratioUV +
      //         kz.val * dzC * ratioUV,
      //     ],
      //     indC * 2 + 1
      //   );
      // }

        // let kk = 0;
      // let znakDxA = dxA > 0 ? 1 : dxA < 0 ? -1 : 0;
      // let znakxxB = dxB > 0 ? 1 : dxB < 0 ? -1 : 0;
      // let znakDxC = dxC > 0 ? 1 : dxC < 0 ? -1 : 0;

      // let znakDyA = dyA > 0 ? 1 : dyA < 0 ? -1 : 0;
      // let znakDyB = dyB > 0 ? 1 : dyB < 0 ? -1 : 0;
      // let znakDyC = dyC > 0 ? 1 : dyC < 0 ? -1 : 0;

      // let znakDzA = dzA > 0 ? 1 : dzA < 0 ? -1 : 0;
      // let znakDzB = dzB > 0 ? 1 : dzB < 0 ? -1 : 0;
      // let znakDzC = dzC > 0 ? 1 : dzC < 0 ? -1 : 0;

      // let kU = 0;
      // let kV = 0;

      // if (dxA > 0) {
      //   kk = 1;
      // } else if (dxA < 0) {
      //   kk = -1;
      // } else if (dyA > 0) {
      //   kk = 1;
      // } else if (dyA < 0) {
      //   kk = -1;
      // } else if (dzA > 0) {
      //   kk = 1;
      // } else if (dzA < 0) {
      //   kk = -1;
      // }

      // if (p.A.u > 0) {
      //   kU = 1;
      // } else if (p.A.u < 0) {
      //   kU = -1;
      // } else if (p.A.v > 0) {
      //   kV = 1;
      // } else if (p.A.v < 0) {
      //   kV = -1;
      // }
const f = 10;
      
// -----------------------------------

const dxA = p.A.x * addScale.x - p.A.x;
      const dxB = p.B.x * addScale.x - p.B.x;
      const dxC = p.C.x * addScale.x - p.C.x;

      const dyA = p.A.y * addScale.y - p.A.y;
      const dyB = p.B.y * addScale.y - p.B.y;
      const dyC = p.C.y * addScale.y - p.C.y;

      const dzA = p.A.z * addScale.z - p.A.z;
      const dzB = p.B.z * addScale.z - p.B.z;
const dzC = p.C.z * addScale.z - p.C.z;
      
// -----------------------------------

// let scaleDir = "";
    // let addSc = 0;

    // if (addScale.x !== 1) {
    //   scaleDir = "X";
    //   // addSc = addScale.x;
    // } else if (addScale.y !== 1) {
    //   scaleDir = "Y";
    //   // addSc = addScale.y;
    // } else if (addScale.z !== 1) {
    //   scaleDir = "Z";
    //   // addSc = addScale.z;
    // } else {
    //   return;
    // }

    // ---------------------------------------