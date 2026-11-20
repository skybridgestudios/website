/* Price list drafted for the site (not published). Moved out of public/index.html so it is not shipped in the page source.
   Restore it only when you decide to publish prices. */
/* ---- pricing (2026 US market, see notes in chat) ---- */
var ONE=[
 {n:['Landing page','Página de aterrizaje'],p:'$1,200',d:['One page that gets you found and gets you calls.','Una página para que te encuentren y te llamen.'],i:[['One scrolling page','Una página con scroll'],['Contact form, map and hours','Formulario, mapa y horario'],['Google Business setup','Configuración en Google'],['Live in about 2 weeks','Lista en unas 2 semanas']]},
 {n:['Business website','Página para negocio'],p:'$2,900',pop:1,d:['For businesses with more to show.','Para negocios con más que mostrar.'],i:[['Up to 6 pages','Hasta 6 páginas'],['Booking or menu built in','Reservas o menú integrados'],['English and Spanish','Inglés y español'],['SEO basics and analytics','SEO básico y estadísticas']]},
 {n:['Online store','Tienda en línea'],p:'$4,900',from:1,d:['Sell online with pickup or shipping.','Vende en línea con recogida o envío.'],i:[['Up to 50 products loaded','Hasta 50 productos cargados'],['Card and digital payments','Pagos con tarjeta y digitales'],['Inventory and order emails','Inventario y correos de pedidos'],['Training on how to run it','Te enseñamos a manejarla']]},
 {n:['Logo and brand kit','Logo y kit de marca'],p:'$650',d:['A look you can use everywhere.','Una imagen que puedes usar en todas partes.'],i:[['3 logo directions, 2 rounds of changes','3 propuestas de logo, 2 rondas de cambios'],['Colors and fonts guide','Guía de colores y tipografía'],['Files for print, web and social','Archivos para imprenta, web y redes']]},
 {n:['Security checkup','Revisión de seguridad'],p:'$750',d:['A one-time review for teams up to 10.','Una revisión única para equipos de hasta 10.'],i:[['Accounts, passwords and 2FA','Cuentas, contraseñas y 2FA'],['Backups and device settings','Respaldos y configuración de equipos'],['Written report with fixes','Reporte escrito con soluciones']]},
 {n:['Mobile app','App móvil'],p:'$18,000',from:1,d:['A first version for both major phone platforms.','Una primera versión para las dos plataformas móviles principales.'],i:[['Design, build and launch','Diseño, desarrollo y lanzamiento'],['Publishing to the app stores','Publicación en las tiendas de apps'],['8 to 12 weeks, paid by milestone','8 a 12 semanas, pago por etapas']]}
];
var SUBS=[
 {n:['Website care','Mantenimiento web'],mo:89,yr:890,d:['Keeps your site fast, updated and backed up.','Mantiene tu página rápida, al día y respaldada.'],i:[['Updates and daily backups','Actualizaciones y respaldos diarios'],['Security and uptime monitoring','Monitoreo de seguridad y caídas'],['Up to 1 hour of edits a month','Hasta 1 hora de cambios al mes']]},
 {n:['Social media','Redes sociales'],mo:650,yr:6500,from:1,d:['Steady posting without you doing it.','Publicaciones constantes sin que tú lo hagas.'],i:[['2 platforms, 12 posts a month','2 plataformas, 12 posts al mes'],['Graphics and captions','Gráficos y textos'],['Monthly results report','Reporte mensual de resultados']],x:['Growth: 3 platforms, 20 posts and replies handled, $1,400/mo','Growth: 3 plataformas, 20 posts y respuestas incluidas, $1,400/mes']},
 {n:['AI receptionist','Recepcionista con IA'],mo:199,yr:1990,d:['Answers calls, takes orders and books appointments.','Contesta llamadas, toma pedidos y agenda citas.'],i:[['Up to 500 minutes a month','Hasta 500 minutos al mes'],['Texts you a summary of each call','Te envía un resumen de cada llamada'],['Connects to your calendar','Se conecta a tu calendario']],x:['One-time setup: $500','Configuración única: $500']},
 {n:['Managed security','Seguridad administrada'],mo:45,yr:450,unit:1,d:['Ongoing protection for small teams.','Protección continua para equipos pequeños.'],i:[['Device protection and monitoring','Protección y monitoreo de equipos'],['Email phishing filter','Filtro de correos de phishing'],['Quarterly check-in','Revisión cada trimestre']],x:['Priced per user, 5-user minimum','Precio por usuario, mínimo 5 usuarios']}
];
var bill='mo';
function money(n){return '$'+n.toLocaleString('en-US')}
function card(o,body){return '<article class="price glass lift'+(o.pop?' pop':'')+'" data-rise>'+(o.pop?'<span class="flag">'+L(['most picked','la más elegida'])+'</span>':'')+'<h3>'+L(o.n)+'</h3>'+body+'<p class="muted">'+L(o.d)+'</p><ul>'+o.i.map(function(x){return '<li>'+L(x)+'</li>'}).join('')+'</ul>'+(o.x?'<p class="extra">'+L(o.x)+'</p>':'')+'</article>'}
function renderPrices(){
  if(!$('#oneGrid')){ renderShowcase(); return; }
  var from=L(['from','desde']);
  $('#oneGrid').innerHTML=ONE.map(function(o){return card(o,'<div class="amt">'+(o.from?'<small>'+from+'</small>':'')+o.p+'</div>')}).join('');
  $('#subGrid').innerHTML=SUBS.map(function(o){
    var v=bill==='mo'?o.mo:o.yr, per=(o.unit?L(['/user','/usuario']):'')+(bill==='mo'?L(['/mo','/mes']):L(['/yr','/año']));
    var save=bill==='yr'?L(['You save ','Ahorras '])+money(o.mo*12-o.yr)+(o.unit?L([' per user',' por usuario']):''):'';
    return card(o,'<div class="amt">'+(o.from?'<small>'+from+'</small>':'')+money(v)+'<span class="per">'+per+'</span></div><div class="save">'+save+'</div>');
  }).join('');
  $$('[data-bill]').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.bill===bill)});
}
$$('[data-bill]').forEach(function(b){b.addEventListener('click',function(){bill=b.dataset.bill; renderPrices(); var g=$('#subGrid'); g.classList.remove('flip'); void g.offsetWidth; g.classList.add('flip'); movePills();})});

