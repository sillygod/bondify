# Admin Interface

## Overview

The admin interface provides tools for managing AI-generated questions and monitoring system statistics.

## Access

Admin routes are available at `/admin/*`:
- `/admin` - Dashboard
- `/admin/questions` - Question Manager
- `/admin/generate` - Generate Questions

## Features

### Dashboard (`/admin`)

Displays statistics:
- **Questions**: Total, reviewed, pending counts by game type
- **Vocabulary Cache**: Cache hits, total lookups

### Question Manager (`/admin/questions`)

Manage AI-generated questions:

| Action | Description |
|--------|-------------|
| **Filter** | By game type and review status |
| **View** | Click to see full question details |
| **Edit** | Modify question JSON, difficulty |
| **Delete** | Remove question from database |
| **Review** | Mark as reviewed/pending |

### Generate Questions (`/admin/generate`)

Generate new AI questions:

1. Select game type from dropdown
2. Set count (1-50)
3. Choose difficulty (easy/medium/hard)
4. Click Generate
5. Monitor progress in real-time

## API Endpoints Used

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/game-questions/{type}` | GET | List questions |
| `/api/game-questions/{id}` | PATCH | Update question |
| `/api/game-questions/{id}` | DELETE | Delete question |
| `/api/game-questions/{id}/review` | POST | Toggle review status |
| `/api/game-questions/generate` | POST | Generate new questions |

## File Structure

```
src/admin/
├── index.ts              # Exports
├── api.ts                # Admin API client
├── AdminLayout.tsx       # Layout wrapper
├── components/
│   └── AdminSidebar.tsx  # Navigation
├── pages/
│   ├── AdminDashboard.tsx
│   ├── QuestionManager.tsx
│   └── GenerateQuestions.tsx
└── EditQuestionDialog.tsx
```
