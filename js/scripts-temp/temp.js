// temp
// { x: 49.045, y: 169.253 },
// { x: 47.2, y: 167.014 },
// { x: 44.639, y: 164.26 },
// { x: 42.968, y: 162.672 },
// { x: 41.724, y: 161.292 },
// { x: 38.376, y: 158.413 },
// { x: 36.73, y: 156.785 },
// { x: 35.294, y: 155.591 },
// { x: 29.846, y: 149.868 },
// { x: 27.743, y: 147.546 },

// { x: initParams.E.x, y: initParams.E.y },
// { x: initParams.F.x, y: initParams.F.y },

// { x: 22.105 + dx - 0, y: 169.26 },
// { x: 25.31 + dx - 0, y: 167.05 },
// { x: 25.207 + dx - 0, y: 152.715 },
// { x: 24.885 + dx - 0, y: 149.89 },
// { x: 24.63 + dx - 0, y: 147.73 },

// старі змінні
// let sc = 2;
// let k = 200;
// let pos = [];
// let uv = [];
// let normal = [];
// let index = [];
// let prevX = 1;
// let prevY = 1;
// let prevZ = 1;
// let prev = 1;
// let d = 0;
// //

// function fooXOld(value) {
//   sc = value / prevX;
//   if (sc > 1) {
//     d = sc;

//     // d = Math.abs(d) * -1;
//   } else {
//     d = -sc;
//   }
//   // console.log(sc);
//   prevX = value;
//   obj.children.forEach((mesh, index) => {
//     // let geo = geomArr[index].clone();
//     // uv = geomArr[index].attributes.uv.array;
//     // normal = geomArr[index].attributes.normal.array;
//     let geo = mesh.geometry;
//     uv = geo.attributes.uv.array;
//     normal = geo.attributes.normal.array;
//     pos = geo.attributes.position.array;
//     index = geo.attributes.index;
//     // console.log("pos.length", pos.length);
//     // geo.scale(sc, 1, 1);
//     // mesh.scale.x *= sc;
//     // mesh.scale.set(value, 1, 1);
//     // for (let i = 0; i < uv.length; i += 2) {
//     for (let i = 0; i < pos.length - 3; i += 3) {
//       // console.log(i);
//       // if (Math.abs(normal[(i / 2) * 3]) > 0.9) {
//       //   uv.set([uv[i], uv[i + 1]], i);
//       // } else {
//       //   uv.set([uv[i] * sc, uv[i + 1]], i);
//       // }
//       if (pos[i] > xL && pos[i] < xM) {
//         // if (true) {
//         // console.log(pos[i * 3]);
//         // pos.set([pos[i] * sc], i);
//         pos.set([pos[i] * sc, pos[i + 1], pos[i + 2]], i);
//         // console.log(pos[i * 3]);
//       } else if (pos[i] > xM) {
//         pos.set([pos[i] + d, pos[i + 1], pos[i + 2]], i);
//       }
//     }
//     geo.attributes.position.needsUpdate = true;
//     // mesh.geometry.copy(geo);
//   });
// }

// ---------------------------

// function fooAll(value) {
//   // -------правильне збільшення UV при масштабування всіх вимірів
//   sc = value / prev;
//   d = value - prev;
//   prev = value;

//   obj.children.forEach((mesh, index) => {
//     // let geo = geomArr[index].clone();
//     // geo.scale(value, value, value);
//     // mesh.geometry.copy(geo);
//     //   // mesh.scale.set(1, 1, value);
//     mesh.scale.set(value, value, value);
//     mesh.geometry.attributes.uv.array.forEach(function (element, index) {
//       mesh.geometry.attributes.uv.array.set([element * sc], index);
//     });
//     mesh.geometry.attributes.uv.needsUpdate = true;
//   });
//   // -------END правильне збільшення UV при масштабування всіх вимірів
// }
// ---------------------------------
// function updateFrameGeometryWorkY() {
//   let geo = initParams.geometry.frame.clone();
//   let uv = geo.attributes.uv.array;
//   let normal = geo.attributes.normal.array;
//   let pos = geo.attributes.position.array;
//   // geo.scale(sc, 1, 1);
//   // geo.translate(0, -85, 0);

