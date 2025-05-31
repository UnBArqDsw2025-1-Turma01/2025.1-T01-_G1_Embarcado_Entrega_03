// === SVG EMBED CODE ===
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
        background-color: var(--md-accent-fg-color--transparent);
      }

      .icon-btn .material-icons {
        font-size: 1.2rem;
        width: 1.2rem;
        height: 1.2rem;
        line-height: 1;
        display: block;
        color: var(--md-primary-bg-color) !important;
        transition: transform 0.2s ease, color 0.2s ease;
      }

      .icon-btn:hover .material-icons {
        color: var(--md-accent-fg-color) !important;
      }

      .icon-btn.clicked .material-icons {
        animation: feedback-glow 0.25s ease;
      }

      #svg-container {
        border: 1px solid var(--md-default-fg-color--lighter);
        background-color: var(--md-default-bg-color);
      }

      /* AQUI: REMOVIDO 'touch-action: none;' */
      /* #canvas-area {
        touch-action: none;
      } */

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
        font-size: 0.9rem;
        font-weight: bold;
        line-height: 1;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        white-space: nowrap;
        color: inherit;
      }

      #zoom-label {
        font-family: var(--md-text-font-family);
        font-size: 0.64rem;
        white-space: nowrap;
        font-weight: bold;
        color: inherit;
        flex-shrink: 1;
      }

      #coord-display {
        font-family: var(--md-code-font-family);
        font-size: 0.6rem;
        white-space: nowrap;
        font-weight: bold;
        color: inherit;
        flex-shrink: 1;
      }

      .button-group, .coord-group {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: nowrap;
        min-width: 0;
      }

      @media (max-width: 600px) {
        .toolbar-bottom {
          flex-wrap: wrap;
          justify-content: center;
          padding: 8px 8px;
          gap: 4px;
        }
        .button-group, .coord-group {
          flex-wrap: wrap;
          gap: 4px;
          flex-shrink: 1;
        }
        .icon-btn {
          width: 32px;
          height: 32px;
        }
        .icon-btn .material-icons {
          font-size: 1rem;
          width: 1rem;
          height: 1rem;
        }
        #zoom-label, #coord-display {
          font-size: 0.5rem;
        }
        #diagram-title {
          font-size: 0.8rem;
        }
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
  let lastTouchDist = null; // Para zoom com 2 dedos

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
    // A direção do pan para o usuário é o inverso do movimento do viewBox
    offsetX -= (dx / rect.width) * viewWidth;
    offsetY -= (dy / rect.height) * viewHeight;
    updateViewBox();
  });

  // AQUI: Ajustes na lógica de Touch para Pan (Zoom de 2 dedos ainda está customizado)
  canvas.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) { // Pan com um dedo
      isPanning = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    } else if (e.touches.length === 2) { // Inicia zoom com 2 dedos
      lastTouchDist = Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY);
      isPanning = false; // Desativa pan ao iniciar zoom
    }
  });

  canvas.addEventListener("touchmove", (e) => {
    e.preventDefault(); // Impede a rolagem padrão da página para controlar o movimento

    if (e.touches.length === 1 && isPanning) { // Pan com um dedo
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      const rect = svg.getBoundingClientRect();
      offsetX -= (dx / rect.width) * viewWidth;
      offsetY -= (dy / rect.height) * viewHeight;
      updateViewBox();
    } else if (e.touches.length === 2) { // Zoom com 2 dedos
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);

      if (lastTouchDist !== null) {
        const delta = currentDist - lastTouchDist;
        simulateZoom(delta * 0.7); // Ajuste o 0.2 para a sensibilidade do zoom
      }
      lastTouchDist = currentDist;
      isPanning = false; // Garante que o pan esteja desativado durante o zoom
    }
  });

  canvas.addEventListener("touchend", (e) => {
    isPanning = false;
    if (e.touches.length < 2) { // Se menos de 2 dedos, resetar lastTouchDist
      lastTouchDist = null;
    }
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
})

