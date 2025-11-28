const { findByRnc } = require('../src/dataLoader');

(async function(){
  const rnc = '100022768';
  console.log('Buscando RNC', rnc);
  const res = await findByRnc(rnc);
  console.log('Resultado:', res);
})();
