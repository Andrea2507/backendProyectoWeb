const BackupLog = require('../models/backuplog.model')
const sequelize = require('../db/db')
const { registrarLog } = require('../middlewares/log.middleware')

exports.generarBackup = async (req, res) => {
  try {
    const tipo = 'COMPLETO'
    const fecha = new Date()

    const [tablas] = await sequelize.query("SHOW TABLES")
    const col = Object.keys(tablas[0])[0]

    let contenidoSQL = ''

    for (const t of tablas) {
      const tableName = t[col]

      const [create] = await sequelize.query(`SHOW CREATE TABLE \`${tableName}\``)
      contenidoSQL += `\n\n-- ESTRUCTURA: ${tableName}\n${create[0]['Create Table']};\n`

      const [rows] = await sequelize.query(`SELECT * FROM \`${tableName}\``)
      if (rows.length > 0) {
        contenidoSQL += `\n-- DATOS: ${tableName}\nINSERT INTO \`${tableName}\` VALUES\n`

        rows.forEach((row, i) => {
          const valores = Object.values(row).map(v =>
            v === null ? 'NULL' : `'${v.toString().replace(/'/g, "\\'")}'`
          ).join(',')

          contenidoSQL += `(${valores})${i < rows.length - 1 ? ',' : ';'}\n`
        })
      }
    }

    const tamanoMB = Buffer.byteLength(contenidoSQL, 'utf8') / 1024 / 1024

    await sequelize.query(
      "INSERT INTO backups (contenido, tamanoMB) VALUES (?, ?)",
      { replacements: [contenidoSQL, tamanoMB] }
    )

    await BackupLog.create({
      tipo,
      tamanoMB,
      ok: 1,
      detalle: 'Backup almacenado en tabla backups',
      ubicacion: 'DB backups'
    })

    await registrarLog(req.user?.id, 'Backup', null, 'CREAR', null, { tamanoMB })

    res.json({
      message: 'Backup generado correctamente',
      tamanoMB
    })

  } catch (e) {
    await BackupLog.create({
      tipo: 'COMPLETO',
      ok: 0,
      detalle: e.message,
      ubicacion: null
    })

    res.status(500).json({ message: 'Error al generar backup', error: e.message })
  }
}
