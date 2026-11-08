export interface NoteTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
}

export const DEFAULT_TEMPLATES: NoteTemplate[] = [
  {
    id: 'daily',
    name: 'Daily Note',
    description: 'Journal entry with date, priorities, and scratchpad',
    content: `# Daily Note: {{date}} ({{weekday}})

## 🎯 Top Priorities
- [ ] 
- [ ] 
- [ ] 

## 📝 Log & Notes


## 💡 Thoughts & Reflections

#daily #journal #{{year}}
`,
  },
  {
    id: 'zettel',
    name: 'Zettelkasten Atomic Idea',
    description: 'Single focused atomic concept with links and references',
    content: `# {{title}}

## Summary


## Context & Insights


## Connections
- [[Welcome to Synapse]]

## References


#zettel #concept
`,
  },
  {
    id: 'meeting',
    name: 'Meeting Minutes',
    description: 'Attendees, agenda, discussion notes, and action items',
    content: `# Meeting: {{title}} ({{date}})

**Time**: {{time}}
**Attendees**: 
- 

## Agenda
1. 

## Key Discussions


## Action Items
- [ ] 

#meeting #work
`,
  },
  {
    id: 'code-review',
    name: 'Code Review / Architecture Note',
    description: 'System design, components, and code references',
    content: `# Architecture: {{title}}

## Overview


## Architecture Diagram
\`\`\`mermaid
graph TD
    Client[Client App] --> Core[Synapse Engine]
    Core --> Storage[Local File Vault]
\`\`\`

## Code Specifications
\`\`\`typescript
export interface Service {
  execute(): Promise<void>;
}
\`\`\`

#architecture #code #engineering
`,
  },
];

export function applyTemplate(templateContent: string, noteTitle: string): string {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);
  const weekday = now.toLocaleDateString('en-US', { weekday: 'long' });
  const year = now.getFullYear().toString();

  return templateContent
    .replace(/\{\{title\}\}/g, noteTitle)
    .replace(/\{\{date\}\}/g, dateStr)
    .replace(/\{\{time\}\}/g, timeStr)
    .replace(/\{\{weekday\}\}/g, weekday)
    .replace(/\{\{year\}\}/g, year);
}