//   let scaleX = params.width / initParams.outerWidth;
//   let deltaX = params.width - initParams.outerWidth;

//   let scaleY = params.height / initParams.outerHeight;
//   let deltaY = params.height - initParams.outerHeight;
//   console.log(deltaY);

//   let uCoords = uv.filter((el, i) => i % 2 === 0);
//   let vCoords = uv.filter((el, i) => i % 2 === 1);

//   let uMax = Math.max(...uCoords);
//   let uMin = Math.min(...uCoords);
//   let vMax = Math.max(...vCoords);
//   let vMin = Math.min(...vCoords);

//   // let scaleUX = (uMax - uMin) / initParams.outerWidth;
//   // let deltaUX = deltaX * scaleUX;

//   let scaleVY = (vMax - vMin) / initParams.outerHeight;
//   let deltaVY = deltaY * scaleVY;

//   for (let i = 0; i < pos.length - 3; i += 3) {
//     if (
//       isPointInPolygon({ x: pos[i], y: pos[i + 1] }, initParams.leftPolygon) ||
//       isPointInPolygon({ x: pos[i], y: pos[i + 1] }, initParams.rightPolygon)
//     ) {
//       // розтягуємо по ОY
//       pos.set([pos[i], pos[i + 1] * scaleY, pos[i + 2]], i);
//       uv.set(
//         [uv[(i / 3) * 2], uv[(i / 3) * 2 + 1] * scaleY - deltaVY / 6.6],
//         (i / 3) * 2
//       );
//     } else if (pos[i + 1] > initParams.M.y - 5) {
//       // зміщуємо up
//       pos.set([pos[i], pos[i + 1] + deltaY / 2, pos[i + 2]], i);
//       uv.set([uv[(i / 3) * 2], uv[(i / 3) * 2 + 1] - deltaVY / 2], (i / 3) * 2);
//     } else {
//       // зміщуємо dowwn
//       pos.set([pos[i], pos[i + 1] - deltaY / 2, pos[i + 2]], i);
//       uv.set([uv[(i / 3) * 2], uv[(i / 3) * 2 + 1] + deltaVY / 2], (i / 3) * 2);
//     }
//   }

//   frameMesh.geometry = geo;
// }
// -----------------------------
// const x1 = -27.557 + dx;
// const y1 = 146.521;
// const z1 = -1.242;

// const x11 = -27.827 + dx;
// const y11 = 147.103;
// const z11 = -0.27;

// const x2 = 26.885 + dx;
// const y2 = 147.065;
// const z2 = 0.059;

// const x22 = 27.798 + dx;
// const y22 = 147.784;
// const z22 = 1.266;

// const x3 = 26.794 + dx;
// const y3 = 23.022;
// const z3 = 0.096;

// const x4 = -27.233 + dx;
// const y4 = 23.409;
// const z4 = -0.943;

// const abs = 0.2;

// // for (let i = 0; i < pos.length - 3; i += 3) {
// for (let i = 0; i < 0 - 3; i += 3) {
// if (
//   (Math.abs(initParams.geometry.frame.attributes.position.array[i] - x1) < abs &&
//     Math.abs(initParams.geometry.frame.attributes.position.array[i + 1] - y1) < abs &&
//     Math.abs(initParams.geometry.frame.attributes.position.array[i + 2] - z1) < abs) ||
//   (Math.abs(initParams.geometry.frame.attributes.position.array[i] - x11) < abs &&
//     Math.abs(initParams.geometry.frame.attributes.position.array[i + 1] - y11) < abs &&
//     Math.abs(initParams.geometry.frame.attributes.position.array[i + 2] - z11) < abs)
// ) {
//   console.log(
//     initParams.geometry.frame.attributes.position.array[i] - dx,
//     initParams.geometry.frame.attributes.position.array[i + 1],
//     initParams.geometry.frame.attributes.position.array[i + 2]
//   );
//   pos.set([x1, pos[i + 1] / scaleY + deltaY], i);
//   let dy = pos[i + 1] - initParams.geometry.frame.attributes.position.array[i + 1];

