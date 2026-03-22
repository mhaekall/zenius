# The Vanguard Prompts (2026)
> Dibuat oleh AI Agent menggunakan skill `prompt-engineer-pro` untuk "AI Productivity Hacker".
> Gunakan prompt ini di Cursor, Claude Code, atau Windsurf yang telah terhubung dengan MCP Exa, Firecrawl, dan Composio.

## 1. The "Trend-to-Component" Pipeline Prompt
*(Gunakan ini untuk otomatis meriset UI terbaru dan menjadikannya komponen nyata)*

````markdown
**[ROLE & CONTEXT]**
Act as a Senior Fullstack Engineer and Expert UI/UX Designer. I want to build a "Trending UI Showcase" component based on the latest 2026 design trends.

**[TECH STACK]**
- Frontend: Next.js App Router, React, TypeScript
- Styling: Tailwind CSS v4, Framer Motion for animation
- Backend/DB: Not needed for this component
- UI Library: Custom / shadcn/ui primitives

**[AESTHETIC & UI/UX RULES]**
- Implement a modern, premium "iOS / Spatial Computing" aesthetic.
- Use Glassmorphism heavily (backdrop-filter: blur, semi-transparent borders).
- Use a dark/pitch-black theme with subtle glowing ambient backgrounds.
- Add staggered micro-animations on load (fade up and scale).
- Do NOT use generic, default Tailwind colors (no default purple/indigo). Use refined, intentional palettes.

**[CORE FEATURES & LOGIC]**
1. **Research (Exa MCP):** Use the Exa Search MCP tool to find the top 3 latest web design trends in March 2026 (focus on frontend UI).
2. **Extraction (Firecrawl MCP):** Pick the best URL from the search results and use the Firecrawl MCP to extract the Markdown content of that page.
3. **Execution (Ruang Makan):** Based on the extracted markdown, create a stunning React component (e.g., a Card or Hero section) that implements that exact trend.

**[STEP-BY-STEP EXECUTION PLAN]**
1. Call Exa Search to find trends.
2. Call Firecrawl to read the top URL.
3. Setup the basic layout and scaffolding for the component in `src/components/TrendingUI.tsx`.
4. Build the static UI components using the extracted design principles.
5. Apply the final polish (glassmorphism and framer-motion animations).
````
*Mengapa ini God-Tier:* Prompt ini memaksa AI untuk tidak berhalusinasi. AI dipaksa mencari data *real-time* dengan Exa, membacanya dengan Firecrawl, baru kemudian menulis kode dengan batasan estetika Apple HIG yang ketat.

---

## 2. The "Auto-Social Poster" Pipeline Prompt
*(Gunakan ini setelah fitur selesai dibuat, untuk otomatis membuat konten promosi)*

````markdown
**[ROLE & CONTEXT]**
Act as a Viral Content Strategist and Tech Lead. I have just finished building a new UI component. I want to use Composio to draft a social media post and notify my team.

**[TECH STACK]**
- Integrations: Composio MCP (Notion, Slack)

**[AESTHETIC & UI/UX RULES]**
- Tone: Punchy, "AI Productivity Hacker", focus on results and speed.
- Format: Short paragraphs, use bullet points, include tech emojis (🚀, 🧠, ⚡).

**[CORE FEATURES & LOGIC]**
1. **Analysis:** Read the `src/components/TrendingUI.tsx` file to understand what was just built.
2. **Drafting (Composio - Notion):** Use the Composio MCP to create a new page in my Notion workspace titled "New Content Idea: [Component Name]" containing a 30-second TikTok script about how AI built this UI.
3. **Notification (Composio - Slack):** Use the Composio MCP to send a message to my Slack channel summarizing the component and providing a link to the Notion page.

**[STEP-BY-STEP EXECUTION PLAN]**
1. Read the component file.
2. Formulate the TikTok script (Hook, Body, Call to Action).
3. Execute the Composio tool to create the Notion page.
4. Execute the Composio tool to send the Slack notification.
````
*Mengapa ini God-Tier:* Ini adalah puncak dari efisiensi "Agentic". Anda tidak lagi membuka Notion atau Slack secara manual. AI membaca hasil kerjanya sendiri, merumuskan skrip konten, dan mem-posting-nya langsung lewat Meta-Server Composio.
