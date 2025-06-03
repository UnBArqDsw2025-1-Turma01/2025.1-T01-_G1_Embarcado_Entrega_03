// n'ao da pra dar zoom com a roda do mouse nas imagens que n'ao sao svg // --- MÓDULO SVG ZOOM/PAN ---
/**
 * Classe responsável por gerenciar o zoom e pan de um elemento SVG.
 */
class SvgZoomPan {
    /**
     * Construtor da classe SvgZoomPan.
     * @param {SVGElement} svgElement O elemento SVG principal.
     * @param {HTMLElement} canvasElement O contêiner onde o SVG é exibido (para eventos de mouse/toque).
     * @param {HTMLElement} zoomLabelElement O elemento <span> para exibir a porcentagem de zoom.
     * @param {HTMLElement} coordDisplayElement O elemento <span> para exibir as coordenadas do mouse.
     * @param {object} initialViewBox As dimensões iniciais do viewBox do SVG ({x, y, width, height}).
     */
    constructor(svgElement, canvasElement, zoomLabelElement, coordDisplayElement, initialViewBox) {
        this.svg = svgElement;
        this.canvas = canvasElement;
        this.zoomLabel = zoomLabelElement;
        this.coordDisplay = coordDisplayElement;

        // Propriedades iniciais do viewBox, usadas para resetar e centralizar
        this.initialViewBoxX = initialViewBox.x;
        this.initialViewBoxY = initialViewBox.y;
        this.initialViewBoxWidth = initialViewBox.width;
        this.initialViewBoxHeight = initialViewBox.height;

        // Estado atual do zoom e pan
        this.currentDisplayedPercentage = 100; // Porcentagem de zoom exibida
        this.offsetX = 0; // Posição X do viewBox
        this.offsetY = 0; // Posição Y do viewBox
        this.viewWidth = 0; // Largura atual do viewBox
        this.viewHeight = 0; // Altura atual do viewBox
        this.scroll = 0; // Variável auxiliar para cálculo de zoom logarítmico

        // Estado do arrasto (pan)
        this.isPanning = false;
        this.startX = 0; // Posição inicial do mouse/toque para pan
        this.startY = 0;
        this.lastTouchDist = null; // Distância entre dois dedos para zoom por toque

        this.DEFAULT_SVG_ZOOM = 100; // Nível de zoom inicial padrão

        this.init(); // Inicializa o estado
        this.attachEventListeners(); // Anexa os listeners de eventos
    }

    /**
     * Inicializa o zoom e pan do SVG para o estado padrão.
     */
    init() {
        this.applyZoom(this.DEFAULT_SVG_ZOOM, true); // Aplica o zoom inicial
    }

    /**
     * Calcula o fator de zoom com base em um valor de "scroll" logarítmico.
     * @param {number} s O valor de scroll.
     * @returns {number} O fator de zoom.
     */
    zoomFactor(s) {
        return Math.pow(1.05, s / 100);
    }

    /**
     * Converte uma porcentagem de zoom em um valor de "scroll" logarítmico.
     * @param {number} percentage A porcentagem de zoom.
     * @returns {number} O valor de scroll correspondente.
     */
    getScrollFromDisplayedPercentage(percentage) {
        return Math.log(100 / percentage) / Math.log(1.05) * 100;
    }

    /**
     * Atualiza o atributo `viewBox` do SVG com os valores atuais de `offsetX`, `offsetY`, `viewWidth` e `viewHeight`.
     */
    updateViewBox() {
        this.svg.setAttribute("viewBox", `${this.offsetX} ${this.offsetY} ${this.viewWidth} ${this.viewHeight}`);
    }

    /**
     * Atualiza o texto do elemento que exibe a porcentagem de zoom.
     */
    updateZoomLabel() {
        if (this.zoomLabel) {
            this.zoomLabel.textContent = Math.round(this.currentDisplayedPercentage) + "%";
        }
    }

