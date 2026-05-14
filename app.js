const langData = {
    pt: {
        drop: "Arraste seu MP3 aqui ou clique para buscar",
        metaTitle: "Metadados Extraídos",
        title: "Título", artist: "Artista", album: "Álbum",
        year: "Ano", genre: "Gênero", track: "Faixa",
        unknown: "Desconhecido",
        playerEmptyTitle: "Nenhuma música",
        playerEmptyArtist: "Aguardando arquivo",
        extendedTitle: "Todos os Rótulos Encontrados (Tags ID3)",
        lyricsTitle: "Letras da Música",
        techTitle: "Propriedades Técnicas do Arquivo",
        lblBitrate: "Taxa de Bits", lblFrequency: "Frequência de Amostragem", lblChannels: "Canais de Áudio"
    },
    en: {
        drop: "Drag your MP3 here or click to browse",
        metaTitle: "Extracted Metadata",
        title: "Title", artist: "Artist", album: "Album",
        year: "Year", genre: "Genre", track: "Track",
        unknown: "Unknown",
        playerEmptyTitle: "No track selected",
        playerEmptyArtist: "Waiting for file",
        extendedTitle: "All Discovered Labels (ID3 Tags)",
        lyricsTitle: "Lyrics",
        techTitle: "Technical Properties",
        lblBitrate: "Bitrate", lblFrequency: "Sample Rate", lblChannels: "Audio Channels"
    }
};

let currentLang = "pt";
let dynamicDiscoveredTags = {};

const txtDrop = document.getElementById("txt-drop");
const txtMetaTitle = document.getElementById("txt-meta-title");
const txtExtendedTitle = document.getElementById("txt-extended-title");
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

function updateLanguage(lang) {
    currentLang = lang;
    document.getElementById("btn-pt").classList.toggle("active", lang === "pt");
    document.getElementById("btn-en").classList.toggle("active", lang === "en");
    
    txtDrop.innerText = langData[lang].drop;
    txtMetaTitle.innerText = langData[lang].metaTitle;
    txtExtendedTitle.innerText = langData[lang].extendedTitle;
    if(txtLyricsTitle) txtLyricsTitle.innerText = langData[lang].lyricsTitle;
    txtTechTitle.innerText = langData[lang].techTitle;
    lblTitle.innerText = langData[lang].title;
    lblArtist.innerText = langData[lang].artist;
    lblAlbum.innerText = langData[lang].album;
    lblYear.innerText = langData[lang].year;
    lblGenre.innerText = langData[lang].genre;
    lblTrack.innerText = langData[lang].track;
    lblBitrate.innerText = langData[lang].lblBitrate;
    lblFrequency.innerText = langData[lang].lblFrequency;
    lblChannels.innerText = langData[lang].lblChannels;

    if (typeof window.updatePlayerLanguage === "function") {
        window.updatePlayerLanguage(langData[lang]);
    }
    renderExtendedList();
}

document.getElementById("btn-pt").addEventListener("click", () => updateLanguage("pt"));
document.getElementById("btn-en").addEventListener("click", () => updateLanguage("en"));

const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");

dropZone.addEventListener("click", () => fileInput.click());
dropZone.addEventListener("dragover", (e) => { e.preventDefault(); dropZone.style.borderColor = "var(--accent)"; });
dropZone.addEventListener("dragleave", () => dropZone.style.borderColor = "var(--border)");
dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.style.borderColor = "var(--border)";
    if(e.dataTransfer.files && e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
});
fileInput.addEventListener("change", (e) => {
    if(e.target.files && e.target.files.length) handleFile(e.target.files[0]);
});

function handleFile(file) {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const buffer = e.target.result;
        dynamicDiscoveredTags = parseCompleteMP3(buffer);
        
        displayMainTags(dynamicDiscoveredTags);
        renderExtendedList();
        
        const fallbackUnknown = langData[currentLang].unknown;
        if (typeof window.initPlayer === "function") {
            window.initPlayer(file, dynamicDiscoveredTags, fallbackUnknown);
        }
    };
    reader.readAsArrayBuffer(file);
}

