# API Testing Platform - Postman Clone

> A modern, open-source API development and testing platform built with Next.js 14, TypeScript, and MongoDB.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)](https://www.mongodb.com/)

## 🚀 Features

- **Request Builder** - Test APIs with support for all HTTP methods (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
- **Collections** - Organize requests into collections with nested folders
- **Environments** - Manage variables across different deployment environments
- **Authentication** - Support for Bearer, Basic Auth, API Key, OAuth 2.0, and more
- **History** - Track and replay all executed requests
- **Team Collaboration** - Share workspaces with role-based access control
- **Mock Servers** - Create simulated API endpoints for testing
- **Code Generation** - Export requests as cURL, JavaScript, Python, and more
- **Pre-request Scripts** - Execute JavaScript before sending requests
- **Test Scripts** - Write assertions to validate API responses
- **Import/Export** - Compatible with Postman collection format
- **API Documentation** - Auto-generate beautiful API docs from collections
- **GraphQL Support** - Built-in GraphQL IDE with schema introspection
- **WebSocket Testing** - Test real-time bidirectional connections

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn/ui
- **Backend:** Next.js API Routes, NextAuth.js
- **Database:** MongoDB with Mongoose ODM
- **State Management:** Zustand, React Query
- **Code Editor:** Monaco Editor (VS Code)
- **HTTP Client:** Axios

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- MongoDB 7.0+ (local or Atlas)
- Git

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/postman-clone.git
cd postman-clone
```

### 2. Install dependencies
```bash
bun install
```

### 3. Set up environment variables
Create `.env.local` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/postman-clone
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

### 4. Run the development server
```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 Documentation

Full technical specification and architecture documentation is available in [SPECIFICATION.md](SPECIFICATION.md).

### Key Documentation Sections:
- [Architecture Overview](SPECIFICATION.md#system-architecture)
- [Database Schema](SPECIFICATION.md#database-design-philosophy)
- [API Endpoints](SPECIFICATION.md#api-design-specification)
- [Security Architecture](SPECIFICATION.md#security-architecture)
- [Deployment Guide](SPECIFICATION.md#deployment-architecture)

## 🗺️ Roadmap

- [x] Core request builder with response viewer
- [x] Collections and folder organization
- [x] Environment and variable management
- [x] Request history tracking
- [x] Team workspaces and collaboration
- [ ] Mock servers
- [ ] API documentation generation
- [ ] Pre-request and test scripts
- [ ] Code generation for multiple languages
- [ ] GraphQL IDE
- [ ] WebSocket support
- [ ] CLI tool
- [ ] Desktop application (Electron)
- [ ] Mobile apps (iOS/Android)


## 🙏 Acknowledgments

- Inspired by [Postman](https://www.postman.com/)
- Built with [Next.js](https://nextjs.org/)
- UI components from [Shadcn/ui](https://ui.shadcn.com/)
- Code editor powered by [Monaco Editor](https://microsoft.github.io/monaco-editor/)