    /**
     * Simula um zoom aplicando uma mudança percentual ao zoom atual.
     * O zoom é limitado entre 25% e 400%.
     * @param {number} percentageChange A quantidade de mudança na porcentagem de zoom.
     */
    simulateZoom(percentageChange) {
        let newPercentage = this.currentDisplayedPercentage + percentageChange;
        newPercentage = Math.max(25, Math.min(600, newPercentage)); // Limita o zoom

        if (newPercentage === this.currentDisplayedPercentage) return; // Não faz nada se o zoom não mudar

        const oldScroll = this.scroll;
        const newScroll = this.getScrollFromDisplayedPercentage(newPercentage);
        const scale = this.zoomFactor(newScroll) / this.zoomFactor(oldScroll);

        // Calcula o centro atual do viewBox para manter o zoom centrado
        const currentCenterX = this.offsetX + this.viewWidth / 2;
        const currentCenterY = this.offsetY + this.viewHeight / 2;

        // Aplica a escala à largura e altura do viewBox
        this.viewWidth *= scale;
        this.viewHeight *= scale;

        // Ajusta o offsetX e offsetY para manter o centro
        this.offsetX = currentCenterX - this.viewWidth / 2;
        this.offsetY = currentCenterY - this.viewHeight / 2;

        this.scroll = newScroll;
        this.currentDisplayedPercentage = newPercentage;
        this.updateViewBox();
        this.updateZoomLabel();
    }

    /**
     * Aplica um zoom específico ao SVG. Usado para inicialização e reset.
     * @param {number} percentage A porcentagem de zoom a ser aplicada.
     * @param {boolean} resetPan Se true, redefine o pan para o centro também.
     */
    applyZoom(percentage, resetPan = false) {
        this.currentDisplayedPercentage = percentage;
        this.scroll = this.getScrollFromDisplayedPercentage(percentage);
        const zoomScale = 100 / percentage;

        this.viewWidth = this.initialViewBoxWidth * zoomScale;
        this.viewHeight = this.initialViewBoxHeight * zoomScale;

        if (resetPan) {
            // Centraliza o viewBox no conteúdo original
            this.offsetX = (this.initialViewBoxX + this.initialViewBoxWidth / 2) - (this.viewWidth / 2);
            this.offsetY = (this.initialViewBoxY + this.initialViewBoxHeight / 2) - (this.viewHeight / 2);
        } else {
            // Mantém o centro atual ao aplicar um novo zoom
            const currentCenterX = this.offsetX + this.viewWidth / 2;
            const currentCenterY = this.offsetY + this.viewHeight / 2;
            this.offsetX = currentCenterX - this.viewWidth / 2;
            this.offsetY = currentCenterY - this.viewHeight / 2;
        }

        this.updateViewBox();
        this.updateZoomLabel();
    }

    /**
     * Redefine o zoom e o pan para o estado inicial padrão.
     */
    reset() {
        this.applyZoom(this.DEFAULT_SVG_ZOOM, true);
    }

    /**
     * Centraliza o diagrama na visualização atual sem alterar o zoom.
     */
    center() {
        this.offsetX = (this.initialViewBoxX + this.initialViewBoxWidth / 2) - (this.viewWidth / 2);
        this.offsetY = (this.initialViewBoxY + this.initialViewBoxHeight / 2) - (this.viewHeight / 2);
        this.updateViewBox();
    }

    /**
     * Atualiza a exibição das coordenadas do mouse dentro do SVG.
     * @param {number} clientX Posição X do mouse na tela.
     * @param {number} clientY Posição Y do mouse na tela.
     */
    updateCoordinates(clientX, clientY) {
        const rect = this.svg.getBoundingClientRect();
        // Converte as coordenadas do cliente para as coordenadas do viewBox do SVG
        const x = this.offsetX + (clientX - rect.left) / rect.width * this.viewWidth;
        const y = this.offsetY + (clientY - rect.top) / rect.height * this.viewHeight;
        if (this.coordDisplay) {
            this.coordDisplay.textContent = `X: ${x.toFixed(1)} Y: ${y.toFixed(1)}`;
        }
    }