//   uv.set(
//     [
//       uv[(i / 3) * 2],
//       initParams.geometry.frame.attributes.uv.array[(i / 3) * 2 + 1] + dy * scaleVY,
//     ],
//     (i / 3) * 2
//   );
// } else if (
//     (Math.abs(initParams.geometry.frame.attributes.position.array[i] - x2) < abs &&
//       Math.abs(initParams.geometry.frame.attributes.position.array[i + 1] - y2) < abs &&
//       Math.abs(initParams.geometry.frame.attributes.position.array[i + 2] - z2) < abs) ||
//     (Math.abs(initParams.geometry.frame.attributes.position.array[i] - x22) < abs &&
//       Math.abs(initParams.geometry.frame.attributes.position.array[i + 1] - y22) < abs &&
//       Math.abs(initParams.geometry.frame.attributes.position.array[i + 2] - z22) < abs)
//   ) {
//     console.log(
//       initParams.geometry.frame.attributes.position.array[i] - dx,
//       initParams.geometry.frame.attributes.position.array[i + 1],
//       initParams.geometry.frame.attributes.position.array[i + 2]
//     );
//     pos.set([pos[i + 1] / scaleY + deltaY], i + 1);
//   } else if (
//     Math.abs(initParams.geometry.frame.attributes.position.array[i] - x3) < abs &&
//     Math.abs(initParams.geometry.frame.attributes.position.array[i + 1] - y3) < abs &&
//     Math.abs(initParams.geometry.frame.attributes.position.array[i + 2] - z3) < abs
//   ) {
//     console.log(
//       initParams.geometry.frame.attributes.position.array[i] - dx,
//       initParams.geometry.frame.attributes.position.array[i + 1],
//       initParams.geometry.frame.attributes.position.array[i + 2]
//     );
//     // pos.set([pos[i] + deltaX / 7, y3], i);
//   } else if (
//     Math.abs(initParams.geometry.frame.attributes.position.array[i] - x4) < abs &&
//     Math.abs(initParams.geometry.frame.attributes.position.array[i + 1] - y4) < abs &&
//     Math.abs(initParams.geometry.frame.attributes.position.array[i + 2] - z4) < abs
//   ) {
//     console.log(
//       initParams.geometry.frame.attributes.position.array[i] - dx,
//       initParams.geometry.frame.attributes.position.array[i + 1],
//       initParams.geometry.frame.attributes.position.array[i + 2]
//     );
//     // pos.set([x4, y4], i);
//   }
// }
// ----------------------------------
// console.log("scaleX");
// console.log(scaleX);
// console.log("deltaX");
// console.log(deltaX);
// console.log("scaleY");
// console.log(scaleY);
// console.log("deltaY");
// console.log(deltaY);
// -------------------------------------------
function updateFrameGeometryWorkX() {
  let geo = initParams.geometry.frame.clone();
  let uv = geo.attributes.uv.array;
  let normal = geo.attributes.normal.array;
  let pos = geo.attributes.position.array;
  // geo.scale(sc, 1, 1);

  let scaleX = params.width / initParams.outerWidth;
  let deltaX = params.width - initParams.outerWidth;

  let scaleY = params.height / initParams.outerHeight;
  let = params.height - initParams.outerHeight;

  let uCoords = uv.filter((el, i) => i % 2 === 0);
  let vCoords = uv.filter((el, i) => i % 2 === 1);

  let uMax = Math.max(...uCoords);
  let uMin = Math.min(...uCoords);
  let vMax = Math.max(...vCoords);
  let vMin = Math.min(...vCoords);

  let ratioUX = (uMax - uMin) / initParams.outerWidth;
  // let deltaUX = deltaX * ratioUX;

  // let scaleVX = (vMax - vMin) / initParams.outerHeight;
  // let deltaVX = deltaY * scaleVX;

  for (let i = 0; i < pos.length - 3; i += 3) {
    if (isPointInPolygon({ x: pos[i], y: pos[i + 1] }, initParams.topPolygon)) {
      // розтягуємо по ОХ
      pos.set([pos[i] * scaleX, pos[i + 1], pos[i + 2]], i);
      let dx = pos[i] - initParams.geometry.frame.attributes.position.array[i];
      // let dy = pos[i + 1] - initParams.geometry.frame.attributes.position.array[i + 1];
      uv.set([uv[(i / 3) * 2] - dx * ratioUX, uv[(i / 3) * 2 + 1]], (i / 3) * 2);
    } else if (isPointInPolygon({ x: pos[i], y: pos[i + 1] }, initParams.bottomPolygon)) {
      // розтягуємо по ОХ
      pos.set([pos[i] * scaleX, pos[i + 1], pos[i + 2]], i);
      let dx = pos[i] - initParams.geometry.frame.attributes.position.array[i];
      uv.set([uv[(i / 3) * 2] - dx * ratioUX, uv[(i / 3) * 2 + 1]], (i / 3) * 2);
    } else if (isPointInPolygon({ x: pos[i], y: pos[i + 1] }, initParams.leftPolygon)) {
      console.log("left");
      // // розтягуємо по ОY
      // pos.set([pos[i], pos[i + 1] * scaleY, pos[i + 2]], i);
      // let dy = pos[i + 1] - initParams.geometry.frame.attributes.position.array[i + 1];
      // uv.set([uv[(i / 3) * 2], uv[(i / 3) * 2 + 1] + dy * ratioVY], (i / 3) * 2);
    } else if (isPointInPolygon({ x: pos[i], y: pos[i + 1] }, initParams.rightPolygon)) {
      // зміщуємо вправо
      pos.set([pos[i] + deltaX, pos[i + 1], pos[i + 2]], i);
      let dx = pos[i] - initParams.geometry.frame.attributes.position.array[i];
      // let dy = pos[i + 1] - initParams.geometry.frame.attributes.position.array[i + 1];
      uv.set([uv[(i / 3) * 2] - dx * ratioUX, uv[(i / 3) * 2 + 1]], (i / 3) * 2);
    } else {
      console.log("noooooooooo");
    }
  }

  frameMesh.geometry = geo;
}

