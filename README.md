# appcursos

Apps didácticas de una sola página (HTML autocontenido), organizadas por curso.
`index.html` en la raíz las lista todas.

## Estructura

```
index.html                  índice de todas las apps
apps/
  apps.js                   manifiesto que lee el índice (generado)
  publicitario/             un curso = una carpeta
    forja_diafragmas.html   una app = un archivo HTML autocontenido
scripts/
  build-index.mjs           regenera apps/apps.js escaneando apps/
```

## Añadir una app

1. Guarda el HTML en `apps/<curso>/<nombre>.html`.
2. Que el archivo lleve:
   - `<title>NOMBRE · detalle</title>` — lo de antes del `·` se muestra como
     nombre de la app; lo de después, como detalle.
   - `<meta name="description" content="…">` — la descripción de la tarjeta.
3. Regenera el manifiesto:

```bash
node scripts/build-index.mjs
```

## Añadir un curso

Crea `apps/<curso>/` y mete dentro sus apps. Para el nombre visible, o bien
pones la primera línea de `apps/<curso>/curso.txt`, o bien añades la carpeta al
mapa `CURSOS` de `scripts/build-index.mjs`. Sin ninguna de las dos, se usa el
nombre de la carpeta.

Un curso sin apps HTML no aparece en el índice.

## Publicar

Todo es estático y funciona igual abierto con doble clic (`file://`) o servido
por GitHub Pages (Settings → Pages → rama `main`, carpeta `/`). El índice enlaza
con rutas relativas, así que no depende del dominio.