    /**
     * Anexa os listeners de eventos (roda do mouse, arrasto, toque) ao elemento canvas.
     */
    attachEventListeners() {
        // Evento de roda do mouse para zoom
        this.canvas.addEventListener("wheel", (e) => {
            e.preventDefault(); // Impede o scroll da página
            const delta = e.deltaY > 0 ? -25 : 25; // Determina a direção do zoom
            this.simulateZoom(delta);
        });

        // Eventos de mouse para pan (arrasto)
        this.canvas.addEventListener("mousedown", (e) => {
            this.isPanning = true;
            this.startX = e.clientX;
            this.startY = e.clientY;
            this.canvas.style.cursor = "grabbing"; // Muda o cursor para indicar arrasto
        });

        window.addEventListener("mouseup", () => {
            this.isPanning = false;
            this.canvas.style.cursor = "grab"; // Volta o cursor ao normal
        });

        window.addEventListener("mouseleave", () => this.isPanning = false); // Para de arrastar se o mouse sair da janela

        this.canvas.addEventListener("mousemove", (e) => {
            this.updateCoordinates(e.clientX, e.clientY); // Sempre atualiza as coordenadas

            if (!this.isPanning) return;
            const dx = e.clientX - this.startX; // Mudança na posição X do mouse
            const dy = e.clientY - this.startY; // Mudança na posição Y do mouse
            this.startX = e.clientX;
            this.startY = e.clientY;

            const rect = this.svg.getBoundingClientRect();
            // Calcula o fator de escala para converter pixels da tela em unidades do viewBox
            const scaleFactorForPan = this.viewWidth / rect.width;

            // Ajusta o offsetX e offsetY do viewBox
            this.offsetX -= dx * scaleFactorForPan;
            this.offsetY -= dy * scaleFactorForPan;
            this.updateViewBox(); // Atualiza o SVG
        });

        // Eventos de toque para pan e zoom (multi-toque)
        this.canvas.addEventListener("touchstart", (e) => {
            if (e.touches.length === 1) {
                this.isPanning = true;
                this.startX = e.touches[0].clientX;
                this.startY = e.touches[0].clientY;
            } else if (e.touches.length === 2) {
                // Calcula a distância inicial entre os dois dedos
                this.lastTouchDist = Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY);
                this.isPanning = false; // Desativa o pan durante o zoom multi-toque
            }
        }, { passive: false }); // `passive: false` é importante para `preventDefault`

        this.canvas.addEventListener("touchmove", (e) => {
            e.preventDefault(); // Impede o scroll da página em dispositivos móveis
            if (e.touches.length === 1 && this.isPanning) {
                const dx = e.touches[0].clientX - this.startX;
                const dy = e.touches[0].clientY - this.startY;
                this.startX = e.touches[0].clientX;
                this.startY = e.touches[0].clientY;
                const rect = this.svg.getBoundingClientRect();
                const scaleFactorForPan = this.viewWidth / rect.width;
                this.offsetX -= dx * scaleFactorForPan;
                this.offsetY -= dy * scaleFactorForPan;
                this.updateViewBox();
            } else if (e.touches.length === 2) {
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const currentDist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);

                if (this.lastTouchDist !== null) {
                    const delta = currentDist - this.lastTouchDist;
                    this.simulateZoom(delta * 0.7); // Ajusta a sensibilidade do zoom por toque
                }
                this.lastTouchDist = currentDist;
                this.isPanning = false;
            }
        }, { passive: false });

        this.canvas.addEventListener("touchend", (e) => {
            this.isPanning = false;
            if (e.touches.length < 2) {
                this.lastTouchDist = null; // Reseta a distância se menos de 2 dedos
            }
        });
    }
}

// --- MÓDULO DE FEEDBACK DE BOTÃO ---
class ButtonFeedback {
    /**
     * Aplica um feedback visual temporário a um botão.
     * @param {HTMLElement} btn O elemento do botão.
     */
    static apply(btn) {
        btn.classList.add("clicked");
        setTimeout(() => btn.classList.remove("clicked"), 250);
    }
}

