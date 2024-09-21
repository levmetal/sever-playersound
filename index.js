import express from 'express';
import axios from 'axios';
import path from 'path';  // Para manejar rutas de archivos
const port = 3000;
const app = express();

// Ruta para servir archivos estáticos (HTML, CSS, JS, etc.)
const __dirname = path.resolve();  // Obtener el directorio actual (compatible con ES Modules)
app.use(express.static(path.join(__dirname, 'public')));  // Servir la carpeta 'public'

// Ruta para obtener el audio desde inv.nadeko.net
app.get('/audio', async (req, res) => {
  const videoId = req.query.id;

  if (!videoId) {
      return res.status(400).send('Missing video ID');
  }

  try {
      const baseUrl = `https://inv.nadeko.net/latest_version?id=${videoId}&itag=18&local=true`;

      const response = await axios.get(baseUrl, {
          maxRedirects: 0,
          validateStatus: function (status) {
              return status >= 300 && status < 400;  // Solo redirecciones
          }
      });

      // Obtener la URL de redirección
      const relativeUrl = response.headers.location;
      const finalUrl = `https://inv.nadeko.net${relativeUrl}`;  // Agregar el dominio

      res.json({ audioUrl: finalUrl });

  } catch (error) {
      console.error('Error al obtener la URL de redirección:', error);
      res.status(500).send('Error al obtener la URL de redirección');
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});