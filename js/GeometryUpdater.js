class GeometryUpdater {
  constructor(mesh) {
    this.geometry = mesh.geometry.clone();
    this.uv = this.geometry.attributes.uv.array;
    this.pos = this.geometry.attributes.position.array;
    this.normal = this.geometry.attributes.normal.array;
    this.index = this.geometry.index.array;
    this.bbox = new THREE.Box3().setFromObject(mesh);
    this.size = this.calcSize();
    this.scale = this.calcScale({});
    this.delta = this.calcDelta({});
    this.ratioUV = this.calcRatioUV();
    this.initParams = {};
  }

  calcSize() {
    return {
      width: this.bbox.max.x - this.bbox.min.x,
      height: this.bbox.max.y - this.bbox.min.y,
      depth: this.bbox.max.z - this.bbox.min.z,
    };
  }

  calcScale({
    width = this.size.width,
    height = this.size.height,
    depth = this.size.depth,
  }) {
    return {
      x: width / this.size.width,
      y: height / this.size.height,
      z: depth / this.size.depth,
    };
  }

  calcDelta({
    width = this.size.width,
    height = this.size.height,
    depth = this.size.depth,
  }) {
    return {
      dx: width - this.size.width,
      dy: height - this.size.height,
      dz: depth - this.size.depth,
    };
  }

  calcRatioUV() {
    const index = this.index;
    const uv = this.uv;
    const pos = this.pos;

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

  setInitParams() {
    // встановлює початкові параметри
  }

  updateGeometry() {
    //дії з точками геометрії
  }

  isEqualPoints(p1, p2) {
    const lim = 0.1;
    return (
      Math.abs(p1.x - p2.x) < lim &&
      Math.abs(p1.y - p2.y) < lim &&
      Math.abs(p1.z - p2.z) < lim
    );
  }

  isPointAtPointsList(list, point) {
    return list.find((curPoint) => this.isEqualPoints(curPoint, point));
  }

  isPointInPolygon(point, poligon) {
    // poligon - масив точок
    const { x, y } = point;

    const xArr = poligon.map((el) => el.x);
    const yArr = poligon.map((el) => el.y);

    const len = poligon.length;
    let j = len - 1;
    let res = false;
    for (let i = 0; i < poligon.length; i += 1) {
      if (
        ((yArr[i] <= y && y < yArr[j]) || (yArr[j] <= y && y < yArr[i])) &&
        x > ((xArr[j] - xArr[i]) * (y - yArr[i])) / (yArr[j] - yArr[i]) + xArr[i]
      ) {
        res = !res;
      }
      j = i;
    }

    return res;
  }
}