// --- MÓDULO DE TELA CHEIA ---
class FullscreenHandler {
    /**
     * Anexa a lógica de tela cheia a um botão.
     * @param {string} buttonId O ID do botão de tela cheia.
     * @param {string} containerId O ID do contêiner que deve ir para tela cheia.
     */
    static attach(buttonId, containerId) {
        const btn = document.getElementById(buttonId);
        const container = document.getElementById(containerId);
        if (btn && container) {
            btn.onclick = function () {
                ButtonFeedback.apply(this);
                if (!document.fullscreenElement) {
                    container.requestFullscreen().catch(err => {
                        console.error(`Erro ao tentar modo tela cheia para '${containerId}': ${err.message} (${err.name})`);
                    });
                } else {
                    document.exitFullscreen();
                }
            };
        } else {
            console.warn(`Botão de tela cheia '${buttonId}' ou contêiner '${containerId}' não encontrado.`);
        }
    }
}

// --- MÓDULO DE DOWNLOAD ---
class DownloadHandler {
    /**
     * Anexa a lógica de download para SVG a um botão.
     * @param {string} buttonId O ID do botão de download.
     * @param {SVGElement} svgElement O elemento SVG a ser baixado.
     * @param {string} fileName O nome base do arquivo para download.
     */
    static attachSvg(buttonId, svgElement, fileName) {
        const btn = document.getElementById(buttonId);
        if (btn) {
            btn.onclick = function () {
                ButtonFeedback.apply(this);
                const data = new XMLSerializer().serializeToString(svgElement);
                const blob = new Blob([data], { type: "image/svg+xml" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = fileName.replace(/\s/g, "_") + ".svg";
                a.click();
                URL.revokeObjectURL(url);
            };
        } else {
            console.warn(`Botão de download SVG '${buttonId}' não encontrado.`);
        }
    }

    /**
     * Anexa a lógica de download para imagem a um botão.
     * @param {string} buttonId O ID do botão de download.
     * @param {HTMLImageElement} imgElement O elemento de imagem a ser baixado.
     * @param {string} fileName O nome base do arquivo para download.
     * @param {string} imagePath O caminho original da imagem para inferir a extensão.
     */
    static attachImage(buttonId, imgElement, fileName, imagePath) {
        const btn = document.getElementById(buttonId);
        if (btn) {
            btn.onclick = function () {
                ButtonFeedback.apply(this);
                const a = document.createElement("a");
                a.href = imgElement.src;
                const fileExtension = imagePath.split(".").pop() || "png"; // Fallback para png
                a.download = fileName.replace(/\s/g, "_") + "." + fileExtension;
                a.click();
            };
        } else {
            console.warn(`Botão de download de imagem '${buttonId}' não encontrado.`);
        }
    }
}

// --- MÓDULO DE CONSTRUÇÃO DA UI DO EMBED ---
class EmbedUIBuilder {
    /**
     * Gera o HTML comum para o contêiner do embed, incluindo estilos e barras de ferramentas.
     * @param {string} uniqueId Um ID único para o embed.
     * @param {string} title O título a ser exibido na barra superior.
     * @param {string} typePrefix Um prefixo para IDs de elementos específicos (ex: 'svg' ou 'image').
     * @returns {string} O HTML completo da estrutura do embed.
     */
    static getCommonHtml(uniqueId, title, typePrefix) {
        return `
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

                /* Estilos específicos para o contêiner do embed */
                #${typePrefix}-container-${uniqueId} {
                    border: 1px solid var(--md-default-fg-color--lighter);
                    background-color: var(--md-default-bg-color);
                }

                /* Estilos para as barras de ferramentas */
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

                /* Estilos para o título do diagrama/imagem */
                #${typePrefix}-title-${uniqueId} {
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

                /* Estilos para o label de zoom */
                #${typePrefix}-zoom-label-${uniqueId} {
                    font-family: var(--md-text-font-family);
                    font-size: 0.64rem;
                    white-space: nowrap;
                    font-weight: bold;
                    color: inherit;
                    flex-shrink: 1;
                }

                /* Estilos para o display de coordenadas */
                #${typePrefix}-coord-display-${uniqueId} {
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
                    #${typePrefix}-zoom-label-${uniqueId}, #${typePrefix}-coord-display-${uniqueId} {
                        font-size: 0.5rem;
                    }
                    #${typePrefix}-title-${uniqueId} {
                        font-size: 0.8rem;
                    }
                }
            </style>
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

            <div id="${typePrefix}-container-${uniqueId}" style="width:100%; height:100%; display:flex; flex-direction:column; cursor:grab;">
                <div class="toolbar-top">
                    <span id="${typePrefix}-title-${uniqueId}">${title}</span>
                </div>
                <div id="canvas-area-${uniqueId}" style="flex:1; overflow:hidden; display:flex; justify-content:center; align-items:center;"></div>
                <div class="toolbar-bottom">
                    <div class="button-group">
                        <button class="icon-btn" id="btn-${typePrefix}-zoom-out-${uniqueId}" title="Reduzir Zoom"><span class="material-icons">remove</span></button>
                        <span id="${typePrefix}-zoom-label-${uniqueId}">100%</span>
                        <button class="icon-btn" id="btn-${typePrefix}-zoom-in-${uniqueId}" title="Aumentar Zoom"><span class="material-icons">add</span></button>
                        <button class="icon-btn" id="btn-${typePrefix}-reset-${uniqueId}" title="Resetar Zoom"><span class="material-icons">refresh</span></button>
                        <button class="icon-btn" id="btn-${typePrefix}-center-${uniqueId}" title="Centralizar Diagrama"><span class="material-icons">center_focus_strong</span></button>
                    </div>
                    <div class="coord-group">
                        <span id="${typePrefix}-coord-display-${uniqueId}"></span>
                        <button class="icon-btn" id="btn-${typePrefix}-download-${uniqueId}" title="Baixar"><span class="material-icons">download</span></button>
                        <button class="icon-btn" id="btn-${typePrefix}-fullscreen-${uniqueId}" title="Tela cheia"><span class="material-icons">fullscreen</span></button>
                    </div>
                </div>
            </div>
        `;
    }
}

// --- CLASSE PARA EMBED DE SVG ---
class SvgEmbed {
    /**
     * Inicializa um embed SVG.
     * @param {HTMLElement} rootElement O elemento raiz (div) onde o SVG será incorporado.
     */
    async create(rootElement) {
        if (!rootElement) return;

        const svgPath = rootElement.dataset.svgPath;
        const diagramTitle = rootElement.dataset.title || "Diagrama";
        const uniqueSvgId = `my-svg-${Math.random().toString(36).substr(2, 9)}`;

        if (!svgPath) {
            rootElement.innerHTML = "<p style='color: red;'>Atributo data-svg-path não definido.</p>";
            console.error("Atributo 'data-svg-path' não encontrado no elemento raiz para SvgEmbed.");
            return;
        }

        try {
            const res = await fetch(svgPath);
            if (!res.ok) throw new Error(`Erro ao carregar SVG: ${res.status} ${res.statusText}`);
            const text = await res.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, "image/svg+xml");
            const svg = doc.querySelector("svg");

            if (!svg) {
                rootElement.innerHTML = "<p style='color:red'>SVG inválido ou vazio.</p>";
                console.error("O arquivo SVG carregado não contém um elemento <svg> válido.");
                return;
            }

            svg.setAttribute("id", uniqueSvgId);
            svg.setAttribute("width", "100%");
            svg.setAttribute("height", "100%");
            svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

            rootElement.innerHTML = EmbedUIBuilder.getCommonHtml(uniqueSvgId, diagramTitle, 'svg');

            const canvas = document.getElementById(`canvas-area-${uniqueSvgId}`);
            if (!canvas) {
                 console.error("Elemento 'canvas-area' não encontrado para o SVG após a injeção do HTML.");
                 return;
            }
            canvas.appendChild(svg);

            let initialViewBoxX, initialViewBoxY, initialViewBoxWidth, initialViewBoxHeight;
            const svgViewBoxAttr = svg.getAttribute("viewBox");

            if (svgViewBoxAttr) {
                const parts = svgViewBoxAttr.split(" ").map(Number);
                if (parts.length === 4 && !isNaN(parts[0])) {
                    initialViewBoxX = parts[0];
                    initialViewBoxY = parts[1];
                    initialViewBoxWidth = parts[2];
                    initialViewBoxHeight = parts[3];
                } else {
                    console.warn("viewBox SVG inválido. Calculando a partir do getBBox().");
                }
            }
            
            // Fallback ou override se viewBox não for válido/existir
            if (!svgViewBoxAttr || !initialViewBoxWidth || !initialViewBoxHeight) {
                const originalContentBBox = svg.getBBox();
                const padding = 10; // Adiciona um padding ao redor do conteúdo
                initialViewBoxX = originalContentBBox.x - padding;
                initialViewBoxY = originalContentBBox.y - padding;
                initialViewBoxWidth = originalContentBBox.width + 2 * padding;
                initialViewBoxHeight = originalContentBBox.height + 2 * padding;
            }

            const svgZoomPanInstance = new SvgZoomPan(
                svg,
                canvas,
                document.getElementById(`svg-zoom-label-${uniqueSvgId}`),
                document.getElementById(`svg-coord-display-${uniqueSvgId}`),
                {
                    x: initialViewBoxX,
                    y: initialViewBoxY,
                    width: initialViewBoxWidth,
                    height: initialViewBoxHeight
                }
            );

            document.getElementById(`btn-svg-zoom-in-${uniqueSvgId}`).onclick = function () { ButtonFeedback.apply(this); svgZoomPanInstance.simulateZoom(25); };
            document.getElementById(`btn-svg-zoom-out-${uniqueSvgId}`).onclick = function () { ButtonFeedback.apply(this); svgZoomPanInstance.simulateZoom(-25); };
            document.getElementById(`btn-svg-reset-${uniqueSvgId}`).onclick = function () {
                ButtonFeedback.apply(this);
                svgZoomPanInstance.reset();
            };
            document.getElementById(`btn-svg-center-${uniqueSvgId}`).onclick = function () {
                ButtonFeedback.apply(this);
                svgZoomPanInstance.center();
            };

            FullscreenHandler.attach(`btn-svg-fullscreen-${uniqueSvgId}`, `svg-container-${uniqueSvgId}`);
            DownloadHandler.attachSvg(`btn-svg-download-${uniqueSvgId}`, svg, diagramTitle);

        } catch (error) {
            console.error("Erro ao inicializar SVG embed:", error);
            rootElement.innerHTML = `<p style='color: red;'>Erro ao carregar ou processar SVG: ${error.message}</p>`;
        }
    }
}

// --- CLASSE PARA EMBED DE IMAGEM ---
class ImageEmbed {
    /**
     * Inicializa um embed de Imagem.
     * @param {HTMLElement} rootElement O elemento raiz (div) onde a imagem será incorporada.
     */
    async create(rootElement) {
        if (!rootElement) return;

        const imagePath = rootElement.dataset.imagePath;
        const imageTitle = rootElement.dataset.title || "Imagem";
        const uniqueImageId = `my-image-${Math.random().toString(36).substr(2, 9)}`;

        if (!imagePath) {
            rootElement.innerHTML = "<p style='color: red;'>Atributo data-image-path não definido no elemento image-root.</p>";
            console.error("Atributo 'data-image-path' não encontrado no elemento raiz para ImageEmbed.");
            return;
        }

        rootElement.innerHTML = EmbedUIBuilder.getCommonHtml(uniqueImageId, imageTitle, 'image');

        const img = new Image();
        img.src = imagePath;
        img.id = `img-${uniqueImageId}`;
        img.style.objectFit = "contain";
        img.style.transformOrigin = "center"; // Changed to center for better pan logic
        img.style.willChange = "transform";
        img.style.transition = "transform 0.05s ease-out"; // Short transition for smoother zoom/pan feedback

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
            rootElement.innerHTML = `<p style='color: red;'>Erro ao carregar a imagem: ${imagePath}</p>`;
            console.error(`Erro ao carregar imagem: ${imagePath}`, error);
            return;
        }

