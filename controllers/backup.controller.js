const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const BackupLog = require('../models/backuplog.model');
const { registrarLog } = require('../middlewares/log.middleware');

function getDumpCommand(ruta) {
  const host = process.env.HOST;
  const port = process.env.PORT_SQL;
  const user = process.env.USER;
  const pass = process.env.PASS;
  const db   = process.env.NAME;

  if (process.platform === 'win32') {
    return `"C:\\laragon\\bin\\mysql\\mysql-8.4.3-winx64\\bin\\mysqldump.exe" -h ${host} -P ${port} -u ${user} -p${pass} ${db} > "${ruta}"`;
  }

  return `mysqldump -h ${host} -P ${port} -u ${user} -p${pass} ${db} > "${ruta}"`;
}

exports.generarBackup = async (req, res) => {
  try {
    const fecha = new Date();
    const nombre = `backup_${fecha.toISOString().replace(/[:.]/g, '-')}.sql`;
    const rutaCarpeta = path.join(__dirname, '../backups');
    const rutaArchivo = path.join(rutaCarpeta, nombre);

    if (!fs.existsSync(rutaCarpeta)) fs.mkdirSync(rutaCarpeta);

    const comando = getDumpCommand(rutaArchivo);

    exec(comando, async (error) => {
      if (error) {
        return res.status(500).json({ message: 'Error al generar backup', error: error.message });
      }

      const tamanoMB = (fs.statSync(rutaArchivo).size / 1024 / 1024).toFixed(2);

      await BackupLog.create({ tipo: 'COMPLETO', tamanoMB, ok: 1, ubicacion: rutaArchivo });

      await registrarLog(req.user?.id, 'Backup', null, 'CREAR', null, { archivo: nombre, tamanoMB });

      res.json({ message: 'Backup generado correctamente', archivo: nombre, tamanoMB });
    });
  } catch (e) {
    res.status(500).json({ message: 'Error interno al generar backup', error: e.message });
  }
};
