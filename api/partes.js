module.exports = async function (req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método inválido' });
  const { PARTES_SCRIPT_URL, PARTES_SCRIPT_TOKEN, PARTES_ACCESS_TOKEN } = process.env;
  if (!PARTES_SCRIPT_URL || !PARTES_SCRIPT_TOKEN || !PARTES_ACCESS_TOKEN) {
    return res.status(503).json({ error: 'Sincronización sin configurar' });
  }
  if (req.headers.authorization !== 'Bearer ' + PARTES_ACCESS_TOKEN) {
    return res.status(401).json({ error: 'Acceso no autorizado' });
  }
  if (typeof req.body?.id !== 'string') return res.status(400).json({ error: 'Parte inválido' });
  try {
    const respuesta = await fetch(PARTES_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ token: PARTES_SCRIPT_TOKEN, parte: req.body }),
      signal: AbortSignal.timeout(12000)
    });
    const confirmacion = await respuesta.json();
    if (!respuesta.ok || confirmacion.id !== req.body?.id) {
      return res.status(502).json({ error: 'La planilla no confirmó el registro' });
    }
    return res.status(200).json(confirmacion);
  } catch {
    return res.status(502).json({ error: 'No se pudo contactar la planilla' });
  }
};