        let imageCurrentZoom = 100;
        let imagePanX = 0;
        let imagePanY = 0;
        let imageIsPanning = false;
        let imageStartX = 0;
        let imageStartY = 0;
        let imageLastTouchDist = null;
        let imageRafId = null;

        const scheduleImageUpdate = () => {
            if (imageRafId) return;
            imageRafId = requestAnimationFrame(() => {
                this.updateImageTransform(img, imageCanvas, imageCurrentZoom, imagePanX, imagePanY, uniqueImageId);
                imageRafId = null;
            });
        };

        const clampImagePan = (imgElement, canvasElement, currentZoom, panX, panY) => {
            const scaledWidth = imgElement.naturalWidth * (currentZoom / 100);
            const scaledHeight = imgElement.naturalHeight * (currentZoom / 100);
            const canvasRect = canvasElement.getBoundingClientRect();

            let clampedPanX = panX;
            let clampedPanY = panY;

            // Pan limits are relative to the center of the canvas and the image
            const maxAbsPanX = Math.max(0, (scaledWidth - canvasRect.width) / 2);
            const maxAbsPanY = Math.max(0, (scaledHeight - canvasRect.height) / 2);
            
            clampedPanX = Math.max(-maxAbsPanX, Math.min(maxAbsPanX, panX));
            clampedPanY = Math.max(-maxAbsPanY, Math.min(maxAbsPanY, panY));

            return { x: clampedPanX, y: clampedPanY };
        };

