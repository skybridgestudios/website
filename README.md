# Skybridge Digital Studios — website

Sitio estático de una sola página (HTML, CSS y JS en un archivo), bilingüe EN/ES.
Es una copia exacta del artifact de Claude (versión `1794762318-e8db`, 16 nov 2026).

## Estructura

```
public/index.html   el sitio completo
netlify.toml        configuración de Netlify (publica public/, sin build)
```

## Ver en local

```bash
npx serve public
```

O abrir `public/index.html` directamente en el navegador.

## Subir a GitHub

Crear un repositorio vacío en GitHub (sin README ni .gitignore) y luego:

```bash
git remote add origin https://github.com/USUARIO/skybridge-digital-studios.git
git push -u origin main
```

## Publicar en Netlify

1. En Netlify: **Add new site → Import an existing project → GitHub**.
2. Elegir este repositorio.
3. Dejar el comando de build vacío. El directorio de publicación (`public`) ya viene de `netlify.toml`.
4. **Deploy**. Cada push a `main` vuelve a publicar.

## Pendiente antes de producción

- **Formulario de cotización.** Hoy no envía nada: prepara un correo para que el visitante lo mande. Para activarlo, llenar `FORM_ENDPOINT` y `FORM_KEY` al inicio del `<script>` en `public/index.html` (está pensado para Web3Forms).
- **Panel "Vista previa: colores, letra y logo".** Es solo para elegir el diseño. Quitar el bloque `<details class="tune">` antes de publicar y dejar fijos la paleta, la tipografía y el logo en la etiqueta `<html>`.
- **Dependencias externas.** El sitio carga Google Fonts y three.js desde jsDelivr.
- Revisar los puntos de la auditoría del 16 nov (textos de "clientes en 50 estados", aviso de cookies, navegación en móvil, SEO).
