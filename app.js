const langData = {
    pt: {
        drop: "Arraste seu MP3 aqui ou clique para buscar",
        metaTitle: "Metadados Extraídos",
        title: "Título", artist: "Artista", album: "Álbum",
        year: "Ano", genre: "Gênero", track: "Faixa",
        unknown: "Desconhecido"
    },
    en: {
        drop: "Drag your MP3 here or click to browse",
        metaTitle: "Extracted Metadata",
        title: "Title", artist: "Artist", album: "Album",
        year: "Year", genre: "Genre", track: "Track",
        unknown: "Unknown"
    }
};

let currentLang = "pt";

const txtDrop = document.getElementById("txt-drop");
const txtMetaTitle = document.getElementById("txt-meta-title");
const lblTitle = document.getElementById("lbl-title");
const lblArtist = document.getElementById("lbl-artist");
const lblAlbum = document.getElementById("lbl-album");
const lblYear = document.getElementById("lbl-year");
const lblGenre = document.getElementById("lbl-genre");
const lblTrack = document.getElementById("lbl-track");

function updateLanguage(lang) {
    currentLang = lang;
    document.getElementById("btn-pt").classList.toggle("active", lang === "pt");
    document.getElementById("btn-en").classList.toggle("active", lang === "en");
    
    txtDrop.innerText = langData[lang].drop;
    txtMetaTitle.innerText = langData[lang].metaTitle;
    lblTitle.innerText = langData[lang].title;
    lblArtist.innerText = langData[lang].artist;
    lblAlbum.innerText = langData[lang].album;
    lblYear.innerText = langData[lang].year;
    lblGenre.innerText = langData[lang].genre;
    lblTrack.innerText = langData[lang].track;
}

document.getElementById("btn-pt").addEventListener("click", () => updateLanguage("pt"));
document.getElementById("btn-en").addEventListener("click", () => updateLanguage("en"));

// Elementos Upload e Dom
const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");

dropZone.addEventListener("click", () => fileInput.click());
dropZone.addEventListener("dragover", (e) => { e.preventDefault(); dropZone.style.borderColor = "var(--accent)"; });
dropZone.addEventListener("dragleave", () => dropZone.style.borderColor = "var(--border)");
dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.style.borderColor = "var(--border)";
    if(e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
});
fileInput.addEventListener("change", (e) => {
    if(e.target.files.length) handleFile(e.target.files[0]);
});

function handleFile(file) {
    if (file.type !== "audio/mpeg" && !file.name.endsWith(".mp3")) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const buffer = e.target.result;
        const tags = parseID3(buffer);
        displayTags(tags);
        window.initPlayer(file, tags);
    };
    reader.readAsArrayBuffer(file);
}

// Parser ID3v2 integrado nativo
function parseID3(buffer) {
    const view = new DataView(buffer);
    const tags = { title: "", artist: "", album: "", year: "", genre: "", track: "", base64Cover: "" };
    
    if (view.getUint8(0) !== 0x49 || view.getUint8(1) !== 0x44 || view.getUint8(2) !== 0x33) return tags;
    
    let offset = 10;
    const totalSize = ((view.getUint8(6) & 0x7F) << 21) | ((view.getUint8(7) & 0x7F) << 14) | ((view.getUint8(8) & 0x7F) << 7) | (view.getUint8(9) & 0x7F);

    while (offset < totalSize) {
        let frameId = String.fromCharCode(view.getUint8(offset), view.getUint8(offset+1), view.getUint8(offset+2), view.getUint8(offset+3));
        if (frameId.charCodeAt(0) === 0) break;
        
        let frameSize = (view.getUint8(offset+4) << 24) | (view.getUint8(offset+5) << 16) | (view.getUint8(offset+6) << 8) | view.getUint8(offset+7);
        let nextOffset = offset + 10 + frameSize;
        
        if (frameId === "TIT2") tags.title = readTextFrame(view, offset + 10, frameSize);
        else if (frameId === "TPE1") tags.artist = readTextFrame(view, offset + 10, frameSize);
        else if (frameId === "TALB") tags.album = readTextFrame(view, offset + 10, frameSize);
        else if (frameId === "TYER") tags.year = readTextFrame(view, offset + 10, frameSize);
        else if (frameId === "TCON") tags.genre = readTextFrame(view, offset + 10, frameSize);
        else if (frameId === "TRCK") tags.track = readTextFrame(view, offset + 10, frameSize);
        else if (frameId === "APIC") tags.base64Cover = readPictureFrame(view, offset + 10, frameSize);
        
        offset = nextOffset;
    }
    return tags;
}

function readTextFrame(view, offset, size) {
    const encoding = view.getUint8(offset);
    const bytes = new Uint8Array(view.buffer, offset + 1, size - 1);
    return decodeString(bytes, encoding).replace(/\0/g, '').trim();
}

function decodeString(bytes, encoding) {
    if (encoding === 1 || encoding === 2) return new TextDecoder('utf-16').decode(bytes);
    return new TextDecoder('utf-8').decode(bytes);
}

function readPictureFrame(view, offset, size) {
    const end = offset + size;
    let current = offset + 1; 
    while (view.getUint8(current) !== 0 && current < end) current++;
    let mimeType = "";
    for (let i = offset + 1; i < current; i++) mimeType += String.fromCharCode(view.getUint8(i));
    current += 2; 
    while (view.getUint8(current) !== 0 && current < end) current++;
    current++; 
    const imgBytes = new Uint8Array(view.buffer, current, end - current);
    let binary = '';
    for (let i = 0; i < imgBytes.byteLength; i++) binary += String.fromCharCode(imgBytes[i]);
    return `data:${mimeType};base64,${btoa(binary)}`;
}

function displayTags(tags) {
    document.getElementById("meta-container").classList.remove("field-hidden");
    const fallback = langData[currentLang].unknown;
    
    document.getElementById("val-title").innerText = tags.title || fallback;
    document.getElementById("val-artist").innerText = tags.artist || fallback;
    document.getElementById("val-album").innerText = tags.album || fallback;
    document.getElementById("val-year").innerText = tags.year || fallback;
    document.getElementById("val-genre").innerText = tags.genre || fallback;
    document.getElementById("val-track").innerText = tags.track || fallback;

    const img = document.getElementById("cover-art");
    const def = document.getElementById("default-cover");
    if(tags.base64Cover && tags.base64Cover.length > 30) {
        img.src = tags.base64Cover;
        img.classList.remove("field-hidden");
        def.classList.add("field-hidden");
    } else {
        img.classList.add("field-hidden");
        def.classList.remove("field-hidden");
    }
}
