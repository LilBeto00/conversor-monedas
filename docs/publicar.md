# Cómo publicar cambios

La web se publica sola con **GitHub Pages** desde la rama `main`. Cada vez que subes cambios, en 1 o 2 minutos están en https://lilbeto00.github.io/conversor-monedas/

## Desde VS Code

1. Haz los cambios y guarda.
2. Icono **Control de código fuente** (la rama, a la izquierda).
3. Escribe un mensaje que diga qué has cambiado y pulsa **Confirmar**.
4. Pulsa **Sincronizar cambios**.
5. Apunta el cambio en `CHANGELOG.md`.

## Desde la consola

```
git add -A
git commit -m "Qué he cambiado"
git push
```

## Ver si se ha publicado

```
gh run list --limit 3
```
o en GitHub: pestaña **Actions** del repositorio.

## Ideas y tareas pendientes

Se apuntan como **Issues** en GitHub (pestaña Issues > New issue). Para verlas desde la consola: `gh issue list`.
