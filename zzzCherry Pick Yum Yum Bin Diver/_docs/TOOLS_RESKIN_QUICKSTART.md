# 🎨 TOOLS RESKIN - QUICK START GUIDE

## TL;DR

I built 5 working tools that look like shit. You need to reskin them to match the SICK homepage design.

---

## 📁 ONE FILE TO READ

**`RESKIN_ALL_TOOLS_PROMPT.md`** - Complete reskin guide (500+ lines)

Contains:
- Tool-by-tool redesign specs
- Exact code patterns to use
- Color schemes for each tool
- Animation specs
- Do's and don'ts

---

## 🎯 YOUR JOB

### Reskin these 5 files:
1. `src/app/tools/email-signature/page.tsx` → Purple/pink gradients
2. `src/app/tools/typing-test/page.tsx` → Yellow/orange (MOST POPULAR)
3. `src/app/tools/salary-calculator/page.tsx` → Green/emerald
4. `src/app/tools/linkedin-optimizer/page.tsx` → Blue/indigo
5. `src/app/tools/skills-gap/page.tsx` → Red/rose

### Reference this file:
`src/app/home/page.tsx` (lines 1-600) - Copy the styling patterns

---

## ✅ KEEP (Don't Touch)
- ALL functionality (forms, logic, state)
- ALL imports
- ALL routes
- ALL data

## 🎨 CHANGE (Make It Sexy)
- Background: `bg-gray-50` → `bg-black`
- Cards: White → Dark gradient with glows
- Text: Dark → Light with gradient headlines
- Buttons: Basic → Gradient with glow effects
- Add framer-motion animations
- Add glow orbs in background

---

## 🎨 DESIGN SYSTEM (Copy from Homepage)

### Base Pattern
```tsx
<div className="min-h-screen bg-black text-white overflow-hidden">
  {/* Gradient background */}
  <div className="absolute inset-0 bg-gradient-to-br from-[COLOR]-950 via-black to-[COLOR2]-950 opacity-70" />
  
  {/* Glow orb */}
  <div className="absolute top-0 left-1/2 w-[800px] h-[800px] bg-[COLOR]/10 rounded-full blur-[150px]" />
  
  <div className="relative z-10 container mx-auto px-4 py-20">
    {/* Tool content */}
  </div>
</div>
```

### Gradient Colors (from homepage `tools` array)
- Email Signature: `from-purple-500 to-pink-600`
- Typing Test: `from-yellow-500 to-orange-600`
- Salary Calculator: `from-green-500 to-emerald-600`
- LinkedIn Optimizer: `from-blue-600 to-indigo-600`
- Skills Gap: `from-red-500 to-rose-600`

### Dark Card
```tsx
<motion.div
  whileHover={{ y: -4 }}
  className="bg-gradient-to-br from-gray-900/90 to-black rounded-3xl p-10 border-2 border-gray-800/50 hover:border-[ACCENT]/70 transition-all duration-500 shadow-[0_20px_70px_-15px_rgba(0,0,0,0.8)] hover:shadow-[0_30px_90px_-15px_rgba(R,G,B,0.4)]"
>
  {/* Content */}
</motion.div>
```

### Gradient Headline
```tsx
<h1 className="text-6xl md:text-7xl font-black mb-6">
  <span className="bg-gradient-to-r from-[COLOR]-400 to-[COLOR2]-400 bg-clip-text text-transparent drop-shadow-[0_0_60px_rgba(R,G,B,0.4)]">
    Gradient Part
  </span>
  <br />
  <span className="text-white">White Part</span>
</h1>
```

### Gradient Button
```tsx
<Button className="bg-gradient-to-r from-[COLOR] to-[COLOR2] hover:from-[COLOR-lighter] hover:to-[COLOR2-lighter] shadow-[0_0_40px_rgba(R,G,B,0.3)] hover:shadow-[0_0_60px_rgba(R,G,B,0.5)] text-white font-bold text-lg py-6 rounded-2xl">
  Button Text
  <ArrowRight className="ml-2" />
</Button>
```

---

## 🔥 SPECIAL FEATURES

### Typing Test: "MOST POPULAR" Badge
```tsx
<motion.div
  animate={{ scale: [1, 1.05, 1] }}
  transition={{ duration: 2, repeat: Infinity }}
  className="fixed top-4 right-4 z-50"
>
  <Badge className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 border-0 text-black font-black shadow-[0_0_40px_rgba(251,191,36,0.6)]">
    ⭐ MOST POPULAR
  </Badge>
</motion.div>
```

### LinkedIn + Skills Gap: Circular Score Gauge
```tsx
<div className="relative w-48 h-48">
  <svg className="transform -rotate-90" width="192" height="192">
    <circle
      cx="96" cy="96" r="88"
      fill="none"
      stroke="rgba(55, 65, 81, 0.3)"
      strokeWidth="12"
    />
    <circle
      cx="96" cy="96" r="88"
      fill="none"
      stroke="url(#gradient)"
      strokeWidth="12"
      strokeDasharray={`${(score / 100) * 553} 553`}
      strokeLinecap="round"
    />
  </svg>
  
  <div className="absolute inset-0 flex flex-col items-center justify-center">
    <div className="text-6xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
      {score}
    </div>
    <div className="text-gray-400 text-sm">/ 100</div>
  </div>
</div>
```

---

## 📋 CHECKLIST (For Each Tool)

- [ ] Import framer-motion: `import { motion } from 'framer-motion'`
- [ ] Change page background to `bg-black`
- [ ] Add gradient overlay backgrounds
- [ ] Add glow orb effect
- [ ] Wrap content in `motion.div` with animations
- [ ] Update headline to gradient text
- [ ] Add Badge above headline
- [ ] Change card backgrounds to dark gradients
- [ ] Update borders (gray → accent on hover)
- [ ] Style button with gradient + glow
- [ ] Update all inputs to dark theme
- [ ] Add hover effects to cards
- [ ] Test all functionality still works

---

## 🧪 TEST COMMANDS

```bash
# Start dev server
npm run dev

# Visit tools
http://localhost:3001/tools/email-signature
http://localhost:3001/tools/typing-test
http://localhost:3001/tools/salary-calculator
http://localhost:3001/tools/linkedin-optimizer
http://localhost:3001/tools/skills-gap

# Test each tool works (forms, buttons, calculations)
```

---

## 🎯 SUCCESS = TOOLS THAT LOOK LIKE HOMEPAGE

Compare your restyled tools to the homepage tool cards (section starting at line 471 in `home/page.tsx`).

They should have:
- Same dark aesthetic
- Same gradient style
- Same glow effects
- Same smooth animations
- But with unique colors per tool

---

## 💬 PRIORITY ORDER

1. **Typing Test** (most popular, most visible)
2. **Salary Calculator** (high usage expected)
3. **Skills Gap** (most complex, lots of UI)
4. **LinkedIn Optimizer** (simple, quick win)
5. **Email Signature** (simplest, do last)

---

## 🚀 GO TIME!

Read the full brief: `RESKIN_ALL_TOOLS_PROMPT.md`

Reference the homepage: `src/app/home/page.tsx`

Make these tools SICK! 🔥
