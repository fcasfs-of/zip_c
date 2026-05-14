(function() {
    const btnDownload = document.getElementById("btn-download-meta");

    if (btnDownload) {
        btnDownload.addEventListener("click", () => {
            // Verifica se existem metadados carregados no escopo do app.js
            if (!window.dynamicDiscoveredTags || Object.keys(window.dynamicDiscoveredTags).length === 0) return;
            
            const tags = window.dynamicDiscoveredTags;
            const currentLang = window.currentLang || "pt";
            
            // Define o nome base do arquivo de saída
            const baseFileName = tags.title ? `${tags.title} - ${tags.artist || 'Meta'}` : "audio_metadata";
            
            // 1. GERAÇÃO E DOWNLOAD DO ARQUIVO DE TEXTO (.TXT)
            let txtContent = "";
            if (currentLang === "pt") {
                txtContent += "=========================================\n";
                txtContent += "    METADADOS E INFORMAÇÕES DO ÁUDIO     \n";
                txtContent += "=========================================\n\n";
                txtContent += `Título:       ${tags.title || 'Desconhecido'}\n`;
                txtContent += `Artista:      ${tags.artist || 'Desconhecido'}\n`;
                txtContent += `Álbum:        ${tags.album || 'Desconhecido'}\n`;
                txtContent += `Ano:          ${tags.year || 'Desconhecido'}\n`;
                txtContent += `Gênero:       ${tags.genre || 'Desconhecido'}\n`;
                txtContent += `Faixa:        ${tags.track || 'Desconhecido'}\n\n`;
                txtContent += "--- PROPRIEDADES TÉCNICAS ---\n";
                txtContent += `Taxa de Bits: ${tags.technical.bitrate || '-'}\n`;
                txtContent += `Frequência:   ${tags.technical.frequency || '-'}\n`;
                txtContent += `Canais:       ${tags.technical.channels || '-'}\n\n`;
                if (tags.lyrics) {
                    txtContent += "--- LETRA DA MÚSICA ---\n";
                    txtContent += tags.lyrics + "\n";
                }
            } else {
                txtContent += "=========================================\n";
                txtContent += "    AUDIO METADATA AND INFORMATION       \n";
                txtContent += "=========================================\n\n";
                txtContent += `Title:        ${tags.title || 'Unknown'}\n`;
                txtContent += `Artist:       ${tags.artist || 'Unknown'}\n`;
                txtContent += `Album:        ${tags.album || 'Unknown'}\n`;
                txtContent += `Year:         ${tags.year || 'Unknown'}\n`;
                txtContent += `Genre:        ${tags.genre || 'Unknown'}\n`;
                txtContent += `Track:        ${tags.track || 'Unknown'}\n\n`;
                txtContent += "--- TECHNICAL PROPERTIES ---\n";
                txtContent += `Bitrate:      ${tags.technical.bitrate || '-'}\n`;
                txtContent += `Frequency:    ${tags.technical.frequency || '-'}\n`;
                txtContent += `Channels:     ${tags.technical.channels || '-'}\n\n`;
                if (tags.lyrics) {
                    txtContent += "--- LYRICS ---\n";
                    txtContent += tags.lyrics + "\n";
                }
            }

            // Dispara download do arquivo .txt criando um link temporário na memória
            const txtBlob = new Blob([txtContent], { type: "text/plain;charset=utf-8" });
            const txtUrl = URL.createObjectURL(txtBlob);
            const aTxt = document.createElement("a");
            aTxt.href = txtUrl;
            aTxt.download = `${baseFileName}.txt`;
            document.body.appendChild(aTxt);
            aTxt.click();
            document.body.removeChild(aTxt);
            URL.revokeObjectURL(txtUrl);

            // 2. EXTRAÇÃO E DOWNLOAD DA CAPA DO ÁLBUM
            if (tags.base64Cover && tags.base64Cover.length > 50) {
                // Descobre a extensão do arquivo a partir da string Data URI (PNG ou JPEG)
                let extension = "jpg";
                if (tags.base64Cover.includes("image/png")) extension = "png";
                if (tags.base64Cover.includes("image/gif")) extension = "gif";

                const aImg = document.createElement("a");
                aImg.href = tags.base64Cover;
                aImg.download = `${baseFileName}.${extension}`;
                document.body.appendChild(aImg);
                aImg.click();
                document.body.removeChild(aImg);
            }
        });
    }
})();
