# Edit Notes Feature - Visual Guide

## 🎯 Feature Overview
You can now edit appointment notes directly from the patient profile page with an inline editor.

## 📍 Location
**Page:** Patient Profile (`/patient/:patientId`)
**Section:** "Notes des Rendez-vous" (with green theme)

## 🖼️ UI Components

### Before Editing (View Mode)
```
┌─────────────────────────────────────────────────────────┐
│ 📅 lundi 13 novembre 2024         [Terminé]             │
│                                                          │
│ ┌─────────────────────────────────────────────────┐    │
│ │ Patient arrived on time. Blood pressure normal. │ [✏️]│
│ │ Prescribed medication as discussed.              │    │
│ │ Follow-up in 2 weeks.                           │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ ⚖️ 72 kg   ❤️ 120/80 mmHg   💓 78 bpm                 │
└─────────────────────────────────────────────────────────┘
```

**Elements:**
- 📅 Date (formatted in French)
- Status badge (color-coded: green, blue, orange, gray)
- 📝 Note content (light green background)
- ✏️ Edit button (top-right, green hover)
- 📊 Vital signs (if available)

### During Editing (Edit Mode)
```
┌─────────────────────────────────────────────────────────┐
│ 📅 lundi 13 novembre 2024         [Terminé]             │
│                                                          │
│ ┌─────────────────────────────────────────────────┐    │
│ │ ┌───────────────────────────────────────────┐   │    │
│ │ │ Patient arrived on time.                  │   │    │
│ │ │ Blood pressure normal.                    │   │    │
│ │ │ Prescribed medication as discussed.       │   │    │
│ │ │ Follow-up in 2 weeks.                     │   │    │
│ │ └───────────────────────────────────────────┘   │    │
│ │                                                  │    │
│ │ [💾 Enregistrer]  [Annuler]                      │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ ⚖️ 72 kg   ❤️ 120/80 mmHg   💓 78 bpm                 │
└─────────────────────────────────────────────────────────┘
```

**Elements:**
- 📝 Textarea (4 rows, green border on focus)
- 💾 Save button (green background, white text)
- ❌ Cancel button (gray border)
- Edit icon disappears during edit

### During Save (Loading State)
```
┌─────────────────────────────────────────────────────────┐
│ 📅 lundi 13 novembre 2024         [Terminé]             │
│                                                          │
│ ┌─────────────────────────────────────────────────┐    │
│ │ ┌───────────────────────────────────────────┐   │    │
│ │ │ Patient arrived on time.                  │   │    │
│ │ │ Blood pressure normal.                    │   │    │
│ │ │ Prescribed medication as discussed.       │   │    │
│ │ │ Follow-up in 2 weeks.                     │   │    │
│ │ └───────────────────────────────────────────┘   │    │
│ │                                                  │    │
│ │ [⏳ Enregistrement...]  [Annuler] (disabled)     │    │
│ └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

**Elements:**
- ⏳ Loading text
- Both buttons disabled (50% opacity)
- Textarea disabled

## 🎨 Color Scheme

### Green Theme (Matching Notes Section)
- **Edit Button Hover:** `bg-green-100` (light green background)
- **Edit Icon:** `text-green-600` (green color)
- **Textarea Border Focus:** `ring-green-500` (green ring)
- **Save Button:** `bg-green-500 hover:bg-green-600` (green gradient)
- **Note Background:** `bg-green-50 border-green-100` (light green)

### Status Badges
- **Terminé:** Green (`bg-green-100 text-green-700`)
- **En cours:** Blue (`bg-blue-100 text-blue-700`)
- **En attente:** Orange (`bg-orange-100 text-orange-700`)
- **Other:** Gray (`bg-gray-100 text-gray-700`)

## 🎬 User Flow Animation

```
Step 1: View Note
    │
    └─> Click Edit Icon [✏️]
         │
Step 2: Edit Mode
    │
    ├─> Modify Text in Textarea
    │   │
    │   └─> Click "Enregistrer" [💾]
    │       │
    │       └─> Step 3: Saving...
    │           │
    │           └─> Step 4: Success!
    │               │
    │               └─> Return to View Mode (with updated note)
    │
    └─> OR Click "Annuler"
        │
        └─> Return to View Mode (no changes)
