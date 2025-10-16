// Verificar usuarios disponibles para ajustar el script de simulación
import mysql from 'mysql2/promise';

const config = {
    host: 'database-oxitrans.cjokqqsqayan.us-east-2.rds.amazonaws.com',
    // port: 31852,
    user: 'admin',
    password: 'oxitrans06092025*',
    database: 'control_acceso_oxitrans',
    timezone: 'Z'
};

async function verificarUsuarios() {
    let connection;
    
    try {
        console.log('🔍 Conectando a la base de datos...');
        connection = await mysql.createConnection(config);
        
        // Verificar usuarios activos disponibles
        console.log('\n📋 USUARIOS ACTIVOS DISPONIBLES:');
        console.log('=' .repeat(80));
        
        const [usuarios] = await connection.execute(`
            SELECT 
                id,
                nombre,
                apellido,
                email,
                rol,
                departamento
            FROM usuarios 
            ORDER BY id
        `);
        
        if (usuarios.length === 0) {
            console.log('❌ No se encontraron usuarios');
            return;
        }
        
        console.log(`Total usuarios disponibles: ${usuarios.length}\n`);
        
        usuarios.forEach((usuario, index) => {
            console.log(`${index + 1}. ID: ${usuario.id}`);
            console.log(`   👤 Nombre: ${usuario.nombre} ${usuario.apellido}`);
            console.log(`   📧 Email: ${usuario.email}`);
            console.log(`   🎯 Rol: ${usuario.rol}`);
            console.log(`   🏢 Departamento: ${usuario.departamento || 'No asignado'}`);
            console.log('   ' + '-'.repeat(50));
        });
        
        // Verificar si ya existen jornadas para estos usuarios
        console.log('\n📊 JORNADAS EXISTENTES POR USUARIO:');
        console.log('=' .repeat(80));
        
        const [jornadas] = await connection.execute(`
            SELECT 
                u.id,
                u.nombre,
                u.apellido,
                COUNT(j.id) as total_jornadas,
                MIN(j.fecha) as primera_jornada,
                MAX(j.fecha) as ultima_jornada
            FROM usuarios u
            LEFT JOIN jornadas_laborales j ON u.id = j.usuario_id
            GROUP BY u.id, u.nombre, u.apellido
            ORDER BY total_jornadas DESC, u.id
        `);
        
        jornadas.forEach((jornada, index) => {
            console.log(`${index + 1}. ID: ${jornada.id} - ${jornada.nombre} ${jornada.apellido}`);
            console.log(`   📋 Jornadas registradas: ${jornada.total_jornadas}`);
            if (jornada.total_jornadas > 0) {
                console.log(`   📅 Primera: ${jornada.primera_jornada}`);
                console.log(`   📅 Última: ${jornada.ultima_jornada}`);
            }
            console.log('   ' + '-'.repeat(50));
        });
        
        // Generar recomendaciones para el script
        console.log('\n💡 RECOMENDACIONES PARA EL SCRIPT:');
        console.log('=' .repeat(80));
        
        const usuariosParaScript = usuarios.slice(0, 5); // Tomar los primeros 5
        
        console.log('✅ Usuarios recomendados para la simulación:');
        usuariosParaScript.forEach((usuario, index) => {
            console.log(`   ${index + 1}. ID: ${usuario.id} - ${usuario.nombre} ${usuario.apellido} (${usuario.departamento || 'Sin departamento'})`);
        });
        
        console.log('\n📝 IDs a usar en el script:');
        const ids = usuariosParaScript.map(u => u.id).join(', ');
        console.log(`   [${ids}]`);
        
        console.log('\n🔧 Verificar en el script que uses estos IDs exactos');
        console.log('   Reemplaza los IDs 2, 3, 4, 5, 6 por los IDs disponibles arriba');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n✅ Conexión cerrada');
        }
    }
}

// Ejecutar verificación
verificarUsuarios().catch(console.error);