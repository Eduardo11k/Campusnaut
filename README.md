# CampusPulse

Agente de recomendação de eventos de campus para estudantes universitários. 
Versão demo em Next.js 14 com agenda estática de 40 eventos e um agente que 
pode usar LLM (OpenAI) ou um fallback determinístico local.

## Stack

- Next.js 14 (App Router)
- React + TypeScript
- Tailwind CSS
- date-fns / date-fns-tz
- Zod
- OpenAI API (opcional)

## Instalação

```bash
npm install
```

## Configurar LLM (opcional)

```bash
cp .env.example .env.local
```

Adiciona a tua chave OpenAI:

```
OPENAI_API_KEY=sk-...
```

Se a chave não existir, o agente usa automaticamente o fallback local de 
pontuação por tags, horário e preço.

## Correr localmente

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run typecheck
npm run build
```

## Estrutura das páginas

- `/` — Landing page com hero, passos e CTA.
- `/agente` — Formulário de recomendação (interesses, dias, horas, preço),
  skeleton, estados de erro/vazio e refinamento.
- `/agenda` — Filtros por tag/dia e exportação de eventos visíveis para `.ics`.

## Fluxo de teste rápido

1. Vai a `/agente`.
2. Seleciona interesses (ex: `IA`, `carreira`).
3. Mantém os dias de semana selecionados.
4. Clica em **Encontrar eventos**.
5. Espera 3–5 recomendações com justificação e exporta uma para calendário.

Para testar o modo LLM:

- Configura `OPENAI_API_KEY` e repete o fluxo.
- O `model` pode ser configurado em `lib/recommend.ts` (`gpt-4o-mini` por padrão).

Para testar o fallback determinístico:

- Remove ou comenta `OPENAI_API_KEY`.
- O agente continua a funcionar com pontuação local.

## Notas

- Fusorário usado: `America/Los_Angeles`.
- Dados gerados para a semana de 19–25 de outubro de 2026.
- Exportação ICS inclui `VTIMEZONE` embutido para compatibilidade com Google Calendar / Outlook.
