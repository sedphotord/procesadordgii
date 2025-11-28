// procesar.js
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const inputFile = 'DGII.txt'; // Asegúrate que tu archivo se llame así
const outputDir = path.join(__dirname, 'dist', 'data');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const dataChunks = {};
const formatRNC = (rnc) => rnc; // Simplificado, ya que los datos de entrada parecen limpios

const processFile = async () => {
  console.log('Iniciando el procesamiento del archivo. Esto puede tardar unos minutos...');
  const fileStream = fs.createReadStream(inputFile, { encoding: 'latin1' }); // Usar latin1 por si hay caracteres especiales
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineCount = 0;
  for await (const line of rl) {
    lineCount++;
    if (lineCount % 100000 === 0) console.log(`Procesando línea: ${lineCount}`);
    
    const parts = line.split('|');
    if (parts.length < 11 || !/^\d{9}$/.test(parts[0].trim())) continue;

    const rnc = parts[0].trim();
    const fileKey = rnc.substring(0, 3);
    if (!dataChunks[fileKey]) dataChunks[fileKey] = {};
    
    dataChunks[fileKey][rnc] = {
        rnc: `${rnc.substring(0, 3)}-${rnc.substring(3, 8)}-${rnc.substring(8)}`,
        razonSocial: parts[1].trim() || 'N/A',
        nombreComercial: parts[2].trim() || 'N/A',
        actividadEconomica: parts[3].trim() || 'N/A',
        fechaConstitucion: parts[8].trim() || 'N/A',
        estado: parts[9].trim().toUpperCase() === 'SUSPENDIDO' ? 'Inactivo' : 'Activo',
        regimenPagos: parts[10].trim().toUpperCase() === 'NORMAL' ? 'RÉGIMEN ORDINARIO' : 'N/A',
    };
  }

  console.log('Procesamiento de líneas completado. Escribiendo archivos JSON...');
  const keys = Object.keys(dataChunks);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    fs.writeFileSync(path.join(outputDir, `${key}.json`), JSON.stringify(dataChunks[key]));
    if ((i + 1) % 100 === 0) console.log(`Escribiendo archivo ${i + 1} de ${keys.length}`);
  }
  console.log(`¡Éxito! Se crearon ${keys.length} archivos JSON en la carpeta 'dist/data'.`);
};

processFile().catch(console.error);