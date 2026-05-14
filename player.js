(function() {
    const audio = document.getElementById("main-audio");
    const btnPlay = document.getElementById("btn-play");
    const svgPlay = document.getElementById("svg-play");
    const svgPause = document.getElementById("svg-pause");
    const progressBar = document.getElementById("progress-bar");
    const timeCurrent = document.getElementById("time-current");
    const timeTotal = document.getElementById("time-total");
    const volumeSlider = document.getElementById("volume-slider");
    const btnMute = document.getElementById("btn-mute");
    const pTitle = document.getElementById("player-title");
    const pArtist = document.getElementById("player-artist");
    const pThumb = document.getElementById("player-thumb");

    let isTrackLoaded = false;
    let currentTrackTags = null;
    let fallbackText = "Desconhecido";
    let currentFileName = "";

    function loadSavedSettings() {
        if (!audio || !volumeSlider) return;

        const savedVolume = localStorage.getItem("audioMeta_volume");
        const savedMute = localStorage.getItem("audioMeta_mute");

        if (savedVolume !== null) {
            audio.volume = parseFloat(savedVolume);
            volumeSlider.value = savedVolume;
        } else {
            audio.volume = 0.8;
            volumeSlider.value = 0.8;
        }

        if (savedMute === "true") {
            audio.muted = true;
            if (btnMute) btnMute.style.opacity = "0.4";
        }
    }

    window.initPlayer = function(file, tags, unknownFallback) {
        if (!file || !audio) return;
        
        audio.src = URL.createObjectURL(file);
        isTrackLoaded = true;
        currentTrackTags = tags;
        fallbackText = unknownFallback;
        currentFileName = file.name;

        if (pTitle) pTitle.innerText = tags.title || currentFileName;
        if (pArtist) pArtist.innerText = tags.artist || fallbackText;
        
        // Renderização imediata da capa no player de áudio inferior
        if (pThumb) {
            if (tags.base64Cover && tags.base64Cover.length > 50) {
                pThumb.src = tags.base64Cover;
            } else {
                pThumb.src = "data:image/svg+xml;utf8,<svg xmlns='http://w3.org' viewBox='0 0 24 24' fill='%23888'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z'/></svg>";
            }
        }
        playAudio();
    };

    window.updatePlayerLanguage = function(langStrings) {
        if (!pTitle || !pArtist) return;
        
        if (!isTrackLoaded) {
            pTitle.innerText = langStrings.playerEmptyTitle;
            pArtist.innerText = langStrings.playerEmptyArtist;
            if (pThumb) {
                pThumb.src = "data:image/svg+xml;utf8,<svg xmlns='http://w3.org' viewBox='0 0 24 24' fill='%23888'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z'/></svg>";
            }
        } else {
            fallbackText = langStrings.unknown;
            if (!currentTrackTags || !currentTrackTags.title) {
                pTitle.innerText = currentFileName;
            }
            if (!currentTrackTags || !currentTrackTags.artist) {
                pArtist.innerText = fallbackText;
            }
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

    if (audio) {
        audio.addEventListener("timeupdate", () => {
            if (!audio.duration || isNaN(audio.duration)) return;
            const pct = (audio.currentTime / audio.duration) * 100;
            if (progressBar) progressBar.value = pct;
            if (timeCurrent) timeCurrent.innerText = formatTime(audio.currentTime);
        });

        audio.addEventListener("loadedmetadata", () => {
            if (timeTotal) timeTotal.innerText = formatTime(audio.duration);
        });
    }

    if (progressBar) {
        progressBar.addEventListener("input", (e) => {
            if (!audio || !audio.src || !audio.duration) return;
            audio.currentTime = (e.target.value / 100) * audio.duration;
        });
    }

    if (volumeSlider) {
        volumeSlider.addEventListener("input", (e) => {
            if (!audio) return;
            const vol = e.target.value;
            audio.volume = vol;
            localStorage.setItem("audioMeta_volume", vol);
            
            if (audio.muted && vol > 0) {
                audio.muted = false;
                localStorage.setItem("audioMeta_mute", "false");
                if (btnMute) btnMute.style.opacity = "1";
            }
        });
    }

    if (btnMute) {
        btnMute.addEventListener("click", () => {
            if (!audio) return;
            audio.muted = !audio.muted;
            localStorage.setItem("audioMeta_mute", audio.muted ? "true" : "false");
            btnMute.style.opacity = audio.muted ? "0.4" : "1";
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
