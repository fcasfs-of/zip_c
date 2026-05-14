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

    window.initPlayer = function(file, tags, unknownFallback) {
        audio.src = URL.createObjectURL(file);
        isTrackLoaded = true;
        currentTrackTags = tags;
        fallbackText = unknownFallback;

        pTitle.innerText = tags.title || file.name;
        pArtist.innerText = tags.artist || fallbackText;
        
        if(tags.base64Cover && tags.base64Cover.length > 30) {
            pThumb.src = tags.base64Cover;
        } else {
            pThumb.src = "data:image/svg+xml;utf8,<svg xmlns='http://w3.org' viewBox='0 0 24 24' fill='%23888'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z'/></svg>";
        }
        playAudio();
    };

    window.updatePlayerLanguage = function(langStrings) {
        if (!isTrackLoaded) {
            pTitle.innerText = langStrings.playerEmptyTitle;
            pArtist.innerText = langStrings.playerEmptyArtist;
        } else {
            fallbackText = langStrings.unknown;
            if (!currentTrackTags.artist) {
                pArtist.innerText = fallbackText;
            }
        }
    };

    btnPlay.addEventListener("click", () => {
        if (!audio.src) return;
        audio.paused ? playAudio() : pauseAudio();
    });

    function playAudio() {
        audio.play().catch(e => console.log("Aguardando interação do usuário para reproduzir."));
        svgPlay.classList.add("field-hidden");
        svgPause.classList.remove("field-hidden");
    }

    function pauseAudio() {
        audio.pause();
        svgPlay.classList.remove("field-hidden");
        svgPause.classList.add("field-hidden");
    }

    audio.addEventListener("timeupdate", () => {
        if(isNaN(audio.duration)) return;
        const pct = (audio.currentTime / audio.duration) * 100;
        progressBar.value = pct;
        timeCurrent.innerText = formatTime(audio.currentTime);
    });

    audio.addEventListener("loadedmetadata", () => {
        timeTotal.innerText = formatTime(audio.duration);
    });

    progressBar.addEventListener("input", (e) => {
        if (!audio.src) return;
        const seekTime = (e.target.value / 100) * audio.duration;
        audio.currentTime = seekTime;
    });

    volumeSlider.addEventListener("input", (e) => {
        audio.volume = e.target.value;
    });

    btnMute.addEventListener("click", () => {
        audio.muted = !audio.muted;
        btnMute.style.opacity = audio.muted ? "0.5" : "1";
    });

    function formatTime(secs) {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    }
})();
