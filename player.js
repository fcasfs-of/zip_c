(function() {
    const audio = document.getElementById("main-audio");
    const btnPlay = document.getElementById("btn-play");
    const svgPlay = document.getElementById("svg-play");
    const svgPause = document.getElementById("svg-pause");
    const btnStop = document.getElementById("btn-stop");
    const btnRewind = document.getElementById("btn-rewind");
    const btnForward = document.getElementById("btn-forward");
    
    // Sliders customizados baseados em divs
    const seekSlider = document.getElementById("seek-slider");
    const seekFill = document.getElementById("seek-fill");
    const seekThumb = document.getElementById("seek-thumb");
    const volumeSlider = document.getElementById("volume-slider");
    const volumeFill = document.getElementById("volume-fill");
    const volumeThumb = document.getElementById("volume-thumb");

    const timeCurrent = document.getElementById("time-current");
    const timeTotal = document.getElementById("time-total");
    const btnMute = document.getElementById("btn-mute");
    const pTitle = document.getElementById("player-title");
    const pArtist = document.getElementById("player-artist");
    const pThumb = document.getElementById("player-thumb");

    let isTrackLoaded = false;
    let currentTrackTags = null;
    let fallbackText = "Desconhecido";
    let currentFileName = "";
    
    // Estados para controle de arrasto (Mouse e Touch)
    let isDraggingSeek = false;
    let isDraggingVolume = false;

    // String SVG estruturada em Outline para quando o áudio não possuir capa
    const audioFallbackSvg = "data:image/svg+xml;utf8,<svg xmlns='http://w3.org' viewBox='0 0 24 24' fill='none' stroke='%233b82f6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M9 18V5l12-2v13'></path><circle cx='6' cy='18' r='3'></circle><circle cx='18' cy='16' r='3'></circle></svg>";

    // Recupera e aplica as configurações salvas de volume e mudo
    function loadSavedSettings() {
        if (!audio) return;
        const savedVolume = localStorage.getItem("audioMeta_volume");
        const savedMute = localStorage.getItem("audioMeta_mute");

        let vol = 0.8;
        if (savedVolume !== null) vol = parseFloat(savedVolume);
        audio.volume = vol;
        updateVolumeUI(vol);

        if (savedMute === "true") {
            audio.muted = true;
            if (btnMute) btnMute.style.opacity = "0.4";
        }
    }

    // Inicialização da faixa enviada pelo app.js (Funciona para arquivos locais e URLs remotas)
    window.initPlayer = function(source, tags, unknownFallback, isUrl = false) {
        if (!source || !audio) return;
        
        // RemoveObjectURL anterior para evitar vazamento de memória se for um arquivo local
        if (audio.src && audio.src.startsWith("blob:")) {
            URL.revokeObjectURL(audio.src);
        }

        // Configura a origem do áudio de acordo com o tipo de entrada
        if (isUrl) {
            audio.src = source; // String da URL remota direta
            currentFileName = source.split('/').pop().split('?')[0] || "Stream de Áudio";
        } else {
            audio.src = URL.createObjectURL(source); // Objeto File local do input/drop
            currentFileName = source.name;
        }

        isTrackLoaded = true;
        currentTrackTags = tags;
        fallbackText = unknownFallback;

        if (pTitle) pTitle.innerText = tags.title || currentFileName;
        if (pArtist) pArtist.innerText = tags.artist || fallbackText;
        
        if (pThumb) {
            if (tags.base64Cover && tags.base64Cover.length > 50) {
                pThumb.src = tags.base64Cover;
            } else {
                pThumb.src = audioFallbackSvg;
            }
        }
        playAudio();
    };

    // Callback de tradução chamado em tempo real pelo app.js
    window.updatePlayerLanguage = function(langStrings) {
        if (!pTitle || !pArtist) return;
        if (!isTrackLoaded) {
            pTitle.innerText = langStrings.playerEmptyTitle;
            pArtist.innerText = langStrings.playerEmptyArtist;
            if (pThumb) pThumb.src = audioFallbackSvg;
        } else {
            fallbackText = langStrings.unknown;
            if (!currentTrackTags || !currentTrackTags.title) pTitle.innerText = currentFileName;
            if (!currentTrackTags || !currentTrackTags.artist) pArtist.innerText = fallbackText;
        }
    };

    if (btnPlay) {
        btnPlay.addEventListener("click", () => {
            if (!audio || !audio.src) return;
            audio.paused ? playAudio() : pauseAudio();
        });
    }

    function playAudio() {
        if (!audio) return;
        audio.play().catch(function() {});
        if (svgPlay) svgPlay.classList.add("field-hidden");
        if (svgPause) svgPause.classList.remove("field-hidden");
    }

    function pauseAudio() {
        if (!audio) return;
        audio.pause();
        if (svgPlay) svgPlay.classList.remove("field-hidden");
        if (svgPause) svgPause.classList.add("field-hidden");
    }

    // Botão Parar (Stop): Zera o áudio, pausa e reinicia os sliders para 0%
    if (btnStop) {
        btnStop.addEventListener("click", () => {
            if (!audio || !audio.src) return;
            audio.pause();
            audio.currentTime = 0;
            if (svgPlay) svgPlay.classList.remove("field-hidden");
            if (svgPause) svgPause.classList.add("field-hidden");
            updateSeekUI(0);
            if (timeCurrent) timeCurrent.innerText = "0:00";
        });
    }

    // Avanço e Retrocesso Temporais de 10 segundos
    if (btnRewind) {
        btnRewind.addEventListener("click", () => {
            if (!audio || !audio.src) return;
            audio.currentTime = Math.max(0, audio.currentTime - 10);
        });
    }

    if (btnForward) {
        btnForward.addEventListener("click", () => {
            if (!audio || !audio.src || !audio.duration || isNaN(audio.duration)) return;
            audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
        });
    }

    // Sincronização do Áudio com as Barras de Progresso Customizadas
    if (audio) {
        audio.addEventListener("timeupdate", () => {
            if (!audio.duration || isNaN(audio.duration) || isDraggingSeek) return;
            const pct = (audio.currentTime / audio.duration) * 100;
            updateSeekUI(pct);
            if (timeCurrent) timeCurrent.innerText = formatTime(audio.currentTime);
        });

        audio.addEventListener("loadedmetadata", () => {
            if (timeTotal) timeTotal.innerText = formatTime(audio.duration);
            updateSeekUI(0);
        });
    }

    function updateSeekUI(pct) {
        if (seekFill) seekFill.style.width = pct + "%";
        if (seekThumb) seekThumb.style.left = pct + "%";
    }

    function updateVolumeUI(vol) {
        const pct = vol * 100;
        if (volumeFill) volumeFill.style.width = pct + "%";
        if (volumeThumb) volumeThumb.style.left = pct + "%";
    }

    // GATILHOS DE CONTROLE DESLIZANTE (MOUSE E TOUCH SCREEN)
    if (seekSlider) {
        seekSlider.addEventListener("mousedown", (e) => {
            if (!audio || !audio.src || !audio.duration || isNaN(audio.duration)) return;
            isDraggingSeek = true;
            processSeekEvent(e);
        });
        seekSlider.addEventListener("touchstart", (e) => {
            if (!audio || !audio.src || !audio.duration || isNaN(audio.duration)) return;
            isDraggingSeek = true;
            processSeekEvent(e.touches[0]);
        }, { passive: true });
    }

    if (volumeSlider) {
        volumeSlider.addEventListener("mousedown", (e) => {
            if (!audio) return;
            isDraggingVolume = true;
            processVolumeEvent(e);
        });
        volumeSlider.addEventListener("touchstart", (e) => {
            if (!audio) return;
            isDraggingVolume = true;
            processVolumeEvent(e.touches[0]);
        }, { passive: true });
    }

    // Captura global de movimentos (Previne travamento fora da bounding box das divs)
    window.addEventListener("mousemove", (e) => {
        if (isDraggingSeek) processSeekEvent(e);
        if (isDraggingVolume) processVolumeEvent(e);
    });
    window.addEventListener("touchmove", (e) => {
        if (isDraggingSeek) processSeekEvent(e.touches[0]);
        if (isDraggingVolume) processVolumeEvent(e.touches[0]);
    }, { passive: true });

    window.addEventListener("mouseup", () => {
        isDraggingSeek = false;
        isDraggingVolume = false;
    });
    window.addEventListener("touchend", () => {
        isDraggingSeek = false;
        isDraggingVolume = false;
    });

    function processSeekEvent(coord) {
        if (!audio || !audio.duration || isNaN(audio.duration) || !seekSlider) return;
        const rect = seekSlider.getBoundingClientRect();
        let posX = (coord.clientX - rect.left) / rect.width;
        posX = Math.max(0, Math.min(1, posX)); 
        
        updateSeekUI(posX * 100);
        audio.currentTime = posX * audio.duration;
        if (timeCurrent) timeCurrent.innerText = formatTime(audio.currentTime);
    }

    function processVolumeEvent(coord) {
        if (!audio || !volumeSlider) return;
        const rect = volumeSlider.getBoundingClientRect();
        let posX = (coord.clientX - rect.left) / rect.width;
        posX = Math.max(0, Math.min(1, posX));
        
        audio.volume = posX;
        updateVolumeUI(posX);
        localStorage.setItem("audioMeta_volume", posX);

        if (audio.muted && posX > 0) {
            audio.muted = false;
            localStorage.setItem("audioMeta_mute", "false");
            if (btnMute) btnMute.style.opacity = "1";
        }
    }

    if (btnMute) {
        btnMute.addEventListener("click", () => {
            if (!audio) return;
            audio.muted = !audio.muted;
            localStorage.setItem("audioMeta_mute", audio.muted ? "true" : "false");
            
            const isLightTheme = document.body.classList.contains("light-theme");
            btnMute.style.opacity = audio.muted ? "0.4" : (isLightTheme ? "0.8" : "1");
        });
    }

    function formatTime(secs) {
        if (isNaN(secs) || secs < 0) return "0:00";
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    loadSavedSettings();
})();