```

## 🔔 Feedback Messages

### Success
```
✅ Note modifiée avec succès !
```

### Validation Error
```
❌ La note ne peut pas être vide
```

### Server Error
```
❌ Erreur lors de la modification de la note.
```

### Network Error
```
❌ Une erreur est survenue lors de la modification de la note.
```

## 🎯 Interaction States

### Edit Button
| State | Appearance |
|-------|-----------|
| Default | Green icon, transparent background |
| Hover | Green icon, light green background (`bg-green-100`) |
| Hidden | During edit mode |

### Save Button
| State | Appearance |
|-------|-----------|
| Default | Green background, white text |
| Hover | Darker green, shadow |
| Disabled | 50% opacity, cursor not allowed |
| Loading | "Enregistrement..." text |

### Cancel Button
| State | Appearance |
|-------|-----------|
| Default | Gray border, dark text |
| Hover | Light gray background |
| Disabled | 50% opacity, cursor not allowed |

### Textarea
| State | Appearance |
|-------|-----------|
| Default | White background, gray border |
| Focus | Green ring (`ring-green-500`) |
| Disabled | Grayed out, cursor not allowed |

## 📱 Responsive Design
- **Mobile:** Full width, stacked buttons
- **Tablet:** Optimized spacing
- **Desktop:** Optimal layout with proper margins

## ♿ Accessibility
- **Title attributes:** "Modifier la note" on edit button
- **Disabled states:** Properly indicated with opacity and cursor
- **Keyboard navigation:** All interactive elements accessible
- **Screen readers:** Semantic HTML with proper labels

## 🧪 Testing Scenarios

### Happy Path
1. Click edit icon ✅
2. Modify note text ✅
3. Click "Enregistrer" ✅
4. See success message ✅
5. Note updates in view ✅

### Cancel Flow
1. Click edit icon ✅
2. Modify note text ✅
3. Click "Annuler" ✅
4. Changes discarded ✅
5. Original note shown ✅

### Validation
1. Click edit icon ✅
2. Clear all text ✅
3. Click "Enregistrer" ✅
4. See error: "La note ne peut pas être vide" ✅

### Token Refresh
1. Token expires during edit ✅
2. Save attempt triggers refresh ✅
3. Retry with new token ✅
4. Save completes successfully ✅

### Multiple Notes
1. Only one note editable at a time ✅
2. Editing one note hides other edit buttons ✅
3. Completing edit shows all edit buttons again ✅

## 🔧 Technical Details

### Component State
```typescript
const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
const [editNoteText, setEditNoteText] = useState('');
const [savingNote, setSavingNote] = useState(false);
```

### Conditional Rendering
```typescript
{editingNoteId === (rdv._id || rdv.id) ? (
  // Edit Mode: Textarea + Buttons
) : (
  // View Mode: Note Display
)}

{!editingNoteId && (
  // Show Edit Button only when not editing
)}
```

### API Call
```typescript
PUT /medecin/rendez-vous/${rendezVousId}/note
Headers: Authorization: Bearer ${token}
Body: { note: string }
```

## 🎨 CSS Classes Reference

### Layout
- `p-6`: Padding
- `flex items-start justify-between gap-4`: Flexbox layout
- `space-y-3`: Vertical spacing between elements

### Colors
- `bg-green-50`: Light green background
- `border-green-100`: Light green border
- `text-green-600`: Green text
- `bg-green-500`: Green background (button)
- `hover:bg-green-100`: Hover state

### Interactive
- `transition-colors`: Smooth color transitions
- `hover:bg-gray-100`: Hover effects
- `disabled:opacity-50`: Disabled state
- `disabled:cursor-not-allowed`: Disabled cursor

### Typography
- `text-gray-700`: Dark gray text
- `font-medium`: Medium font weight
- `whitespace-pre-wrap`: Preserve line breaks
- `leading-relaxed`: Relaxed line height

## 🚀 Live Demo
Visit the patient profile page and scroll to the "Notes des Rendez-vous" section to see the edit functionality in action!

**Dev Server:** https://5173-i9ggi3wid04kp8xrk8j3j-de59bda9.sandbox.novita.ai
