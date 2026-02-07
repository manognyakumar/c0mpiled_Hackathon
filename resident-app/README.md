# Resident App - Complete Demo

A comprehensive Next.js 14+ App Router demo for resident visitor management with multilingual support (EN/AR), RTL switching, and voice input capabilities.

## Features

### 🏠 Three Main Screens

1. **Today's Schedule** (`/`) - View today's visitor schedule with status tracking
2. **Approval Requests** (`/approvals`) - Manage pending visitor approvals with voice input
3. **Recurring Visitors** (`/recurring`) - Manage recurring visitor entries

### 🌍 Multilingual Support

- English and Arabic language support
- RTL (Right-to-Left) layout switching for Arabic
- Persistent language selection via localStorage
- Translation dictionary with t() helper function
- Lingo.dev integration ready (optional)

### 🎤 Voice Input

- Press-and-hold recording using MediaRecorder API
- Audio processing via `/api/voice/process` endpoint
- Real-time transcript display
- Graceful permission handling

### 🎨 Design Features

- Dark UI theme with custom CSS variables
- Mobile-first responsive design
- Clean card-based layouts
- Status badges and notifications
- Smooth animations and transitions

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Plain CSS with CSS variables
- **Date Utilities**: date-fns
- **API**: Next.js Route Handlers (mock data)

## Project Structure

```
resident-app/
├── app/
│   ├── layout.tsx                 # Root layout with nav
│   ├── page.tsx                   # Today's Schedule
│   ├── globals.css                # Global styles
│   ├── approvals/
│   │   └── page.tsx              # Approval Requests page
│   ├── recurring/
│   │   └── page.tsx              # Recurring Visitors page
│   └── api/                       # Mock API endpoints
│       ├── residents/[id]/schedule-today/route.ts
│       ├── approval-requests/route.ts
│       ├── visitors/
│       │   ├── approve/route.ts
│       │   └── deny/route.ts
│       ├── recurring-visitors/route.ts
│       └── voice/process/route.ts
├── components/
│   ├── VisitorCard.tsx           # Visitor schedule card
│   ├── ApprovalCard.tsx          # Approval request card
│   ├── VoiceInput.tsx            # Voice recording component
│   ├── LanguageToggle.tsx        # Language switcher
│   └── Toast.tsx                 # Notification component
├── lib/
│   ├── types.ts                  # TypeScript type definitions
│   └── i18n.ts                   # Translation utilities
├── package.json
├── tsconfig.json
└── next.config.mjs
```

## Getting Started

### Installation

1. Navigate to the project directory:

```bash
cd resident-app
```

2. Install dependencies:

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

Build the application:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## API Endpoints

All endpoints are mocked with realistic data:

- `GET /api/residents/123/schedule-today` - Today's visitor schedule
- `GET /api/approval-requests` - Pending approval requests
- `POST /api/visitors/approve` - Approve a visitor (body: `{ visitor_id, valid_until }`)
- `POST /api/visitors/deny` - Deny a visitor (body: `{ visitor_id }`)
- `GET /api/recurring-visitors` - List recurring visitors
- `POST /api/voice/process` - Process audio input (FormData with audio file)

## Key Features Explained

### Time Calculations

The approval flow uses `date-fns` to calculate validity windows:

- Valid until = Current time + 90 minutes
- Displayed in "Approved until HH:mm" format

### Voice Recording

1. Press and hold the microphone button to record
2. Release to stop and automatically send to API
3. Transcript appears below the button
4. Handles microphone permissions gracefully

### RTL Support

- Toggle language between EN/AR using the top-right button
- Document direction automatically switches to RTL for Arabic
- Arabic font fallback applied
- Layout elements flip appropriately

### State Management

- Local state for UI interactions
- localStorage for language persistence
- No hydration mismatches (safe SSR handling)

## Browser Compatibility

- Modern browsers with MediaRecorder API support
- Chrome, Edge, Firefox, Safari (latest versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

- Install `@lingo-dev/next` package to activate Lingo.dev compiler
- Connect to real backend APIs
- Add authentication and authorization
- Implement real-time updates via WebSocket
- Add push notifications for approval requests
- Expand voice command capabilities

## License

MIT

---

Built with ❤️ using Next.js 14+ App Router
