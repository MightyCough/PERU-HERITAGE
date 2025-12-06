// Script de prueba de conexión Frontend-Backend
// Ejecutar en la consola del navegador cuando el frontend esté corriendo

console.log('🔍 Iniciando pruebas de conexión Backend-Frontend...\n');

const API_BASE_URL = 'http://localhost:8000/api';

// Función helper para hacer requests
async function testEndpoint(method, endpoint, data = null, requiresAuth = false) {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Agregar token si está disponible
  if (requiresAuth) {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const { state } = JSON.parse(authStorage);
      const token = state?.token;
      if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
      }
    }
  }

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type');
    let responseData;

    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    return {
      success: response.ok,
      status: response.status,
      data: responseData,
      url,
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      error: error.message,
      url,
    };
  }
}

// Pruebas
(async () => {
  console.log('📋 PRUEBAS DE ENDPOINTS\n');

  // 1. Test de preguntas
  console.log('1️⃣ Testing /preguntas/ (GET)');
  const preguntasTest = await testEndpoint('GET', '/preguntas/');
  if (preguntasTest.success) {
    console.log('   ✅ Éxito:', preguntasTest.status);
    console.log('   📊 Preguntas encontradas:', Array.isArray(preguntasTest.data) ? preguntasTest.data.length : 'N/A');
  } else {
    console.log('   ❌ Error:', preguntasTest.status, preguntasTest.error || preguntasTest.data);
  }

  // 2. Test de pregunta aleatoria
  console.log('\n2️⃣ Testing /preguntas/random/ (GET)');
  const randomTest = await testEndpoint('GET', '/preguntas/random/');
  if (randomTest.success) {
    console.log('   ✅ Éxito:', randomTest.status);
    console.log('   📝 Pregunta:', randomTest.data.text?.substring(0, 50) + '...');
  } else {
    console.log('   ❌ Error:', randomTest.status, randomTest.error || randomTest.data);
  }

  // 3. Test de datos curiosos
  console.log('\n3️⃣ Testing /datos-curiosos/ (GET)');
  const curiososTest = await testEndpoint('GET', '/datos-curiosos/');
  if (curiososTest.success) {
    console.log('   ✅ Éxito:', curiososTest.status);
    console.log('   📊 Datos curiosos encontrados:', Array.isArray(curiososTest.data) ? curiososTest.data.length : 'N/A');
  } else {
    console.log('   ❌ Error:', curiososTest.status, curiososTest.error || curiososTest.data);
  }

  // 4. Test de leaderboard
  console.log('\n4️⃣ Testing /puntuaciones/leaderboard/ (GET)');
  const leaderboardTest = await testEndpoint('GET', '/puntuaciones/leaderboard/');
  if (leaderboardTest.success) {
    console.log('   ✅ Éxito:', leaderboardTest.status);
    console.log('   🏆 Jugadores en leaderboard:', Array.isArray(leaderboardTest.data) ? leaderboardTest.data.length : 'N/A');
  } else {
    console.log('   ❌ Error:', leaderboardTest.status, leaderboardTest.error || leaderboardTest.data);
  }

  // 5. Test de ubicaciones del tablero
  console.log('\n5️⃣ Testing /gameplay/ubicaciones-tablero/ (GET)');
  const ubicacionesTest = await testEndpoint('GET', '/gameplay/ubicaciones-tablero/');
  if (ubicacionesTest.success) {
    console.log('   ✅ Éxito:', ubicacionesTest.status);
    console.log('   🎯 Ubicaciones del tablero:', Array.isArray(ubicacionesTest.data) ? ubicacionesTest.data.length : 'N/A');
  } else {
    console.log('   ❌ Error:', ubicacionesTest.status, ubicacionesTest.error || ubicacionesTest.data);
  }

  // 6. Test de sesiones (puede requerir autenticación)
  console.log('\n6️⃣ Testing /gameplay/sesiones-juego/ (GET)');
  const sesionesTest = await testEndpoint('GET', '/gameplay/sesiones-juego/', null, true);
  if (sesionesTest.success) {
    console.log('   ✅ Éxito:', sesionesTest.status);
    console.log('   🎮 Sesiones encontradas:', Array.isArray(sesionesTest.data) ? sesionesTest.data.length : 'N/A');
  } else {
    console.log('   ❌ Error:', sesionesTest.status, sesionesTest.error || sesionesTest.data);
    if (sesionesTest.status === 401) {
      console.log('   ℹ️ Este endpoint requiere autenticación');
    }
  }

  // Resumen
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN DE PRUEBAS');
  console.log('='.repeat(50));
  
  const tests = [preguntasTest, randomTest, curiososTest, leaderboardTest, ubicacionesTest, sesionesTest];
  const successCount = tests.filter(t => t.success).length;
  const failCount = tests.filter(t => !t.success).length;

  console.log(`✅ Exitosas: ${successCount}`);
  console.log(`❌ Fallidas: ${failCount}`);
  console.log(`📈 Total: ${tests.length}`);

  if (failCount > 0) {
    console.log('\n⚠️ PROBLEMAS DETECTADOS:');
    console.log('1. Verifica que el backend esté corriendo en http://localhost:8000');
    console.log('2. Verifica que CORS esté configurado (ver CONFIGURAR_CORS.md)');
    console.log('3. Verifica que la base de datos tenga datos');
    console.log('4. Algunos endpoints requieren autenticación');
  } else {
    console.log('\n🎉 ¡Todas las pruebas pasaron! La conexión está funcionando correctamente.');
  }

  console.log('\n' + '='.repeat(50));
  console.log('ℹ️ Para más información, revisa:');
  console.log('   - SERVICIOS_API.md (documentación de servicios)');
  console.log('   - CONFIGURAR_CORS.md (configuración de CORS)');
  console.log('='.repeat(50));
})();
