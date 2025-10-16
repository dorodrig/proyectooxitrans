#!/usr/bin/env node

/**
 * 🔍 DIAGNÓSTICO DE LOGIN SIMPLE
 * ==============================
 * Verifica el endpoint de login con un usuario específico
 */

console.log('🔍 DIAGNÓSTICO DE LOGIN SIMPLE');
console.log('==============================');

const API_BASE = 'http://localhost:3001';

async function testHealth() {
    try {
        console.log('🏥 Probando endpoint /api/health...');
        const response = await fetch(`${API_BASE}/api/health`);
        console.log(`📊 Status: ${response.status}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Servidor respondiendo correctamente');
            console.log('📋 Respuesta health:', JSON.stringify(data, null, 2));
            return true;
        } else {
            console.log('❌ Servidor no responde correctamente');
            return false;
        }
    } catch (error) {
        console.log('❌ Error conectando al servidor:', error.message);
        return false;
    }
}

async function testLoginSimpple() {
    console.log('\n🔐 PROBANDO LOGIN SIMPLE');
    console.log('─'.repeat(40));
    
    // Probamos login con documento en lugar de email
    const testCredentials = {
        documento: '12345001',  // Carlos Andrés
        password: '8uhoq2dl'
    };
    
    console.log('📋 Credenciales de prueba:');
    console.log(`   👤 Documento: ${testCredentials.documento}`);  
    console.log(`   🔑 Password: ${testCredentials.password}`);
    
    try {
        console.log('\n📤 Enviando request a /api/auth/login...');
        
        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testCredentials)
        });
        
        console.log(`📊 Status HTTP: ${response.status}`);
        console.log(`📊 Status Text: ${response.statusText}`);
        
        const responseText = await response.text();
        console.log('\n📋 Respuesta completa:');
        console.log(responseText);
        
        if (response.ok) {
            console.log('\n✅ LOGIN EXITOSO');
            try {
                const data = JSON.parse(responseText);
                if (data.token || (data.data && data.data.token)) {
                    console.log('🎯 Token JWT recibido correctamente');
                    return true;
                } else {
                    console.log('⚠️ Login OK pero no hay token en respuesta');
                }
            } catch (e) {
                console.log('⚠️ Respuesta no es JSON válido');
            }
        } else {
            console.log('\n❌ LOGIN FALLÓ');
            console.log('💡 Posibles problemas:');
            console.log('   • Servidor no está corriendo');
            console.log('   • Endpoint incorrecto');
            console.log('   • Credenciales incorrectas');
            console.log('   • Problema con la base de datos');
        }
        
        return false;
        
    } catch (error) {
        console.log('\n❌ Error en request:', error.message);
        console.log('💡 El servidor probablemente no está corriendo');
        return false;
    }
}

async function testEmailLogin() {
    console.log('\n🔐 PROBANDO LOGIN CON EMAIL');
    console.log('─'.repeat(40));
    
    // También probamos con email por si acaso
    const testCredentials = {
        email: 'carlos.rodriguez@oxitrans.com',
        password: '8uhoq2dl'
    };
    
    console.log('📋 Credenciales con email:');
    console.log(`   📧 Email: ${testCredentials.email}`);  
    console.log(`   🔑 Password: ${testCredentials.password}`);
    
    try {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testCredentials)
        });
        
        console.log(`📊 Status HTTP: ${response.status}`);
        
        const responseText = await response.text();
        console.log('📋 Respuesta:');
        console.log(responseText);
        
        return response.ok;
        
    } catch (error) {
        console.log('❌ Error:', error.message);
        return false;
    }
}

async function main() {
    // Verificar servidor
    const serverOk = await testHealth();
    
    if (serverOk) {
        // Probar login con documento
        const loginDocOk = await testLoginSimpple();
        
        if (!loginDocOk) {
            // Probar login con email
            await testEmailLogin();
        }
    }
    
    console.log('\n🎯 SIGUIENTE PASO:');
    console.log('─'.repeat(40));
    if (!serverOk) {
        console.log('1. Iniciar el servidor: cd server && npm run dev');
    } else {
        console.log('1. Verificar que las passwords estén correctamente asignadas');
        console.log('2. Verificar que los usuarios existan en la base de datos');
        console.log('3. Revisar los logs del servidor para errores');
    }
}

main().catch(console.error);