// === IMAGE EMBED CODE ===
document.addEventListener("DOMContentLoaded", async () => {
  const root = document.getElementById("image-root");
  if (!root) {
    console.error("Elemento com ID 'image-root' não encontrado.");
    return;
  }

  const imagePath = root.dataset.image;
  const imageTitle = root.dataset.title || "Imagem";

  if (!imagePath) {
    root.innerHTML = "<p style='color: red;'>Atributo data-image não definido no elemento image-root.</p>";
    return;
  }

  // Inject CSS and HTML structure dynamically
  root.innerHTML = `
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
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
        background-color: var(--md-accent-fg-color--transparent);
      }

      .icon-btn .material-icons {
        font-size: 1.2rem;
        color: var(--md-primary-bg-color) !important;
        transition: transform 0.2s ease, color 0.2s ease;
      }

      .icon-btn.clicked .material-icons {
        animation: feedback-glow 0.25s ease;
      }

      #image-container {
        border: 1px solid var(--md-default-fg-color--lighter);
        background-color: var(--md-default-bg-color);
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

      #image-title {
        font-family: var(--md-text-font-family);
        font-size: 0.9rem;
        font-weight: bold;
        color: inherit;
      }

      #zoom-label, #coord-display {
        font-family: var(--md-text-font-family);
        font-size: 0.64rem;
        font-weight: bold;
        color: inherit;
      }

      .button-group, .coord-group {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      @media (max-width: 600px) {
        .toolbar-bottom { flex-wrap: wrap; justify-content: center; gap: 4px; }
        .button-group, .coord-group { flex-wrap: wrap; gap: 4px; }
        .icon-btn { width: 32px; height: 32px; }
        .icon-btn .material-icons { font-size: 1rem; }
        #zoom-label, #coord-display { font-size: 0.5rem; }
        #image-title { font-size: 0.8rem; }
      }
    </style>

    <div id="image-container" style="width:100%; height:100%; display:flex; flex-direction:column;">
      <div class="toolbar-top"><span id="image-title">${imageTitle}</span></div>
      <div id="canvas-area" style="flex:1; overflow:hidden; position:relative; display:flex; justify-content:center; align-items:center;"></div>
      <div class="toolbar-bottom">
        <div class="button-group">
          <button class="icon-btn" id="btn-zoom-out" title="Reduzir Zoom"><span class="material-icons">remove</span></button>
          <span id="zoom-label">100%</span>
          <button class="icon-btn" id="btn-zoom-in" title="Aumentar Zoom"><span class="material-icons">add</span></button>
          <button class="icon-btn" id="btn-reset" title="Resetar Zoom"><span class="material-icons">refresh</span></button>
          <button class="icon-btn" id="btn-center" title="Centralizar"><span class="material-icons">center_focus_strong</span></button>
        </div>
        <div class="coord-group">
          <span id="coord-display"></span>
          <button class="icon-btn" id="btn-download" title="Download"><span class="material-icons">download</span></button>
          <button class="icon-btn" id="btn-fullscreen" title="Tela cheia"><span class="material-icons">fullscreen</span></button>
        </div>
      </div>
    </div>
  `;

  const img = new Image();
  img.src = imagePath;
  img.id = "my-image";
  img.style.objectFit = "contain";
  img.style.transformOrigin = "center";
  img.style.willChange = "transform";
  img.style.transition = "transform 0.05s ease-out"; // Smooth transition for transform

  const canvas = document.getElementById("canvas-area");
  if (!canvas) {
    console.error("Elemento com ID 'canvas-area' não encontrado após injeção de HTML.");
    return;
  }
  canvas.appendChild(img);

  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  }).catch(() => {
    root.innerHTML = `<p style='color: red;'>Erro ao carregar a imagem: ${imagePath}</p>`;
    return; // Exit if image fails to load
  });

  let currentZoom = 100;
  let panX = 0;
  let panY = 0;
  let isPanning = false;
  let startX = 0;
  let startY = 0;
  let lastTouchDist = null;
  let rafId = null; // Used for requestAnimationFrame

  const scheduleUpdate = () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      updateTransform();
      rafId = null;
    });
  };

  const clampPan = () => {
    const scaledWidth = img.naturalWidth * (currentZoom / 100);
    const scaledHeight = img.naturalHeight * (currentZoom / 100);
    const canvasRect = canvas.getBoundingClientRect();

    // Reset pan if image is smaller than canvas in a dimension
    if (scaledWidth <= canvasRect.width) {
      panX = 0;
    } else {
      const maxPanX = (scaledWidth - canvasRect.width) / 2;
      panX = Math.min(maxPanX, Math.max(-maxPanX, panX));
    }

    if (scaledHeight <= canvasRect.height) {
      panY = 0;
    } else {
      const maxPanY = (scaledHeight - canvasRect.height) / 2;
      panY = Math.min(maxPanY, Math.max(-maxPanY, panY));
    }
  };

  const updateTransform = () => {
    clampPan();
    img.style.transform = `translate(${panX}px, ${panY}px) scale(${currentZoom / 100})`;
    const zoomLabel = document.getElementById("zoom-label");
    if (zoomLabel) zoomLabel.textContent = `${currentZoom}%`;
  };

  const applyZoom = (delta) => {
    const newZoom = Math.max(25, Math.min(400, currentZoom + delta));
    if (newZoom !== currentZoom) {
      currentZoom = newZoom;
      scheduleUpdate();
    }
  };

  const darFeedbackVisual = (btn) => {
    btn.classList.add("clicked");
    setTimeout(() => btn.classList.remove("clicked"), 250);
  };

  const withFeedback = (btnId, callback) => {
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.addEventListener("click", () => {
        darFeedbackVisual(btn);
        callback();
      });
    } else {
      console.warn(`Botão com ID '${btnId}' não encontrado.`);
    }
  };

  // --- Botões da Barra de Ferramentas ---
  withFeedback("btn-zoom-in", () => applyZoom(25));
  withFeedback("btn-zoom-out", () => applyZoom(-25));
  withFeedback("btn-reset", () => {
    currentZoom = 100;
    panX = 0;
    panY = 0;
    scheduleUpdate();
  });
  withFeedback("btn-center", () => {
    panX = 0;
    panY = 0;
    scheduleUpdate();
  });
  withFeedback("btn-download", () => {
    const a = document.createElement("a");
    a.href = img.src;
    // Tenta obter a extensão do arquivo, caso contrário, usa 'png' como padrão
    const fileExtension = imagePath.split(".").pop() || "png";
    a.download = imageTitle.replace(/\s/g, "_") + "." + fileExtension;
    a.click();
  });
  withFeedback("btn-fullscreen", () => {
    const el = document.getElementById("image-container");
    if (el) {
      if (!document.fullscreenElement) {
        el.requestFullscreen().catch(err => {
          console.error(`Erro ao tentar modo tela cheia: ${err.message} (${err.name})`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  });

  // --- Interação do Mouse (Pan e Coordenadas) ---
  let isDragging = false; // Separate flag for mouse drag
  img.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    canvas.style.cursor = "grabbing";
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
    canvas.style.cursor = "grab";
  });

  window.addEventListener("mousemove", (e) => {
    // Update coordinates display
    const coordDisplay = document.getElementById("coord-display");
    if (coordDisplay) {
      const rect = img.getBoundingClientRect();
      // Calculate coordinates relative to the original image size
      const x = (e.clientX - rect.left - panX) / (currentZoom / 100) * (img.naturalWidth / rect.width * (currentZoom / 100));
      const y = (e.clientY - rect.top - panY) / (currentZoom / 100) * (img.naturalHeight / rect.height * (currentZoom / 100));

      // Adjust calculation for actual image dimensions
      const naturalX = (e.clientX - rect.left) / (currentZoom / 100) - (img.naturalWidth / 2 - img.width / 2);
      const naturalY = (e.clientY - rect.top) / (currentZoom / 100) - (img.naturalHeight / 2 - img.height / 2);

      const offsetX = (rect.width - img.naturalWidth * (currentZoom / 100)) / 2;
      const offsetY = (rect.height - img.naturalHeight * (currentZoom / 100)) / 2;

      const displayX = (e.clientX - rect.left - panX - offsetX) / (currentZoom / 100);
      const displayY = (e.clientY - rect.top - panY - offsetY) / (currentZoom / 100);

      coordDisplay.textContent = `X: ${displayX.toFixed(0)} Y: ${displayY.toFixed(0)}`;
    }

    if (!isDragging) return;
    panX += e.clientX - startX;
    panY += e.clientY - startY;
    startX = e.clientX;
    startY = e.clientY;
    scheduleUpdate();
  });


  // --- Interação de Toque (Pan e Zoom) ---
  img.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
      isPanning = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      isPanning = false; // Disable single-touch pan if two touches are detected
      lastTouchDist = Math.hypot(
        e.touches[1].clientX - e.touches[0].clientX,
        e.touches[1].clientY - e.touches[0].clientY
      );
    }
  }, { passive: false }); // Use passive: false to allow e.preventDefault() for scrolling

  img.addEventListener("touchmove", (e) => {
    e.preventDefault(); // Prevent default scrolling/zooming behavior
    if (e.touches.length === 1 && isPanning) {
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      panX += dx;
      panY += dy;
      scheduleUpdate();
    } else if (e.touches.length === 2) {
      const [touch1, touch2] = e.touches;
      const currentDist = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      if (lastTouchDist !== null) {
        // Adjust zoom sensitivity for touch
        const delta = currentDist - lastTouchDist;
        applyZoom(delta > 0 ? 10 : -10); // Smaller zoom step for smoother touch zoom
      }
      lastTouchDist = currentDist;
    }
  }, { passive: false });

  img.addEventListener("touchend", () => {
    isPanning = false;
    lastTouchDist = null;
  });

  // --- Inicialização ---
  updateTransform(); // Apply initial transform
});