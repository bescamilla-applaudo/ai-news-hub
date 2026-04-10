# Copilot Instructions — ai-news-hub & Contexto del Desarrollador

## Sobre el desarrollador
- Dev con experiencia freelance end-to-end en proyectos serios
- Onboarding activo en **Applaudo** (organización: `Applaudo-Internal`)
- Usa tanto **Copilot CLI** (terminal) como **Copilot VS Code** en paralelo
- Filosofía: investigar → entender → ejecutar → probar (ciclo constante)

## Proyecto actual: ai-news-hub
- Stack: React 19, TypeScript 6, Vite 8, TailwindCSS 4, Netlify Functions
- Deploy: `https://ai-news-applaudo.netlify.app`
- Arquitectura: `React SPA → /api/get-news (Netlify Function) → GNews API`
- La API key de GNews vive solo en el servidor (Netlify Function), nunca en el cliente

## Proyecto principal en Applaudo: Knewton
- Repos: `Knewton-AI` (Python/LangGraph), `Knewton-FE` (TypeScript/Remix), `Knewton-BE`
- `Knewton-AI` es una plataforma de agentes IA con +1000 archivos, patrones ReAct/Reflection/Planning
- LLM primario: Google Gemini. Framework: LangGraph v1 + FastAPI
- Cada "task" es un workflow LangGraph auto-registrado con estructura fija de 7 archivos

## Convenciones importantes
- Commits siempre con trailer: `Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>`
- No comentar código obvio, solo lo que necesita clarificación
- Cambios quirúrgicos — no tocar código no relacionado con la tarea
- Verificar siempre que los cambios no rompen comportamiento existente

## MCP configurado
- **Context7** activo tanto en CLI (`~/.copilot/mcp-config.json`) como en VS Code (`.vscode/mcp.json`)
- Usar Context7 para consultar docs actualizadas de LangGraph, Vite, React, FastAPI

## Cómo trabajamos
- CLI: estrategia, análisis de repos, planeación, revisión de PRs
- VS Code: implementación, completado de código, refactors locales
- El desarrollador entiende el *por qué* antes de implementar — no ejecutar ciegamente
