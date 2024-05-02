import renderFlameGraph from "./framegraph.js";
import * as styles from "./styles.module.css";

if (import.meta.env.DEV) {
  await import("./render.jsx");
}

const dropSignal = document.querySelector(`.${styles.dropSignal}`);
const dropZone = document.body;
const fileSelect = document.querySelector(`.${styles.fileSelect}`);

async function process(file) {
  const buf = await new Response(file).arrayBuffer();
  const svg = await renderFlameGraph(buf);
  const svgFile = new File([svg], "flamegraph.svg", { type: "image/svg+xml" });
  const url = URL.createObjectURL(svgFile);
  location.href = url;
}

function signalDropValid() {
  dropSignal.classList.add(styles.dropValid);
}
function signalDropInvalid() {
  dropSignal.classList.add(styles.dropInvalid);
}
function resetDropSignal() {
  dropSignal.classList.remove(styles.dropValid, styles.dropInvalid);
}

fileSelect.onclick = () => {
  const f = document.createElement("input");
  f.type = "file";
  f.onchange = () => process(f.files[0]);
  f.click();
};

function isValidWasmDrop(dt) {
  if (dt.items.length != 1) return null;
  const item = dt.items[0];
  if (item.kind != "file") return null;
  if (item.type != "application/wasm") return null;
  return item;
}

dropZone.ondragleave = () => resetDropSignal();

dropZone.ondragover = ev => {
  ev.preventDefault();
  if (!isValidWasmDrop(ev.dataTransfer)) {
    signalDropInvalid();
    return;
  }
  signalDropValid();
};
dropZone.ondrop = ev => {
  ev.preventDefault();
  resetDropSignal();
  if (!isValidWasmDrop(ev.dataTransfer)) return;
  const file = ev.dataTransfer.files[0];
  process(file);
};
