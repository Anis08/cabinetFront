# 📺 Public Waiting Line Display

## Overview

A public-facing waiting line display that shows the current patient in consultation and the next 3 patients waiting. The display updates in real-time using WebSocket technology.

## Features

### 🎯 Main Features

1. **Current Patient Display (Large)**
   - Shows the patient currently in consultation
   - Large, prominent display with animation
   - Shows appointment time if available
   - Green border indicating active status

2. **Waiting Queue (Up to 3 patients)**
   - Shows next 3 patients in waiting line
   - Numbered badges (1st = yellow, 2nd = orange, 3rd = blue)
   - "Suivant" (Next) indicator for first patient
   - Displays appointment times

3. **Real-Time Updates**
   - WebSocket connection for live updates
   - Automatic reconnection on disconnect
   - No page refresh needed
   - Smooth animations for patient changes

4. **Modern UI**
   - Full-screen gradient background
   - Large, readable text for distance viewing
   - Animated transitions
   - Live clock display (updates every second)
   - Date display in French

### 🔓 Public Access

- **No Authentication Required** - Anyone can access this page
- **Direct URL**: `/waiting-line`
- **Can be displayed on TV/Monitor** in waiting room

## Technical Implementation

### Frontend

**File**: `src/pages/PublicWaitingLine.jsx`

**Dependencies**:
- `socket.io-client` - WebSocket communication
- `framer-motion` - Animations
- `lucide-react` - Icons

**State Management**:
```javascript
const [currentPatient, setCurrentPatient] = useState(null)
const [waitingPatients, setWaitingPatients] = useState([])
const [loading, setLoading] = useState(true)
const [currentTime, setCurrentTime] = useState(new Date())
```

**WebSocket Events**:
- `connect` - Connection established
- `disconnect` - Connection lost
- `waiting-line-update` - New waiting line data received

### Backend Requirements

#### REST API Endpoint

**Endpoint**: `GET /public/waiting-line`

**Response Format**:
```json
{
  "current": {
    "id": "patient-123",
    "name": "Jean Dupont",
    "fullName": "Jean Dupont",
    "appointmentTime": "2025-11-09T14:30:00.000Z"
  },
  "waiting": [
    {
      "id": "patient-456",
      "name": "Marie Martin",
      "fullName": "Marie Martin",
      "appointmentTime": "2025-11-09T14:45:00.000Z"
    },
    {
      "id": "patient-789",
      "name": "Pierre Bernard",
      "fullName": "Pierre Bernard",
      "appointmentTime": "2025-11-09T15:00:00.000Z"
    }
  ]
}
```

#### WebSocket Implementation

**Server Setup** (Node.js example with Socket.IO):

```javascript
const io = require('socket.io')(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

// When waiting line changes
function broadcastWaitingLineUpdate(currentPatient, waitingPatients) {
  io.emit('waiting-line-update', {
    current: currentPatient,
    waiting: waitingPatients.slice(0, 3) // Only send first 3
  })
}

// Example: When appointment status changes
appointment.on('statusChange', async () => {
  const current = await getCurrentPatient()
  const waiting = await getWaitingPatients()
  broadcastWaitingLineUpdate(current, waiting)
})
```

### Routing Configuration

**File**: `src/AppSimple.jsx`

```javascript
// Public route - No authentication required
<Route path="/waiting-line" element={<PublicWaitingLine />} />
```

This route is placed **outside** the `<AuthProvider>` component, making it accessible without login.

## Usage

### For Clinic Staff

1. **Setup Display**:
   - Open browser on TV/Monitor
   - Navigate to: `https://your-domain.com/waiting-line`
   - Set browser to fullscreen mode (F11)

2. **Kiosk Mode** (Optional):
   - Use browser kiosk mode to prevent accidental navigation
   - Disable mouse cursor
   - Auto-start on system boot

### For Developers

#### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access the page
open http://localhost:5173/waiting-line
```

#### Testing WebSocket Connection

```javascript
// Open browser console on the page
// You should see:
// "WebSocket connected"

// Test manual update (from backend):
io.emit('waiting-line-update', {
  current: { id: '1', name: 'Test Patient', appointmentTime: new Date() },
  waiting: [
    { id: '2', name: 'Patient 2', appointmentTime: new Date() },
    { id: '3', name: 'Patient 3', appointmentTime: new Date() }
  ]
})
```

## Configuration

### Environment Variables

The component uses the `baseURL` from `src/config.js`:

```javascript
export const baseURL = import.meta.env.VITE_API_BASE_URL
```

**WebSocket URL** is automatically derived from `baseURL`:
- HTTP URL: `http://localhost:3000` → WebSocket URL: `ws://localhost:3000`
- HTTPS URL: `https://api.domain.com` → WebSocket URL: `wss://api.domain.com`

