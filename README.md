# 🧪 PromptLab · Taller de instrucciones a la IA

Página interactiva para una clase de **70 minutos** con estudiantes de **5.º año del Ciclo Orientado en Economía** (16–17 años). Basada en las Unidades 2 y 3 del programa **EsencIA**.

| Momento | Duración | Qué se hace |
|---|---|---|
| 🧪 **1 · Laboratorio de prompts** | 22 min | Misma misión con 4 estilos de prompt (flash, receta, few shot, paso a paso), medidor de ingredientes en vivo, alerta de datos personales, autoevaluación y gráfico comparativo |
| 🦉 **2 · Aprender con la IA** | 23 min | Texto de una carilla sobre *scoring* crediticio e IA, subrayado, “prompt trampa vs. prompt tutor”, 6 prompts tutores que guían sin dar la respuesta y desafío “sin red” con autoevaluación |
| 🦈 **3 · Tanque de Inversores IA** | 15 min | Máquina de startups, socios IA, canvas, crítica de un inversor IA, pitch de 60″ al compañero/a y tarjeta coleccionable con rareza |

También incluye nombre del estudiante, insignias, reloj de tiempo activo, progreso guardado en el navegador y una **bitácora** final que se puede imprimir en PDF o copiar como texto para Classroom.

**Idiomas: español, francés e inglés.** El botón **🌐 ES ▾** (arriba a la derecha) cambia el idioma en cualquier momento; por defecto está en **español**. Se traduce todo: consignas, el texto del Momento 2, los prompts tutores y de socios IA (la IA responde en ese idioma), la máquina de startups, la tarjeta y la bitácora. El medidor de ingredientes reconoce prompts escritos en cualquiera de los tres idiomas.

No usa preguntas de opción múltiple: todas las actividades piden construir, comparar, explicar o decidir.

## 🚀 Publicar en GitHub Pages
1. Creá un repositorio nuevo **público** llamado `ia_promptlab`.
2. Hacé clic en **uploading an existing file**, arrastrá **el contenido** de esta carpeta y luego en **Commit changes**.
3. **Settings → Pages → Deploy from a branch → `main` / `(root)` → Save**.
4. En 1 o 2 minutos el sitio queda en: **https://mamanirafa.github.io/ia_promptlab/**

## ✏️ Personalizar
Los contenidos están en `js/data.js` (español), `js/data.fr.js` (francés) y `js/data.en.js` (inglés); los textos de la interfaz, en `js/i18n.js`. En `js/data.js` está además la configuración: datos del docente, código docente, misiones, rondas, el **texto** del Momento 2, sus ideas clave, los prompts tutores y las opciones de la máquina de startups.

## 📁 Estructura
```
index.html · css/styles.css · js/data.js · js/data.fr.js · js/data.en.js · js/i18n.js · js/app.js · js/card.js
assets/img/ (ilustraciones SVG originales: Nova, íconos)
docs/GUIA_DOCENTE.md (secuencia, guion, criterios de evaluación)
```

Diseño didáctico: **Prof. Rafael Mamani** · Contenidos: programa EsencIA (Eidos Global / Google.org).
