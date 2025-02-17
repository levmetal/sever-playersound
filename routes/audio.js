import express from 'express';
import ytdl from '@distube/ytdl-core';

const router = express.Router();

const audioURLCache = new Map();
const CACHE_EXPIRY_SECONDS = 3600;

//  Implementar Función de Reintento con Retroceso Exponencial
async function fetchAudioInfoWithRetry(videoUrl, maxRetries = 3, delay = 1000) { // delay en milisegundos
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Obteniendo ytdl.getInfo (intento ${attempt + 1}) para la URL: ${videoUrl}`); // Log de reintentos en producción
            const info = await ytdl.getInfo(videoUrl);
            return info; // ¡Éxito! Devolver info
        } catch (error) {
            if (error.statusCode === 429) {
                const waitTime = delay * Math.pow(2, attempt); // Retroceso Exponencial
                console.warn(`YouTube ha limitado la frecuencia. Reintentando en ${waitTime / 1000} segundos... (intento ${attempt + 1}/${maxRetries})`); // Log de rate limits en producción
                await new Promise(resolve => setTimeout(resolve, waitTime)); // Esperar antes de reintentar
            } else {
                console.error(`Error al obtener ytdl.getInfo (no 429) en el intento ${attempt + 1}:`, error.message); // Log de errores no-429
                throw error; // Volver a lanzar errores no-429 para que sean manejados por el try-catch principal
            }
        }
    }
    throw new Error("maximo de reintentos alcanzado. No se pudo obtener la información de audio debido a la limitación de frecuencia u otros errores."); // Lanzar error si todos los reintentos fallan
}


router.get('/', async (req, res) => {
    const videoId = req.query.id;

    if (!videoId) {
        return res.status(400).send('ID de video faltante');
    }

    const cachedData = audioURLCache.get(videoId);
    if (cachedData && cachedData.expiry > Date.now()) {
        console.log(`Éxito de cache para el ID de video: ${videoId}`);
        return res.json({ audioUrl: cachedData.audioUrl });
    }

    try {
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        // Usar la Función de Reintento para ytdl.getInfo**
        const info = await fetchAudioInfoWithRetry(videoUrl); // Envolver ytdl.getInfo en la función de reintento
        const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');

        if (!audioFormats.length) {
            return res.status(404).send('No se encontraron formatos de audio para este video.');
        }

        const bestAudioFormat = audioFormats.sort((a, b) => {
            const aBitrate = a.audioBitrate || 0;
            const bBitrate = b.audioBitrate || 0;
            return bBitrate - aBitrate;
        })[0];

        if (!bestAudioFormat || !bestAudioFormat.url) {
            return res.status(500).send('No se pudo obtener la URL del stream de audio.');
        }

        const audioURL = bestAudioFormat.url;

        audioURLCache.set(videoId, {
            audioUrl: audioURL,
            expiry: Date.now() + CACHE_EXPIRY_SECONDS * 1000
        });
        console.log(`Fallo de caché para el ID de video: ${videoId}, guardando en caché por ${CACHE_EXPIRY_SECONDS} segundos`);

        res.json({ audioUrl: audioURL });

    } catch (error) {
        console.error(`Error al obtener la URL de redirección para el ID de video ${videoId}:`, error.message);
        res.status(500).send('Error al obtener la URL de redirección');
    }
});

export default router;