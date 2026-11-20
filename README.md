# Skybridge Digital Studios — website

Dominio: https://www.skybridgestd.space/

Sitio estático de una sola página (HTML, CSS y JS en un archivo), bilingüe EN/ES.
Es una copia exacta del artifact de Claude (versión `1795132498-e0b8`, 19 nov 2026): fondo gris suave, acento verde, logo monograma.

## Estructura

```
public/index.html                    el sitio completo
public/Digital-Accounting-Tax/       demo para el cliente Digital Accounting & Tax Inc.
netlify/edge-functions/demo-acceso.ts  acceso privado al demo (solo con enlace de acceso)
netlify.toml                         configuración de Netlify (publica public/, sin build)
```

## Demo: Digital Accounting & Tax

Sitio de muestra para presentar a Carlos Moran (Digital Accounting & Tax Inc.). Se abre en `/Digital-Accounting-Tax`.

- `/Digital-Accounting-Tax/` abre siempre `en/index.html` (inicio en inglés), en celular y computadora.
- Páginas: `es/index.html`, `servicios`, `itin`, `nosotros`, `contacto`, `privacidad`, `cookies`, `terminos`, `accesibilidad`, y sus equivalentes en `en/`.
- `/Digital-Accounting-Tax/telefono.html`: el sitio dentro de dos iPhones (español e inglés), con selector de paleta, para presentarlo.
- **Privada.** Solo entra quien abre el enlace de acceso `https://www.skybridgestd.space/Digital-Accounting-Tax/?acceso=LLAVE`. La función `netlify/edge-functions/demo-acceso.ts` revisa la llave (sin importar mayúsculas), guarda una cookie por 30 días, quita la llave de la barra de direcciones y abre el inicio en inglés (el visitante puede cambiar a español). El único archivo público es `preview.jpg`, la imagen que muestran WhatsApp y iMessage al compartir el enlace. En un teléfono, `telefono.html` abre el sitio real en vez de las maquetas. Cualquier otra persona recibe "Esta página no está disponible" (404), sin HTML, imágenes ni estilos del demo.
  - La llave vive en Netlify, no en este repositorio: **Site configuration → Environment variables → `DAT_ACCESS_KEY`**. Puede tener varias llaves separadas por espacios.
  - Opcional: `DAT_ACCESS_UNTIL` con una fecha (`2027-01-31`). Después de esa fecha nadie entra.
  - Para quitar el acceso: cambia o borra `DAT_ACCESS_KEY` y vuelve a publicar. Las cookies viejas dejan de servir.
  - Si `DAT_ACCESS_KEY` no existe, el demo queda cerrado para todos.
- No está enlazada desde la página principal y no se indexa en Google (`noindex` en cada página y `X-Robots-Tag` en `netlify.toml`). Cada página muestra una etiqueta "Demo de Skybridge Digital Studios".
- Cuando el cliente apruebe, la versión de producción (con canonical, hreflang, sitemap y robots apuntando a digital.tax) se publica en su propio dominio, no aquí.

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
- **Dependencias externas.** El sitio carga Google Fonts y three.js desde jsDelivr.
- Revisar los puntos de la auditoría del 16 nov (textos de "clientes en 50 estados", aviso de cookies, navegación en móvil, SEO).
