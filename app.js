const langData = {
    pt: {
        drop: "Arraste seu MP3 aqui ou clique para buscar",
        metaTitle: "Metadados Extraídos",
        title: "Título", artist: "Artista", album: "Álbum",
        year: "Ano", genre: "Gênero", track: "Faixa",
        unknown: "Desconhecido",
        playerEmptyTitle: "Nenhuma música",
        playerEmptyArtist: "Aguardando arquivo",
        lyricsTitle: "Letras da Música",
        techTitle: "Propriedades Técnicas do Arquivo",
        lblBitrate: "Taxa de Bits", lblFrequency: "Frequência de Amostragem", lblChannels: "Canais de Áudio",
        corsError: "URL remota com restrição CORS. Áudio carregado diretamente no player."
    },
    en: {
        drop: "Drag your MP3 here or click to browse",
        metaTitle: "Extracted Metadata",
        title: "Title", artist: "Artist", album: "Album",
        year: "Year", genre: "Genre", track: "Track",
        unknown: "Unknown",
        playerEmptyTitle: "No track selected",
        playerEmptyArtist: "Waiting for file",
        lyricsTitle: "Lyrics",
        techTitle: "Technical Properties",
        lblBitrate: "Bitrate", lblFrequency: "Sample Rate", lblChannels: "Audio Channels",
        corsError: "Remote URL restricted by CORS. Audio loaded directly into player."
    }
};

window.currentLang = localStorage.getItem("audioMeta_lang") || "pt";
window.dynamicDiscoveredTags = {};

let currentTheme = localStorage.getItem("audioMeta_theme") || "dark";

const txtDrop = document.getElementById("txt-drop");
const txtMetaTitle = document.getElementById("txt-meta-title");
const txtLyricsTitle = document.getElementById("txt-lyrics-title");
const txtTechTitle = document.getElementById("txt-tech-title");
const lblTitle = document.getElementById("lbl-title");
const lblArtist = document.getElementById("lbl-artist");
const lblAlbum = document.getElementById("lbl-album");
const lblYear = document.getElementById("lbl-year");
const lblGenre = document.getElementById("lbl-genre");
const lblTrack = document.getElementById("lbl-track");
const lblBitrate = document.getElementById("lbl-bitrate");
const lblFrequency = document.getElementById("lbl-frequency");
const lblChannels = document.getElementById("lbl-channels");
const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const btnTheme = document.getElementById("btn-theme");
const txtBtnDownload = document.getElementById("txt-btn-download");

// Inputs de URL
const btnUrlSubmit = document.getElementById("btn-url-submit");
const urlInput = document.getElementById("url-input");

function initTheme() {
    document.body.classList.remove("light-theme", "dark-theme");
    document.body.classList.add(`${currentTheme}-theme`);
    updateThemeButtonIcon();
}

function toggleTheme() {
    currentTheme = currentTheme === "dark" ? "light" : "dark";
    localStorage.setItem("audioMeta_theme", currentTheme);
    document.body.classList.remove("light-theme", "dark-theme");
    document.body.classList.add(`${currentTheme}-theme`);
    updateThemeButtonIcon();
}

function updateThemeButtonIcon() {
    if (!btnTheme) return;
    const svgSun = btnTheme.querySelector("#svg-sun");
    const svgMoon = btnTheme.querySelector("#svg-moon");
    if (svgSun && svgMoon) {
        if (currentTheme === "dark") {
            svgSun.classList.remove("field-hidden");
            svgMoon.classList.add("field-hidden");
        } else {
            svgSun.classList.add("field-hidden");
            svgMoon.classList.remove("field-hidden");
        }
    }
}

if (btnTheme) btnTheme.addEventListener("click", toggleTheme);