function updateFrameGeometryWorkY() {
  let geo = initParams.geometry.frame.clone();
  let uv = geo.attributes.uv.array;
  let normal = geo.attributes.normal.array;
  let pos = geo.attributes.position.array;

  let scaleY = params.height / initParams.outerHeight;
  let deltaY = params.height - initParams.outerHeight;
  console.log(deltaY);

  let uCoords = uv.filter((el, i) => i % 2 === 0);
  let vCoords = uv.filter((el, i) => i % 2 === 1);

  let vMax = Math.max(...vCoords);
  let vMin = Math.min(...vCoords);

  let ratioVY = (vMax - vMin) / initParams.outerHeight;
  let deltaVY = deltaY * ratioVY;

  for (let i = 0; i < pos.length - 3; i += 3) {
    if (
      isPointInPolygon({ x: pos[i], y: pos[i + 1] }, initParams.leftPolygon) ||
      isPointInPolygon({ x: pos[i], y: pos[i + 1] }, initParams.rightPolygon)
    ) {
      // розтягуємо по ОY
      pos.set([pos[i], pos[i + 1] * scaleY, pos[i + 2]], i);
      let dy = pos[i + 1] - initParams.geometry.frame.attributes.position.array[i + 1];
      uv.set([uv[(i / 3) * 2], uv[(i / 3) * 2 + 1] + dy * ratioVY], (i / 3) * 2);
    } else if (pos[i + 1] > initParams.M.y - 5) {
      // зміщуємо up
      pos.set([pos[i], pos[i + 1] + deltaY, pos[i + 2]], i);
      let dy = pos[i + 1] - initParams.geometry.frame.attributes.position.array[i + 1];
      uv.set([uv[(i / 3) * 2], uv[(i / 3) * 2 + 1] + dy * ratioVY], (i / 3) * 2);
    } else {
      // зміщуємо dowwn
      // pos.set([pos[i], pos[i + 1] - deltaY / 2, pos[i + 2]], i);
      // uv.set([uv[(i / 3) * 2], uv[(i / 3) * 2 + 1] + deltaVY / 2], (i / 3) * 2);
    }
  }

  frameMesh.geometry = geo;
}

