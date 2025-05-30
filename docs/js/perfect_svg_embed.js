document.addEventListener("DOMContentLoaded", async () => {
  const root = document.getElementById("svg-root");
  if (!root) return;

  const svgPath = root.dataset.svg;
  const diagramTitle = root.dataset.title || "Diagrama";

  if (!svgPath) {
    root.innerHTML = "<p style='color: red;'>Atributo data-svg não definido.</p>";
    return;
  }

  // Carrega SVG
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

  // Layout
  root.innerHTML = `
    <style>
      .icon-btn.clicked {
        border-radius: 6px;
      }

      .icon-btn.clicked .material-icons {
        color: #1e88e5 !important;
        text-shadow: 0 0 3px #90caf9;
        transform: scale(1.1);
        transition: all 0.15s ease;
      }
    </style>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <div id="svg-container" style="width:100%; height:100%; display:flex; flex-direction:column; background:inherit; border:1px solid #ccc;">
      <div style="height:48px; display:flex; align-items:center; padding:0 12px; background:inherit; border-bottom:1px solid #ddd;">
        <span id="diagram-title" style="font-weight:bold; font-family:sans-serif;">${diagramTitle}</span>
      </div>
      <div id="canvas-area" style="flex:1; overflow:hidden; display:flex; justify-content:center; align-items:center; cursor:grab;"></div>
      <div style="height:48px; display:flex; justify-content:space-between; align-items:center; padding:0 12px; background:inherit; border-top:1px solid #ddd;">
        <div style="display:flex; align-items:center; gap:12px;">
          <button class="icon-btn" id="btn-zoom-out" title="Reduzir Zoom"><span class="material-icons">remove</span></button>
          <span id="zoom-label">100%</span>
          <button class="icon-btn" id="btn-zoom-in" title="Aumentar Zoom"><span class="material-icons">add</span></button>
          <button class="icon-btn" id="btn-reset" title="Resetar Zoom"><span class="material-icons">refresh</span></button>
          <button class="icon-btn" id="btn-center" title="Centralizar Diagrama"><span class="material-icons">center_focus_strong</span></button>
        </div>
        <div style="display:flex; align-items:center; gap:12px;">
          <span id="coord-display" style="font-size:12px; font-family:monospace;"></span>
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

  const zoomFactor = (s) => Math.pow(1.05, s / 100);
  const getZoomPercentageFromScroll = (s) => Math.round(100 / zoomFactor(s));
  const getScrollFromDisplayedPercentage = (percentage) => {
    return Math.log(100 / percentage) / Math.log(1.05) * 100;
  };

  const updateViewBox = () => {
    svg.setAttribute("viewBox", `${offsetX} ${offsetY} ${viewWidth} ${viewHeight}`);
  };

  const updateZoomLabel = () => {
    document.getElementById("zoom-label").textContent = currentDisplayedPercentage + "%";
  };

  const simulateZoom = (percentageChange) => {
    const newPercentage = currentDisplayedPercentage + percentageChange;
    if (newPercentage < 25 || newPercentage > 400) return;

    const newScroll = getScrollFromDisplayedPercentage(newPercentage);
    const oldZoom = zoomFactor(scroll);
    const newZoom = zoomFactor(newScroll);

    const svgCenterX = offsetX + viewWidth / 2;
    const svgCenterY = offsetY + viewHeight / 2;

    const scale = newZoom / oldZoom;
    viewWidth *= scale;
    viewHeight *= scale;
    offsetX = svgCenterX - viewWidth / 2;
    offsetY = svgCenterY - viewHeight / 2;

    scroll = newScroll;
    currentDisplayedPercentage = newPercentage;

    updateViewBox();
    updateZoomLabel();
  };

  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -5 : 5;
    let newPercentage = currentDisplayedPercentage + delta;
    newPercentage = Math.min(400, Math.max(25, newPercentage));

    const newScroll = getScrollFromDisplayedPercentage(newPercentage);
    const oldZoom = zoomFactor(scroll);
    const newZoom = zoomFactor(newScroll);

    const rect = svg.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const svgX = offsetX + (mx / rect.width) * viewWidth;
    const svgY = offsetY + (my / rect.height) * viewHeight;

    const scale = newZoom / oldZoom;
    viewWidth *= scale;
    viewHeight *= scale;
    offsetX = svgX - (mx / rect.width) * viewWidth;
    offsetY = svgY - (my / rect.height) * viewHeight;

    scroll = newScroll;
    currentDisplayedPercentage = newPercentage;

    updateViewBox();
    updateZoomLabel();
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

  // Função para feedback visual
  function darFeedbackVisual(botao) {
    botao.classList.add("clicked");
    setTimeout(() => botao.classList.remove("clicked"), 150);
  }

  document.getElementById("btn-zoom-in").onclick = function () {
    darFeedbackVisual(this);
    simulateZoom(25);
  };

  document.getElementById("btn-zoom-out").onclick = function () {
    darFeedbackVisual(this);
    simulateZoom(-25);
  };

  document.getElementById("btn-reset").onclick = function () {
    darFeedbackVisual(this);
    scroll = 0;
    offsetX = 0;
    offsetY = 0;
    viewWidth = 1000;
    viewHeight = 1000;
    currentDisplayedPercentage = 100;
    updateViewBox();
    updateZoomLabel();
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

  const aplicarContraste = (container) => {
    let bg = window.getComputedStyle(container).backgroundColor;
    let r_bg, g_bg, b_bg;

    if (!bg || bg === "transparent" || bg === "rgba(0, 0, 0, 0)") {
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      bg = isDarkMode ? "rgb(30, 30, 30)" : "rgb(255, 255, 255)";
    }

    container.style.backgroundColor = bg;

    const bgMatch = bg.match(/\d+/g);
    if (bgMatch && bgMatch.length >= 3) {
      [r_bg, g_bg, b_bg] = bgMatch.map(Number);
    } else {
      r_bg = 255; g_bg = 255; b_bg = 255;
    }

    const pageTextColor = window.getComputedStyle(document.body).color;
    const textColorMatch = pageTextColor.match(/\d+/g);
    let r_text_page = 0, g_text_page = 0, b_text_page = 0;

    if (textColorMatch && textColorMatch.length >= 3) {
      [r_text_page, g_text_page, b_text_page] = textColorMatch.map(Number);
    } else {
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDarkMode) {
        r_text_page = 255; g_text_page = 255; b_text_page = 255;
      } else {
        r_text_page = 0; g_text_page = 0; b_text_page = 0;
      }
    }

    updateContrastAndMatchColor([r_bg, g_bg, b_bg], [r_text_page, g_text_page, b_text_page], container);
  };

  const updateContrastAndMatchColor = (rgb_bg, rgb_text_page, container) => {
    const [r_bg, g_bg, b_bg] = rgb_bg;
    const [r_text_page, g_text_page, b_text_page] = rgb_text_page;

    const luminancia = (c) => {
      const v = c / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };

    const l_bg = 0.2126 * luminancia(r_bg) + 0.7152 * luminancia(g_bg) + 0.0722 * luminancia(b_bg);
    const l_text_page = 0.2126 * luminancia(r_text_page) + 0.7152 * luminancia(g_text_page) + 0.0722 * luminancia(b_text_page);

    const calcularTaxaContraste = (l1, l2) => {
      const brighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (brighter + 0.05) / (darker + 0.05);
    };

    const MIN_CONTRAST = 7.0;
    let corIdeal = `rgb(${r_text_page}, ${g_text_page}, ${b_text_page})`;
    let contrasteComCorDaPagina = calcularTaxaContraste(l_bg, l_text_page);

    if (contrasteComCorDaPagina < MIN_CONTRAST) {
      const l_white = 0.2126 + 0.7152 + 0.0722;
      const l_black = 0;

      const contraste_com_branco = calcularTaxaContraste(l_bg, l_white);
      const contraste_com_preto = calcularTaxaContraste(l_bg, l_black);

      if (contraste_com_branco >= MIN_CONTRAST && contraste_com_branco >= contraste_com_preto) {
        corIdeal = "#ffffff";
      } else if (contraste_com_preto >= MIN_CONTRAST) {
        corIdeal = "#000000";
      } else {
        corIdeal = l_bg > 0.5 ? "#000000" : "#ffffff";
      }
    }

    container.querySelectorAll(`
      .icon-btn,
      .material-icons,
      #zoom-label,
      #diagram-title,
      #coord-display
    `).forEach(el => {
      el.style.color = corIdeal;
    });
  };

  aplicarContraste(document.getElementById("svg-container"));
});