function updateLanguage(lang) {
    window.currentLang = lang;
    localStorage.setItem("audioMeta_lang", lang);
    
    const btnPt = document.getElementById("btn-pt");
    const btnEn = document.getElementById("btn-en");
    if (btnPt) btnPt.classList.toggle("active", lang === "pt");
    if (btnEn) btnEn.classList.toggle("active", lang === "en");
    
    if (txtDrop) txtDrop.innerText = langData[lang].drop;
    if (txtMetaTitle) txtMetaTitle.innerText = langData[lang].metaTitle;
    if (txtLyricsTitle) txtLyricsTitle.innerText = langData[lang].lyricsTitle;
    if (txtTechTitle) txtTechTitle.innerText = langData[lang].techTitle;
    if (lblTitle) lblTitle.innerText = langData[lang].title;
    if (lblArtist) lblArtist.innerText = langData[lang].artist;
    if (lblAlbum) lblAlbum.innerText = langData[lang].album;
    if (lblYear) lblYear.innerText = langData[lang].year;
    if (lblGenre) lblGenre.innerText = langData[lang].genre;
    if (lblTrack) lblTrack.innerText = langData[lang].track;
    if (lblBitrate) lblBitrate.innerText = langData[lang].lblBitrate;
    if (lblFrequency) lblFrequency.innerText = langData[lang].lblFrequency;
    if (lblChannels) lblChannels.innerText = langData[lang].lblChannels;
    if (txtBtnDownload) txtBtnDownload.innerText = lang === "pt" ? "Baixar Dados" : "Download Data";

    const txtUrlTitle = document.getElementById("txt-url-title");
    if (txtUrlTitle) txtUrlTitle.innerText = lang === "pt" ? "Ou insira a URL do áudio MP3" : "Or enter MP3 audio URL";

    if (Object.keys(window.dynamicDiscoveredTags).length > 0) {
        displayMainTags(window.dynamicDiscoveredTags);
    }
    if (typeof window.updatePlayerLanguage === "function") {
        window.updatePlayerLanguage(langData[lang]);
    }
}

if (document.getElementById("btn-pt")) document.getElementById("btn-pt").addEventListener("click", () => updateLanguage("pt"));
if (document.getElementById("btn-en")) document.getElementById("btn-en").addEventListener("click", () => updateLanguage("en"));

if (dropZone && fileInput) {
    dropZone.addEventListener("click", () => fileInput.click());
    dropZone.addEventListener("dragover", (e) => { e.preventDefault(); dropZone.style.borderColor = "var(--accent)"; });
    dropZone.addEventListener("dragleave", () => dropZone.style.borderColor = "var(--border)");
    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.style.borderColor = "var(--border)";
        if (e.dataTransfer.files && e.dataTransfer.files.length) handleLocalFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files.length) handleLocalFile(e.target.files[0]);
    });
}

// Disparador de input por Link URL
if (btnUrlSubmit && urlInput) {
    btnUrlSubmit.addEventListener("click", () => {
        const urlValue = urlInput.value.trim();
        if (urlValue) handleUrlFile(urlValue);
    });
    urlInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            const urlValue = urlInput.value.trim();
            if (urlValue) handleUrlFile(urlValue);
        }
    });
}

function handleLocalFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        window.dynamicDiscoveredTags = parseCompleteMP3(e.target.result);
        displayMainTags(window.dynamicDiscoveredTags);
        if (typeof window.initPlayer === "function") {
            window.initPlayer(URL.createObjectURL(file), file.name, window.dynamicDiscoveredTags, langData[window.currentLang].unknown);
        }
    };
    reader.readAsArrayBuffer(file);
}

function handleUrlFile(url) {
    const filename = url.substring(url.lastIndexOf('/') + 1) || "Remoto.mp3";
    
    // Tenta ler binários via Fetch (pode falhar silenciosamente se o servidor de terceiros travar o CORS)
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error("Network error");
            return response.arrayBuffer();
        })
        .then(buffer => {
            window.dynamicDiscoveredTags = parseCompleteMP3(buffer);
            displayMainTags(window.dynamicDiscoveredTags);
            if (typeof window.initPlayer === "function") {
                window.initPlayer(url, filename, window.dynamicDiscoveredTags, langData[window.currentLang].unknown);
            }
        })
        .catch(() => {
            // Fallback CORS: Limpa erros críticos do console e alimenta o player diretamente com o stream
            window.dynamicDiscoveredTags = {
                title: filename, artist: langData[window.currentLang].corsError,
                album: "", year: "", genre: "", track: "",
                lyrics: "", technical: { bitrate: "Streaming", frequency: "-", channels: "-" }, base64Cover: ""
            };
            displayMainTags(window.dynamicDiscoveredTags);
            if (typeof window.initPlayer === "function") {
                window.initPlayer(url, filename, window.dynamicDiscoveredTags, langData[window.currentLang].unknown);
            }
        });
}

