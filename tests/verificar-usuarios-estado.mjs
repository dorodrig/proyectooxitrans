#!/usr/bin/env node

/**
 * 🔍 VERIFICADOR DE ESTADO DE USUARIOS
 * ====================================
 * Verifica si los usuarios simulados aún existen después del cleanup
 * y diagnostica problemas de login
 */

console.log('🔍 VERIFICADOR DE ESTADO DE USUARIOS');
console.log('====================================');

const API_BASE = 'http://localhost:3001';

// Lista de usuarios que deberían existir
const usuariosEsperados = [
    'carlos.rodriguez@oxitrans.com',
    'maria.lopez@oxitrans.com', 
    'juan.martinez@oxitrans.com',
    'ana.garcia@oxitrans.com',
    'diego.ruiz@oxitrans.com'
];

async function verificarUsuarios() {
    try {
        console.log('📋 Verificando usuarios en API...');
        
        const response = await fetch(`${API_BASE}/api/usuarios`);
        
        if (!response.ok) {
            console.log(`❌ Error HTTP: ${response.status} ${response.statusText}`);
            return;
        }
        
        const usuarios = await response.json();
        console.log(`✅ API respondió correctamente`);
        console.log(`📊 Total usuarios en base: ${usuarios.length}`);
        
        if (usuarios.length === 0) {
            console.log('⚠️ NO HAY USUARIOS EN LA BASE DE DATOS');
            console.log('💡 Necesitas recrear los usuarios de simulación');
            return;
        }
        
        console.log('\n👥 USUARIOS ENCONTRADOS:');
        console.log('─'.repeat(60));
        
        usuarios.forEach((usuario, index) => {
            const esSimulado = usuariosEsperados.includes(usuario.email);
            console.log(`${index + 1}. ${usuario.nombre_completo}`);
            console.log(`   📧 Email: ${usuario.email}`);
            console.log(`   🏢 Regional: ${usuario.regional || 'Sin asignar'}`);
            console.log(`   🎯 Simulado: ${esSimulado ? '✅ SÍ' : '❌ NO'}`);
            console.log('');
        });
        
        // Verificar usuarios de simulación específicos
        const usuariosSimulados = usuarios.filter(u => usuariosEsperados.includes(u.email));
        console.log(`🎯 Usuarios de simulación encontrados: ${usuariosSimulados.length}/5`);
        
        if (usuariosSimulados.length < 5) {
            console.log('⚠️ FALTAN USUARIOS DE SIMULACIÓN');
            console.log('💡 Ejecuta el script de creación de usuarios');
        }
        
        return usuarios;
        
    } catch (error) {
        console.log('❌ Error al verificar usuarios:', error.message);
        console.log('💡 Verifica que el servidor esté ejecutándose en puerto 3000');
    }
}

async function testearLogin() {
    console.log('\n🔐 TESTEANDO LOGIN CON PASSWORD TEMPORAL');
    console.log('─'.repeat(60));
    
    const passwordTemporal = 'temporal123';
    const emailTest = 'carlos.rodriguez@oxitrans.com';
    
    try {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: emailTest,
                password: passwordTemporal
            })
        });
        
        const result = await response.json();
        
        console.log(`📧 Testeando: ${emailTest}`);
        console.log(`🔑 Password: ${passwordTemporal}`);
        console.log(`📊 Status: ${response.status}`);
        
        if (response.ok) {
            console.log('✅ LOGIN EXITOSO');
            console.log('🎯 Los usuarios están correctamente configurados');
        } else {
            console.log('❌ LOGIN FALLÓ');
            console.log('📋 Respuesta:', result.message || result.error || 'Error desconocido');
            console.log('💡 Posibles causas:');
            console.log('   • Password incorrecto');
            console.log('   • Usuario no existe');
            console.log('   • Usuario deshabilitado');
        }
        
    } catch (error) {
        console.log('❌ Error en login test:', error.message);
    }
}

async function main() {
    const usuarios = await verificarUsuarios();
    
    if (usuarios && usuarios.length > 0) {
        await testearLogin();
    }
    
    console.log('\n🎯 RECOMENDACIONES:');
    console.log('─'.repeat(60));
    console.log('1. Si no hay usuarios: Ejecuta crear-usuarios-solo.mjs');
    console.log('2. Si hay usuarios pero login falla: Ejecuta asignar-passwords-usuarios.mjs');
    console.log('3. Si todo está bien: El problema puede ser del servidor');
}

main().catch(console.error);