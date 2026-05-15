(function() {
    // 1. GERAÇÃO E INJEÇÃO DINÂMICA DO DOM DO PLAYER
    const playerContainer = document.createElement("div");
    playerContainer.className = "audio-player";
    playerContainer.id = "audio-player";
    playerContainer.innerHTML = `
        <audio id="main-audio"></audio>
        <div class="player-grid">
            <div class="player-track-info">
                <img id="player-thumb" src="data:image/svg+xml;utf8,<svg xmlns='http://w3.org' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M9 18V5l12-2v13'></path><circle cx='6' cy='18' r='3'></circle><circle cx='18' cy='16' r='3'></circle></svg>" alt="">
                <div>
                    <div class="player-title" id="player-title">Nenhuma música</div>
                    <div class="player-artist" id="player-artist">Aguardando arquivo</div>
                </div>
            </div>
            
            <div class="player-controls">
                <div class="control-buttons">
                    <button id="btn-loop" title="Repetir (Loop)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
                    </button>
                    <button id="btn-rewind" title="Voltar 10s">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                            <path d="M3 3v5h5"/>
                            <text x="12" y="15" font-size="7" font-weight="bold" fill="currentColor" stroke="none" text-anchor="middle">10</text>
                        </svg>
                    </button>
                    <button id="btn-play" class="play-main">
                        <svg id="svg-play" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                        <svg id="svg-pause" class="field-hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="4" x2="10" y2="20"></line><line x1="14" y1="4" x2="14" y2="20"></line></svg>
                    </button>
                    <button id="btn-stop" class="stop-main" title="Parar Música">
                        <svg viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="5" width="14" height="14" rx="2"></rect></svg>
                    </button>
                    <button id="btn-forward" title="Avançar 10s">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                            <path d="M21 3v5h-5"/>
                            <text x="12" y="15" font-size="7" font-weight="bold" fill="currentColor" stroke="none" text-anchor="middle">10</text>
                        </svg>
                    </button>
                    <div class="speed-menu-container">
                        <button id="btn-speed" title="Velocidade">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            <span id="current-speed-lbl">1.0x</span>
                        </button>
                        <div id="speed-dropdown" class="speed-dropdown field-hidden">
                            <div data-speed="0.50">0.50x</div><div data-speed="0.75">0.75x</div><div data-speed="1.00">1.00x</div>
                            <div data-speed="1.25">1.25x</div><div data-speed="1.50">1.50x</div><div data-speed="1.75">1.75x</div>
                            <div data-speed="2.00">2.00x</div><div data-speed="2.25">2.25x</div><div data-speed="2.50">2.50x</div>
                            <div data-speed="2.75">2.75x</div><div data-speed="3.00">3.00x</div>
                        </div>
                    </div>
                </div>
                <div class="progress-container">
                    <span id="time-current">0:00</span>
                    <div class="custom-slider" id="seek-slider">
                        <div class="slider-track"></div>
                        <div class="slider-fill" id="seek-fill"></div>
                        <div class="slider-thumb" id="seek-thumb"></div>
                    </div>
                    <span id="time-total">0:00</span>
                </div>
            </div>
            
            <div class="volume-container">
                <button id="btn-mute">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    </svg>
                </button>
                <div class="custom-slider volume-slider-width" id="volume-slider">
                    <div class="slider-track"></div>
                    <div class="slider-fill" id="volume-fill"></div>
                    <div class="slider-thumb" id="volume-thumb"></div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(playerContainer);

    // 2. EXTRAÇÃO E MAPEAMENTO DOS ELEMENTOS INJETADOS
    const audio = document.getElementById("main-audio");
    const btnPlay = document.getElementById("btn-play");
    const svgPlay = document.getElementById("svg-play");
    const svgPause = document.getElementById("svg-pause");
    const btnStop = document.getElementById("btn-stop");
    const btnRewind = document.getElementById("btn-rewind");
    const btnForward = document.getElementById("btn-forward");
    const btnLoop = document.getElementById("btn-loop");
    const btnSpeed = document.getElementById("btn-speed");
    const speedDropdown = document.getElementById("speed-dropdown");
    const currentSpeedLbl = document.getElementById("current-speed-lbl");
    
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
    let isDraggingSeek = false;
    let isDraggingVolume = false;

    const audioFallbackSvg = "data:image/svg+xml;utf8,<svg xmlns='http://w3.org' viewBox='0 0 24 24' fill='none' stroke='%233b82f6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M9 18V5l12-2v13'></path><circle cx='6' cy='18' r='3'></circle><circle cx='18' cy='16' r='3'></circle></svg>";

    function loadSavedSettings() {
        if (!audio) return;
        const savedVolume = localStorage.getItem("audioMeta_volume");
        const savedMute = localStorage.getItem("audioMeta_mute");
        const savedLoop = localStorage.getItem("audioMeta_loop");
        const savedSpeed = localStorage.getItem("audioMeta_speed");

        let vol = 0.8;
        if (savedVolume !== null) vol = parseFloat(savedVolume);
        audio.volume = vol;
        updateVolumeUI(vol);

        if (savedMute === "true") {
            audio.muted = true;
            if (btnMute) btnMute.style.opacity = "0.4";
        }

        if (savedLoop === "true") {
            audio.loop = true;
            if (btnLoop) btnLoop.classList.add("active");
        }

        if (savedSpeed !== null) {
            const speedVal = parseFloat(savedSpeed);
            audio.playbackRate = speedVal;
            if (currentSpeedLbl) currentSpeedLbl.innerText = speedVal.toFixed(1) + "x";
            updateActiveSpeedClass(savedSpeed);
        }
    }

    window.initPlayer = function(source, tags, unknownFallback, isUrl = false) {
        if (!source || !audio) return;
        
        if (audio.src && audio.src.startsWith("blob:")) {
            URL.revokeObjectURL(audio.src);
        }

        if (isUrl) {
            audio.src = source;
            try { currentFileName = source.split('/').pop().split('?') || "URL Stream"; } catch(e) { currentFileName = "URL Stream"; }
        } else {
            audio.src = URL.createObjectURL(source);
            currentFileName = source.name;
        }

        isTrackLoaded = true;
        currentTrackTags = tags;
        fallbackText = unknownFallback;

        if (pTitle) pTitle.innerText = tags.title || currentFileName;
        if (pArtist) pArtist.innerText = tags.artist || fallbackText;
        if (pThumb) {
            pThumb.src = (tags.base64Cover && tags.base64Cover.length > 50) ? tags.base64Cover : audioFallbackSvg;
        }

        const savedSpeed = localStorage.getItem("audioMeta_speed") || "1.00";
        audio.playbackRate = parseFloat(savedSpeed);
        playAudio();
    };

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

    if (btnLoop) {
        btnLoop.addEventListener("click", () => {
            if (!audio) return;
            audio.loop = !audio.loop;
            localStorage.setItem("audioMeta_loop", audio.loop ? "true" : "false");
            btnLoop.classList.toggle("active", audio.loop);
        });
    }

    if (btnSpeed && speedDropdown) {
        btnSpeed.addEventListener("click", (e) => {
            e.stopPropagation();
            speedDropdown.classList.toggle("field-hidden");
        });

        speedDropdown.addEventListener("click", (e) => {
            const targetItem = e.target;
            const targetSpeedStr = targetItem.getAttribute("data-speed");
            if (!targetSpeedStr) return;

            const speedVal = parseFloat(targetSpeedStr);
            audio.playbackRate = speedVal;
            localStorage.setItem("audioMeta_speed", targetSpeedStr);
            if (currentSpeedLbl) currentSpeedLbl.innerText = speedVal.toFixed(1) + "x";
            
            updateActiveSpeedClass(targetSpeedStr);
            speedDropdown.classList.add("field-hidden");
        });
    }

    function updateActiveSpeedClass(speedStr) {
        if (!speedDropdown) return;
        const items = speedDropdown.querySelectorAll("div");
        items.forEach(item => {
            const itemSpeed = item.getAttribute("data-speed");
            item.classList.toggle("active", itemSpeed === speedStr);
        });
    }

    document.addEventListener("click", () => {
        if (speedDropdown) speedDropdown.classList.add("field-hidden");
    });

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

    if (seekSlider) {
        seekSlider.addEventListener("mousedown", () => { if (audio.src && !isNaN(audio.duration)) isDraggingSeek = true; });
        seekSlider.addEventListener("touchstart", () => { if (audio.src && !isNaN(audio.duration)) isDraggingSeek = true; }, { passive: true });
    }

    if (volumeSlider) {
        volumeSlider.addEventListener("mousedown", () => isDraggingVolume = true);
        volumeSlider.addEventListener("touchstart", () => isDraggingVolume = true, { passive: true });
    }

    window.addEventListener("mousemove", (e) => {
        if (isDraggingSeek) processSliderMove(e, seekSlider, true);
        if (isDraggingVolume) processSliderMove(e, volumeSlider, false);
    });

    window.addEventListener("touchmove", (e) => {
        if (isDraggingSeek && e.touches.length) processSliderMove(e.touches, seekSlider, true);
        if (isDraggingVolume && e.touches.length) processSliderMove(e.touches, volumeSlider, false);
    }, { passive: true });

    window.addEventListener("mouseup", () => { isDraggingSeek = false; isDraggingVolume = false; });
    window.addEventListener("touchend", () => { isDraggingSeek = false; isDraggingVolume = false; });

    function processSliderMove(eventObj, sliderElement, isSeek) {
        if (!sliderElement) return;
        const rect = sliderElement.getBoundingClientRect();
        
        const clientX = (eventObj && eventObj.clientX !== undefined) ? eventObj.clientX : eventObj.clientX;
        let posX = (clientX - rect.left) / rect.width;
        posX = Math.max(0, Math.min(1, posX));

        if (isSeek) {
            updateSeekUI(posX * 100);
            audio.currentTime = posX * audio.duration;
            if (timeCurrent) timeCurrent.innerText = formatTime(audio.currentTime);
        } else {
            audio.volume = posX;
            updateVolumeUI(posX);
            localStorage.setItem("audioMeta_volume", posX);
            if (audio.muted && posX > 0) {
                audio.muted = false;
                localStorage.setItem("audioMeta_mute", "false");
                if (btnMute) btnMute.style.opacity = "1";
            }
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
