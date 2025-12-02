# PuoAi Theme Customization

This document outlines the PuoAi design theme that has been applied to your Next.js AI Chatbot.

## 🎨 Design System

### Color Palette
- **Primary Blue**: `#3b82f6` (Blue 600)
- **Dark Blue**: `#1e40af` (Blue 800)
- **Light Gray Background**: `#f9fafb` (Gray 50)
- **White**: `#ffffff`
- **Text Gray**: `#1f2937` (Gray 800)

### Key Design Elements

#### 1. Chat Bubbles
- **User Messages**: 
  - Blue gradient background (`bg-blue-600`)
  - White text
  - Rounded corners with `rounded-3xl`
  - Notch on top-right (`rounded-tr-md`)
  - Padding: `px-5 py-3`

- **Assistant Messages**:
  - White background
  - Gray text (`text-gray-800`)
  - Rounded corners with `rounded-3xl`
  - Notch on top-left (`rounded-tl-md`)
  - Subtle shadow

#### 2. Input Field
- Fully rounded design (`rounded-full`)
- White background with gray border
- Blue border on focus
- Placeholder: "Type your message..."
- Padding: `px-4 py-3 pr-24`

#### 3. Buttons
- **Send Button**: 
  - Blue gradient background
  - White icon
  - Fully rounded (`rounded-full`)
  - Hover effect: darker blue

- **Action Buttons** (Copy, Like, etc.):
  - Transparent background
  - Blue icons (`text-blue-500`)
  - Rounded (`rounded-full`)
  - Gray background on hover

#### 4. Background
- Light gray (`bg-gray-50`) for main chat area
- Creates contrast with white message bubbles

## 📁 Component Structure

### Core PuoAi Components
Located in `components/puo/`:

1. **BottomIconBar** - Gradient action bar with swap, mic, and close buttons
2. **ChatBubble** - Message bubble with action buttons
3. **MicrophoneButton** - Animated microphone button with glowing effects
4. **TranslationInputBar** - Input field with mic and attachment buttons
5. **PuoHeader** - Header with back button and title
6. **LoadingRing** - Loading spinner

### Modified Existing Components

1. **message.tsx** - Updated with PuoAi chat bubble styling
2. **multimodal-input.tsx** - Rounded input field with blue send button
3. **message-actions.tsx** - Rounded action buttons with blue icons
4. **chat.tsx** - Gray background for chat container

## 🎯 Usage

### Standard Chat (with PuoAi theme)
```tsx
import { Chat } from '@/components/chat';

// The default chat now uses PuoAi styling
<Chat 
  id={id}
  initialMessages={[]}
  selectedModelId={modelId}
  selectedVisibilityType="private"
  isReadonly={false}
/>
```

### PuoAi Components
```tsx
import { ChatBubble, MicrophoneButton, TranslationInputBar } from '@/components/puo';

// Use individual components
<ChatBubble 
  message="Hello!"
  type="incoming"
  showActions={true}
  onCopy={() => console.log('Copied')}
/>

<MicrophoneButton 
  variant="glowing"
  onHoldStart={() => console.log('Recording...')}
/>

<TranslationInputBar 
  onSend={(msg) => console.log(msg)}
  onMicPress={() => console.log('Mic pressed')}
/>
```

## 🎨 Custom Styles

Custom CSS utilities added to `globals.css`:

```css
.puo-gradient-blue {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
}

.puo-shadow-soft {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.puo-shadow-glow {
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}
```

## 🚀 Features

### Voice Input
- Microphone button with hold-to-speak functionality
- Glowing animation when active
- Supports both click and hold interactions

### Message Actions
- Copy message to clipboard
- Upvote/downvote responses
- Text-to-speech (speak message)
- Reply to message

### Responsive Design
- Mobile-first approach
- Tablet layout support
- Adaptive spacing and sizing

## 🔧 Customization

### Changing Colors
Update the color values in the component files:
- User message background: `bg-blue-600` → your color
- Assistant message background: `bg-white` → your color
- Button colors: `bg-blue-600 hover:bg-blue-700` → your colors

### Adjusting Bubble Shape
Modify the border radius classes:
- `rounded-3xl` - main bubble roundness
- `rounded-tr-md` / `rounded-tl-md` - notch style

### Input Field Style
Change in `multimodal-input.tsx`:
- `rounded-full` - fully rounded
- `rounded-2xl` - less rounded
- Adjust padding with `px-*` and `py-*` classes

## 📱 Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Speech Recognition API for voice input
- Speech Synthesis API for text-to-speech

## 🎉 Credits

Design inspired by PuoAi translation interface with modern, clean aesthetics and smooth animations.
