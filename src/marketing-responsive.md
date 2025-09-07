# Marketing Page Responsive Updates

## Changes to make manually:

### 1. Main Container (line ~333)
```jsx
// FROM:
<div className="max-w-5xl mx-auto px-6 py-16">
// TO:
<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
```

### 2. Campaign Theme Grid (line ~374)
```jsx
// FROM:
<div className="grid grid-cols-3 gap-4">
// TO:
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
```

### 3. Theme Button Padding (line ~381)
```jsx
// FROM:
className={`p-5 rounded-lg border-2...
// TO:
className={`p-3 sm:p-4 lg:p-5 rounded-lg border-2...
```

### 4. Upload Section (line ~400)
```jsx
// FROM:
<div className="card p-8 space-y-6">
// TO:
<div className="card p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
```

### 5. Asset Preview Grid (line ~437)
```jsx
// FROM:
<div className="grid grid-cols-3 gap-4">
// TO:
<div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
```

### 6. Tone Grid (line ~492)
```jsx
// FROM:
<div className="grid grid-cols-2 gap-4">
// TO:
<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
```

### 7. Tone Button Padding (line ~499)
```jsx
// FROM:
className={`p-6 rounded-lg border-2...
// TO:
className={`p-4 sm:p-5 lg:p-6 rounded-lg border-2...
```

### 8. Step Headers (all steps)
```jsx
// FROM:
<h2 className="text-2xl font-bold...">
// TO:
<h2 className="text-xl sm:text-2xl font-bold...">
```

### 9. Stepper for Mobile (line ~337)
```jsx
// Wrap stepper in scrollable container for mobile:
<div className="mb-6 sm:mb-8 lg:mb-10 overflow-x-auto">
  <div className="flex items-center justify-between min-w-max px-2 sm:px-0">
    {/* existing stepper code */}
  </div>
</div>
```

### 10. Results Grid (line ~643)
```jsx
// FROM:
<div className="grid md:grid-cols-3 gap-6">
// TO:
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
```