function parseCompleteMP3(buffer) {
    const view = new DataView(buffer);
    const tags = { _raw: {}, lyrics: "", technical: { bitrate: "-", frequency: "-", channels: "-" } };
    
    if (buffer.byteLength < 10) return tags;

    if (view.getUint8(0) === 0x49 && view.getUint8(1) === 0x44 && view.getUint8(2) === 0x33) {
        const version = view.getUint8(3);
        let offset = 10;
        const totalSize = ((view.getUint8(6) & 0x7F) << 21) | ((view.getUint8(7) & 0x7F) << 14) | ((view.getUint8(8) & 0x7F) << 7) | (view.getUint8(9) & 0x7F);
        const limit = Math.min(totalSize, buffer.byteLength);

        while (offset < limit - 10) {
            let frameId = "";
            let frameSize = 0;
            let headerSize = 10;

            if (version === 2) {
                frameId = String.fromCharCode(view.getUint8(offset), view.getUint8(offset+1), view.getUint8(offset+2));
                frameSize = (view.getUint8(offset+3) << 16) | (view.getUint8(offset+4) << 8) | view.getUint8(offset+5);
                headerSize = 6;
            } else {
                frameId = String.fromCharCode(view.getUint8(offset), view.getUint8(offset+1), view.getUint8(offset+2), view.getUint8(offset+3));
                frameSize = (view.getUint8(offset+4) << 24) | (view.getUint8(offset+5) << 16) | (view.getUint8(offset+6) << 8) | view.getUint8(offset+7);
            }

            if (!frameId || frameId.charCodeAt(0) === 0 || frameSize <= 0 || (offset + headerSize + frameSize) > limit) break;
            
            let dataOffset = offset + headerSize;

            try {
                if (frameId.startsWith("T") && frameId !== "TXXX") {
                    let val = readTextFrame(view, dataOffset, frameSize);
                    if (val) tags._raw[frameId] = val;
                } else if (frameId === "COMM" || frameId === "COM") {
                    let val = readCommentFrame(view, dataOffset, frameSize);
                    if (val) tags._raw[frameId] = val;
                } else if (frameId === "APIC" || frameId === "PIC") {
                    tags.base64Cover = readPictureFrame(view, dataOffset, frameSize, version);
                } else if (frameId === "USLT" || frameId === "ULT") {
                    tags.lyrics = readLyricsFrame(view, dataOffset, frameSize);
                }
            } catch(err) {
                // Previne falha crítica se um bloco de dados estiver corrompido
            }
            
            offset += headerSize + frameSize;
        }
    }

    // Leitura simplificada e estável de frames nativos de áudio
    try {
        let syncOffset = 0;
        const maxSearch = Math.min(buffer.byteLength - 4, 32000);
        while (syncOffset < maxSearch) {
            if (view.getUint8(syncOffset) === 0xFF && (view.getUint8(syncOffset + 1) & 0xE0) === 0xE0) {
                const byte2 = view.getUint8(syncOffset + 2);
                const byte3 = view.getUint8(syncOffset + 3);

                const sampleRates = [44100, 48000, 32000, 0];
                const sampleRate = sampleRates[(byte2 & 0x0C) >> 2];
                const channels = ((byte3 & 0xC0) >> 6) === 3 ? "Mono" : "Stereo";

                tags.technical.frequency = sampleRate ? `${sampleRate} Hz` : "-";
                tags.technical.channels = channels;
                tags.technical.bitrate = "MPEG Audio Layer III";
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

function readCommentFrame(view, offset, size) {
    if (size <= 5) return "";
    return decodeString(new Uint8Array(view.buffer, view.byteOffset + offset + 5, size - 5), view.getUint8(offset));
}

function readLyricsFrame(view, offset, size) {
    if (size <= 5) return "";
    return decodeString(new Uint8Array(view.buffer, view.byteOffset + offset + 5, size - 5), view.getUint8(offset));
}

function decodeString(uint8Array, encoding) {
    try {
        const cleanBytes = uint8Array.filter(b => b !== 0);
        if (encoding === 1 || encoding === 2) return new TextDecoder('utf-16').decode(cleanBytes);
        return new TextDecoder('utf-8').decode(cleanBytes);
    } catch(e) { return ""; }
}

function readPictureFrame(view, offset, size, version) {
    try {
        const end = offset + size;
        let current = offset + 1;
        let mimeType = "image/jpeg";

        if (version === 2) {
            current = offset + 5;
        } else {
            let mimeChars = [];
            while (view.getUint8(current) !== 0 && current < end) {
                mimeChars.push(String.fromCharCode(view.getUint8(current)));
                current++;
            }
            if(mimeChars.length) mimeType = mimeChars.join("");
            current += 2;
        }

        while (view.getUint8(current) !== 0 && current < end) current++;
        current++;

        if(current >= end) return "";
        const imgBytes = new Uint8Array(view.buffer, view.byteOffset + current, end - current);
        let binary = '';
        const len = imgBytes.byteLength;
        for (let i = 0; i < len; i++) binary += String.fromCharCode(imgBytes[i]);
        return `data:${mimeType};base64,${btoa(binary)}`;
    } catch(e) { return ""; }
}

function displayMainTags(tags) {
    document.getElementById("meta-container").classList.remove("field-hidden");
    const fallback = langData[currentLang].unknown;
    
    document.getElementById("val-title").innerText = tags.title || fallback;
    document.getElementById("val-artist").innerText = tags.artist || fallback;
    document.getElementById("val-album").innerText = tags.album || fallback;
    document.getElementById("val-year").innerText = tags.year || fallback;
    document.getElementById("val-genre").innerText = tags.genre || fallback;
    document.getElementById("val-track").innerText = tags.track || fallback;

    document.getElementById("val-bitrate").innerText = tags.technical.bitrate || "-";
    document.getElementById("val-frequency").innerText = tags.technical.frequency || "-";
    document.getElementById("val-channels").innerText = tags.technical.channels || "-";

    const lyricsCard = document.getElementById("lyrics-card");
    const lyricsText = document.getElementById("lyrics-text");
    if(tags.lyrics) {
        lyricsCard.classList.remove("field-hidden");
        lyricsText.innerText = tags.lyrics;
    } else {
        lyricsCard.classList.add("field-hidden");
    }

    const img = document.getElementById("cover-art");
    const def = document.getElementById("default-cover");
    if(tags.base64Cover && tags.base64Cover.length > 50) {
        img.src = tags.base64Cover;
        img.classList.remove("field-hidden");
        def.classList.add("field-hidden");
    } else {
        img.classList.add("field-hidden");
        def.classList.remove("field-hidden");
    }
}

function renderExtendedList() {
    const container = document.getElementById("extended-tags-list");
    const card = document.getElementById("extended-card");
    if (!container || !dynamicDiscoveredTags._raw) return;
    
    container.innerHTML = "";
    const raw = dynamicDiscoveredTags._raw;
    const keys = Object.keys(raw);

    if (keys.length === 0) {
        card.classList.add("field-hidden");
        return;
    }
    card.classList.remove("field-hidden");

    keys.forEach(key => {
        const valueText = raw[key];
        if(valueText && valueText.trim() !== "") {
            const item = document.createElement("div");
            item.className = "extended-item";
            item.innerHTML = `<span class="extended-key">${key}</span><span class="extended-val">${valueText}</span>`;
            container.appendChild(item);
        }
    });
}

updateLanguage("pt");
