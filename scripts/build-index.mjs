#!/usr/bin/env node
// ============================================================
// appcursos · regenera apps/apps.js escaneando apps/<curso>/*.html
//
//   node scripts/build-index.mjs
//
// De cada app toma:
//   · <title>FORJA · diafragmas</title>   -> titulo "FORJA", detalle "diafragmas"
//   · <meta name="description" ...>       -> descripcion
//
// El nombre visible de un curso sale, por orden:
//   1. la primera línea de apps/<curso>/curso.txt (si existe)
//   2. el mapa CURSOS de aquí abajo
//   3. el nombre de la carpeta, con guiones convertidos en espacios
// ============================================================
'use strict';

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ    = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR_APPS = join(RAIZ, 'apps');
const SALIDA   = join(DIR_APPS, 'apps.js');

// nombres bonitos por carpeta (opcional: también sirve apps/<curso>/curso.txt)
const CURSOS = {
  publicitario: 'Fotodiseño publicitario'
};

function nombreCurso(id){
  const txt = join(DIR_APPS, id, 'curso.txt');
  if (existsSync(txt)) {
    const primera = readFileSync(txt, 'utf8').split('\n')[0].trim();
    if (primera) return primera;
  }
  if (CURSOS[id]) return CURSOS[id];
  const suelto = id.replace(/[-_]+/g, ' ');
  return suelto.charAt(0).toUpperCase() + suelto.slice(1);
}

function etiqueta(html, re){
  const m = html.match(re);
  if (!m) return '';
  return m[1]
    .replace(/\s+/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .trim();
}

function leerApp(idCurso, archivo){
  const ruta = `apps/${idCurso}/${archivo}`;
  const html = readFileSync(join(DIR_APPS, idCurso, archivo), 'utf8');

  const titulo = etiqueta(html, /<title[^>]*>([\s\S]*?)<\/title>/i)
                 || basename(archivo, '.html');
  const desc   = etiqueta(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);

  // "FORJA · diafragmas" -> nombre + detalle
  const partes = titulo.split('·').map(s => s.trim()).filter(Boolean);

  return {
    titulo: partes[0] || titulo,
    detalle: partes.slice(1).join(' · '),
    descripcion: desc,
    archivo,
    ruta
  };
}

function carpetas(dir){
  return readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('.'))
    .map(d => d.name)
    .sort((a, b) => a.localeCompare(b, 'es'));
}

const cursos = carpetas(DIR_APPS).map(id => {
  const apps = readdirSync(join(DIR_APPS, id))
    .filter(f => f.toLowerCase().endsWith('.html') && f.toLowerCase() !== 'index.html')
    .sort((a, b) => a.localeCompare(b, 'es'))
    .map(f => leerApp(id, f));
  return { id, nombre: nombreCurso(id), apps };
}).filter(c => c.apps.length);

const contenido =
`/* ============================================================
   appcursos · manifiesto de apps
   Generado por scripts/build-index.mjs (node scripts/build-index.mjs)
   Se puede editar a mano, pero al regenerar se sobrescribe.
   ============================================================ */
window.APPCURSOS = ${JSON.stringify({ cursos }, null, 2)};
`;

writeFileSync(SALIDA, contenido, 'utf8');

const total = cursos.reduce((n, c) => n + c.apps.length, 0);
console.log(`apps/apps.js · ${cursos.length} curso(s) · ${total} app(s)`);
cursos.forEach(c => {
  console.log(`  ${c.nombre} (apps/${c.id}/)`);
  c.apps.forEach(a => console.log(`    · ${a.titulo}${a.detalle ? ' · ' + a.detalle : ''}  ->  ${a.archivo}`));
});
