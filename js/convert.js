const input = document.querySelector("#file");

let arrOfStr = null;
let arrOfCoords = [];
let countFiles = 0;

input.addEventListener("change", changeListener);

// -----------------

function addSpaces(str) {
  let spacedString = "";
  for (let i = 0; i < str.length; i++) {
    if (str[i] === "M") {
      spacedString += "M ";
    } else if (str[i] === "V" || str[i] === "H" || str[i] === "L") {
      spacedString += ` ${str[i]} `;
    } else if (str[i] === "Z") {
      spacedString += " Z";
    } else {
      spacedString += str[i];
    }
  }
  return spacedString;
}

// ----------------------

function changeListener() {
  const filesObj = input.files;

  countFiles = filesObj.length;

  const filesArr = [];

  for (let i = 0; i < countFiles; i += 1) {
    filesArr.push(filesObj[i]);
  }

  console.log(filesArr);

  filesArr.forEach((file) => {
    const reader = new FileReader();
    reader.onload = readerOnLoad;
    reader.readAsText(file);
  });
}

// --------

function readerOnLoad(e) {
  console.log(e);
  const path = getPathFromSVG(e.srcElement.result);
  const spacedPath = addSpaces(path);
  const arr = spacedPath.split(" ");

  const res = [];
  const cur = { x: 0, y: 0 };

  arr.forEach((ch, i) => {
    if (!Number(ch)) {
      switch (ch) {
        case "M":
          cur.x = Number(arr[i + 1]);
          cur.y = Number(arr[i + 2]);
          res.push([cur.x, cur.y]);
          break;

        case "V":
          cur.y = Number(arr[i + 1]);
          res.push([cur.x, cur.y]);
          break;

        case "H":
          cur.x = Number(arr[i + 1]);
          res.push([cur.x, cur.y]);
          break;

        case "L":
          cur.x = Number(arr[i + 1]);
          cur.y = Number(arr[i + 2]);
          res.push([cur.x, cur.y]);
          break;

        default:
          break;
      }
    }
  });

  const maxX = Math.max(...res.map((el) => el[0]));
  const maxY = Math.max(...res.map((el) => el[1]));

  const coords = res
    .map((el) => `[${+(el[0] / maxX).toFixed(2)}, ${+(1 - el[1] / maxY).toFixed(2)}]`)
    .join(", ");

  arrOfCoords.push(coords);

  console.log(arrOfCoords);

  checkFinish();
}

// -----------------

function checkFinish() {
  if (arrOfCoords.length < countFiles) {
    return;
  }

  console.log("finish");
  // const fileResult = new Blob([arrOfCoords.join("\r\n")], {
  const fileResult = new Blob([arrOfCoords.join("\n")], {
    type: "text/html",
  });
  const link = document.createElement("a");
  link.setAttribute("href", URL.createObjectURL(fileResult));
  link.setAttribute("download", "result.txt");
  link.click();
}

// ----------------------

function getPathFromSVG(SVGString) {
  const startIndex = SVGString.indexOf("path") + 8;
  let newString = SVGString.substring(startIndex);
  const endIndex = newString.indexOf("fill") - 2;
  newString = newString.substring(0, endIndex);
  console.log(newString);
  return newString;
}