function updateFrameGeometryWorkYf() {
  let geo = initParams.geometry.frame.clone();
  let uv = geo.attributes.uv.array;
  let normal = geo.attributes.normal.array;
  let pos = geo.attributes.position.array;

  let scaleX = params.width / initParams.outerWidth;
  let deltaX = params.width - initParams.outerWidth;

  let scaleY = params.height / initParams.outerHeight;
  let deltaY = params.height - initParams.outerHeight;
  console.log(deltaY);

  let uCoords = uv.filter((el, i) => i % 2 === 0);
  let vCoords = uv.filter((el, i) => i % 2 === 1);

  let uMax = Math.max(...uCoords);
  let uMin = Math.min(...uCoords);
  let vMax = Math.max(...vCoords);
  let vMin = Math.min(...vCoords);

  let ratioUX = (uMax - uMin) / initParams.outerWidth;
  let deltaUX = deltaX * ratioUX;

  let ratioVY = (vMax - vMin) / initParams.outerHeight;
  let deltaVY = deltaY * ratioVY;

  for (let i = 0; i < pos.length - 3; i += 3) {
    if (
      isPointInPolygon({ x: pos[i], y: pos[i + 1] }, initParams.topPolygon)
      // isPointInPolygon({ x: pos[i], y: pos[i + 1] }, initParams.rightPolygon)
    ) {
      // зміщуємо up
      pos.set([pos[i], pos[i + 1] + deltaY / 2, pos[i + 2]], i);
      uv.set([uv[(i / 3) * 2], uv[(i / 3) * 2 + 1] - deltaVY / 2], (i / 3) * 2);
    } else if (isPointInPolygon({ x: pos[i], y: pos[i + 1] }, initParams.bottomPolygon)) {
      // зміщуємо dowwn
      pos.set([pos[i], pos[i + 1] - deltaY / 2, pos[i + 2]], i);
      uv.set([uv[(i / 3) * 2], uv[(i / 3) * 2 + 1] + deltaVY / 2], (i / 3) * 2);
      // } else if (pos[i ] > initParams.M.x - 5) {
    } else {
      // розтягуємо по ОY
      pos.set([pos[i], pos[i + 1] * scaleY, pos[i + 2]], i);
      uv.set(
        [uv[(i / 3) * 2], uv[(i / 3) * 2 + 1] * scaleY - deltaVY / 6.6],
        (i / 3) * 2
      );
    }
  }

  frameMesh.geometry = geo;
}
// ----------------------------------------
function updateFrameGeometry() {
  let geo = initParams.geometry.frame.clone();
  // geo.translate(dx, dy, 0);

  let uv = geo.attributes.uv.array;
  let normal = geo.attributes.normal.array;
  let pos = geo.attributes.position.array;

  // geo.scale(sc, 1, 1);

  let scaleX = params.width / initParams.outerWidth;
  let deltaX = params.width - initParams.outerWidth;

  let scaleY = params.height / initParams.outerHeight;
  let deltaY = params.height - initParams.outerHeight;

  let uCoords = uv.filter((el, i) => i % 2 === 0);
  let vCoords = uv.filter((el, i) => i % 2 === 1);

  let uMax = Math.max(...uCoords);
  let uMin = Math.min(...uCoords);
  let vMax = Math.max(...vCoords);
  let vMin = Math.min(...vCoords);

  let ratioUX = (uMax - uMin) / initParams.outerWidth;
  // let deltaUX = deltaX * ratioUX;

  let ratioVY = (vMax - vMin) / initParams.outerHeight;
  // let deltaVY = deltaY * ratioVY;

  for (let i = 0; i < pos.length - 3; i += 3) {
    if (isPointAtFixedPoints(initParams.fixedPoints.bottomLeft, pointFromIndex(i))) {
      // do nothing
    } else if (
      isPointAtFixedPoints(initParams.fixedPoints.topLeft, {
        x: pos[i],
        y: pos[i + 1],
        z: pos[i + 2],
      })
    ) {
      //зміщуєм вверх
      pos.set([pos[i], pos[i + 1] + deltaY, pos[i + 2]], i);
      let dy = pos[i + 1] - initParams.geometry.frame.attributes.position.array[i + 1];
      uv.set([uv[(i / 3) * 2], uv[(i / 3) * 2 + 1] + dy * ratioVY], (i / 3) * 2);
    } else if (
      isPointAtFixedPoints(initParams.fixedPoints.topRight, {
        x: pos[i],
        y: pos[i + 1],
        z: pos[i + 2],
      })
    ) {
      //зміщуєм вверх і вправо
      pos.set([pos[i] + deltaX, pos[i + 1] + deltaY, pos[i + 2]], i);
      let dx = pos[i] - initParams.geometry.frame.attributes.position.array[i];
      let dy = pos[i + 1] - initParams.geometry.frame.attributes.position.array[i + 1];
      uv.set(
        [uv[(i / 3) * 2] - dx * ratioUX, uv[(i / 3) * 2 + 1] + dy * ratioVY],
        (i / 3) * 2
      );
    } else if (
      isPointAtFixedPoints(initParams.fixedPoints.bottomRight, {
        x: pos[i],
        y: pos[i + 1],
        z: pos[i + 2],
      })
    ) {
      //зміщуєм вправо
      pos.set([pos[i] + deltaX, pos[i + 1], pos[i + 2]], i);
      let dx = pos[i] - initParams.geometry.frame.attributes.position.array[i];
      // let dy = pos[i + 1] - initParams.geometry.frame.attributes.position.array[i + 1];
      uv.set([uv[(i / 3) * 2] - dx * ratioUX, uv[(i / 3) * 2 + 1]], (i / 3) * 2);
    } else if (isPointInPolygon({ x: pos[i], y: pos[i + 1] }, initParams.topPolygon)) {
      // розтягуємо по ОХ і зміщуємо вверх
      pos.set([pos[i] * scaleX, pos[i + 1] + deltaY, pos[i + 2]], i);
      let dx = pos[i] - initParams.geometry.frame.attributes.position.array[i];
      let dy = pos[i + 1] - initParams.geometry.frame.attributes.position.array[i + 1];
      uv.set(
        [uv[(i / 3) * 2] - dx * ratioUX, uv[(i / 3) * 2 + 1] + dy * ratioVY],
        (i / 3) * 2
      );
    } else if (isPointInPolygon({ x: pos[i], y: pos[i + 1] }, initParams.bottomPolygon)) {
      // розтягуємо по ОХ
      pos.set([pos[i] * scaleX, pos[i + 1], pos[i + 2]], i);
      let dx = pos[i] - initParams.geometry.frame.attributes.position.array[i];
      uv.set([uv[(i / 3) * 2] - dx * ratioUX, uv[(i / 3) * 2 + 1]], (i / 3) * 2);
    } else if (isPointInPolygon({ x: pos[i], y: pos[i + 1] }, initParams.leftPolygon)) {
      // розтягуємо по ОY
      pos.set([pos[i], pos[i + 1] * scaleY, pos[i + 2]], i);
      let dy = pos[i + 1] - initParams.geometry.frame.attributes.position.array[i + 1];
      uv.set([uv[(i / 3) * 2], uv[(i / 3) * 2 + 1] + dy * ratioVY], (i / 3) * 2);
    } else if (isPointInPolygon({ x: pos[i], y: pos[i + 1] }, initParams.rightPolygon)) {
      // розтягуємо по ОY і зміщуємо вправо
      pos.set([pos[i] + deltaX, pos[i + 1] * scaleY, pos[i + 2]], i);
      let dx = pos[i] - initParams.geometry.frame.attributes.position.array[i];
      let dy = pos[i + 1] - initParams.geometry.frame.attributes.position.array[i + 1];
      uv.set(
        [uv[(i / 3) * 2] - dx * ratioUX, uv[(i / 3) * 2 + 1] + dy * ratioVY],
        (i / 3) * 2
      );
    } else {
      console.log("lost point:");
      console.log(pos[i] - dx, pos[i + 1], pos[i + 2]);
    }
  }

  frameMesh.geometry = geo;
}
// ----------------------------
// fixedPoints: {
//     bottomLeft: [
//       { x: -27.541, y: 22.899, z: -0.93 },
//       { x: -27.849, y: 22.308, z: 0.359 },
//       { x: -29.74, y: 20.262, z: 0.158 },
//       { x: -35.369, y: 14.644, z: -0.076 },
//       { x: -36.667, y: 13.342, z: -0.373 },
//       { x: -38.34, y: 11.672, z: -0.805 },
//       { x: -41.673, y: 8.608, z: -0.218 },
//       { x: -43.046, y: 7.173, z: -0.16 },
//       { x: -44.64, y: 5.458, z: -0.205 },
//       { x: -47.278, y: 2.796, z: -0.255 },
//       { x: -49.311, y: 0.71, z: -0.247 },
//       { x: -49.994, y: 0.187, z: -0.584 },
//       // { x: -26.833, y: 22.908, z: -1.068 },
//       // { x: -27.494, y: 22.293, z: -0.207 },
//       // { x: -29.74, y: 20.262, z: 0.158 },
//       // { x: -35.369, y: 14.644, z: -0.076 },
//       // { x: -36.667, y: 13.342, z: -0.373 },
//       // { x: -38.34, y: 11.672, z: -0.805 },
//       // { x: -41.673, y: 8.608, z: -0.218 },
//       // { x: -43.046, y: 7.173, z: -0.16 },
//       // { x: -44.64, y: 5.458, z: -0.205 },
//       // { x: -47.278, y: 2.796, z: -0.255 },
//       // { x: -49.311, y: 0.71, z: -0.247 },
//       // { x: -50, y: 0.179, z: -0.24 },
//     ],
//     topLeft: [
//       { x: -49.768, y: 169.827, z: -1.757 },
//       { x: -49.686, y: 169.455, z: -0.56 },
//       { x: -49.228, y: 169.024, z: -0.394 },
//       { x: -47.244, y: 167.046, z: -0.254 },
//       { x: -43.062, y: 162.578, z: -0.16 },
//       { x: -41.628, y: 161.374, z: -0.155 },
//       { x: -38.32, y: 158.3, z: -0.777 },
//       { x: -36.765, y: 156.619, z: -0.362 },
//       { x: -35.34, y: 155.417, z: -0.015 },
//       { x: -32.386, y: 152.594, z: 0.072 },
//       { x: -29.741, y: 149.867, z: 0.158 },
//       { x: -27.827, y: 147.103, z: -0.27 },
//       { x: -27.557, y: 146.521, z: -1.242 },
//       // { x: -50.084, y: 170.034, z: -1.576 },
//       // { x: -49.953, y: 169.954, z: -0.398 },
//       // { x: -49.106, y: 169.296, z: -0.272 },
//       // { x: -49.106, y: 169.296, z: -0.272 },

