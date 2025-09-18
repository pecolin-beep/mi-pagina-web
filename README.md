# Go-Monas

Proyecto final con lista de tareas, galería dinámica y carrito de compras.

## Cómo iniciar el proyecto
1. Abre una terminal en esta carpeta.
2. Ejecuta:

py -m http.server --bind 127.0.0.1 8000

3. Abre en tu navegador:

http://127.0.0.1:8000/


## Estructura
- **index.html** → Interfaz principal  
- **scripts.js** → Lógica en JavaScript (tareas, galería, carrito)  
- **styles.css** → Estilos personalizados  
- **products.json** → Datos simulados como API

## Pruebas
- [ ] Agregar tarea con Enter y botón "Agregar tarea".
- [ ] Eliminar primera tarea.
- [ ] Galería: agregar imágenes con URL y archivo.
- [ ] Productos: cargan automáticamente desde `products.json`.
- [ ] Carrito: agregar, sumar/restar, vaciar y pagar.

## Bibliotecas utilizadas
- **Bootstrap 5 (CDN)** → Estilos y componentes.
- **JS nativo** → DOM, fetch, localStorage.
