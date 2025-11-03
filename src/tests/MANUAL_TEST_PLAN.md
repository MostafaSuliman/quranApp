# Manual Test Plan for Arabic Text Display Fix

## Critical Issues Fixed:
1. ✅ Updated Quran API to use correct endpoints (`/quran/verses/uthmani`)
2. ✅ Simplified data transformation to handle text_uthmani field directly
3. ✅ Added basic translations for Al-Fatiha (Chapter 1)
4. ✅ Enhanced Arabic text debugger with API testing

## Test URLs (assuming dev server on port 3001):
- Home page: http://localhost:3001/
- Lesson page: http://localhost:3001/lesson/current
- Arabic debug page: http://localhost:3001/debug/arabic

## Test Checklist:

### 1. Arabic Debug Page (`/debug/arabic`)
- [ ] Arabic fonts load correctly (Amiri, Uthmanic visible)
- [ ] Google Fonts access working
- [ ] Quran API test shows SUCCESS
- [ ] 3 verses from Al-Fatiha display with Arabic text
- [ ] Raw API response shows correct verse data
- [ ] AyahDisplay components render Arabic text properly

### 2. Lesson Page (`/lesson/current`)  
- [ ] Page loads without errors
- [ ] Arabic text displays in lesson exercises
- [ ] Bismillah shows correctly during loading
- [ ] Exercise cards show Arabic verses
- [ ] Translations display alongside Arabic text
- [ ] Audio play buttons appear (even if audio doesn't work)

### 3. Home Page (`/`)
- [ ] Bismillah displays correctly in header section
- [ ] QuranText component renders Arabic properly
- [ ] "Start Lesson" button navigates to lesson page

### 4. Browser Console Tests
```javascript
// Test API directly
fetch('https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=1')
  .then(r => r.json())
  .then(d => console.log('Verses:', d.verses.slice(0,3)))

// Test if CSS classes work
document.querySelector('.arabic-text')?.style.fontFamily
```

### 5. Expected Results:
- **Arabic Text**: بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ (should be clearly visible)
- **Font**: Amiri or Uthmanic font family applied
- **Direction**: Right-to-left text alignment
- **Translation**: "In the name of Allah, the Entirely Merciful, the Especially Merciful."

### 6. Common Issues to Check:
- [ ] No console errors related to API calls
- [ ] No "undefined" or missing text in verses
- [ ] No layout issues with RTL text
- [ ] Fonts don't fallback to default sans-serif

## Success Criteria:
✅ All Arabic text renders correctly with proper fonts
✅ API successfully loads verses from Quran.com
✅ Lesson page shows interactive exercises with Arabic text
✅ No JavaScript errors in browser console
✅ Arabic text is readable and properly formatted