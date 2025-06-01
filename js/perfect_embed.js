// --- SVG EMBED HELPER FUNCTION ---
// Esta função é responsável por inicializar um único embed de SVG.
// Ela recebe o elemento raiz (div) onde o SVG será incorporado.
async function createSvgEmbed(rootElement) {
    // Verifica se o elemento raiz existe
    if (!rootElement) return;

    // Obtém o caminho do SVG e o título do diagrama dos atributos data do elemento raiz
    const svgPath = rootElement.dataset.svgPath; // Agora usa data-svg-path
    const diagramTitle = rootElement.dataset.title || "Diagrama";
    // Gera um ID único para este embed SVG para evitar conflitos se houver múltiplos na página
    const uniqueSvgId = `my-svg-${Math.random().toString(36).substr(2, 9)}`;

    // Se o caminho do SVG não estiver definido, exibe uma mensagem de erro
    if (!svgPath) {
        rootElement.innerHTML = "<p style='color: red;'>Atributo data-svg-path não definido.</p>";
        return;
    }

    try {
        // Tenta buscar o conteúdo do arquivo SVG
        const res = await fetch(svgPath);
        if (!res.ok) throw new Error(`Erro ao carregar SVG: ${res.statusText}`);
        const text = await res.text();
        // Analisa o texto SVG para criar um objeto SVG DOM
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "image/svg+xml");
        const svg = doc.querySelector("svg");

        // Se nenhum SVG válido for encontrado no arquivo, exibe um erro
        if (!svg) {
            rootElement.innerHTML = "<p style='color:red'>SVG inválido.</p>";
            return;
        }

        // Configura atributos essenciais para o SVG
        svg.setAttribute("id", uniqueSvgId); // Define o ID único para o SVG
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        svg.setAttribute("preserveAspectRatio", "xMidYMid meet"); // Crucial para manter a proporção

        // Injeta a estrutura HTML e CSS dentro do elemento raiz
        rootElement.innerHTML = `
            <style>
                /* Keyframes para o feedback visual dos botões */
                @keyframes feedback-glow {
                    0% { transform: scale(1); text-shadow: none; }
                    50% { transform: scale(1.15); text-shadow: 0 0 4px var(--md-accent-fg-color); }
                    100% { transform: scale(1); text-shadow: none; }
                }

                /* Estilo base para os botões de ícone */
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

                /* Estilos específicos para o contêiner do SVG, usando o ID único */
                #svg-container-${uniqueSvgId} {
                    border: 1px solid var(--md-default-fg-color--lighter);
                    background-color: var(--md-default-bg-color);
                }

                /* Estilos para as barras de ferramentas (comuns para SVG e Imagem) */
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

                /* Estilos para o título do diagrama (usando o ID único) */
                #diagram-title-${uniqueSvgId} {
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

                /* Estilos para o label de zoom (usando o ID único) */
                #zoom-label-${uniqueSvgId} {
                    font-family: var(--md-text-font-family);
                    font-size: 0.64rem;
                    white-space: nowrap;
                    font-weight: bold;
                    color: inherit;
                    flex-shrink: 1;
                }

                /* Estilos para o display de coordenadas (usando o ID único) */
                #coord-display-${uniqueSvgId} {
                    font-family: var(--md-code-font-family);
                    font-size: 0.6rem;
                    white-space: nowrap;
                    font-weight: bold;
                    color: inherit;
                    flex-shrink: 1;
                }

                /* Estilos para grupos de botões */
                .button-group, .coord-group {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: nowrap;
                    min-width: 0;
                }

                /* Media queries para responsividade */
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
                    #zoom-label-${uniqueSvgId}, #coord-display-${uniqueSvgId} {
                        font-size: 0.5rem;
                    }
                    #diagram-title-${uniqueSvgId} {
                        font-size: 0.8rem;
                    }
                }
            </style>
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

            <div id="svg-container-${uniqueSvgId}" style="width:100%; height:100%; display:flex; flex-direction:column; cursor:grab;">
                <div class="toolbar-top">
                    <span id="diagram-title-${uniqueSvgId}">${diagramTitle}</span>
                </div>
                <div id="canvas-area-${uniqueSvgId}" style="flex:1; overflow:hidden; display:flex; justify-content:center; align-items:center;"></div>
                <div class="toolbar-bottom">
                    <div class="button-group">
                        <button class="icon-btn" id="btn-zoom-out-${uniqueSvgId}" title="Reduzir Zoom"><span class="material-icons">remove</span></button>
                        <span id="zoom-label-${uniqueSvgId}">100%</span>
                        <button class="icon-btn" id="btn-zoom-in-${uniqueSvgId}" title="Aumentar Zoom"><span class="material-icons">add</span></button>
                        <button class="icon-btn" id="btn-reset-${uniqueSvgId}" title="Resetar Zoom"><span class="material-icons">refresh</span></button>
                        <button class="icon-btn" id="btn-center-${uniqueSvgId}" title="Centralizar Diagrama"><span class="material-icons">center_focus_strong</span></button>
                    </div>
                    <div class="coord-group">
                        <span id="coord-display-${uniqueSvgId}"></span>
                        <button class="icon-btn" id="btn-download-${uniqueSvgId}" title="Baixar SVG"><span class="material-icons">download</span></button>
                        <button class="icon-btn" id="btn-fullscreen-${uniqueSvgId}" title="Tela cheia"><span class="material-icons">fullscreen</span></button>
                    </div>
                </div>
            </div>
        `;

        // Adiciona o elemento SVG ao canvas
        const canvas = document.getElementById(`canvas-area-${uniqueSvgId}`);
        canvas.appendChild(svg);

        // Define o zoom padrão para este SVG (usado na inicialização e no reset)
        const DEFAULT_SVG_ZOOM = 75;

        // Variáveis de estado para o controle do SVG
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

        // Obtém a caixa delimitadora real do conteúdo do SVG
        const originalContentBBox = svg.getBBox();
        const originalContentX = originalContentBBox.x;
        const originalContentY = originalContentBBox.y;
        const originalContentWidth = originalContentBBox.width;
        const originalContentHeight = originalContentBBox.height;

        // Define o viewBox inicial com base no conteúdo ou no atributo viewBox do SVG
        let initialViewBoxWidth = originalContentWidth;
        let initialViewBoxHeight = originalContentHeight;
        let initialViewBoxX = originalContentX;
        let initialViewBoxY = originalContentY;

        const svgViewBoxAttr = svg.getAttribute("viewBox");
        if (svgViewBoxAttr) {
            const parts = svgViewBoxAttr.split(" ").map(Number);
            if (parts.length === 4 && !isNaN(parts[0])) {
                initialViewBoxX = parts[0];
                initialViewBoxY = parts[1];
                initialViewBoxWidth = parts[2];
                initialViewBoxHeight = parts[3];
            }
        } else {
            const padding = 10;
            initialViewBoxX = originalContentX - padding;
            initialViewBoxY = originalContentY - padding;
            initialViewBoxWidth = originalContentWidth + 2 * padding;
            initialViewBoxHeight = originalContentHeight + 2 * padding;
        }

        // Funções auxiliares para zoom e atualização da interface
        const zoomFactor = (s) => Math.pow(1.05, s / 100);
        const getScrollFromDisplayedPercentage = (percentage) => Math.log(100 / percentage) / Math.log(1.05) * 100;

        const updateViewBox = () => svg.setAttribute("viewBox", `${offsetX} ${offsetY} ${viewWidth} ${viewHeight}`);
        const updateZoomLabel = () => document.getElementById(`zoom-label-${uniqueSvgId}`).textContent = Math.round(currentDisplayedPercentage) + "%";

        const simulateZoom = (percentageChange) => {
            let newPercentage = currentDisplayedPercentage + percentageChange;
            newPercentage = Math.max(25, Math.min(400, newPercentage));
            
            const oldScroll = scroll;
            const newScroll = getScrollFromDisplayedPercentage(newPercentage);
            const scale = zoomFactor(newScroll) / zoomFactor(oldScroll);
            const currentCenterX = offsetX + viewWidth / 2;
            const currentCenterY = offsetY + viewHeight / 2;
            
            viewWidth *= scale;
            viewHeight *= scale;
            
            offsetX = currentCenterX - viewWidth / 2;
            offsetY = currentCenterY - viewHeight / 2;
            
            scroll = newScroll;
            currentDisplayedPercentage = newPercentage;
            updateViewBox();
            updateZoomLabel();
        };

        const applyInitialZoom = (percentage) => {
            currentDisplayedPercentage = percentage;
            scroll = getScrollFromDisplayedPercentage(percentage);
            const zoomScale = 100 / percentage;

            viewWidth = initialViewBoxWidth * zoomScale;
            viewHeight = initialViewBoxHeight * zoomScale;

            offsetX = (initialViewBoxX + initialViewBoxWidth / 2) - (viewWidth / 2);
            offsetY = (initialViewBoxY + initialViewBoxHeight / 2) - (viewHeight / 2);

            updateViewBox();
            updateZoomLabel();
        };

        // Aplica o zoom inicial definido pela constante
        applyInitialZoom(DEFAULT_SVG_ZOOM);

        // Event listeners para interações do mouse e toque
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

        window.addEventListener("mouseup", () => {
            isPanning = false;
            canvas.style.cursor = "grab";
        });

        window.addEventListener("mouseleave", () => isPanning = false);

        canvas.addEventListener("mousemove", (e) => {
            if (!isPanning) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            startX = e.clientX;
            startY = e.clientY;
            const rect = svg.getBoundingClientRect();
            const scaleFactorForPan = viewWidth / rect.width;
            
            offsetX -= dx * scaleFactorForPan;
            offsetY -= dy * scaleFactorForPan;
            updateViewBox();
        });

        canvas.addEventListener("touchstart", (e) => {
            if (e.touches.length === 1) {
                isPanning = true;
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            } else if (e.touches.length === 2) {
                lastTouchDist = Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY);
                isPanning = false;
            }
        }, { passive: false });

        canvas.addEventListener("touchmove", (e) => {
            e.preventDefault();
            if (e.touches.length === 1 && isPanning) {
                const dx = e.touches[0].clientX - startX;
                const dy = e.touches[0].clientY - startY;
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                const rect = svg.getBoundingClientRect();
                const scaleFactorForPan = viewWidth / rect.width;
                offsetX -= dx * scaleFactorForPan;
                offsetY -= dy * scaleFactorForPan;
                updateViewBox();
            } else if (e.touches.length === 2) {
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const currentDist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);

                if (lastTouchDist !== null) {
                    const delta = currentDist - lastTouchDist;
                    simulateZoom(delta * 0.7);
                }
                lastTouchDist = currentDist;
                isPanning = false;
            }
        }, { passive: false });

        canvas.addEventListener("touchend", (e) => {
            isPanning = false;
            if (e.touches.length < 2) {
                lastTouchDist = null;
            }
        });

        // Função para dar feedback visual ao clique do botão
        const darFeedbackVisual = (btn) => {
            btn.classList.add("clicked");
            setTimeout(() => btn.classList.remove("clicked"), 250);
        };

        // Associa os event listeners aos botões, usando os IDs únicos
        document.getElementById(`btn-zoom-in-${uniqueSvgId}`).onclick = function () { darFeedbackVisual(this); simulateZoom(25); };
        document.getElementById(`btn-zoom-out-${uniqueSvgId}`).onclick = function () { darFeedbackVisual(this); simulateZoom(-25); };
        document.getElementById(`btn-reset-${uniqueSvgId}`).onclick = function () {
            darFeedbackVisual(this);
            applyInitialZoom(DEFAULT_SVG_ZOOM); // Reset usando a constante
        };
        document.getElementById(`btn-center-${uniqueSvgId}`).onclick = function () {
            darFeedbackVisual(this);
            offsetX = (initialViewBoxX + initialViewBoxWidth / 2) - (viewWidth / 2);
            offsetY = (initialViewBoxY + initialViewBoxHeight / 2) - (viewHeight / 2);
            updateViewBox();
        };
        document.getElementById(`btn-fullscreen-${uniqueSvgId}`).onclick = function () {
            darFeedbackVisual(this);
            const container = document.getElementById(`svg-container-${uniqueSvgId}`);
            if (!document.fullscreenElement) container.requestFullscreen();
            else document.exitFullscreen();
        };

        document.getElementById(`btn-fullscreen-${uniqueSvgId}`).onclick = function () {
        const container = document.getElementById(`svg-container-${uniqueSvgId}`);
        if (!document.fullscreenElement) {
            // Chame requestFullscreen() *diretamente aqui*
            container.requestFullscreen().catch(err => {
                console.error(`Erro ao tentar modo tela cheia para SVG: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
        darFeedbackVisual(this);
        };

        document.getElementById(`btn-download-${uniqueSvgId}`).onclick = function () {
            darFeedbackVisual(this);
            const data = new XMLSerializer().serializeToString(svg);
            const blob = new Blob([data], { type: "image/svg+xml" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = diagramTitle.replace(/\s/g, "_") + ".svg"; // Usa o título para o nome do arquivo
            a.click();
            URL.revokeObjectURL(url);
        };

        // Listener para exibir coordenadas do mouse no SVG
        svg.addEventListener("mousemove", (e) => {
            const rect = svg.getBoundingClientRect();
            const x = offsetX + (e.clientX - rect.left) / rect.width * viewWidth;
            const y = offsetY + (e.clientY - rect.top) / rect.height * viewHeight;
            document.getElementById(`coord-display-${uniqueSvgId}`).textContent = `X: ${x.toFixed(1)} Y: ${y.toFixed(1)}`;
        });
    } catch (error) {
        console.error("Erro ao inicializar SVG embed:", error);
        rootElement.innerHTML = `<p style='color: red;'>Erro ao carregar ou processar SVG: ${error.message}</p>`;
    }
}

// --- IMAGE EMBED HELPER FUNCTION ---
// Esta função é responsável por inicializar um único embed de Imagem.
// Ela recebe o elemento raiz (div) onde a imagem será incorporada.
async function createImageEmbed(rootElement) {
    // Verifica se o elemento raiz existe
    if (!rootElement) return;

    // Obtém o caminho da imagem e o título dos atributos data do elemento raiz
    const imagePath = rootElement.dataset.imagePath; // Agora usa data-image-path
    const imageTitle = rootElement.dataset.title || "Imagem";
    // Gera um ID único para este embed de imagem
    const uniqueImageId = `my-image-${Math.random().toString(36).substr(2, 9)}`;

    // Se o caminho da imagem não estiver definido, exibe uma mensagem de erro
    if (!imagePath) {
        rootElement.innerHTML = "<p style='color: red;'>Atributo data-image-path não definido no elemento image-root.</p>";
        return;
    }

    // Injeta a estrutura HTML e CSS dentro do elemento raiz
    rootElement.innerHTML = `
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
      <style>
        /* Keyframes para o feedback visual dos botões (reaproveitado) */
        @keyframes feedback-glow {
          0% { transform: scale(1); text-shadow: none; }
          50% { transform: scale(1.15); text-shadow: 0 0 4px var(--md-accent-fg-color); }
          100% { transform: scale(1); text-shadow: none; }
        }

        /* Estilo base para os botões de ícone (reaproveitado) */
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

        /* Estilos específicos para o contêiner da imagem, usando o ID único */
        #image-container-${uniqueImageId} {
          border: 1px solid var(--md-default-fg-color--lighter);
          background-color: var(--md-default-bg-color);
        }

        /* Estilos para as barras de ferramentas (comuns para SVG e Imagem) */
        .toolbar-top, .toolbar-bottom {
          min-height: 48px; display: flex; align-items: center; padding: 8px 12px; box-sizing: border-box; flex-wrap: wrap;
        }
        .toolbar-top {
          border-bottom: 1px solid var(--md-primary-bg-color-light); justify-content: center; background-color: var(--md-primary-fg-color); color: var(--md-primary-bg-color);
        }
        .toolbar-bottom {
          border-top: 1px solid var(--md-primary-bg-color-light); justify-content: space-between; background-color: var(--md-primary-fg-color); color: var(--md-primary-bg-color); gap: 8px;
        }

        /* Estilos para o título da imagem (usando o ID único) */
        #image-title-${uniqueImageId} {
          font-family: var(--md-text-font-family); font-size: 0.9rem; font-weight: bold; color: inherit;
        }

        /* Estilos para o label de zoom e display de coordenadas (usando IDs únicos) */
        #image-zoom-label-${uniqueImageId}, #image-coord-display-${uniqueImageId} {
          font-family: var(--md-text-font-family); font-size: 0.64rem; font-weight: bold; color: inherit;
        }

        /* Estilos para grupos de botões (reaproveitado) */
        .button-group, .coord-group { display: flex; align-items: center; gap: 8px; }
        
        /* Media queries para responsividade */
        @media (max-width: 600px) {
          .toolbar-bottom { flex-wrap: wrap; justify-content: center; gap: 4px; }
          .button-group, .coord-group { flex-wrap: wrap; gap: 4px; }
          .icon-btn { width: 32px; height: 32px; }
          .icon-btn .material-icons { font-size: 1rem; }
          #image-zoom-label-${uniqueImageId}, #image-coord-display-${uniqueImageId} { font-size: 0.5rem; }
          #image-title-${uniqueImageId} { font-size: 0.8rem; }
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

    // Cria e configura o elemento de imagem
    const img = new Image();
    img.src = imagePath;
    img.id = `img-${uniqueImageId}`; // Usa um ID único para a imagem também
    img.style.objectFit = "contain";
    img.style.transformOrigin = "center";
    img.style.willChange = "transform";
    img.style.transition = "transform 0.05s ease-out"; // Transição suave para transformações

    // Adiciona a imagem ao canvas
    const imageCanvas = document.getElementById(`canvas-area-${uniqueImageId}`);
    if (!imageCanvas) {
        console.error("Elemento com ID 'canvas-area' não encontrado após injeção de HTML.");
        return;
    }
    imageCanvas.appendChild(img);

    try {
        // Espera a imagem carregar para garantir que naturalWidth/Height estejam disponíveis
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
        });
    } catch (error) {
        rootElement.innerHTML = `<p style='color: red;'>Erro ao carregar a imagem: ${imagePath}</p>`;
        return; // Sai se a imagem falhar ao carregar
    }

    // Variáveis de estado para o controle da imagem
    let imageCurrentZoom = 100;
    let imagePanX = 0;
    let imagePanY = 0;
    let imageIsPanning = false;
    let imageStartX = 0;
    let imageStartY = 0;
    let imageLastTouchDist = null;
    let imageRafId = null; // Usado para requestAnimationFrame

    // Função para agendar a atualização da transformação da imagem
    const scheduleImageUpdate = () => {
        if (imageRafId) return;
        imageRafId = requestAnimationFrame(() => {
            updateImageTransform();
            imageRafId = null;
        });
    };

    // Função para limitar o movimento de pan da imagem dentro do canvas
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

    // Função para aplicar a transformação CSS e atualizar o label de zoom
    const updateImageTransform = () => {
        clampImagePan();
        img.style.transform = `translate(${imagePanX}px, ${imagePanY}px) scale(${imageCurrentZoom / 100})`;
        const zoomLabel = document.getElementById(`image-zoom-label-${uniqueImageId}`);
        if (zoomLabel) zoomLabel.textContent = `${imageCurrentZoom}%`;
    };

    // Função para aplicar o zoom à imagem
    const applyImageZoom = (delta) => {
        const newZoom = Math.max(25, Math.min(400, imageCurrentZoom + delta));
        if (newZoom !== imageCurrentZoom) {
            imageCurrentZoom = newZoom;
            scheduleImageUpdate();
        }
    };

    // Função para dar feedback visual ao clique do botão (imagem)
    const darFeedbackVisualForImage = (btn) => {
        btn.classList.add("clicked");
        setTimeout(() => btn.classList.remove("clicked"), 250);
    };

    // Função auxiliar para associar feedback visual e callback a botões
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
    imageCanvas.addEventListener("mousedown", (e) => {
        imageIsDragging = true;
        imageStartX = e.clientX;
        imageStartY = e.clientY;
        imageCanvas.style.cursor = "grabbing";
    });

    window.addEventListener("mouseup", () => {
        imageIsDragging = false;
        imageCanvas.style.cursor = "grab";
    });

    window.addEventListener("mousemove", (e) => {
        const coordDisplay = document.getElementById(`image-coord-display-${uniqueImageId}`);
        if (coordDisplay) {
            const rect = img.getBoundingClientRect();
            const xRelativeToCanvas = e.clientX - imageCanvas.getBoundingClientRect().left;
            const yRelativeToCanvas = e.clientY - imageCanvas.getBoundingClientRect().top;

            const imageCenteredX = imageCanvas.offsetWidth / 2 + imagePanX;
            const imageCenteredY = imageCanvas.offsetHeight / 2 + imagePanY;

            const offsetXFromImageCenter = xRelativeToCanvas - imageCenteredX;
            const offsetYFromImageCenter = yRelativeToCanvas - imageCenteredY;

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
                applyImageZoom(delta > 0 ? 10 : -10);
            }
            imageLastTouchDist = currentDist;
        }
    }, { passive: false });

    imageCanvas.addEventListener("touchend", () => {
        imageIsPanning = false;
        imageLastTouchDist = null;
    });

    // Inicializa a transformação da imagem
    updateImageTransform();
}

// --- Chamadas de inicialização no DOMContentLoaded ---
// Estas chamadas agora iteram sobre os elementos com as classes específicas
// para inicializar múltiplos embeds de SVG e Imagem.
document.addEventListener("DOMContentLoaded", () => {
    // Itera sobre todos os elementos com a classe 'svg-embed-container'
    document.querySelectorAll(".svg-embed-container").forEach(element => {
        createSvgEmbed(element);
    });

    // Itera sobre todos os elementos com a classe 'image-embed-container'
    document.querySelectorAll(".image-embed-container").forEach(element => {
        createImageEmbed(element);
    });
});