        this.updateImageTransform = (imgElement, canvasElement, currentZoom, panX, panY, id) => {
            const clamped = clampImagePan(imgElement, canvasElement, currentZoom, panX, panY);
            imagePanX = clamped.x;
            imagePanY = clamped.y;
            imgElement.style.transform = `translate(${imagePanX}px, ${imagePanY}px) scale(${currentZoom / 100})`;
            const zoomLabel = document.getElementById(`image-zoom-label-${id}`);
            if (zoomLabel) zoomLabel.textContent = `${Math.round(currentZoom)}%`; // Round for display
        };

        const applyImageZoom = (delta) => {
            const newZoom = Math.max(25, Math.min(600, imageCurrentZoom + delta));
            if (newZoom !== imageCurrentZoom) {
                imageCurrentZoom = newZoom;
                scheduleImageUpdate();
            }
        };

        // NEW: Evento de roda do mouse para zoom em imagens não SVG
        imageCanvas.addEventListener("wheel", (e) => {
            e.preventDefault(); // Impede o scroll da página
            const delta = e.deltaY > 0 ? -25 : 25; // Determina a direção do zoom
            applyImageZoom(delta);
        });

        document.getElementById(`btn-image-zoom-in-${uniqueImageId}`).onclick = function () { ButtonFeedback.apply(this); applyImageZoom(25); };
        document.getElementById(`btn-image-zoom-out-${uniqueImageId}`).onclick = function () { ButtonFeedback.apply(this); applyImageZoom(-25); };
        document.getElementById(`btn-image-reset-${uniqueImageId}`).onclick = function () {
            ButtonFeedback.apply(this);
            imageCurrentZoom = 100;
            imagePanX = 0;
            imagePanY = 0;
            scheduleImageUpdate();
        };
        document.getElementById(`btn-image-center-${uniqueImageId}`).onclick = function () {
            ButtonFeedback.apply(this);
            imagePanX = 0;
            imagePanY = 0;
            scheduleImageUpdate();
        };

