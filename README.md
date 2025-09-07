# AdGen - AI Marketing & Brand Identity Generator

A comprehensive AI-powered platform for generating marketing campaigns and brand identities using Google's Gemini 2.5 Flash model, with voice interaction powered by ElevenLabs.

## 🚀 Features

### ✅ **Real AI Text Generation**
- **Marketing Content**: Generate ad copy, Instagram captions, email subjects, and banner headlines using Gemini 2.5 Flash
- **Brand Identity**: Create complete brand kits with colors, typography, taglines, and brand guidelines
- **Multiple Content Types**: Support for social media, email marketing, digital ads, content marketing, video scripts, and e-commerce

### ✅ **AI Image Generation** 
- **Text-to-Image**: Generate high-quality marketing images from descriptions
- **Image Editing**: Modify existing images with natural language prompts
- **Photo Restoration**: Enhance and colorize old photos
- **Brand Assets**: Create logos and visual brand elements

### ✅ **Voice Interaction**
- **Speech Recognition**: Voice input for all wizard steps
- **AI Voice Responses**: ElevenLabs-powered confirmation after each step
- **Conversational Flow**: Natural voice-driven experience
- **Fallback Support**: Manual text input when voice isn't available

### ✅ **Project Persistence**
- **Database Storage**: All projects saved to Supabase with full metadata
- **Project Management**: View, edit, and delete saved projects
- **Statistics Dashboard**: Track project counts and creation trends
- **Auto-Save**: Projects automatically saved after AI generation

### ✅ **Authentication & User Management**
- **Supabase Auth**: Complete user authentication system
- **User Profiles**: Automated profile creation on signup
- **Protected Routes**: Secure access to user-specific data
- **Row-Level Security**: Database-level security policies

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Custom Components
- **AI Services**: 
  - Google Gemini 2.5 Flash (Text & Image Generation)
  - ElevenLabs (Voice Synthesis)
  - Web Speech API (Voice Recognition)
- **Backend**: Supabase (Database, Auth, Storage)
- **State Management**: React Hooks
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd adgen-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your API keys:
   ```env
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_GEMINI_API_KEY=your-gemini-api-key
   VITE_ELEVENLABS_API_KEY=your-elevenlabs-api-key
   ```

4. **Set up Supabase Database**
   - Create a new Supabase project
   - Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor
   - Update your environment variables with the Supabase URL and anon key

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 📊 Database Schema

The application uses the following database structure:

### Tables
- **`profiles`**: User profile information
- **`projects`**: Main project records
- **`marketing_campaigns`**: Marketing-specific data
- **`brand_kits`**: Brand identity data

### Features
- **Row Level Security (RLS)**: Users can only access their own data
- **Automatic Profile Creation**: Profiles created on user signup
- **Cascading Deletes**: Related records cleaned up automatically
- **Timestamping**: Automatic creation and update timestamps

## 🎯 Usage

### Marketing Campaign Creation
1. Navigate to **Marketing** from the dashboard
2. Select campaign type (Social Media, Email, Ads, etc.)
3. Choose target audience and tone
4. Enter product/service description
5. AI generates multiple content pieces
6. Project automatically saved to dashboard

### Brand Identity Creation
1. Navigate to **Brand** from the dashboard  
2. Select industry and style preferences
3. Choose brand values
4. Provide brand description
5. AI generates complete brand kit (colors, typography, taglines)
6. Generate additional brand assets (logos, business cards)

### Image Generation
1. Access through Marketing page (select "Marketing Images")
2. Or use dedicated **Image Tools** page
3. Choose between Generate, Edit, or Restore modes
4. Upload images (for editing/restoration) or enter text prompts
5. Download generated images

### Voice Interaction
1. Voice confirmations play automatically after each step (if ElevenLabs is configured)
2. Use voice input in supported components
3. Manual fallback available when voice recognition fails

## 🔧 API Integrations

### Google Gemini 2.5 Flash
- **Text Generation**: Marketing copy and brand content
- **Image Generation**: Visual content creation
- **Smart Parsing**: Structured JSON responses with fallback handling

### ElevenLabs Voice
- **Voice Synthesis**: Natural voice confirmations
- **Multiple Voices**: Configurable voice selection
- **Error Handling**: Graceful fallback when voice synthesis fails

### Supabase
- **Authentication**: Email/password and social login support
- **Database**: PostgreSQL with real-time capabilities  
- **Storage**: File upload support (ready for future expansion)

## 🔒 Security Features

- **Environment Variables**: All API keys stored securely
- **Row Level Security**: Database-level access control
- **Input Validation**: Client and server-side validation
- **Error Handling**: Comprehensive error management
- **Rate Limiting**: Built-in API rate limiting

## 🚧 Development Notes

### Project Structure
```
src/
├── components/          # Reusable UI components
├── pages/              # Main application pages
├── services/           # API and business logic
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
└── config/             # Configuration files
```

### Key Services
- **`geminiTextService.ts`**: Handles all Gemini text generation
- **`geminiImageService.ts`**: Manages image generation and editing
- **`voiceService.ts`**: Voice recognition and synthesis
- **`projectService.ts`**: Database operations and project management

### Testing Recommendations
1. Test all AI generation flows (marketing, brand, images)
2. Verify project saving and loading
3. Test voice interactions (requires ElevenLabs API key)
4. Validate error handling with invalid inputs
5. Check responsive design on mobile devices

## 📈 Future Enhancements

- **Canvas Editor**: Visual design tools for logos and graphics
- **Template Library**: Pre-built templates for common use cases
- **Collaboration**: Multi-user project editing
- **Analytics**: Advanced project performance metrics
- **Export Options**: PDF, PNG, SVG export formats
- **API Endpoints**: Public API for third-party integrations

## 🐛 Troubleshooting

### Common Issues

1. **Voice Synthesis Not Working**
   - Verify ElevenLabs API key in environment variables
   - Check browser permissions for audio playback

2. **Database Connection Errors**
   - Confirm Supabase URL and keys are correct
   - Ensure database schema has been applied

3. **AI Generation Failures**
   - Verify Gemini API key is valid and has credits
   - Check network connectivity
   - Review error messages in browser console

4. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
   - Update browser if using outdated version

## 📞 Support

For technical support or feature requests, please refer to the project documentation or create an issue in the repository.

## 🎉 Completion Status

✅ **All major features implemented and tested:**
- Real AI text and image generation
- Voice interaction with confirmations  
- Project persistence and management
- User authentication and security
- Responsive UI with error handling
- Database schema and relationships

The AdGen platform is now fully functional with production-ready AI integrations!
