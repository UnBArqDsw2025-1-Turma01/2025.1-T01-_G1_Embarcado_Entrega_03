// --- SVG EMBED CODE ---
async function initializeSvgEmbed() {
  const root = document.getElementById("svg-root");
  if (!root) return;

  const svgPath = root.dataset.svg;
  const diagramTitle = root.dataset.title || "Diagrama";

  if (!svgPath) {
    root.innerHTML = "<p style='color: red;'>Atributo data-svg não definido.</p>";
    return;
  }

  try {
    const res = await fetch(svgPath);
    if (!res.ok) throw new Error(`Erro ao carregar SVG: ${res.statusText}`);
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

    // MOUSEUP e MOUSELEAVE devem ser no WINDOW ou document para evitar bugs se soltar o botão fora do canvas
    window.addEventListener("mouseup", () => {
      isPanning = false;
      canvas.style.cursor = "grab";
    });

    window.addEventListener("mouseleave", () => isPanning = false); // Para o caso de sair da janela

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

    // Ajustes na lógica de Touch para Pan (Zoom de 2 dedos ainda está customizado)
    canvas.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) { // Pan com um dedo
        isPanning = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      } else if (e.touches.length === 2) { // Inicia zoom com 2 dedos
        lastTouchDist = Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY);
        isPanning = false; // Desativa pan ao iniciar zoom
      }
    }, { passive: false }); // Usar { passive: false } para permitir preventDefault

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
          simulateZoom(delta * 0.7); // Ajuste o 0.7 para a sensibilidade do zoom
        }
        lastTouchDist = currentDist;
        isPanning = false; // Garante que o pan esteja desativado durante o zoom
      }
    }, { passive: false }); // Usar { passive: false } para permitir preventDefault

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
  } catch (error) {
    console.error("Erro ao inicializar SVG embed:", error);
    root.innerHTML = `<p style='color: red;'>Erro ao carregar ou processar SVG: ${error.message}</p>`;
  }
}

