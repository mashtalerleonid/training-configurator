class GeometryUpdater {
  constructor(mesh) {
    this.geometry = mesh.geometry.clone();
    this.uv = this.geometry.attributes.uv.array;
    this.pos = this.geometry.attributes.position.array;
    this.bbox = new THREE.Box3().setFromObject(mesh);
    this.size = this.calcSize();
    this.bboxUV = this.calcBboxUV();
    this.scale = this.calcScale({});
    this.delta = this.calcDelta({});
    this.ratioUV = this.calcRatioUV();
    this.initParams = {};
  }

  calcBboxUV() {
    const uCoords = this.uv.filter((el, i) => i % 2 === 0);
    const vCoords = this.uv.filter((el, i) => i % 2 === 1);

    return {
      max: {
        u: Math.max(...uCoords),
        v: Math.max(...vCoords),
      },
      min: {
        u: Math.min(...uCoords),
        v: Math.min(...vCoords),
      },
    };
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

  calcRatioUV(isUonX = true) {
    // ф-я залежить від того як напрямлені осі UV
    return isUonX
      ? (this.bboxUV.max.u - this.bboxUV.min.u) / (this.bbox.max.x - this.bbox.min.x)
      : (this.bboxUV.max.u - this.bboxUV.min.u) / (this.bbox.max.y - this.bbox.min.y);
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
