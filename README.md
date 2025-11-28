# API de consultas RNC

Pequeña API Express para consultar RNCs usando los JSON generados por `procesar.js`.

Instalación y ejecución (Windows PowerShell):

```powershell
# instalar dependencias
npm install

# iniciar el servidor (escucha en puerto 3000)
npm start
```

Rutas principales:
- GET /api/rnc/:rnc  -> búsqueda exacta
- GET /api/search?query=texto&limit=20 -> búsqueda parcial
 - POST /api/bulk { rncs: ["123456789", ...] } -> (removido) consulta por lotes

Interfaz web para pruebas locales:
- Accede a http://localhost:3000/ui en el navegador después de iniciar el servidor. La UI ahora ofrece UNA búsqueda unificada donde puedes buscar por RNC o por nombre. Si escribes un RNC (9 dígitos) la UI hace búsqueda exacta; si escribes texto la UI buscará por nombre y mostrará TODA la información de cada registro directamente en la página (sin scroll interno por ficha).

Interfaz reintentos y estado
- La UI incluye ahora un indicador de estado y un botón "Comprobar" en la cabecera. La UI hace comprobaciones automáticas de salud cada pocos segundos y aplica backoff exponencial si el servidor no responde.

Nota: La API espera encontrar los archivos JSON en `dist/sitio-para-netlify/data/*.json` (esto está producido por `procesar.js`). Si no existen, ejecuta `node procesar.js` para generarlos (tarda, ya que el archivo DGII es grande).
