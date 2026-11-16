# Desarrollo web

Incluye 17 skills (orquestador, 15 departamentos y QA independiente) y un `AGENTS.md`.

## Instalación en tu proyecto
1. Copia `AGENTS.md` a la raíz de tu proyecto y rellénalo.
2. Copia la carpeta `.agents/` a la raíz de tu proyecto (queda `.agents/skills/<departamento>/SKILL.md`).
3. Abre el proyecto en Antigravity y comprueba que las skills aparecen en la pestaña Customizations (o con `agy skills list` en la CLI).
4. Si tu versión usa otra ruta para skills de proyecto, mueve las carpetas ahí; el formato `SKILL.md` es el mismo.

## Primer uso
Escribe en el chat del agente:

> Usa el orquestador. Objetivo: [tu objetivo]. Dame primero un plan con los departamentos necesarios y espera mi aprobación.

## Consejos
- Empieza con el núcleo: `orquestador`, `investigacion`, `producto-proyectos`, `ingenieria`, `contenido-comunicacion` y `qa-auditoria`. Añade los demás cuando hagan falta.
- Si el agente se vuelve lento o se llena el contexto, desactiva los departamentos que no uses.
- Edita las skills a tu gusto: son archivos de texto. Cuanto más específicas tus reglas, mejores resultados.
- La `description` de cada skill es lo que el agente lee para decidir si la usa: mantenla clara.
