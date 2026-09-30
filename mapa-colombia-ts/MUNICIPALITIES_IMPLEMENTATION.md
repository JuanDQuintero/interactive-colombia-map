# Hybrid Municipalities Implementation Guide

## Overview
This document describes the implementation of the hybrid municipalities feature in the Colombia Map application. This feature allows users to filter attractions by municipality within each department, maintaining the department-level view as the primary navigation layer.

## Architecture

### 1. **Data Structure**
**File**: `src/data/municipalitiesData.ts`

- Contains municipality definitions organized by department code
- Each municipality has:
  - `id`: Unique identifier (e.g., 'CO-AMA-001')
  - `name`: Municipality name (e.g., 'Leticia')
  - `departmentId`: Reference back to parent department

**Current Status**: Data includes main/capital municipalities for each of the 32 departments (approximately 96 municipalities as examples)

**Future Enhancement**: Can be extended to include all 1,122 municipalities in Colombia

### 2. **Component Changes**
**File**: `src/components/Modals/DepartmentModal.tsx`

#### Added Features:
- Municipality selector with button-based filtering UI
- Visual distinction for selected municipality (emerald highlight)
- "Todos" (All) option for viewing all department attractions

#### UI Layout:
```
Header (Department Name)
↓
Municipality Filter (buttons: "Todos", "Leticia", "El Encanto", etc.)
↓
Search Bar
↓
Category Filter
↓
Attraction List (filtered by selected municipality)
```

### 3. **Interface Enhancements**
**File**: `src/interfaces/attraction.ts`

Added optional fields to `Attraction` interface:
- `municipalityId?: string`: Reference to municipality
- `municipalityName?: string`: Display name of municipality

These fields are optional to maintain backward compatibility with existing attractions that don't have municipality data.

### 4. **Custom Hook**
**File**: `src/hooks/useAttractionsByMunicipality.ts`

- Encapsulates municipality filtering logic
- Currently returns all attractions (ready for when Attraction includes municipalityId)
- Includes detailed comments on future implementation requirements

## Current State of Implementation

### ✅ Completed
1. Municipality data structure created and organized by department
2. DepartmentModal imports and renders municipality selector UI
3. Municipality selection state managed within component
4. Filtering logic prepared with custom hook
5. Attraction interface extended with optional municipality fields
6. Build verified - 0 compilation errors

### ⏳ Next Steps (For Production Use)

#### Phase 1: Enable Municipality Filtering
1. **Update Attraction data in Firebase**:
   - Add `municipalityId` and `municipalityName` fields to existing attractions
   - Assign each attraction to its appropriate municipality

2. **Uncomment filtering logic** in `useAttractionsByMunicipality`:
   - Activate the municipality-level filter
   - Attractions will automatically filter based on selected municipality

3. **Test municipality filtering**:
   - Verify filters work correctly
   - Confirm attraction counts update based on municipality

#### Phase 2: Expand Municipality Coverage (Optional)
1. Update `municipalitiesData.ts` with all 1,122 Colombian municipalities
2. Consider performance optimizations:
   - Virtual scrolling for large municipality lists
   - Dropdown selector instead of buttons for departments with many municipalities
   - Search functionality within municipality selector

#### Phase 3: Enhanced Analytics (Optional)
1. Track municipality-level completion statistics
2. Add municipality badges/indicators to department view
3. Enable municipality-level travel tips and local recommendations

## Usage Example

### For End Users
1. User clicks department (e.g., "Antioquia")
2. DepartmentModal opens showing:
   - Municipality selector with buttons: "Todos | Medellín | Envigado | Rionegro | ..."
   - All attractions from selected municipality
3. User can switch municipalities to see location-specific attractions
4. Can view all attractions by clicking "Todos"

### For Developers
```typescript
// Get municipalities for a specific department
import { getMunicipalitiesForDepartment } from '@/data/municipalitiesData';

const municipalities = getMunicipalitiesForDepartment('CO-ANT'); // Antioquia
// Returns: [
//   { id: 'CO-ANT-001', name: 'Medellín', departmentId: 'CO-ANT' },
//   { id: 'CO-ANT-002', name: 'Arendal', departmentId: 'CO-ANT' },
//   ...
// ]

// Get specific municipality details
import { getMunicipalityById } from '@/data/municipalitiesData';

const mun = getMunicipalityById('CO-ANT-001'); // 'Medellín'
```

## Performance Considerations

### Current State
- 1,384 modules in Vite build
- Build time: ~2.5 seconds
- Municipality selector uses client-side filtering (no server calls)

### Optimization Opportunities
1. **For large municipality lists** (when expanding to all 1,122):
   - Implement virtual scrolling on municipality buttons
   - Switch to dropdown + search pattern for departments with 50+ municipalities
   - Lazy load municipality data per department

2. **For filtering**:
   - Current useMemo pattern is efficient for typical use cases
   - Consider debouncing if search is added to municipality selector

## Files Modified/Created

### Created:
- `src/data/municipalitiesData.ts` - Municipality definitions
- `src/hooks/useAttractionsByMunicipality.ts` - Filtering hook

### Modified:
- `src/components/Modals/DepartmentModal.tsx` - Added UI and state management
- `src/interfaces/attraction.ts` - Added optional municipality fields

## Notes for Future Implementation

### When Adding Real Municipality Data:
1. Enable filtering in `useAttractionsByMunicipality.ts` (uncomment lines)
2. Update Firestore data with `municipalityId` field
3. Update `AttractionProposal` interface to include municipality selection
4. Add municipality dropdown to `ProposeAttractionForm.tsx`

### Considerations:
- The solution maintains department as primary level (solves UX/performance issues of 1,122 clickable regions)
- Municipalities become refinement/detail level for power users
- Zero breaking changes to existing department-based functionality
- Preserves current styling and interaction patterns

## Testing Checklist

- [ ] Municipality buttons appear for departments with municipalities data
- [ ] Clicking municipality button highlights it (emerald color)
- [ ] "Todos" button deselects individual municipalities
- [ ] Build completes without TypeScript errors
- [ ] Application renders without console errors
- [ ] Dark mode styling works for municipality buttons
- [ ] Municipality filtering doesn't break existing department functionality
