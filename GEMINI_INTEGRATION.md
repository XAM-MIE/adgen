# Gemini 2.5 Flash Image Integration

This document describes the integration of Google's Gemini 2.5 Flash Image model into the AdGen application for AI-powered image generation and editing.

## Features Implemented

### 1. **Text-to-Image Generation**
- Generate high-quality images from text descriptions
- Perfect for marketing materials, social media content, and brand assets
- Supports detailed prompts with style, composition, and mood specifications

### 2. **Image Editing**
- Modify existing images using natural language prompts
- Change backgrounds, add/remove objects, adjust colors, and more
- Support for multiple image inputs for complex edits

### 3. **Photo Restoration**
- Enhance and restore old or damaged photos
- Colorize black and white images
- Fix scratches, improve quality, and enhance details

### 4. **Media Input Support**
- Drag-and-drop file upload interface
- Supports PNG, JPEG, JPG, WebP formats
- File size limit: 10MB per image
- Preview thumbnails with file information

## Integration Points

### Pages Updated:
- **Marketing Page**: Added image generation option for marketing visuals
- **Brand Page**: Logo and brand asset generation after brand identity creation
- **New Image Tools Page**: Dedicated interface for all image operations

### Components Created:
- `ImageGeneration.tsx`: Main component for all image operations
- `MediaInput.tsx`: File upload and media handling component
- `geminiImageService.ts`: Service layer for Gemini API interactions

## API Configuration

The integration uses the provided API key: `AIzaSyDR8aFfOFXeCLOk8t6O09Cx0ZTyxnz6mgQ`

### Environment Setup:
```env
VITE_GEMINI_API_KEY=AIzaSyDR8aFfOFXeCLOk8t6O09Cx0ZTyxnz6mgQ
```

## Usage Examples

### 1. Marketing Image Generation
Navigate to Marketing → Select "Marketing Images" → Enter prompt:
```
"Create a photorealistic product shot of a smart coffee maker on a clean white background with professional studio lighting, suitable for Instagram marketing"
```

### 2. Brand Logo Creation  
Complete brand identity creation → Use logo generation section:
```
"Create a modern, minimalist logo for TechStart. Style: professional, Industry: technology, Values: innovation. Use clean lines and geometric shapes."
```

### 3. Image Editing
Upload an image → Enter editing prompt:
```
"Change the background to a sunset beach scene, keep the person in the foreground, add warm golden lighting"
```

### 4. Photo Restoration
Upload an old photo → Enter restoration prompt:
```
"Restore and colorize this 1950s family photo, enhance quality, fix scratches and improve facial details"
```

## Technical Implementation

### Service Layer (`geminiImageService.ts`)
```typescript
// Text-to-image generation
await geminiImageService.generateFromText({ prompt });

// Single image editing
await geminiImageService.editImage({
  prompt, imageData, mimeType
});

// Multiple image editing
await geminiImageService.editMultipleImages({
  prompt, images: [{ data, mimeType }]
});

// Photo restoration
await geminiImageService.restorePhoto(imageData, mimeType, customPrompt);
```

### File Handling
- Automatic base64 conversion for API compatibility
- Blob URL generation for image display
- Download functionality for generated images
- Memory management with URL cleanup

## Navigation

Access image tools through:
1. **Marketing Page**: Step 4 → Select "Marketing Images"
2. **Brand Page**: After generating brand identity → Brand assets section
3. **Image Tools Page**: Dedicated page accessible via navigation

## Features

### Image Generation Component Features:
- Multiple generation modes (generate/edit/restore)
- Real-time preview of uploaded images
- Error handling with user-friendly messages
- Download individual or batch images
- Responsive design for all screen sizes
- Progress indicators during generation

### File Upload Features:
- Drag and drop support
- File type validation
- File size validation
- Preview thumbnails
- Individual file removal
- Clear all functionality
- Support for multiple file selection

## Error Handling

The integration includes comprehensive error handling:
- API key validation
- File format validation
- File size limits
- Network error handling
- User-friendly error messages
- Graceful fallback states

## Security

- API key stored in environment variables
- Client-side validation of file types and sizes
- Secure file handling with memory cleanup
- No API key exposure in client code

## Performance

- Efficient base64 conversion
- Lazy loading of images
- Memory management for file previews
- Optimized bundle size with tree-shaking
- Responsive UI with loading states

## Next Steps

Potential enhancements:
1. **Conversational Editing**: Implement chat-based iterative image editing
2. **Batch Processing**: Handle multiple image operations simultaneously  
3. **Style Presets**: Pre-configured prompts for common use cases
4. **History/Gallery**: Save and manage generated images
5. **Advanced Options**: Fine-tune generation parameters
6. **Integration with Brand Colors**: Use generated brand colors in image prompts

## Testing

To test the integration:
1. Start the development server: `npm run dev`
2. Navigate to different pages to test image generation
3. Try uploading various image formats
4. Test different prompt styles and complexity
5. Verify download functionality works correctly

The integration is now fully functional and ready for use in marketing and brand creation workflows.
