# C4 Context Diagram — CourseReader (Level 1)

```mermaid
C4Context
  title System Context — CourseReader

  Person(student, "Student", "Person using CourseReader to study courses")

  System_Boundary(cr, "CourseReader") {
    System(courseReader, "CourseReader", "Electrobun + React 19 + TypeScript + Bun desktop study app")
  }

  Rel(student, courseReader, "Reads lessons, takes quizzes, reviews with SRS, asks AI questions")

  System_Ext(fs, "File System", "subjects/ + ~/.coursereader/ with YAML/MD/JSON course data")
  System_Ext(aiBrowser, "Browser (User's AI)", "ChatGPT/Claude/Gemini/Perplexity — user pastes prompt")

  Rel(courseReader, fs, "Loads subjects, modules, lessons, quizzes, SRS decks")
  Rel(courseReader, aiBrowser, "Copies prompt + lesson context to clipboard, opens browser")
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| Student | Person | End user who studies course material |
| CourseReader | System | Electrobun desktop app: React 19 + TypeScript frontend, Bun backend |
| File System | External System | `subjects/` directory + `~/.coursereader/` storage |
| Browser (User's AI) | External System | User's browser — paste into ChatGPT/Claude/Gemini/Perplexity |

## Relationships

- Student → CourseReader: reads lessons, takes quizzes, reviews SRS cards, creates flash cards, asks AI
- CourseReader → File System: reads syllabus YAML, lesson MD, quiz YAML, SRS JSON, writes annotations
- CourseReader → Browser: copies persona prompt + lesson context to clipboard, opens Google AI Mode