// --- IMAGE EMBED CODE ---
async function initializeImageEmbed() {
  const imageRoot = document.getElementById("image-root");
  if (!imageRoot) {
    console.error("Elemento com ID 'image-root' não encontrado.");
    return;
  }

  const imagePath = imageRoot.dataset.image;
  const imageTitle = imageRoot.dataset.title || "Imagem";

  if (!imagePath) {
    imageRoot.innerHTML = "<p style='color: red;'>Atributo data-image não definido no elemento image-root.</p>";
    return;
  }

  // Define um ID único para a imagem dentro do contêiner
  const uniqueImageId = `my-image-${Math.random().toString(36).substr(2, 9)}`;

  // Inject CSS and HTML structure dynamically
  imageRoot.innerHTML = `
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

      .image-container-unique { /* Usar uma classe ou ID gerado dinamicamente para o contêiner */
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

      .image-title-unique { /* Classe para o título da imagem */
        font-family: var(--md-text-font-family);
        font-size: 0.9rem;
        font-weight: bold;
        color: inherit;
      }

      .image-zoom-label-unique, .image-coord-display-unique { /* Classes para o label de zoom e display de coordenadas */
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
        .image-zoom-label-unique, .image-coord-display-unique { font-size: 0.5rem; }
        .image-title-unique { font-size: 0.8rem; }
      }
    </style>

    <div id="image-container-${uniqueImageId}" class="image-container-unique" style="width:100%; height:100%; display:flex; flex-direction:column;">
      <div class="toolbar-top"><span id="image-title-${uniqueImageId}" class="image-title-unique">${imageTitle}</span></div>
      <div id="canvas-area-${uniqueImageId}" style="flex:1; overflow:hidden; position:relative; display:flex; justify-content:center; align-items:center;"></div>
      <div class="toolbar-bottom">
        <div class="button-group">
          <button class="icon-btn" id="btn-image-zoom-out-${uniqueImageId}" title="Reduzir Zoom"><span class="material-icons">remove</span></button>
          <span id="image-zoom-label-${uniqueImageId}" class="image-zoom-label-unique">100%</span>
          <button class="icon-btn" id="btn-image-zoom-in-${uniqueImageId}" title="Aumentar Zoom"><span class="material-icons">add</span></button>
          <button class="icon-btn" id="btn-image-reset-${uniqueImageId}" title="Resetar Zoom"><span class="material-icons">refresh</span></button>
          <button class="icon-btn" id="btn-image-center-${uniqueImageId}" title="Centralizar"><span class="material-icons">center_focus_strong</span></button>
        </div>
        <div class="coord-group">
          <span id="image-coord-display-${uniqueImageId}" class="image-coord-display-unique"></span>
          <button class="icon-btn" id="btn-image-download-${uniqueImageId}" title="Download"><span class="material-icons">download</span></button>
          <button class="icon-btn" id="btn-image-fullscreen-${uniqueImageId}" title="Tela cheia"><span class="material-icons">fullscreen</span></button>
        </div>
      </div>
    </div>
  `;

  const img = new Image();
  img.src = imagePath;
  img.id = uniqueImageId; // Usa o ID único para a imagem
  img.style.objectFit = "contain";
  img.style.transformOrigin = "center";
  img.style.willChange = "transform";
  img.style.transition = "transform 0.05s ease-out"; // Smooth transition for transform

  const imageCanvas = document.getElementById(`canvas-area-${uniqueImageId}`);
  if (!imageCanvas) {
    console.error("Elemento com ID 'canvas-area' não encontrado após injeção de HTML.");
    return;
  }
  imageCanvas.appendChild(img);

  try {
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
  } catch (error) {
    imageRoot.innerHTML = `<p style='color: red;'>Erro ao carregar a imagem: ${imagePath}</p>`;
    return; // Exit if image fails to load
  }

  let imageCurrentZoom = 100;
  let imagePanX = 0;
  let imagePanY = 0;
  let imageIsPanning = false;
  let imageStartX = 0;
  let imageStartY = 0;
  let imageLastTouchDist = null;
  let imageRafId = null; // Used for requestAnimationFrame

  const scheduleImageUpdate = () => {
    if (imageRafId) return;
    imageRafId = requestAnimationFrame(() => {
      updateImageTransform();
      imageRafId = null;
    });
  };

  const clampImagePan = () => {
    const scaledWidth = img.naturalWidth * (imageCurrentZoom / 100);
    const scaledHeight = img.naturalHeight * (imageCurrentZoom / 100);
    const canvasRect = imageCanvas.getBoundingClientRect();

    if (scaledWidth <= canvasRect.width) {
      imagePanX = 0;
    } else {
      const maxPanX = (scaledWidth - canvasRect.width) / 2;
      imagePanX = Math.min(maxPanX, Math.max(-maxPanX, imagePanX));
    }

    if (scaledHeight <= canvasRect.height) {
      imagePanY = 0;
    } else {
      const maxPanY = (scaledHeight - canvasRect.height) / 2;
      imagePanY = Math.min(maxPanY, Math.max(-maxPanY, imagePanY));
    }
  };

  const updateImageTransform = () => {
    clampImagePan();
    img.style.transform = `translate(${imagePanX}px, ${imagePanY}px) scale(${imageCurrentZoom / 100})`;
    const zoomLabel = document.getElementById(`image-zoom-label-${uniqueImageId}`);
    if (zoomLabel) zoomLabel.textContent = `${imageCurrentZoom}%`;
  };

  const applyImageZoom = (delta) => {
    const newZoom = Math.max(25, Math.min(400, imageCurrentZoom + delta));
    if (newZoom !== imageCurrentZoom) {
      imageCurrentZoom = newZoom;
      scheduleImageUpdate();
    }
  };

  const darFeedbackVisualForImage = (btn) => {
    btn.classList.add("clicked");
    setTimeout(() => btn.classList.remove("clicked"), 250);
  };

  const withFeedbackForImage = (btnId, callback) => {
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.addEventListener("click", () => {
        darFeedbackVisualForImage(btn);
        callback();
      });
    } else {
      console.warn(`Botão com ID '${btnId}' não encontrado.`);
    }
  };

  // --- Botões da Barra de Ferramentas (Imagem) ---
  withFeedbackForImage(`btn-image-zoom-in-${uniqueImageId}`, () => applyImageZoom(25));
  withFeedbackForImage(`btn-image-zoom-out-${uniqueImageId}`, () => applyImageZoom(-25));
  withFeedbackForImage(`btn-image-reset-${uniqueImageId}`, () => {
    imageCurrentZoom = 100;
    imagePanX = 0;
    imagePanY = 0;
    scheduleImageUpdate();
  });
  withFeedbackForImage(`btn-image-center-${uniqueImageId}`, () => {
    imagePanX = 0;
    imagePanY = 0;
    scheduleImageUpdate();
  });
  withFeedbackForImage(`btn-image-download-${uniqueImageId}`, () => {
    const a = document.createElement("a");
    a.href = img.src;
    const fileExtension = imagePath.split(".").pop() || "png";
    a.download = imageTitle.replace(/\s/g, "_") + "." + fileExtension;
    a.click();
  });
  withFeedbackForImage(`btn-image-fullscreen-${uniqueImageId}`, () => {
    const el = document.getElementById(`image-container-${uniqueImageId}`);
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

  // --- Interação do Mouse (Pan e Coordenadas para Imagem) ---
  let imageIsDragging = false;
  // Mousedown no imageCanvas para capturar o pan em qualquer parte da área do canvas
  imageCanvas.addEventListener("mousedown", (e) => {
    imageIsDragging = true;
    imageStartX = e.clientX;
    imageStartY = e.clientY;
    imageCanvas.style.cursor = "grabbing";
  });

  // Mouseup e Mousemove no WINDOW/DOCUMENT para evitar que o pan pare se o mouse sair do canvas
  window.addEventListener("mouseup", () => {
    imageIsDragging = false;
    imageCanvas.style.cursor = "grab";
  });

  window.addEventListener("mousemove", (e) => {
    const coordDisplay = document.getElementById(`image-coord-display-${uniqueImageId}`);
    if (coordDisplay) {
      const rect = img.getBoundingClientRect();
      // Calcula as coordenadas relativas à imagem original, considerando zoom e pan
      // A lógica para calcular as coordenadas da imagem pode ser complexa e pode precisar de ajustes
      // dependendo de como você quer que as coordenadas se comportem (relativas à imagem original ou ao que está visível).
      // Para simplificar, focaremos na coordenada relativa à tela visível no momento do mouse.
      const xRelativeToCanvas = e.clientX - imageCanvas.getBoundingClientRect().left;
      const yRelativeToCanvas = e.clientY - imageCanvas.getBoundingClientRect().top;

      // Posição do ponto de referência da imagem no canvas (centro da imagem escalada)
      const imageCenteredX = imageCanvas.offsetWidth / 2 + imagePanX;
      const imageCenteredY = imageCanvas.offsetHeight / 2 + imagePanY;

      // Deslocamento do mouse em relação ao centro da imagem escalada
      const offsetXFromImageCenter = xRelativeToCanvas - imageCenteredX;
      const offsetYFromImageCenter = yRelativeToCanvas - imageCenteredY;

      // Coordenadas na imagem original (considerando o zoom)
      const originalImgX = (img.naturalWidth / 2) + (offsetXFromImageCenter / (imageCurrentZoom / 100));
      const originalImgY = (img.naturalHeight / 2) + (offsetYFromImageCenter / (imageCurrentZoom / 100));

      coordDisplay.textContent = `X: ${originalImgX.toFixed(0)} Y: ${originalImgY.toFixed(0)}`;
    }

    if (!imageIsDragging) return;
    imagePanX += e.clientX - imageStartX;
    imagePanY += e.clientY - imageStartY;
    imageStartX = e.clientX;
    imageStartY = e.clientY;
    scheduleImageUpdate();
  });

  // --- Interação de Toque (Pan e Zoom para Imagem) ---
  imageCanvas.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
      imageIsPanning = true;
      imageStartX = e.touches[0].clientX;
      imageStartY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      imageIsPanning = false;
      imageLastTouchDist = Math.hypot(
        e.touches[1].clientX - e.touches[0].clientX,
        e.touches[1].clientY - e.touches[0].clientY
      );
    }
  }, { passive: false });

  imageCanvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (e.touches.length === 1 && imageIsPanning) {
      const dx = e.touches[0].clientX - imageStartX;
      const dy = e.touches[0].clientY - imageStartY;
      imageStartX = e.touches[0].clientX;
      imageStartY = e.touches[0].clientY;
      imagePanX += dx;
      imagePanY += dy;
      scheduleImageUpdate();
    } else if (e.touches.length === 2) {
      const [touch1, touch2] = e.touches;
      const currentDist = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      if (imageLastTouchDist !== null) {
        const delta = currentDist - imageLastTouchDist;
        applyImageZoom(delta > 0 ? 10 : -10); // Ajuste a sensibilidade do zoom de toque
      }
      imageLastTouchDist = currentDist;
    }
  }, { passive: false });

  imageCanvas.addEventListener("touchend", () => {
    imageIsPanning = false;
    imageLastTouchDist = null;
  });

  // --- Inicialização ---
  updateImageTransform();
}

// --- Chamadas de inicialização no DOMContentLoaded ---
document.addEventListener("DOMContentLoaded", () => {
  initializeSvgEmbed();
  initializeImageEmbed();
});