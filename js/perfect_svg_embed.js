document.addEventListener("DOMContentLoaded", async () => {
  const root = document.getElementById("svg-root");
  if (!root) return;

  const svgPath = root.dataset.svg;
  const diagramTitle = root.dataset.title || "Diagrama";

  if (!svgPath) {
    root.innerHTML = "<p style='color: red;'>Atributo data-svg não definido.</p>";
    return;
  }

  const res = await fetch(svgPath);
  const text = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "image/svg+xml");
  const svg = doc.querySelector("svg");

  if (!svg) {
    root.innerHTML = "<p style='color:red'>SVG inválido.</p>";
    return;
  }

  svg.setAttribute("id", "my-svg");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

  root.innerHTML = `
    <style>
      @keyframes feedback-glow {
        0% { transform: scale(1); text-shadow: none; }
        50% { transform: scale(1.15); text-shadow: 0 0 4px var(--md-accent-fg-color); }
        100% { transform: scale(1); text-shadow: none; }
      }

      .icon-btn {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        margin: 0;
        background: transparent;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      .icon-btn:hover {
        background-color: rgba(255, 255, 255, 0.08);
      }

      .icon-btn .material-icons {
        font-size: 24px;
        width: 24px;
        height: 24px;
        line-height: 24px;
        display: block;
        color: inherit;
        transition: transform 0.2s ease, color 0.2s ease;
      }

      .icon-btn.clicked .material-icons {
        animation: feedback-glow 0.25s ease;
      }

      #svg-container {
        border: 1px solid var(--md-default-fg-color--lighter);
        background-color: var(--md-default-bg-color);
      }

      #canvas-area {
        touch-action: none;
      }

      .toolbar-top,
      .toolbar-bottom {
        min-height: 48px;
        display: flex;
        align-items: center;
        padding: 8px 12px;
        box-sizing: border-box;
        flex-wrap: wrap;
      }

      .toolbar-top {
        border-bottom: 1px solid var(--md-primary-bg-color-light);
        justify-content: center;
        background-color: var(--md-primary-fg-color);
        color: var(--md-primary-bg-color);
      }

      .toolbar-bottom {
        border-top: 1px solid var(--md-primary-bg-color-light);
        justify-content: space-between;
        background-color: var(--md-primary-fg-color);
        color: var(--md-primary-bg-color);
        gap: 8px;
      }

      #diagram-title {
        font-family: var(--md-text-font-family);
        font-size: 0.875rem;
        font-weight: 500;
        line-height: 48px;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        white-space: nowrap;
        color: inherit;
      }

      #zoom-label {
        font-family: var(--md-text-font-family);
        font-size: 0.8rem;
        white-space: nowrap;
      }

      #coord-display {
        font-family: var(--md-code-font-family);
        font-size: 0.75rem;
        white-space: nowrap;
      }

      .button-group, .coord-group {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
    </style>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

    <div id="svg-container" style="width:100%; height:100%; display:flex; flex-direction:column; cursor:grab;">
      <div class="toolbar-top">
        <span id="diagram-title">${diagramTitle}</span>
      </div>
      <div id="canvas-area" style="flex:1; overflow:hidden; display:flex; justify-content:center; align-items:center;"></div>
      <div class="toolbar-bottom">
        <div class="button-group">
          <button class="icon-btn" id="btn-zoom-out" title="Reduzir Zoom"><span class="material-icons">remove</span></button>
          <span id="zoom-label">100%</span>
          <button class="icon-btn" id="btn-zoom-in" title="Aumentar Zoom"><span class="material-icons">add</span></button>
          <button class="icon-btn" id="btn-reset" title="Resetar Zoom"><span class="material-icons">refresh</span></button>
          <button class="icon-btn" id="btn-center" title="Centralizar Diagrama"><span class="material-icons">center_focus_strong</span></button>
        </div>
        <div class="coord-group">
          <span id="coord-display"></span>
          <button class="icon-btn" id="btn-download" title="Baixar SVG"><span class="material-icons">download</span></button>
          <button class="icon-btn" id="btn-fullscreen" title="Tela cheia"><span class="material-icons">fullscreen</span></button>
        </div>
      </div>
    </div>
  `;

  const canvas = document.getElementById("canvas-area");
  canvas.appendChild(svg);

  let scroll = 0;
  let currentDisplayedPercentage = 100;
  let offsetX = 0;
  let offsetY = 0;
  let viewWidth = 1000;
  let viewHeight = 1000;
  let isPanning = false;
  let startX = 0;
  let startY = 0;
  let lastTouchDist = null;

  const zoomFactor = (s) => Math.pow(1.05, s / 100);
  const getScrollFromDisplayedPercentage = (percentage) => Math.log(100 / percentage) / Math.log(1.05) * 100;

  const updateViewBox = () => svg.setAttribute("viewBox", `${offsetX} ${offsetY} ${viewWidth} ${viewHeight}`);
  const updateZoomLabel = () => document.getElementById("zoom-label").textContent = Math.round(currentDisplayedPercentage) + "%";

  const simulateZoom = (percentageChange) => {
    let newPercentage = currentDisplayedPercentage + percentageChange;
    newPercentage = Math.max(25, Math.min(400, newPercentage));
    const newScroll = getScrollFromDisplayedPercentage(newPercentage);
    const scale = zoomFactor(newScroll) / zoomFactor(scroll);
    const centerX = offsetX + viewWidth / 2;
    const centerY = offsetY + viewHeight / 2;
    viewWidth *= scale;
    viewHeight *= scale;
    offsetX = centerX - viewWidth / 2;
    offsetY = centerY - viewHeight / 2;
    scroll = newScroll;
    currentDisplayedPercentage = newPercentage;
    updateViewBox();
    updateZoomLabel();
  };

  // Mouse zoom e pan
  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -5 : 5;
    simulateZoom(delta);
  });

  canvas.addEventListener("mousedown", (e) => {
    isPanning = true;
    startX = e.clientX;
    startY = e.clientY;
    canvas.style.cursor = "grabbing";
  });

  canvas.addEventListener("mouseup", () => {
    isPanning = false;
    canvas.style.cursor = "grab";
  });

  canvas.addEventListener("mouseleave", () => isPanning = false);

  canvas.addEventListener("mousemove", (e) => {
    if (!isPanning) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    startX = e.clientX;
    startY = e.clientY;
    const rect = svg.getBoundingClientRect();
    offsetX -= (dx / rect.width) * viewWidth;
    offsetY -= (dy / rect.height) * viewHeight;
    updateViewBox();
  });

  // Touch zoom e pan
  canvas.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
      isPanning = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }
  });

  canvas.addEventListener("touchmove", (e) => {
    if (e.touches.length === 1 && isPanning) {
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      const rect = svg.getBoundingClientRect();
      offsetX -= (dx / rect.width) * viewWidth;
      offsetY -= (dy / rect.height) * viewHeight;
      updateViewBox();
      e.preventDefault();
    }

    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);

      if (lastTouchDist !== null) {
        const delta = dist - lastTouchDist;
        simulateZoom(delta * 0.2);
      }

      lastTouchDist = dist;
      e.preventDefault();
    }
  });

  canvas.addEventListener("touchend", (e) => {
    isPanning = false;
    if (e.touches.length < 2) lastTouchDist = null;
  });

  const darFeedbackVisual = (btn) => {
    btn.classList.add("clicked");
    setTimeout(() => btn.classList.remove("clicked"), 250);
  };

  document.getElementById("btn-zoom-in").onclick = function () { darFeedbackVisual(this); simulateZoom(25); };
  document.getElementById("btn-zoom-out").onclick = function () { darFeedbackVisual(this); simulateZoom(-25); };
  document.getElementById("btn-reset").onclick = function () {
    darFeedbackVisual(this);
    scroll = 0; offsetX = 0; offsetY = 0; viewWidth = 1000; viewHeight = 1000; currentDisplayedPercentage = 100;
    updateViewBox(); updateZoomLabel();
  };
  document.getElementById("btn-center").onclick = function () {
    darFeedbackVisual(this);
    offsetX = (1000 - viewWidth) / 2;
    offsetY = (1000 - viewHeight) / 2;
    updateViewBox();
  };
  document.getElementById("btn-fullscreen").onclick = function () {
    darFeedbackVisual(this);
    const container = document.getElementById("svg-container");
    if (!document.fullscreenElement) container.requestFullscreen();
    else document.exitFullscreen();
  };
  document.getElementById("btn-download").onclick = function () {
    darFeedbackVisual(this);
    const data = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([data], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "diagrama.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  svg.addEventListener("mousemove", (e) => {
    const rect = svg.getBoundingClientRect();
    const x = offsetX + (e.clientX - rect.left) / rect.width * viewWidth;
    const y = offsetY + (e.clientY - rect.top) / rect.height * viewHeight;
    document.getElementById("coord-display").textContent = `X: ${x.toFixed(1)} Y: ${y.toFixed(1)}`;
  });
});