function parseCompleteMP3(buffer) {
    const view = new DataView(buffer);
    const tags = { _raw: {}, lyrics: "", technical: { bitrate: "-", frequency: "-", channels: "-" }, base64Cover: "" };
    if (buffer.byteLength < 10) return tags;

    if (view.getUint8(0) === 0x49 && view.getUint8(1) === 0x44 && view.getUint8(2) === 0x33) {
        const version = view.getUint8(3);
        let offset = 10;
        const totalSize = ((view.getUint8(6) & 0x7F) << 21) | ((view.getUint8(7) & 0x7F) << 14) | ((view.getUint8(8) & 0x7F) << 7) | (view.getUint8(9) & 0x7F);
        const limit = Math.min(totalSize + 10, buffer.byteLength);

        while (offset < limit - 10) {
            let frameId = "", frameSize = 0, headerSize = 10;
            if (version === 2) {
                frameId = String.fromCharCode(view.getUint8(offset), view.getUint8(offset+1), view.getUint8(offset+2));
                frameSize = (view.getUint8(offset+3) << 16) | (view.getUint8(offset+4) << 8) | view.getUint8(offset+5);
                headerSize = 6;
            } else if (version === 3) {
                frameId = String.fromCharCode(view.getUint8(offset), view.getUint8(offset+1), view.getUint8(offset+2), view.getUint8(offset+3));
                frameSize = (view.getUint8(offset+4) << 24) | (view.getUint8(offset+5) << 16) | (view.getUint8(offset+6) << 8) | view.getUint8(offset+7);
            } else if (version === 4) {
                frameId = String.fromCharCode(view.getUint8(offset), view.getUint8(offset+1), view.getUint8(offset+2), view.getUint8(offset+3));
                frameSize = ((view.getUint8(offset+4) & 0x7F) << 21) | ((view.getUint8(offset+5) & 0x7F) << 14) | ((view.getUint8(offset+6) & 0x7F) << 7) | (view.getUint8(offset+7) & 0x7F);
            }

            if (!frameId || frameId.charCodeAt(0) === 0 || frameSize <= 0 || (offset + headerSize + frameSize) > limit) break;
            let dataOffset = offset + headerSize;

            try {
                if (frameId.startsWith("T") && frameId !== "TXXX" && frameId !== "TXX") {
                    let val = readTextFrame(view, dataOffset, frameSize);
                    if (val) tags._raw[frameId] = val;
                } else if (frameId === "USLT" || frameId === "ULT") {
                    tags.lyrics = readLyricsFrame(view, dataOffset, frameSize);
                } else if (frameId === "APIC" || frameId === "PIC") {
                    tags.base64Cover = readPictureFrame(view, dataOffset, frameSize, version);
                }
            } catch(e) {}
            offset += headerSize + frameSize;
        }
    }

    try {
        let syncOffset = 0;
        const maxSearch = Math.min(buffer.byteLength - 4, 64000);
        const sampleRatesTable = [44100, 48000, 32000, 0];
        const bitratesTable = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
        while (syncOffset < maxSearch) {
            if (view.getUint8(syncOffset) === 0xFF && (view.getUint8(syncOffset + 1) & 0xE0) === 0xE0) {
                const byte2 = view.getUint8(syncOffset + 2);
                const byte3 = view.getUint8(syncOffset + 3);
                const sampleRate = sampleRatesTable[(byte2 & 0x0C) >> 2];
                const channels = ((byte3 & 0xC0) >> 6) === 3 ? "Mono" : "Stereo";
                const bitrate = bitratesTable[(byte2 & 0xF0) >> 4];
                tags.technical.frequency = sampleRate ? `${sampleRate} Hz` : "-";
                tags.technical.channels = channels;
                tags.technical.bitrate = bitrate ? `${bitrate} kbps` : "MPEG Audio";
                break;
            }
            syncOffset++;
        }
    } catch(e) {}

    tags.title = tags._raw["TIT2"] || tags._raw["TT2"] || "";
    tags.artist = tags._raw["TPE1"] || tags._raw["TP1"] || "";
    tags.album = tags._raw["TALB"] || tags._raw["TAL"] || "";
    tags.year = tags._raw["TYER"] || tags._raw["TYE"] || tags._raw["TDRC"] || "";
    tags.genre = tags._raw["TCON"] || tags._raw["TCO"] || "";
    tags.track = tags._raw["TRCK"] || tags._raw["TRK"] || "";
    return tags;
}

function readTextFrame(view, offset, size) {
    if (size <= 1) return "";
    return decodeString(new Uint8Array(view.buffer, view.byteOffset + offset + 1, size - 1), view.getUint8(offset));
}

function readLyricsFrame(view, offset, size) {
    if (size <= 5) return "";
    return decodeString(new Uint8Array(view.buffer, view.byteOffset + offset + 5, size - 5), view.getUint8(offset));
}

