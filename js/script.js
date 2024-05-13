let urlMaterials = R2D.URL.DOMAIN + R2D.URL.CATALOG_MATERIALS_TREE_FOR_MODELS;

const plannerContainer = document.querySelector("#configurator-container");

let configurator = null;

let value = 0;
let curParams = {};
let isLocked = false;

const firstDelay = 3;
let delay = 0;
let intervalId = null;

let selectedMeshIndex = -1;
let selectedHash = "";
let modelMatData = null;
let treeMaterial = null;

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

const script = document.createElement("script");
script.src = `${R2D.URL.DOMAIN}/src_designer/js/three.min.js?v=${getRandomInt(100)}`;
document.body.appendChild(script);
script.onload = onTHREELoaded;

const hideImg = document.querySelector("#hideImg");

function onTHREELoaded() {
    const script = document.createElement("script");
    // script.src = "http://localhost:9000/src_designer/js/plannercore.js?v=10"; //для локальної розробки
    script.src = `${R2D.URL.DOMAIN}/src_designer/js/plannercore.js?v=${getRandomInt(100)}`; //для dev.roomtodo
    document.body.appendChild(script);
    script.onload = onPlannercoreLoaded;
}

function onPlannercoreLoaded() {
    // if (isLocalHost) return; //для локальної розробки

    configurator = new Configurator_1(plannerContainer, R2D);

    configurator.addEventListener("clearCurMaterialsMarkup", clearCurMaterialsMarkupListener);
    configurator.addEventListener("updateCurMaterialsMarkup", updateCurMaterialsMarkupListener);
    configurator.addEventListener("renderSettingsContainer", renderSettingsContainer);

    window.parent.postMessage(
        JSON.stringify({
            action: "check_parent",
        }),
        "*"
    );

    fetchMaterialTree().then(() => {
        configurator.start(modelId, configInfo);
    });
}

// для локальної розробки розкоментувати
// let configInfo = null;
// let isLocalHost = true;
// let modelId = null;
// if (isLocalHost) {
//     window.addEventListener("message", (e) => {
//         if (!e.data || typeof e.data !== "string" || e.data.startsWith("/*framebus*/")) return;
//         const data = JSON.parse(e.data);
//         console.log("data", data);
//         if (data.action === "start_configurate_localhost") {
//             isLocalHost = false;

//             modelId = data.modelId;
//             configInfo = data.configInfo;
//             onPlannercoreLoaded();
//         }
//     });
// }
// -----------
