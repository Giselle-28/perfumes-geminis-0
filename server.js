const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

// Rutas API para operaciones CRUD
// Guardar productos (actualizar JSON)
app.post('/api/save-products', (req, res) => {
  try {
    const { products, catalog } = req.body;
    
    if (!products || !catalog) {
      return res.status(400).json({ success: false, message: 'Datos incompletos' });
    }
    
    // Validar que el archivo sea válido
    if (catalog !== 'productos.json' && catalog !== 'catalogo-completo.json') {
      return res.status(400).json({ success: false, message: 'Archivo de catálogo no válido' });
    }
    
    // Guardar los productos en el archivo JSON
    fs.writeFileSync(catalog, JSON.stringify(products, null, 2), 'utf8');
    
    res.json({ success: true, message: 'Datos guardados correctamente' });
  } catch (error) {
    console.error('Error al guardar:', error);
    res.status(500).json({ success: false, message: `Error al guardar: ${error.message}` });
  }
});

// Importar catálogo desde PDF (simulado)
app.post('/api/import-catalog', (req, res) => {
  try {
    const { catalogType, replace } = req.body;
    
    // Este endpoint simularía el procesamiento de un PDF
    // Generar algunos perfumes aleatorios
    const perfumesGenerados = [];
    const cantidad = Math.floor(Math.random() * 15) + 5; // Entre 5 y 20
    
    for (let i = 0; i < cantidad; i++) {
      perfumesGenerados.push({
        id: i + 1,
        nombre: `Perfume Importado ${i + 1}`,
        marca: "Importado PDF",
        precio: Math.floor(Math.random() * 3000) + 2000,
        imagen: "https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=600",
        tipo: ["masculino", "femenino", "unisex"][Math.floor(Math.random() * 3)],
        descripcion: "Perfume importado desde catálogo PDF.",
        arabe: Math.random() > 0.8
      });
    }
    
    // Determinar archivo de destino
    const catalogFile = catalogType === 'completo' ? 'catalogo-completo.json' : 'productos.json';
    
    // Si no es reemplazo, cargar el catálogo existente y combinar
    if (!replace && fs.existsSync(catalogFile)) {
      const existingContent = fs.readFileSync(catalogFile, 'utf8');
      const existingPerfumes = JSON.parse(existingContent);
      
      // Asignar nuevos IDs a los perfumes importados
      const maxId = Math.max(...existingPerfumes.map(p => p.id), 0);
      for (let i = 0; i < perfumesGenerados.length; i++) {
        perfumesGenerados[i].id = maxId + i + 1;
      }
      
      // Combinar perfumes
      const combinedPerfumes = existingPerfumes.concat(perfumesGenerados);
      
      // Guardar en el archivo destino
      fs.writeFileSync(catalogFile, JSON.stringify(combinedPerfumes, null, 2), 'utf8');
    } else {
      // Reemplazar todo el contenido
      fs.writeFileSync(catalogFile, JSON.stringify(perfumesGenerados, null, 2), 'utf8');
    }
    
    // Contar perfumes por tipo
    const femeninos = perfumesGenerados.filter(p => p.tipo === 'femenino').length;
    const masculinos = perfumesGenerados.filter(p => p.tipo === 'masculino').length;
    const unisex = perfumesGenerados.filter(p => p.tipo === 'unisex').length;
    
    res.json({
      success: true,
      message: `Se han ${replace ? 'reemplazado' : 'añadido'} ${perfumesGenerados.length} perfumes al catálogo.`,
      summary: {
        total: perfumesGenerados.length,
        femeninos: femeninos,
        masculinos: masculinos,
        unisex: unisex
      }
    });
  } catch (error) {
    console.error('Error al importar:', error);
    res.status(500).json({ success: false, message: `Error al importar: ${error.message}` });
  }
});

// Ruta de autenticación (simulada)
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // Usuarios hardcodeados para demo (en un entorno real, estarían en una base de datos)
  const users = [
    { username: 'admin', password: 'admin123', isAdmin: true, nombre: 'Administrador' },
    { username: 'vendedor', password: 'vendedor123', isAdmin: false, nombre: 'Vendedor' }
  ];
  
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    // Omitir la contraseña en la respuesta
    const { password, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      user: userWithoutPassword
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Credenciales incorrectas'
    });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});