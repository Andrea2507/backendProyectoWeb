const fs = require('fs')
const path = require('path')
const sequelize = require('../config/db')

exports.generarBackup = async (req, res) => {
  try {
    const fecha = new Date()
    const nombreArchivo = `backup_${fecha.toISOString().replace(/[:.]/g, '-')}.sql`
    const carpeta = path.join(__dirname, '../backups')
    const rutaArchivo = path.join(carpeta, nombreArchivo)

    if (!fs.existsSync(carpeta)) fs.mkdirSync(carpeta)

    let contenido = ''
    const [tablas] = await sequelize.query("SHOW TABLES")

    for (const fila of tablas) {
      const nombreTabla = Object.values(fila)[0]

      const [[create]] = await sequelize.query(`SHOW CREATE TABLE \`${nombreTabla}\``)
      contenido += `DROP TABLE IF EXISTS \`${nombreTabla}\`;\n`
      contenido += create['Create Table'] + ';\n\n'

      const [rows] = await sequelize.query(`SELECT * FROM \`${nombreTabla}\``)

      for (const row of rows) {
        const columnas = Object.keys(row).map(c => `\`${c}\``).join(',')
        const valores = Object.values(row)
          .map(v => v === null ? 'NULL' : `'${v.toString().replace(/'/g, "''")}'`)
          .join(',')

        contenido += `INSERT INTO \`${nombreTabla}\` (${columnas}) VALUES (${valores});\n`
      }

      contenido += '\n\n'
    }

    fs.writeFileSync(rutaArchivo, contenido)

    res.json({
      ok: true,
      message: 'Backup creado',
      archivo: nombreArchivo
    })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
}
