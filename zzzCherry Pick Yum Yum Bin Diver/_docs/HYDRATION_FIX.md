# Hydration Error Fixed - /recruiter/demo

## Issue

**Error**: React Hydration Mismatch on `/recruiter/demo` page

```
Error: Hydration failed because the server rendered text didn't match the client.
+ src={"https://ui-avatars.com/api/?name=Juan+Hernandez..."}
- src={"https://ui-avatars.com/api/?name=Michelle+Santos..."}
```

## Root Cause

The `generateFakeCandidates()` function used `Math.random()` to create fake candidate data. This caused:

1. **Server-side render** generated one set of random candidates (e.g., "Juan Hernandez")
2. **Client-side hydration** generated a DIFFERENT set of random candidates (e.g., "Michelle Santos")
3. **React detected the mismatch** and threw a hydration error

### Location
`src/app/(recruiter)/recruiter/demo/page.tsx:171`

```typescript
// ❌ BEFORE (Caused hydration mismatch)
const allCandidates = useMemo(() => generateFakeCandidates(30), []);
```

## The Fix

Changed from `useMemo` to `useState` + `useEffect` to ensure data only generates on the client-side:

```typescript
// ✅ AFTER (Fixed - Client-side only)
const [allCandidates, setAllCandidates] = useState<FakeCandidate[]>([]);

useEffect(() => {
  setAllCandidates(generateFakeCandidates(30));
}, []);
```

### Why This Works

1. **Initial render (server)**: `allCandidates` is empty array `[]`
2. **Hydration (client)**: Client receives same empty array
3. **After mount**: `useEffect` runs ONLY on client, generates random data
4. **No mismatch**: Server and client start with identical state

## Testing

Visit: http://localhost:3001/recruiter/demo

**Expected Result:**
- ✅ No hydration errors in console
- ✅ Page loads smoothly
- ✅ Candidate cards appear after mount
- ✅ All filters work correctly

## Related Hydration Issues to Avoid

### Common Causes

1. **`Math.random()`** - Generates different values on server/client
2. **`Date.now()`** - Time differs between renders
3. **`new Date()`** - Different timestamps
4. **Browser APIs** - `window`, `localStorage` only exist on client
5. **Dynamic imports** - Conditional rendering based on environment
6. **User locale** - Date/number formatting varies

### Best Practices

#### ❌ DON'T: Use random/time-based values in render

```typescript
// Bad - causes hydration mismatch
const id = Math.random();
const time = Date.now();
const formattedDate = new Date().toLocaleDateString();
```

#### ✅ DO: Generate dynamic data client-side only

```typescript
// Good - client-side only
const [id, setId] = useState('');
useEffect(() => {
  setId(Math.random().toString());
}, []);

// Or use 'use client' with client-only hooks
'use client';
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return null;
```

#### ✅ DO: Use stable data for SSR

```typescript
// Good - stable across renders
const candidates = useMemo(() => [
  { id: '1', name: 'Fixed Name' },
  { id: '2', name: 'Another Fixed Name' }
], []);
```

## File Modified

- `src/app/(recruiter)/recruiter/demo/page.tsx` (line 171-174)

## Status

✅ **FIXED** - Hydration error resolved

The `/recruiter/demo` page now loads without hydration mismatches.

---

**Fixed**: January 17, 2026, 2:35 PM  
**Issue**: React Hydration Mismatch  
**Solution**: Client-side data generation with useEffect
