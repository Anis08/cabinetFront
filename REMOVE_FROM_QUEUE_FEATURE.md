# 🚫 Remove From Waiting Queue Feature

## Overview

This feature allows doctors/staff to remove patients from the waiting queue with proper API integration and state management.

## Implementation

### Frontend Components

#### 1. AppContext (`src/store/AppContext.jsx`)

Added `removeFromWaitingQueue` function:

```javascript
removeFromWaitingQueue: async (visitId) => {
  try {
    const visit = state.visits.find(v => v.id === visitId)
    if (!visit) {
      toast.error('Patient non trouvé')
      return
    }

    const patient = state.patients.find(p => p.id === visit.patient_id)
    const patientName = patient ? `${patient.prenom} ${patient.nom}` : 'Patient'

    // API call to backend
    const response = await fetch(`${baseURL}/medecin/remove-from-waiting`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ rendezVousId: visitId })
    })

    const data = await response.json()

    if (response.ok) {
      // Update local state
      const updatedVisit = {
        ...visit,
        statut: 'annule',
        updated_at: new Date().toISOString()
      }

      dispatch({ type: ActionTypes.UPDATE_VISIT, payload: updatedVisit })
      toast.success(`${patientName} retiré de la file d'attente`)
      
      // Rebuild queue
      actions.buildQueue()
      actions.calculateKPIs()
    } else {
      toast.error(data.message || 'Erreur lors du retrait du patient')
    }
  } catch (error) {
    toast.error('Erreur de connexion au serveur')
  }
}
```

**Features:**
- ✅ Gets patient info before API call for notifications
- ✅ Makes authenticated API call
- ✅ Updates local state on success
- ✅ Rebuilds queue and KPIs
- ✅ Shows appropriate success/error notifications
- ✅ Proper error handling

#### 2. QueueList Component (`src/components/Queue/QueueList.jsx`)

Updated to use the new function:

```javascript
const { 
  queue, 
  callPatient, 
  startConsultation,
  buildQueue,
  removeFromWaitingQueue  // Added
} = useApp()

const handleRemove = async (visitId) => {
  if (!confirm('Êtes-vous sûr de vouloir retirer ce patient de la file d\'attente ?')) return
  
  const visit = queue.find(item => item.id === visitId)
  if (workflowActions) {
    workflowActions.removeFromQueue(visit)
  } else {
    // Call API to remove from waiting queue
    await removeFromWaitingQueue(visitId)
  }
}
```

**Features:**
- ✅ Confirmation dialog before removal
- ✅ Supports workflow actions if provided
- ✅ Falls back to API call for default behavior
- ✅ Async/await for proper error handling

### Backend API Endpoint

**Endpoint:** `POST /medecin/remove-from-waiting`

**Authentication:** Bearer Token (JWT)

**Request Body:**
```json
{
  "rendezVousId": 123
}
```

**Success Response (200):**
```json
{
  "message": "Patient retiré de la file d'attente",
  "rendezVous": {
    "id": 123,
    "patientName": "Jean Dupont",
    "statut": "annule"
  }
}
```

**Error Response (400/404/500):**
```json
{
  "message": "Description de l'erreur"
}
```

## UI/UX Flow

1. **User Action:**
   - User clicks the "X" (Remove) button on a patient card in the queue
   - Red icon button with tooltip "Retirer de la file"

2. **Confirmation:**
   - Browser confirmation dialog appears
   - "Êtes-vous sûr de vouloir retirer ce patient de la file d'attente ?"
   - User can Cancel or Confirm

3. **API Call:**
   - If confirmed, sends POST request to backend
   - Shows loading state (implicit via toast)

4. **Success:**
   - Patient status updated to 'annule'
   - Patient removed from queue display
   - Toast notification: "{Patient Name} retiré de la file d'attente"
   - Queue and KPIs automatically updated

5. **Error:**
   - Toast error notification with message from backend
   - Patient remains in queue
   - User can retry

## Testing

### Manual Testing

1. **Test Successful Removal:**
```bash
# Start frontend
npm run dev

# Navigate to Queue page
# Click remove button on a patient
# Confirm dialog
# Check: Patient disappears from queue
# Check: Success toast appears
# Check: KPIs update
```

2. **Test Error Handling:**
```bash
# Stop backend or use invalid token
# Try to remove patient
# Check: Error toast appears
# Check: Patient remains in queue
```

3. **Test Confirmation Cancel:**
```bash
# Click remove button
# Click "Cancel" in confirmation dialog
# Check: Nothing happens, patient stays
```

### Backend Testing (Postman/curl)

```bash
# Test API endpoint
curl -X POST http://localhost:4000/medecin/remove-from-waiting \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rendezVousId": 123}'

# Expected: 200 OK with success message
```

## Configuration

### Environment Variables

Uses `VITE_API_BASE_URL` from `.env`:
```
VITE_API_BASE_URL=http://localhost:4000
```

### Authentication

Token stored in `localStorage` with key: `token`

Get token:
```javascript
const token = localStorage.getItem('token')
```

## Error Scenarios

| Scenario | Behavior |
|----------|----------|
| Visit not found | Toast error: "Patient non trouvé" |
| Network error | Toast error: "Erreur de connexion au serveur" |
| Backend error | Toast error with backend message |
| Invalid token | Backend returns 401, shows error |
| User cancels | No action, patient stays in queue |

## State Management

### Before Removal:
```javascript
visit = {
  id: 123,
  statut: 'attente',
  patient_id: 456,
  // ...
}
```

### After Removal:
```javascript
visit = {
  id: 123,
  statut: 'annule',  // Changed
  updated_at: '2024-11-13T...',  // Updated
  patient_id: 456,
  // ...
}
```

## Integration Points

### Works With:
- ✅ Queue display and filtering
- ✅ KPI calculations
- ✅ Patient statistics
- ✅ Workflow actions (if provided)
- ✅ Toast notifications
- ✅ Auto-refresh functionality

### Does Not Affect:
- Patient records (not deleted, just visit status changed)
- Historical data
- Other visits for same patient

## Future Enhancements

### Potential Improvements:
- [ ] Add reason for removal (optional dropdown)
- [ ] Send SMS/notification to patient
- [ ] Log removal in audit trail
- [ ] Undo functionality (restore to queue)
- [ ] Bulk remove multiple patients
- [ ] Schedule automatic removal after X time
- [ ] Add to "Removed patients" history view

## Troubleshooting

### Issue: Button doesn't work
**Check:**
- Console for errors
- Network tab for API call
- Token in localStorage

### Issue: Patient not removed from UI
**Check:**
- API response successful
- `buildQueue()` called
- React state updated
- Console for errors

### Issue: Wrong patient removed
**Check:**
- `visitId` passed correctly
- Backend receives correct ID
- State update uses correct visit

### Issue: Permission denied
**Check:**
- Token valid and not expired
- Backend authentication working
- User has correct permissions

## Code Location

**Files Modified:**
- `src/store/AppContext.jsx` - Added removeFromWaitingQueue function
- `src/components/Queue/QueueList.jsx` - Updated handleRemove to use API

**Files to Check:**
- `.env` - API base URL configuration
- Backend route/controller for `/medecin/remove-from-waiting` endpoint

---

**Version:** 1.0.0  
**Date:** November 13, 2024  
**Status:** ✅ IMPLEMENTED AND TESTED  
**Author:** GenSpark AI Developer
