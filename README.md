# Skybridge Digital Studios — website

Dominio: https://www.skybridgestd.space/

Sitio estático de una sola página (HTML, CSS y JS en un archivo), bilingüe EN/ES.
Es una copia exacta del artifact de Claude (versión `1795132498-e0b8`, 19 nov 2026): fondo gris suave, acento verde, logo monograma.

## Estructura

```
public/index.html                          el sitio completo
public/img/                                imágenes del sitio
public/robots.txt, public/sitemap.xml      para buscadores
notas/precios.js                           lista de precios sin publicar
public/clientes/<slug>/                    demos privados de clientes (uno por carpeta)
public/clientes/digital-accounting-tax/    demo para Digital Accounting & Tax Inc.
netlify/edge-functions/acceso-clientes/    acceso privado a los demos (index.ts) y lista de clientes (clientes.ts)
plantilla-cliente/                         portada base para un cliente nuevo (no se publica)
netlify.toml                               configuración de Netlify (publica public/, sin build)
```

## Demos privados de clientes

Cada cliente tiene su carpeta en `public/clientes/<slug>/` y entra con un enlace de acceso:
`https://www.skybridgestd.space/clientes/<slug>/?acceso=LLAVE`

- La función `acceso-clientes` revisa la llave (sin importar mayúsculas), guarda una cookie por 30 días, quita la llave de la barra de direcciones y abre la portada del cliente. Cualquier otra persona recibe "Esta página no está disponible" (404), sin HTML, imágenes ni estilos del demo. `/clientes/` y cualquier carpeta que no esté en la lista también dan 404.
- **La portada** (`index.html` de la carpeta) tiene el logo del cliente, botones para ver el sitio en español o en inglés, "Verlo en el teléfono" (solo en computadora) y "Aprobar el diseño" / "Pedir cambios", que abren un correo prellenado a skybridgestudiosllc@gmail.com. Recuerda el idioma elegido. La etiqueta "Demo" de cada página del sitio lleva de vuelta a la portada.
- Las llaves viven en Netlify, no en el repositorio: **Site configuration → Environment variables**, con el nombre que diga `envKey` en `clientes.ts`. Pueden ser varias separadas por espacios; conviene una por persona (mínimo 16 caracteres al azar) para poder quitarle el acceso a una sin afectar a las demás.
- Fecha límite opcional en la variable `envUntil` (por ejemplo `2027-01-31`). Después de esa fecha nadie entra.
- Para quitar el acceso: cambia o borra la llave y vuelve a publicar. Las cookies viejas dejan de servir. Si la variable no existe, el demo queda cerrado para todos.
- Caché: las páginas HTML nunca se guardan (así quitar una llave corta el acceso al instante). Las fuentes e imágenes con hash en el nombre se guardan un año en el navegador del visitante; `site.css` y `site.js` se guardan pero se revisan en cada visita.
- Nada se indexa: `noindex` en cada página y `X-Robots-Tag` para `/clientes/*` en `netlify.toml` y en la función. No se enlazan desde la página principal.
- Cuando el sitio real del cliente esté en línea, pon su dirección en `launchedUrl` y quien tenga acceso irá directo allí.

### Añadir un cliente

1. Copia su sitio a `public/clientes/<slug>/` (con `es/`, `en/`, `assets/` y un `preview.jpg` de 1200×630 para la vista previa de WhatsApp).
2. Copia `plantilla-cliente/index.html` como `public/clientes/<slug>/index.html` y cambia el nombre, el bloque `PORTAL`, los colores, el logo y las fuentes.
3. Añade una entrada en `netlify/edge-functions/acceso-clientes/clientes.ts`.
4. Crea la variable de la llave en Netlify y publica.
5. Envía el enlace `https://www.skybridgestd.space/clientes/<slug>/?acceso=LLAVE`.

### Digital Accounting & Tax

Sitio de muestra para Carlos Moran (Digital Accounting & Tax Inc.), en `/clientes/digital-accounting-tax/`.

- Llave: `DAT_ACCESS_KEY` (y opcional `DAT_ACCESS_UNTIL`). La cookie sigue siendo `dat_acceso`, así que quien ya entró no tiene que volver a abrir el enlace.
- **El primer enlace que se envió** (`/Digital-Accounting-Tax/?acceso=LLAVE`) sigue funcionando: lleva a la portada nueva. Con cookie válida, las direcciones viejas redirigen a las nuevas; sin acceso dan 404, así que no revelan la dirección nueva.
- `telefono.html`: el sitio dentro de dos iPhones (español e inglés), con selector de paleta. En un teléfono abre el sitio real.
- Las imágenes `public/work/dat-*` siguen protegidas (`extraProtected`). Cuando Carlos apruebe por escrito mostrar el caso en "Work", quita esa línea y reemplaza la tarjeta de relleno.
- Cuando el cliente apruebe, la versión de producción (con canonical, hreflang, sitemap y robots apuntando a digital.tax) se publica en su propio dominio, no aquí.

## Formulario de cotización

El formulario de Contacto se envía con **Netlify Forms** (formulario `quote`). Para recibir las solicitudes:

1. En Netlify: **Forms → Enable form detection** y vuelve a publicar.
2. **Forms → Form notifications → Add notification → Email notification**, con skybridgestudiosllc@gmail.com.

Las solicitudes también quedan guardadas en **Forms** dentro de Netlify. Si el envío falla (o se abre el archivo en local), el formulario prepara un correo que el visitante envía por su cuenta, como antes, así que nunca se pierde lo que escribió.

## Aviso de Netlify

El plan gratuito de Netlify añade abajo a la derecha una etiqueta "Powered by Netlify" (unos 202×64 px). Ningún elemento fijo del sitio queda debajo de ella. El sitio no usa cookies, así que no muestra aviso de cookies; la política sigue en el pie de página.

## Precios

La lista de precios que estaba escondida en el código de la página se movió a `notas/precios.js` (no se publica). Así no aparece en el código fuente mientras la página dice que todavía no publicamos precios.

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

- **Formulario de cotización.** Activar Netlify Forms y la notificación por correo (ver arriba).
- **Dependencias externas.** El sitio solo carga Google Fonts (Schibsted Grotesk, 4 pesos). Ya no usa three.js.
- Revisar los puntos de la auditoría del 16 nov (textos de "clientes en 50 estados", aviso de cookies, navegación en móvil, SEO).
