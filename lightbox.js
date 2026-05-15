(function() {
    const coverArtImg = document.getElementById("cover-art");

    if (coverArtImg) {
        // Vincula o clique na capa principal
        coverArtImg.addEventListener("click", () => {
            // Só executa o lightbox se a imagem contiver uma capa base64 extraída válida
            if (!coverArtImg.src || coverArtImg.src === "" || coverArtImg.classList.contains("field-hidden")) return;
            
            createLightbox(coverArtImg.src);
        });
    }

    function createLightbox(imageSrc) {
        // 1. CONSTRUÇÃO E INJEÇÃO AUTOMÁTICA DOS COMPONENTES NO DOM
        const overlay = document.createElement("div");
        overlay.className = "meta-lightbox-overlay";
        overlay.id = "meta-lightbox";

        overlay.innerHTML = `
            <div class="meta-lightbox-tools">
                <!-- Botão de Zoom Alternável -->
                <button class="meta-lightbox-btn" id="lightbox-btn-zoom" title="Zoom">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                </button>
                <!-- Botão de Download Independente -->
                <button class="meta-lightbox-btn" id="lightbox-btn-download" title="Baixar Capa">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                </button>
                <!-- Botão de Fechamento Crítico -->
                <button class="meta-lightbox-btn" id="lightbox-btn-close" title="Fechar">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            <div class="meta-lightbox-stage">
                <img src="${imageSrc}" class="meta-lightbox-img" id="lightbox-main-img" alt="Capa Ampliada">
            </div>
        `;

        document.body.appendChild(overlay);

        // Força renderização do ciclo de animação CSS fade-in
        setTimeout(() => overlay.classList.add("active"), 10);

        // 2. CAPTURA DOS NOVOS SUPORTES ELEMENTARES INJETADOS
        const mainImg = document.getElementById("lightbox-main-img");
        const btnClose = document.getElementById("lightbox-btn-close");
        const btnZoom = document.getElementById("lightbox-btn-zoom");
        const btnDownload = document.getElementById("lightbox-btn-download");

        // Mecanismo de Fechamento e Destruição Limpa
        function closeAndDestroy() {
            overlay.classList.remove("active");
            // Aguarda o término da transição de opacidade do CSS para deletar o nó
            overlay.addEventListener("transitionend", function handler(e) {
                if (e.propertyName === "opacity") {
                    overlay.removeEventListener("transitionend", handler);
                    overlay.remove(); // Deleta do HTML e limpa memória RAM de listeners
                }
            });
        }

        // Lógica Alternável do Efeito de Zoom
        function toggleZoom() {
            if (!mainImg || !btnZoom) return;
            mainImg.classList.toggle("zoomed");
            btnZoom.classList.toggle("zoom-active", mainImg.classList.contains("zoomed"));
        }

        // Eventos operacionais do Lightbox
        if (btnClose) btnClose.addEventListener("click", closeAndDestroy);
        if (btnZoom) btnZoom.addEventListener("click", toggleZoom);
        if (mainImg) mainImg.addEventListener("click", toggleZoom);

        // Fecha se clicar diretamente no plano de fundo opaco desfocado
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) closeAndDestroy();
        });

        // Executa extração e download isolado da imagem de capa aberta
        if (btnDownload) {
            btnDownload.addEventListener("click", () => {
                const tags = window.dynamicDiscoveredTags || {};
                const baseName = tags.title ? `${tags.title} - ${tags.artist || 'Capa'}` : "cover_art";
                
                let extension = "jpg";
                if (imageSrc.includes("image/png")) extension = "png";
                if (imageSrc.includes("image/gif")) extension = "gif";

                const a = document.createElement("a");
                a.href = imageSrc;
                a.download = `${baseName}.${extension}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            });
        }

        // Suporte para acessibilidade via teclado (Tecla ESC fecha o Lightbox)
        const keyHandler = function(e) {
            if (e.key === "Escape") {
                window.removeEventListener("keydown", keyHandler);
                closeAndDestroy();
            }
        };
        window.addEventListener("keydown", keyHandler);
    }
})();
