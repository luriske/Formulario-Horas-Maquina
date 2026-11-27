const columnas = ['FECHA', 'HORA ENTRADA', 'HORA SALIDA', 'CODIGO MAQUINA', 'OPERADOR',
  'CODIGO SECTOR', 'SECTOR', 'TRABAJOS REALIZADOS', 'TIPO DE TRABAJO', 'CODIGO TRABAJO',
  'HORA INICIAL', 'HORA FINAL', 'HORAS MAQUINA', 'BOLETA Nº', 'ID', 'REVISION', 'DESTINO'];

function doPost(e) {
  const responder = datos => ContentService.createTextOutput(JSON.stringify(datos))
    .setMimeType(ContentService.MimeType.JSON);
  try {
    const propiedades = PropertiesService.getScriptProperties();
    const secreto = propiedades.getProperty('PARTES_SCRIPT_TOKEN');
    const { token, parte } = JSON.parse(e.postData.contents);
    if (!secreto || token !== secreto) return responder({ error: 'Acceso no autorizado' });
    if (!parte || !/^[0-9a-f-]{36}$/i.test(parte.id) || !/^\d{1,24}$/.test(parte.boleta) ||
        !Number.isSafeInteger(parte.revision) || parte.revision < 1 ||
        !Number.isFinite(parte.hora_inicial) || !Number.isFinite(parte.hora_final) ||
        parte.hora_inicial < 0 || parte.hora_final < parte.hora_inicial) {
      return responder({ error: 'Parte inválido' });
    }
    const bloqueo = LockService.getScriptLock();
    bloqueo.waitLock(8000);
    try {
      const archivo = SpreadsheetApp.openById(propiedades.getProperty('PARTES_SHEET_ID'));
      const hoja = archivo.getSheetByName('PARTES_DIARIOS') || archivo.insertSheet('PARTES_DIARIOS');
      if (!hoja.getLastRow()) {
        hoja.appendRow(columnas);
        hoja.setFrozenRows(1);
      }
      const encabezado = hoja.getRange(1, 1, 1, columnas.length).getValues()[0];
      if (!encabezado.at(-1) && encabezado.slice(0, -1).join('|') === columnas.slice(0, -1).join('|')) {
        hoja.getRange(1, columnas.length).setValue('DESTINO');
      }
      if (hoja.getRange(1, 1, 1, columnas.length).getValues()[0].join('|') !== columnas.join('|')) {
        return responder({ error: 'Encabezados incompatibles' });
      }
      const cantidad = hoja.getLastRow() - 1;
      const claves = cantidad ? hoja.getRange(2, 14, cantidad, 3).getDisplayValues() : [];
      const indice = claves.findIndex(fila => fila[1] === parte.id);
      if (indice >= 0 && Number(claves[indice][2]) >= parte.revision) return responder({ id: parte.id });
      const destinos = ["Caldera","Logística y Recepción","Embarque de Harina"];
      if (parte.destino && !destinos.includes(parte.destino)) return responder({ error: 'Destino inválido' });
      const numero = String(parte.boleta).replace(/^0+(?=\d)/, '');
      if (claves.some((fila, posicion) => posicion !== indice &&
          fila[0].replace(/^0+(?=\d)/, '') === numero)) {
        return responder({ error: 'Boleta duplicada' });
      }
      const texto = valor => String(valor ?? '').replace(/^[=+\-@]/, inicio => "'" + inicio);
      const fila = indice < 0 ? hoja.getLastRow() + 1 : indice + 2;
      hoja.getRange(fila, 14).setNumberFormat('@');
      hoja.getRange(fila, 1, 1, columnas.length).setValues([[
        texto(parte.fecha), texto(parte.hora_entrada), texto(parte.hora_salida),
        texto(parte.codigo_maquina), texto(parte.operador), texto(parte.codigo_sector),
        texto(parte.sector_nombre), texto(parte.descripcion_trabajo), texto(parte.tipo_trabajo),
        texto(parte.codigo_trabajo), parte.hora_inicial, parte.hora_final,
        Math.round((parte.hora_final - parte.hora_inicial) * 10) / 10,
        texto(parte.boleta), parte.id, parte.revision, texto(parte.destino)
      ]]);
      SpreadsheetApp.flush();
      return responder({ id: parte.id });
    } finally {
      bloqueo.releaseLock();
    }
  } catch {
    return responder({ error: 'No se pudo guardar en la planilla' });
  }
}