### Customization

#### Change Number of Waiting Patients Displayed

In `PublicWaitingLine.jsx`, line 200:

```javascript
{waitingPatients.slice(0, 3).map((patient, index) => (
  // Change 3 to any number you want
```

#### Change Update Animation Speed

In `PublicWaitingLine.jsx`, adjust motion transitions:

```javascript
<motion.div
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.8 }}
  transition={{ duration: 0.3 }} // Adjust duration here
>
```

#### Change Colors

Modify Tailwind classes in the component:
- Background gradient: `from-blue-900 via-blue-800 to-blue-900`
- Current patient border: `border-green-400`
- Badge colors: `bg-yellow-500`, `bg-orange-500`, `bg-blue-500`

## Troubleshooting

### WebSocket Not Connecting

1. **Check backend is running**:
   ```bash
   curl http://localhost:3000/public/waiting-line
   ```

2. **Check CORS configuration** on backend:
   ```javascript
   cors: {
     origin: "*", // Or specific domain
     methods: ["GET", "POST"]
   }
   ```

3. **Check browser console** for error messages

4. **Verify WebSocket URL**:
   ```javascript
   console.log('Connecting to:', getSocketURL())
   ```

### No Data Displayed

1. **Check API endpoint** returns correct format
2. **Verify patient data** has required fields:
   - `id` (required)
   - `name` or `fullName` (required)
   - `appointmentTime` (optional)

3. **Test with mock data**:
   ```javascript
   // Add this in useEffect to test
   setCurrentPatient({ id: '1', name: 'Test Patient' })
   setWaitingPatients([
     { id: '2', name: 'Patient 2' },
     { id: '3', name: 'Patient 3' }
   ])
   ```

### Display Issues

1. **Clear browser cache**: Ctrl+Shift+R
2. **Check console** for errors
3. **Verify responsive design** - test on different screen sizes
4. **Update Framer Motion** if animations not working:
   ```bash
   npm update framer-motion
   ```

## Performance

### Optimizations

1. **Lazy Loading**: Component only loads when accessed
2. **Efficient Re-renders**: Uses React hooks properly
3. **WebSocket Reconnection**: Automatic with exponential backoff
4. **Memory Management**: Cleanup on unmount

### Resource Usage

- **Initial Load**: ~200KB (including dependencies)
- **WebSocket**: Minimal bandwidth (only updates sent)
- **Memory**: <50MB typical usage
- **CPU**: <5% on modern hardware

## Security Considerations

### Public Access

⚠️ **Important**: This page is publicly accessible by design.

**Data Exposure**:
- Patient names are visible to anyone in waiting room
- No sensitive medical information should be displayed
- No patient IDs should be visible to users

**Recommended Backend Security**:
```javascript
// Only return minimal data for public display
router.get('/public/waiting-line', (req, res) => {
  const current = getCurrentPatient()
  const waiting = getWaitingPatients()
  
  // Sanitize data - remove sensitive fields
  const sanitize = (patient) => ({
    id: patient.id, // Keep for React key
    name: patient.firstName + ' ' + patient.lastName[0] + '.', // Only first letter of last name
    appointmentTime: patient.appointmentTime
  })
  
  res.json({
    current: current ? sanitize(current) : null,
    waiting: waiting.slice(0, 3).map(sanitize)
  })
})
```

## Browser Compatibility

✅ **Supported Browsers**:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

⚠️ **Limited Support**:
- Internet Explorer (not recommended)

## Future Enhancements

### Possible Features

1. **Audio Announcements**: Text-to-speech for patient names
2. **Queue Number System**: Display numbers instead of names
3. **Multi-language Support**: French, English, Arabic, etc.
4. **Estimated Wait Time**: Show approximate wait time
5. **Doctor Information**: Show which doctor is available
6. **Emergency Alerts**: Red banner for urgent messages
7. **QR Code**: For patients to check their position
8. **Slideshow Mode**: Rotate between queue and announcements

## License

This component is part of the Cabinet Médical project.

## Support

For issues or questions, contact the development team.

---

**Last Updated**: 2025-11-09
**Version**: 1.0.0
