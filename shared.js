// Datos y reglas compartidas por la landing, el simulador de WhatsApp y el panel.
// Todo vive en el navegador (localStorage): es una demo, no hay servidor.
(function () {
  const KEY = 'ce-demo-v3';
  const DIA = 86400000;

  const CAMPANA = {
    nombre: 'Promo Casa Europa 2027',
    marca: 'Casa Europa',
    empresa: 'Casa Europa',
    bot: 'Asistente Casa Europa',
    soles_por_opcion: 10,         // cada S/ 10 en productos participantes = 1 opción
    max_por_dia: 3,               // comprobantes por DNI por día
    monto_revision: 300,          // compras mayores a esto pasan a revisión manual
  };
  // Vigencia de la demo: alrededor de hoy, para que las pruebas caigan dentro.
  const hoy0 = new Date(); hoy0.setHours(0, 0, 0, 0);
  CAMPANA.inicio = new Date(hoy0.getTime() - 35 * DIA);
  CAMPANA.fin = new Date(hoy0.getTime() + 85 * DIA);

  // RUC de las cadenas: referenciales, a confirmar con el cliente.
  const CADENAS = [
    { id: 'wong', nombre: 'Wong', ruc: '20109072177', razon: 'CENCOSUD RETAIL PERU S.A.', tiendas: ['Chacarilla', 'Dos de Mayo', 'San Miguel', 'Óvalo Gutiérrez', 'Aurora'] },
    { id: 'metro', nombre: 'Metro', ruc: '20109072177', razon: 'CENCOSUD RETAIL PERU S.A.', tiendas: ['San Miguel', 'Plaza Norte', 'Limatambo', 'Chorrillos', 'Jesús María'] },
    { id: 'pvea', nombre: 'Plaza Vea', ruc: '20100070970', razon: 'SUPERMERCADOS PERUANOS S.A.', tiendas: ['Caminos del Inca', 'Miraflores', 'Salaverry', 'La Molina', 'Cortijo'] },
    { id: 'tottus', nombre: 'Tottus', ruc: '20508565934', razon: 'HIPERMERCADOS TOTTUS S.A.', tiendas: ['La Marina', 'Mega Plaza', 'San Luis', 'Las Begonias', 'La Fontana'] },
    { id: 'makro', nombre: 'Makro', ruc: '20492092313', razon: 'MAKRO SUPERMAYORISTA S.A.', tiendas: ['Surco', 'Santa Anita', 'SMP', 'Callao', 'Venezuela'] },
  ];
  const RUC_CADENAS = new Set(CADENAS.map(c => c.ruc));

  // Productos reales de casaeuropa.pe (fotos de su web). Precios referenciales solo para la demo.
  const IMG = 'https://casaeuropa.pe/assets/img/producto/';
  const F = 'venta_embutidos_charcuteria_jamones_fiambres_chorizos_morcillas_salchichas_madurados_';
  const PRODUCTOS = [
    { id: 'pierna', nombre: 'Pierna ahumada', cat: 'Jamones', precio: 19.9, color: '#A3132B', img: IMG + 'jamones/' + F + 'ahumada.jpg', desc: 'Pierna entera de cerdo con el toque ahumado de nuestros maestros charcuteros.' },
    { id: 'ingles', nombre: 'Jamón inglés', cat: 'Jamones', precio: 14.9, color: '#111111', img: IMG + 'jamones/' + F + 'ingles.jpg', desc: 'El clásico de siempre, hecho con toda nuestra pasión por el buen embutido.' },
    { id: 'bondiola', nombre: 'Bondiola ahumada', cat: 'Jamones', precio: 22.9, color: '#6E1020', img: IMG + 'jamones/' + F + 'bondiola.jpg', desc: 'Cuello de cerdo marmoleado, ahumado con madera alemana.' },
    { id: 'parrillero', nombre: 'Chorizo parrillero', cat: 'Chorizos', precio: 16.9, color: '#C0392B', img: IMG + 'chorizos/' + F + 'parrillero.jpg', desc: 'Carne de cerdo e insumos alemanes para la mejor parrilla.' },
    { id: 'frank', nombre: 'Frankfurter', cat: 'Salchichas', precio: 12.9, color: '#8A6A4A', img: IMG + 'salchichas/' + F + 'frankfuter.jpg', desc: 'La reina de las salchichas, fiel a su receta de origen.' },
    { id: 'hungaro', nombre: 'Salame húngaro', cat: 'Madurados', precio: 18.9, color: '#3A2A22', img: IMG + 'madurados/' + F + 'hungaro.jpg', desc: 'Cerdo y res madurados con insumos europeos.' },
    { id: 'prosciutto', nombre: 'Prosciutto', cat: 'Madurados', precio: 24.9, color: '#7A0E20', img: IMG + 'madurados/' + F + 'prosciutto.jpg', desc: 'Pierna de cerdo madurada en cámaras que simulan el clima europeo.' },
    { id: 'tocino', nombre: 'Tocino', cat: 'Especiales', precio: 15.9, color: '#5E3A2A', img: IMG + 'especiales/' + F + 'tocino.jpg', desc: 'Las mejores pancetas con un ligero ahumado.' },
  ];
  const OTROS = ['Arroz extra 5 kg', 'Aceite vegetal 1 L', 'Leche evaporada x6', 'Detergente 2 kg', 'Pan de molde', 'Gaseosa 3 L', 'Papel higiénico x12'];

  const FAQ_BASE = [
    { id: 'participar', q: '¿Cómo participo en la promoción?', k: ['participo', 'participar', 'como juego', 'mecanica'], a: 'Es fácil:\n1️⃣ Compra productos Casa Europa en Wong, Metro, Plaza Vea, Tottus o Makro.\n2️⃣ Envíanos por aquí la foto de tu boleta o factura.\n3️⃣ Por cada S/ 10 en productos participantes ganas 1 opción para los sorteos.' },
    { id: 'productos', q: '¿Qué productos participan?', k: ['productos', 'participan', 'cuales', 'que compro'], a: 'Participan todos los productos Casa Europa: jamones (pierna ahumada, jamón inglés, bondiola), chorizos, salchichas Frankfurter, madurados como el prosciutto y el salame húngaro, y tocino. Revisa la lista completa en la web de la promo.' },
    { id: 'registro', q: '¿Cómo registro mi compra?', k: ['registro', 'registrar', 'subir', 'enviar boleta', 'foto'], a: 'Escribe *1* o toca "Registrar mi compra" y envía una foto clara de tu comprobante: que se vea completo, con el RUC, el número, la fecha y el total.' },
    { id: 'comprobante', q: '¿Qué tipo de comprobante puedo enviar?', k: ['tipo', 'comprobante', 'factura', 'boleta', 'ticket'], a: 'Aceptamos boletas y facturas electrónicas de las cadenas participantes. No aceptamos tickets sin número, notas de venta ni fotos de pantalla.' },
    { id: 'aprobado', q: '¿Cómo sé si mi comprobante fue aprobado?', k: ['aprobado', 'aprobaron', 'estado', 'valido', 'revisión'], a: 'Te respondemos al momento. Si tu comprobante necesita revisión manual, te avisamos por aquí en menos de 24 horas. También puedes escribir *3* para ver tus opciones.' },
    { id: 'duplicado', q: '¿Qué sucede si mi factura ya fue registrada?', k: ['ya fue', 'duplicado', 'registrada', 'repetida', 'dos veces'], a: 'Cada comprobante vale una sola vez. Si alguien ya lo registró, el sistema lo marca como duplicado y no suma opciones. Si crees que es un error, escribe *5* para hablar con un asesor.' },
    { id: 'condiciones', q: '¿Cuáles son las condiciones de la promoción?', k: ['condiciones', 'bases', 'terminos', 'vigencia', 'hasta cuando'], a: 'Promoción válida en Lima y provincias para mayores de 18 años, en las cadenas participantes. Hay premios mensuales de S/ 150, 250 y 500 y 3 grandes sorteos con notario. Bases completas en la web de la promo.' },
    { id: 'asesor', q: '¿Cómo puedo comunicarme con un asesor?', k: ['asesor', 'humano', 'persona', 'ayuda', 'reclamo'], a: 'Escribe *5* o toca "Hablar con un asesor" y una persona de nuestro equipo te responde en horario de 9 a. m. a 6 p. m.' },
  ];

  const ROLES = [
    { id: 'admin', nombre: 'Administrador (Free)', puede: 'Todo: validar, editar respuestas, usuarios y descargas' },
    { id: 'validador', nombre: 'Validador', puede: 'Revisar y aprobar o rechazar comprobantes' },
    { id: 'cliente', nombre: 'Cliente (Casa Europa)', puede: 'Ver reportes y descargar; DNI y celular ocultos' },
  ];

  // ---------- generador de datos de ejemplo (siempre el mismo) ----------
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  const NOMBRES = ['María', 'Rosa', 'Carmen', 'Ana', 'Lucía', 'Patricia', 'Juana', 'Elena', 'Sofía', 'Gloria', 'Milagros', 'Karina', 'Jessica', 'Fiorella', 'Diana', 'Luis', 'Carlos', 'Jorge', 'José', 'Miguel', 'Pedro', 'César', 'Renzo', 'Diego', 'Andrea', 'Valeria', 'Yolanda', 'Silvia', 'Marisol', 'Teresa'];
  const APELLIDOS = ['Quispe', 'Flores', 'Rodríguez', 'Sánchez', 'García', 'Rojas', 'Mendoza', 'Huamán', 'Torres', 'Chávez', 'Ramírez', 'Vargas', 'Castillo', 'Gutiérrez', 'Espinoza', 'Mamani', 'Salazar', 'Paredes', 'Cárdenas', 'Romero'];
  const DISTRITOS = ['San Miguel', 'Surco', 'Los Olivos', 'SMP', 'Comas', 'Ate', 'La Molina', 'Miraflores', 'Jesús María', 'Chorrillos', 'Callao', 'San Juan de Lurigancho', 'Lince', 'Pueblo Libre', 'Santa Anita', 'Villa El Salvador'];

  function sembrar() {
    const r = rng(2027);
    const pick = a => a[Math.floor(r() * a.length)];
    const ahora = Date.now();
    const participantes = [], comprobantes = [], conversaciones = [];
    const usados = [];

    const nPart = 430;
    for (let i = 0; i < nPart; i++) {
      // Más registros en fines de semana (días de activación).
      let dias;
      do { dias = Math.floor(r() * 28); } while ([0, 5, 6].indexOf(new Date(ahora - dias * DIA).getDay()) < 0 && r() < 0.6);
      const creado = ahora - dias * DIA - Math.floor(r() * 10 * 3600000) - 3600000;
      const p = {
        id: 'P' + String(1000 + i), nombre: pick(NOMBRES) + ' ' + pick(APELLIDOS) + ' ' + pick(APELLIDOS),
        dni: String(10000000 + Math.floor(r() * 79999999)), celular: '9' + String(10000000 + Math.floor(r() * 89999999)),
        distrito: pick(DISTRITOS), creado, canal: r() < 0.55 ? 'Tablet en tienda' : (r() < 0.6 ? 'Landing → WhatsApp' : 'QR en góndola'),
      };
      participantes.push(p);

      // Algunos se registran y no llegan a mandar comprobante
      const nComp = r() < 0.13 ? 0 : r() < 0.55 ? 1 : (r() < 0.6 ? 2 : (r() < 0.6 ? 3 : 4));
      for (let j = 0; j < nComp; j++) {
        const cad = pick(CADENAS);
        const t = creado + Math.floor(r() * j * 6 * DIA) + 120000;
        if (t > ahora - 60000) break;
        const items = [];
        const nP = 1 + Math.floor(r() * 3);
        for (let k = 0; k < nP; k++) {
          const pr = PRODUCTOS[Math.floor(Math.pow(r(), 1.6) * PRODUCTOS.length)];
          const ex = items.find(x => x.id === pr.id);
          if (ex) ex.cant++; else items.push({ id: pr.id, nombre: pr.nombre, cant: 1 + Math.floor(r() * 2), precio: pr.precio, participa: true });
        }
        const nO = Math.floor(r() * 4);
        for (let k = 0; k < nO; k++) items.push({ nombre: pick(OTROS), cant: 1, precio: +(4 + r() * 25).toFixed(2), participa: false });
        let c = {
          id: 'C' + String(5000 + comprobantes.length), participanteId: p.id, nombre: p.nombre, dni: p.dni, celular: p.celular,
          tipo: r() < 0.9 ? 'Boleta' : 'Factura', ruc: cad.ruc, razon: cad.razon, cadena: cad.nombre, tienda: pick(cad.tiendas),
          serie: (r() < 0.9 ? 'B' : 'F') + String(100 + Math.floor(r() * 300)).padStart(3, '0'),
          numero: String(Math.floor(r() * 9999999)).padStart(8, '0'),
          fecha: new Date(t - Math.floor(r() * 2 * DIA)).toISOString().slice(0, 10), items,
          confianza: +(0.86 + r() * 0.14).toFixed(2), recibido: t, imagen: 'muestra',
        };
        c.importe = +items.reduce((s, x) => s + x.cant * x.precio, 0).toFixed(2);
        // Variedad de casos para el reporte
        const x = r();
        if (x < 0.05 && usados.length) { const o = pick(usados); c.ruc = o.ruc; c.serie = o.serie; c.numero = o.numero; c.razon = o.razon; c.cadena = o.cadena; c.tienda = o.tienda; }
        else if (x < 0.08) { c.ruc = '10' + String(40000000 + Math.floor(r() * 9999999)) + '1'; c.razon = 'BODEGA ' + pick(APELLIDOS).toUpperCase(); c.cadena = 'Otro comercio'; c.tienda = '—'; }
        else if (x < 0.11) { c.items = c.items.filter(i => !i.participa); if (!c.items.length) c.items.push({ nombre: pick(OTROS), cant: 2, precio: 9.9, participa: false }); c.importe = +c.items.reduce((s, i) => s + i.cant * i.precio, 0).toFixed(2); }
        else if (x < 0.14) { c.confianza = +(0.4 + r() * 0.3).toFixed(2); }
        else if (x < 0.21) { c.confianza = +(0.78 + r() * 0.07).toFixed(2); }
        const v = validar(c, comprobantes);
        c.estado = v.estado; c.motivo = v.motivo; c.checks = v.checks; c.opciones = v.opciones;
        // Parte de los pendientes antiguos ya fueron revisados por un validador
        if (c.estado === 'pendiente' && ahora - t > 2 * DIA) {
          const ok = r() < 0.8;
          c.estado = ok ? 'aprobado' : 'rechazado'; c.motivo = ok ? 'Aprobado en revisión manual' : 'Comprobante alterado (revisión manual)';
          c.opciones = ok ? opcionesDe(c) : 0; c.validadoPor = pick(['Karla (Free)', 'Jhon (Free)']); c.validadoEn = t + 5 * 3600000;
        }
        comprobantes.push(c);
        if (c.estado !== 'duplicado') usados.push(c);
      }
    }
    // Conversaciones: incluye gente que preguntó y no se registró
    participantes.forEach(p => conversaciones.push(convDe(p.celular, p.nombre, p.creado - 90000, pick, r, true)));
    for (let i = 0; i < 260; i++) {
      const t = ahora - Math.floor(r() * 28) * DIA - Math.floor(r() * 12 * 3600000);
      conversaciones.push(convDe('9' + String(10000000 + Math.floor(r() * 89999999)), null, t, pick, r, false));
    }
    comprobantes.sort((a, b) => b.recibido - a.recibido);
    conversaciones.sort((a, b) => b.inicio - a.inicio);
    return { participantes, comprobantes, conversaciones, faq: FAQ_BASE.map(f => ({ ...f })), version: 3 };
  }
  function convDe(cel, nombre, t, pick, r, registrado) {
    const temas = registrado ? ['Registro de compra', 'Registro de compra', 'Mis opciones', 'Productos participantes'] : ['Cómo participar', 'Productos participantes', 'Condiciones', 'Tipo de comprobante', 'Hablar con asesor'];
    const tema = pick(temas);
    return {
      id: 'V' + Math.floor(r() * 1e9), celular: cel, nombre, inicio: t, ultimo: t + Math.floor(r() * 900000),
      mensajes: 4 + Math.floor(r() * (registrado ? 14 : 6)), tema,
      estado: tema === 'Hablar con asesor' ? (r() < 0.7 ? 'Atendida por asesor' : 'Esperando asesor') : 'Resuelta por el bot',
      plantillas: registrado && r() < 0.3 ? 1 : 0,
    };
  }

  // ---------- reglas de validación ----------
  function opcionesDe(c) {
    const m = c.items.filter(i => i.participa).reduce((s, i) => s + i.cant * i.precio, 0);
    return Math.floor(m / CAMPANA.soles_por_opcion);
  }
  function validar(c, previos) {
    const checks = [];
    const add = (regla, ok, detalle, nivel) => { checks.push({ regla, ok, detalle, nivel: ok ? 'ok' : nivel }); return ok; };
    const legible = add('Foto legible', c.confianza >= 0.8, c.confianza >= 0.8 ? `Lectura con ${Math.round(c.confianza * 100)} % de confianza` : `Solo ${Math.round(c.confianza * 100)} % de confianza: foto borrosa o cortada`, 'rechazo');
    if (!legible) return fin('rechazado', 'Imagen ilegible', 0);
    const campos = c.ruc && c.serie && c.numero && c.fecha && c.importe > 0;
    if (!add('Datos completos', campos, campos ? 'RUC, serie y número, fecha e importe encontrados' : 'Falta un dato obligatorio', 'rechazo')) return fin('rechazado', 'Datos incompletos', 0);
    if (!add('Cadena participante', RUC_CADENAS.has(c.ruc), RUC_CADENAS.has(c.ruc) ? `RUC ${c.ruc} · ${c.cadena}` : `RUC ${c.ruc} no pertenece a una cadena participante`, 'rechazo')) return fin('rechazado', 'Comercio no participante', 0);
    const f = new Date(c.fecha + 'T12:00:00');
    const enVig = f >= CAMPANA.inicio && f <= CAMPANA.fin;
    if (!add('Fecha dentro de la promo', enVig, enVig ? `Compra del ${fmtFecha(f)}` : `Compra del ${fmtFecha(f)}, fuera de la vigencia`, 'rechazo')) return fin('rechazado', 'Fuera de vigencia', 0);
    const nPart = c.items.filter(i => i.participa).length;
    if (!add('Incluye productos Casa Europa', nPart > 0, nPart ? `${nPart} producto(s) participante(s)` : 'No se encontraron productos participantes', 'rechazo')) return fin('rechazado', 'Sin productos participantes', 0);
    const dup = previos.find(p => p !== c && p.ruc === c.ruc && p.serie === c.serie && p.numero === c.numero && p.estado !== 'duplicado' && p.estado !== 'rechazado');
    if (!add('No registrado antes', !dup, dup ? `Ya registrado el ${fmtFechaHora(dup.recibido)} por ${dup.dni === c.dni ? 'el mismo participante' : 'otro participante'}` : 'Primera vez que llega este comprobante', 'dup')) return fin('duplicado', dup.dni === c.dni ? 'Duplicado (mismo participante)' : 'Duplicado (otro participante)', 0);
    const delDia = previos.filter(p => p !== c && p.dni === c.dni && new Date(p.recibido).toDateString() === new Date(c.recibido).toDateString() && (p.estado === 'aprobado' || p.estado === 'pendiente')).length;
    const okDia = delDia < CAMPANA.max_por_dia;
    add('Límite diario por DNI', okDia, okDia ? `${delDia + 1} de ${CAMPANA.max_por_dia} comprobantes hoy` : `Supera ${CAMPANA.max_por_dia} comprobantes en el día`, 'revision');
    const okMonto = c.importe <= CAMPANA.monto_revision;
    add('Importe razonable', okMonto, okMonto ? `S/ ${c.importe.toFixed(2)}` : `S/ ${c.importe.toFixed(2)} supera S/ ${CAMPANA.monto_revision}: lo revisa una persona`, 'revision');
    const okConf = c.confianza >= 0.86;
    add('Sin señales de edición', okConf, okConf ? 'Tipografía y totales consistentes' : 'Lectura dudosa: lo revisa una persona', 'revision');
    if (!okDia || !okMonto || !okConf) return fin('pendiente', !okDia ? 'Límite diario superado' : !okMonto ? 'Importe alto' : 'Lectura dudosa', 0);
    return fin('aprobado', '', opcionesDe(c));
    function fin(estado, motivo, opciones) { return { estado, motivo, checks, opciones }; }
  }

  // ---------- almacenamiento ----------
  function cargar() {
    try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.version === 3) return s; } catch (e) {}
    const s = sembrar(); guardar(s); return s;
  }
  function guardar(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { console.warn('No se pudo guardar', e); } }
  function reiniciar() { try { localStorage.removeItem(KEY); localStorage.removeItem('ce-demo-chat'); } catch (e) {} return cargar(); }

  // ---------- utilidades ----------
  const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic'];
  function fmtFecha(d) { d = new Date(d); return d.getDate() + ' ' + MESES[d.getMonth()]; }
  function fmtHora(d) { d = new Date(d); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
  function fmtFechaHora(d) { return fmtFecha(d) + ' ' + fmtHora(d); }
  function soles(n) { return 'S/ ' + Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim(); }
  const ETIQ = { aprobado: 'Aprobado', rechazado: 'Rechazado', duplicado: 'Duplicado', pendiente: 'Pendiente' };

  // ---------- dibujo de boleta (para las fotos de ejemplo) ----------
  function dibujarBoleta(canvas, c, opts) {
    opts = opts || {};
    const W = 300, items = c.items || [];
    const H = 330 + items.length * 18;
    canvas.width = W; canvas.height = H;
    const g = canvas.getContext('2d');
    g.save();
    g.fillStyle = '#6d6259'; g.fillRect(0, 0, W, H);
    g.translate(W / 2, H / 2); g.rotate(opts.giro || -0.012); g.translate(-W / 2, -H / 2);
    g.fillStyle = '#fbfaf6'; g.fillRect(14, 8, W - 28, H - 16);
    g.fillStyle = '#222'; g.textAlign = 'center';
    let y = 34;
    const t = (s, f, al) => { g.font = f; g.textAlign = al || 'center'; g.fillText(s, al === 'left' ? 26 : al === 'right' ? W - 26 : W / 2, y); };
    t(c.razon || '', 'bold 12px monospace'); y += 15;
    t('RUC ' + (c.ruc || ''), '11px monospace'); y += 14;
    t(c.cadena && c.cadena !== 'Otro comercio' ? (c.cadena + ' ' + (c.tienda || '')).toUpperCase() : 'AV. PRINCIPAL 123 - LIMA', '10px monospace'); y += 22;
    t((c.tipo === 'Factura' ? 'FACTURA' : 'BOLETA DE VENTA') + ' ELECTRÓNICA', 'bold 11px monospace'); y += 15;
    t((c.serie || '') + '-' + (c.numero || ''), 'bold 13px monospace'); y += 18;
    t('FECHA: ' + (c.fecha || '').split('-').reverse().join('/') + '   HORA: ' + fmtHora(c.recibido || Date.now()), '10px monospace'); y += 10;
    g.fillRect(26, y, W - 52, 1); y += 18;
    items.forEach(i => {
      t((i.cant + ' ' + i.nombre).slice(0, 30).toUpperCase(), '10px monospace', 'left');
      t((i.cant * i.precio).toFixed(2), '10px monospace', 'right'); y += 18;
    });
    g.fillRect(26, y - 6, W - 52, 1); y += 12;
    const op = c.importe / 1.18;
    t('OP. GRAVADA', '10px monospace', 'left'); t(op.toFixed(2), '10px monospace', 'right'); y += 15;
    t('IGV 18%', '10px monospace', 'left'); t((c.importe - op).toFixed(2), '10px monospace', 'right'); y += 18;
    t('TOTAL S/', 'bold 13px monospace', 'left'); t(Number(c.importe).toFixed(2), 'bold 13px monospace', 'right'); y += 22;
    // QR simulado
    const rq = rng(parseInt((c.numero || '1').slice(-6), 10) || 7);
    for (let a = 0; a < 15; a++) for (let b = 0; b < 15; b++) if (rq() < 0.5 || ((a < 4 || a > 10) && (b < 4 || b > 10) && (a % 10 === 0 || b % 10 === 0 || a === 3 || b === 3))) g.fillRect(W / 2 - 37 + a * 5, y + b * 5, 5, 5);
    y += 86;
    t('Representación impresa de la', '9px monospace'); y += 11; t(c.tipo === 'Factura' ? 'factura electrónica' : 'boleta de venta electrónica', '9px monospace');
    g.restore();
    if (opts.borroso) {
      const tmp = document.createElement('canvas'); tmp.width = W / 6; tmp.height = H / 6;
      tmp.getContext('2d').drawImage(canvas, 0, 0, W / 6, H / 6);
      g.imageSmoothingEnabled = true; g.drawImage(tmp, 0, 0, W, H);
      g.fillStyle = 'rgba(255,240,200,.25)'; g.fillRect(0, 0, W, H);
    }
    return canvas;
  }

  window.CE = { IMG, KEY, CAMPANA, CADENAS, PRODUCTOS, OTROS, FAQ_BASE, ROLES, cargar, guardar, reiniciar, validar, opcionesDe, dibujarBoleta, fmtFecha, fmtHora, fmtFechaHora, soles, esc, norm, ETIQ, DIA };
})();