        FullscreenHandler.attach(`btn-image-fullscreen-${uniqueImageId}`, `image-container-${uniqueImageId}`);
        DownloadHandler.attachImage(`btn-image-download-${uniqueImageId}`, img, imageTitle, imagePath);

        imageCanvas.addEventListener("mousedown", (e) => {
            imageIsPanning = true;
            imageStartX = e.clientX;
            imageStartY = e.clientY;
            imageCanvas.style.cursor = "grabbing";
        });

        window.addEventListener("mouseup", () => {
            imageIsPanning = false;
            imageCanvas.style.cursor = "grab";
        });

        window.addEventListener("mousemove", (e) => {
            const coordDisplay = document.getElementById(`image-coord-display-${uniqueImageId}`);
            if (coordDisplay) {
                const imgRect = img.getBoundingClientRect();
                const canvasRect = imageCanvas.getBoundingClientRect();

                // Coordenadas do mouse em relação ao canvas
                const mouseXRelativeToCanvas = e.clientX - canvasRect.left;
                const mouseYRelativeToCanvas = e.clientY - canvasRect.top;

                // Coordenadas do centro da imagem no canvas (após pan e considerando o tamanho original)
                // É o centro do elemento <img> no canvas
                const imgCenterCanvasX = (canvasRect.width / 2) + imagePanX;
                const imgCenterCanvasY = (canvasRect.height / 2) + imagePanY;

                // Deslocamento do mouse em relação ao centro da imagem no canvas
                const offsetXFromImgCenter = mouseXRelativeToCanvas - imgCenterCanvasX;
                const offsetYFromImgCenter = mouseYRelativeToCanvas - imgCenterCanvasY;

                // Coordenadas em pixels originais da imagem (0,0 no canto superior esquerdo da imagem)
                const originalImgX = (img.naturalWidth / 2) + (offsetXFromImgCenter / (imageCurrentZoom / 100));
                const originalImgY = (img.naturalHeight / 2) + (offsetYFromImgCenter / (imageCurrentZoom / 100));

                coordDisplay.textContent = `X: ${Math.round(originalImgX)} Y: ${Math.round(originalImgY)}`;
            }

            if (!imageIsPanning) return;
            imagePanX += e.clientX - imageStartX;
            imagePanY += e.clientY - imageStartY;
            imageStartX = e.clientX;
            imageStartY = e.startY;
            scheduleImageUpdate();
        });

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
                if (this.lastTouchDist !== null) {
                    const delta = currentDist - imageLastTouchDist;
                    applyImageZoom(delta > 0 ? 10 : -10); // Ajusta sensibilidade do zoom por toque
                }
                imageLastTouchDist = currentDist;
            }
        }, { passive: false });

        imageCanvas.addEventListener("touchend", (e) => {
            imageIsPanning = false;
            if (e.touches.length < 2) {
                imageLastTouchDist = null;
            }
        });

        // Initial update to set correct transform and zoom label
        this.updateImageTransform(img, imageCanvas, imageCurrentZoom, imagePanX, imagePanY, uniqueImageId);
    }
}

// --- CLASSE PARA GERENCIAR A INICIALIZAÇÃO DOS EMBEDS ---
class EmbedManager {
    constructor() {
        this.svgEmbed = new SvgEmbed();
        this.imageEmbed = new ImageEmbed();
    }

    /**
     * Inicializa todos os embeds de SVG e Imagem na página.
     */
    initializeAllEmbeds() {
        document.querySelectorAll(".svg-embed-container").forEach(element => {
            this.svgEmbed.create(element);
        });

        document.querySelectorAll(".image-embed-container").forEach(element => {
            this.imageEmbed.create(element);
        });
    }
}

// --- Chamada de inicialização no DOMContentLoaded ---
document.addEventListener("DOMContentLoaded", () => {
    const embedManager = new EmbedManager();
    embedManager.initializeAllEmbeds();
});
