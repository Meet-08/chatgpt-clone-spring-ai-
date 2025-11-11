# ChatGPT Clone

A full-stack AI assistant application that provides intelligent chat conversations, image generation, and voice input capabilities. Built with Spring Boot backend and Next.js frontend, powered by Azure OpenAI services.

## 🚀 Features

### Core Functionality

- **AI Chat**: Engage in intelligent conversations with AI assistant
- **Image Generation**: Create images from text descriptions using AI
- **Voice Input**: Record audio and transcribe it to text using speech-to-text
- **File Upload**: Upload PDF documents for context-aware conversations (RAG)
- **Vector Search**: Store and search document embeddings using pgvector

### Technical Features

- **Real-time Chat Interface**: Modern, responsive UI with message history
- **Voice Recording**: Browser-based audio recording with visual feedback
- **File Attachments**: Support for PDF uploads in chat
- **Image Download**: Generated images can be downloaded or viewed
- **Responsive Design**: Works on desktop and mobile devices

## 🛠 Tech Stack

### Backend

- **Java 25** - Programming language
- **Spring Boot 3.5.7** - Web framework
- **Spring AI 1.0.3** - AI integration framework
- **Azure OpenAI** - AI models for chat, image generation, and transcription
- **PostgreSQL + pgvector** - Vector database for document embeddings
- **Gradle** - Build tool
- **SpringDoc OpenAPI** - API documentation

### Frontend

- **Next.js 16** - React framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - Accessible UI components
- **Zustand** - State management
- **Lucide React** - Icon library

### Infrastructure

- **Docker Compose** - Container orchestration for PostgreSQL
- **pgvector** - PostgreSQL extension for vector operations

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Java 25**
- **Node.js 18+**
- **PostgreSQL 15+** with pgvector extension
- **Azure OpenAI Account**

## 🏗 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Meet-08/chatgpt-clone-spring-ai.git
cd chatgpt-clone-spring-ai
```

### 2. Backend Setup

```bash
cd chatgpt-clone-backend

# Build the application
./gradlew build

# Start PostgreSQL with pgvector using Docker Compose
docker-compose up -d

# Run the Spring Boot application
./gradlew bootRun
```

The backend will start on `http://localhost:8080`

### 3. Frontend Setup

```bash
cd ../chatgpt-ui

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

The frontend will start on `http://localhost:3000`

## 🔧 Configuration

### Database Configuration

The application uses PostgreSQL with the following default settings (configured in `application.yml`):

- **Host**: localhost
- **Port**: 5432
- **Database**: chatgpt_clone
- **Username**: meet
- **Password**: 1234

To change these settings, modify `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/your_database
    username: your_username
    password: your_password
```

### Azure OpenAI Configuration

Configure your Azure OpenAI deployments in `application.yml`:

```yaml
spring:
  ai:
    azure:
      openai:
        api-key: ${AZURE_OPENAI_API_KEY}
        endpoint: ${AZURE_OPENAI_ENDPOINT}
        chat:
          options:
            deployment-name: your-chat-deployment
            temperature: 1
        image:
          options:
            deployment-name: your-image-deployment
        audio:
          transcription:
            options:
              deployment-name: your-whisper-deployment
```

## 📡 API Endpoints

### Chat API

- **POST** `/api/v1/chat/message`
  - Send a chat message with optional file attachments
  - Body: `FormData` with `query` (string) and `files` (multipart files)

### Image Generation API

- **POST** `/api/v1/image/generate?prompt={prompt}`
  - Generate an image from text description
  - Query Parameter: `prompt` (string)

### Audio Transcription API

- **POST** `/api/v1/audio/transcribe`
  - Transcribe audio file to text
  - Body: `FormData` with `audioFile` (multipart file)

## 🎨 Usage

### Starting a Chat

1. Navigate to the chat page from the home screen
2. Type your message in the text area
3. Optionally attach PDF files for context
4. Use voice recording for hands-free input
5. Press Enter or click Send to get AI response

### Generating Images

1. Go to the "Create Image" page
2. Enter a detailed description of the image you want
3. Use voice recording to dictate your prompt
4. Click "Generate Image" to create the image
5. Download or view the generated image

### Voice Input

- Click the microphone button to start recording
- Speak clearly into your microphone
- Click stop when finished
- The transcribed text will be added to your current prompt

## 🏗 Project Structure

```
chatgpt-clone/
├── chatgpt-clone-backend/          # Spring Boot backend
│   ├── src/main/java/com/meet/chatgpt/
│   │   ├── ChatgptCloneBackendApplication.java
│   │   ├── config/
│   │   │   └── ChatClientConfig.java
│   │   ├── controller/
│   │   │   ├── AudioController.java
│   │   │   ├── ChatController.java
│   │   │   └── ImageController.java
│   │   └── service/
│   │       ├── AudioService.java
│   │       ├── ChatService.java
│   │       └── ImageService.java
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── init/schema.sql
│   ├── build.gradle
│   └── compose.yaml
└── chatgpt-ui/                     # Next.js frontend
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── chat/page.tsx
    │   ├── create-image/page.tsx
    │   ├── api/                    # API routes (if any)
    │   └── store/uiStore.ts
    ├── components/ui/              # Reusable UI components
    ├── lib/utils.ts
    ├── package.json
    └── tsconfig.json
```

## 🚀 Deployment

### Backend Deployment

The Spring Boot application can be deployed as a JAR file:

```bash
./gradlew bootJar
java -jar build/libs/chatgpt-clone-backend-0.0.1-SNAPSHOT.jar
```

### Frontend Deployment

Build the Next.js application for production:

```bash
pnpm build
pnpm start
```

For Vercel deployment:

```bash
pnpm build
```

## 🙏 Acknowledgments

- [Spring AI](https://spring.io/projects/spring-ai) for AI integration
- [Azure OpenAI](https://azure.microsoft.com/en-us/products/ai-services/openai-service/) for AI models
- [pgvector](https://github.com/pgvector/pgvector) for vector database functionality
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Shadcn UI](https://ui.shadcn.com/) for accessible components

## 📞 Support

If you have any questions or need help, please open an issue on GitHub

---

**Note**: This application requires valid Azure OpenAI API keys and a running PostgreSQL instance with pgvector extension to function properly.</content>
