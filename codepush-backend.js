// server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { Octokit } = require('@octokit/rest');
const { createTokenAuth } = require('@octokit/auth-token');
const fs = require('fs').promises;
const path = require('path');
const simpleGit = require('simple-git');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

// GitHub OAuth configuration
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_CALLBACK_URL = 'http://localhost:3000/auth/github/callback';

// Initialize Octokit
let octokit;

// GitHub OAuth login endpoint
app.get('/auth/github', (req, res) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=repo`;
  res.redirect(githubAuthUrl);
});

// GitHub OAuth callback
app.get('/auth/github/callback', async (req, res) => {
  const code = req.query.code;
  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code: code,
      }),
    });

    const data = await response.json();
    const accessToken = data.access_token;
    
    octokit = new Octokit({
      auth: accessToken
    });

    res.redirect(`http://localhost:3000?token=${accessToken}`);
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Get user repositories
app.get('/api/repos', async (req, res) => {
  try {
    const { data } = await octokit.repos.listForAuthenticatedUser();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
});

// Create new repository
app.post('/api/repos', async (req, res) => {
  const { name, description = '' } = req.body;
  try {
    const { data } = await octokit.repos.createForAuthenticatedUser({
      name,
      description,
      private: false,
      auto_init: true
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create repository' });
  }
});

// Handle file upload and push to GitHub
app.post('/api/push', upload.array('files'), async (req, res) => {
  const { repository, commitMessage } = req.body;
  const files = req.files;
  const uploadDir = path.join(__dirname, 'uploads', repository);

  try {
    // Create temporary directory for the repository
    await fs.mkdir(uploadDir, { recursive: true });
    
    // Initialize git repository
    const git = simpleGit(uploadDir);
    await git.init();
    await git.addRemote('origin', `https://github.com/${repository}.git`);

    // Copy uploaded files to the repository directory
    for (const file of files) {
      const destination = path.join(uploadDir, file.originalname);
      await fs.copyFile(file.path, destination);
    }

    // Commit and push changes
    await git.add('./*');
    await git.commit(commitMessage);
    await git.push('origin', 'master');

    // Clean up
    await fs.rm(uploadDir, { recursive: true, force: true });
    
    res.json({ message: 'Successfully pushed to GitHub' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to push to GitHub' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
