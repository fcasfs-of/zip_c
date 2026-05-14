(function() {
    const audio = document.getElementById("main-audio");
    const btnPlay = document.getElementById("btn-play");
    const btnStop = document.getElementById("btn-stop");
    const svgPlay = document.getElementById("svg-play");
    const svgPause = document.getElementById("svg-pause");
    const btnRewind = document.getElementById("btn-rewind");
    const btnForward = document.getElementById("btn-forward");
    
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
        let vol = 0.8;
        if (savedVolume !== null) vol = parseFloat(savedVolume);
        audio.volume = vol;
        updateVolumeUI(vol);

        if (savedMute === "true") {
            audio.muted = true;
            if (btnMute) btnMute.style.opacity = "0.4";
        }
    }

    window.initPlayer = function(fileOrUrlObj, tags, unknownFallback, isLocal) {
        if (!audio) return;
        if (audio.src && audio.src.startsWith("blob:")) URL.revokeObjectURL(audio.src);

        if (isLocal) {
            audio.src = URL.createObjectURL(fileOrUrlObj);
            currentFileName = fileOrUrlObj.name;
        } else {
            audio.src = fileOrUrlObj.remoteUrl;
            currentFileName = fileOrUrlObj.name;
        }

        isTrackLoaded = true;
        currentTrackTags = tags;
        fallbackText = unknownFallback;

        if (pTitle) pTitle.innerText = tags.title || currentFileName;
        if (pArtist) pArtist.innerText = tags.artist || fallbackText;
        if (pThumb) pThumb.src = (tags.base64Cover && tags.base64Cover.length > 50) ? tags.base64Cover : audioFallbackSvg;
        
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
        seekSlider.addEventListener("mousedown", (e) => {
            if (!audio || !audio.src || !audio.duration || isNaN(audio.duration)) return;
            isDraggingSeek = true;
            processSeekEvent(e);
        });
    }

    if (volumeSlider) {
        volumeSlider.addEventListener("mousedown", (e) => {
            if (!audio) return;
            isDraggingVolume = true;
            processVolumeEvent(e);
        });
    }

    window.addEventListener("mousemove", (e) => {
        if (isDraggingSeek) processSeekEvent(e);
        if (isDraggingVolume) processVolumeEvent(e);
    });
    window.addEventListener("mouseup", () => {
        isDraggingSeek = false;
        isDraggingVolume = false;
    });

    function processSeekEvent(e) {
        if (!audio || !audio.duration || isNaN(audio.duration) || !seekSlider) return;
        const rect = seekSlider.getBoundingClientRect();
        let posX = (e.clientX - rect.left) / rect.width;
        posX = Math.max(0, Math.min(1, posX));
        updateSeekUI(posX * 100);
        audio.currentTime = posX * audio.duration;
        if (timeCurrent) timeCurrent.innerText = formatTime(audio.currentTime);
    }

    function processVolumeEvent(e) {
        if (!audio || !volumeSlider) return;
        const rect = volumeSlider.getBoundingClientRect();
        let posX = (e.clientX - rect.left) / rect.width;
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
            btnMute.style.opacity = audio.muted ? "0.4" : (document.body.classList.contains("light-theme") ? "0.8" : "1");
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