function decodeString(uint8Array, encoding) {
    try {
        let cleanBytes = uint8Array.filter((b) => encoding === 0 ? b !== 0 : true);
        if (cleanBytes.length === 0) return "";
        let decoded = "";
        if (encoding === 1 || encoding === 2) {
            if (cleanBytes.length >= 2 && cleanBytes[0] === 0xFF && cleanBytes[1] === 0xFE) decoded = new TextDecoder('utf-16le').decode(cleanBytes.subarray(2));
            else if (cleanBytes.length >= 2 && cleanBytes[0] === 0xFE && cleanBytes[1] === 0xFF) decoded = new TextDecoder('utf-16be').decode(cleanBytes.subarray(2));
            else decoded = new TextDecoder('utf-16').decode(cleanBytes);
        } else if (encoding === 3) decoded = new TextDecoder('utf-8').decode(cleanBytes);
        else decoded = new TextDecoder('windows-1252').decode(cleanBytes);
        if (/[\u4e00-\u9fa5\u3040-\u30ff]/.test(decoded)) {
            decoded = new TextDecoder('windows-1252').decode(cleanBytes.filter(b => b >= 32 || b === 10 || b === 13));
        }
        return decoded.replace(/[\x00-\x1F\x7F-\x9F]/g, "").trim();
    } catch(e) { return ""; }
}

function readPictureFrame(view, offset, size, version) {
    try {
        const end = offset + size;
        let current = offset + 1, mimeType = "image/jpeg";
        if (version === 2) current = offset + 5;
        else {
            let mimeChars = [];
            while (view.getUint8(current) !== 0 && current < end) { mimeChars.push(String.fromCharCode(view.getUint8(current))); current++; }
            if (mimeChars.length) mimeType = mimeChars.join("");
            current += 2;
        }
        while (view.getUint8(current) !== 0 && current < end) current++;
        current++;
        if (current >= end) return "";
        const imgBytes = new Uint8Array(view.buffer, view.byteOffset + current, end - current);
        let binary = '';
        for (let i = 0; i < imgBytes.byteLength; i++) binary += String.fromCharCode(imgBytes[i]);
        return `data:${mimeType};base64,${btoa(binary)}`;
    } catch(e) { return ""; }
}

function displayMainTags(tags) {
    const metaContainer = document.getElementById("meta-container");
    if (metaContainer) metaContainer.classList.remove("field-hidden");
    const btnDownloadMeta = document.getElementById("btn-download-meta");
    if (btnDownloadMeta) btnDownloadMeta.classList.remove("field-hidden");
    
    const fallback = langData[window.currentLang].unknown;
    if (document.getElementById("val-title")) document.getElementById("val-title").innerText = tags.title || fallback;
    if (document.getElementById("val-artist")) document.getElementById("val-artist").innerText = tags.artist || fallback;
    if (document.getElementById("val-album")) document.getElementById("val-album").innerText = tags.album || fallback;
    if (document.getElementById("val-year")) document.getElementById("val-year").innerText = tags.year || fallback;
    if (document.getElementById("val-genre")) document.getElementById("val-genre").innerText = tags.genre || fallback;
    if (document.getElementById("val-track")) document.getElementById("val-track").innerText = tags.track || fallback;
    if (document.getElementById("val-bitrate")) document.getElementById("val-bitrate").innerText = tags.technical.bitrate || "-";
    if (document.getElementById("val-frequency")) document.getElementById("val-frequency").innerText = tags.technical.frequency || "-";
    if (document.getElementById("val-channels")) document.getElementById("val-channels").innerText = tags.technical.channels || "-";

    const lyricsCard = document.getElementById("lyrics-card"), lyricsText = document.getElementById("lyrics-text");
    if (tags.lyrics && lyricsCard && lyricsText) { lyricsCard.classList.remove("field-hidden"); lyricsText.innerText = tags.lyrics; }
    else if (lyricsCard) lyricsCard.classList.add("field-hidden");

    const img = document.getElementById("cover-art"), def = document.getElementById("default-cover");
    if (img && def) {
        if (tags.base64Cover && tags.base64Cover.length > 50) { img.src = tags.base64Cover; img.classList.remove("field-hidden"); def.classList.add("field-hidden"); }
        else { img.src = ""; img.classList.add("field-hidden"); def.innerHTML = `<svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx='6' cy='18' r='3'></circle><circle cx='18' cy='16' r='3'></circle></svg>`; def.classList.remove("field-hidden"); }
    }
}

initTheme();
updateLanguage(window.currentLang);
