# CloudCopy Frontend

A modern, responsive file storage and sharing application built with Angular and Tailwind CSS.

## Features

- 🔐 **Secure Authentication** - Google Firebase authentication
- 📁 **File Upload** - Drag and drop file upload with progress
- 🔍 **Smart Search** - Search files by name or type
- 📱 **QR Code Sharing** - Generate QR codes for easy file sharing
- 🔗 **Public Links** - Create shareable public links
- 🗑️ **Bulk Operations** - Select and delete multiple files
- 📱 **Responsive Design** - Works perfectly on all devices
- 🎨 **Modern UI** - Beautiful design with Tailwind CSS

## Tech Stack

- **Angular 20** - Modern frontend framework
- **Tailwind CSS** - Utility-first CSS framework
- **Firebase** - Authentication and backend services
- **TypeScript** - Type-safe JavaScript
- **RxJS** - Reactive programming

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open your browser and navigate to `http://localhost:4200`

## Design System

### Colors
- **Primary**: Blue gradient (`#3b82f6` to `#1d4ed8`)
- **Secondary**: Gray scale (`#64748b` to `#0f172a`)
- **Success**: Green (`#10b981`)
- **Warning**: Yellow (`#f59e0b`)
- **Danger**: Red (`#ef4444`)
- **Info**: Blue (`#3b82f6`)

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700

### Components
- **Buttons**: Consistent styling with hover and focus states
- **Cards**: Clean, modern card design with shadows
- **Forms**: Accessible form inputs with proper focus states
- **Modals**: Responsive modal dialogs with backdrop

## Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## Animations

- **Fade In**: Smooth fade-in animations for content
- **Slide Up**: Cards slide up from bottom
- **Bounce In**: Modal dialogs bounce in
- **Hover Effects**: Subtle hover animations on interactive elements

## File Management

### Upload
- Drag and drop support
- File type validation
- Progress indicators
- Error handling

### Search
- Real-time search
- Search by filename or type
- Debounced input

### Bulk Operations
- Select individual files
- Select all functionality
- Bulk delete with confirmation

### Sharing
- Generate public links
- QR code generation
- Copy to clipboard

## Development

### Project Structure
```
src/
├── app/
│   ├── file-upload/
│   │   ├── file-upload.component.ts
│   │   ├── file-upload.component.html
│   │   └── file-upload.component.scss
│   └── app.component.ts
├── environments/
└── styles.scss
```

### Tailwind Configuration
- Custom color palette
- Custom animations
- Form and typography plugins
- Responsive utilities

### Styling Guidelines
- Use Tailwind utility classes
- Custom components in `styles.scss`
- Responsive design first
- Accessibility focused

## Build

### Development
```bash
npm start
```

### Production
```bash
npm run build
```

## Testing
```bash
npm test
```

## Contributing

1. Follow the existing code style
2. Use Tailwind CSS for styling
3. Ensure responsive design
4. Add proper TypeScript types
5. Test on multiple devices

## License

MIT License - see LICENSE file for details
