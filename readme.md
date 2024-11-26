# CodePush 🚀

CodePush is a modern web application that simplifies the process of uploading and pushing files to GitHub repositories. Built with React and Express, it provides a sleek, user-friendly interface for managing GitHub commits without using the command line.

## Features ✨

- 🔐 GitHub OAuth authentication
- 📁 Repository selection and management
- 📤 Drag-and-drop file uploads
- 💾 Easy commit and push functionality
- 🌓 Light/dark theme support
- 🆕 Create new repositories
- 📱 Responsive design

## Tech Stack 🛠️

### Frontend
- React with Hooks
- Next.js
- Tailwind CSS
- shadcn/ui components
- Lucide icons

### Backend
- Express.js
- Multer for file uploads
- Octokit (GitHub API)
- simple-git for Git operations

## Getting Started 🚀

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- GitHub account
- GitHub OAuth application credentials

### Environment Variables

Create `.env` files in both frontend and backend directories:

Frontend (.env.local):
```
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
```

Backend (.env):
```
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
PORT=3001
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/codepush.git
cd codepush
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
npm install
```

4. Start the development servers:

Backend:
```bash
npm run start
```

Frontend:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Usage 📝

1. Login with your GitHub account
2. Select a repository from the dropdown or create a new one
3. Drag and drop files or click to select files for upload
4. Enter a commit message
5. Click "Push to GitHub" to upload your files

## Security 🔒

- Uses GitHub OAuth for secure authentication
- No GitHub credentials are stored locally
- All API requests are authenticated with OAuth tokens
- File uploads are handled securely with temporary storage

## Contributing 🤝

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments 🙏

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Lucide](https://lucide.dev/) for the icons
- [Octokit](https://github.com/octokit/rest.js/) for GitHub API integration