//       // { x: -47.244, y: 167.046, z: -0.254 },
//       // { x: -43.062, y: 162.578, z: -0.16 },
//       // { x: -41.628, y: 161.374, z: -0.155 },
//       // { x: -38.32, y: 158.3, z: -0.777 },
//       // { x: -36.765, y: 156.619, z: -0.362 },
//       // { x: -35.34, y: 155.417, z: -0.015 },
//       // { x: -32.386, y: 152.594, z: 0.072 },
//       // { x: -29.741, y: 149.867, z: 0.158 },
//       // { x: -27.707, y: 147.743, z: -0.244 },
//       // { x: -27.037, y: 147.048, z: -1.109 },
//     ],
//     topRight: [
//       { x: 26.885, y: 147.065, z: 0.059 },
//       { x: 27.798, y: 147.784, z: 1.266 },
//       { x: 29.846, y: 149.868, z: 1.493 },
//       { x: 35.294, y: 155.591, z: 1.572 },
//       { x: 36.73, y: 156.785, z: 1.306 },
//       { x: 38.376, y: 158.413, z: 0.985 },
//       { x: 41.724, y: 161.292, z: 1.717 },
//       { x: 42.968, y: 162.672, z: 1.768 },
//       { x: 44.639, y: 164.26, z: 1.799 },
//       { x: 47.2, y: 167.014, z: 1.882 },
//       { x: 49.357, y: 169.565, z: 1.511 },
//       { x: 49.7, y: 169.946, z: 0.636 },
//       // { x: 27.01, y: 147.006, z: 0.115 },
//       // { x: 27.492, y: 147.689, z: 1.053 },
//       // { x: 29.846, y: 149.868, z: 1.493 },
//       // { x: 35.294, y: 155.591, z: 1.572 },
//       // { x: 36.73, y: 156.785, z: 1.306 },
//       // { x: 38.376, y: 158.413, z: 0.985 },
//       // { x: 41.724, y: 161.292, z: 1.717 },
//       // { x: 42.968, y: 162.672, z: 1.768 },
//       // { x: 44.639, y: 164.26, z: 1.799 },
//       // { x: 47.2, y: 167.014, z: 1.882 },
//       // { x: 49.045, y: 169.253, z: 1.506 },
//       // { x: 49.713, y: 169.95, z: 0.627 },
//     ],
//     bottomRight: [
//       { x: 49.872, y: 0.149, z: 0.626 },
//       { x: 49.281, y: 0.947, z: 1.516 },
//       { x: 47.2, y: 2.828, z: 1.882 },
//       { x: 44.642, y: 5.453, z: 1.798 },
//       { x: 41.567, y: 8.51, z: 1.655 },
//       { x: 38.33, y: 11.676, z: 0.975 },
//       { x: 36.732, y: 13.357, z: 1.302 },
//       { x: 35.565, y: 14.837, z: 1.578 },
//       { x: 32.608, y: 17.633, z: 1.529 },
//       { x: 29.845, y: 20.261, z: 1.493 },
//       { x: 27.544, y: 22.272, z: 1.022 },
//       { x: 26.879, y: 23.15, z: 0.085 },
//       // { x: 49.852, y: 0.132, z: 0.614 },
//       // { x: 49.271, y: 0.941, z: 1.511 },
//       // { x: 47.2, y: 2.828, z: 1.882 },
//       // { x: 44.642, y: 5.453, z: 1.798 },
//       // { x: 41.567, y: 8.51, z: 1.655 },
//       // { x: 38.33, y: 11.676, z: 0.975 },
//       // { x: 36.732, y: 13.357, z: 1.302 },
//       // { x: 35.565, y: 14.837, z: 1.578 },
//       // { x: 32.608, y: 17.633, z: 1.529 },
//       // { x: 29.845, y: 20.261, z: 1.493 },
//       // { x: 27.708, y: 22.292, z: 0.997 },
//       // { x: 26.816, y: 22.939, z: 0.114 },
//     ],
//   },
// --------------------------------
async function getMaterialGLB1(id) {
//   const loader = new THREE.GLTFLoader();

//   const headers = {
//     "x-lang": "ua",
//     "Content-type": "application/x-www-form-urlencoded",
//   };

//   const json = {
//     ids: id,
//   };
//   const body = `json=${JSON.stringify(json)}`;

//   return fetch(
//     "https://dev.roomtodo.com/api/category/productsByIds?key=4500282e6846fe6650de81bd35d27540",
//     {
//       headers,
//       method: "POST",
//       body,
//     }
//   )
//     .then((response) => {
//       return response.json();
//     })
//     .then((data) => {
//       return new Promise((resolve, reject) => {
//         loader.load(
//           `https://dev.roomtodo.com${data.products[0].source.body.package}`,
//           (glb) => {
//             console.log(glb);
//             const material = glb.scene.children[0].material;
//             resolve(material);
//           }
//         );
//       });
//     });

//   // const data = await response.json();

//   // return new Promise((resolve, reject) => {
//   //   loader.load(
//   //     `https://dev.roomtodo.com${data.products[0].source.body.package}`,
//   //     (glb) => {
//   //       console.log(glb);
//   //       const material = glb.scene.children[0].material;
//   //       resolve(material);
//   //     }
//   //   );
//   // });
// }
// -----------------------------------