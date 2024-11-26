import React, { useState, useEffect } from 'react';
import { Github, Upload, FolderGit2, MessageSquarePlus, GitBranchPlus, Moon, Sun } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CodePush = () => {
  // Theme state
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [user, setUser] = useState(null);
  
  // App state
  const [selectedRepo, setSelectedRepo] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [repos, setRepos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Theme effect
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Auth effect
  useEffect(() => {
    const token = localStorage.getItem('github_token');
    if (token) {
      setAccessToken(token);
      setIsAuthenticated(true);
      fetchUserData(token);
      fetchRepos(token);
    }

    // Check for OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      handleOAuthCallback(code);
    }
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleOAuthCallback = async (code) => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:3001/auth/github/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      
      const data = await response.json();
      
      if (data.access_token) {
        localStorage.setItem('github_token', data.access_token);
        setAccessToken(data.access_token);
        setIsAuthenticated(true);
        await fetchUserData(data.access_token);
        await fetchRepos(data.access_token);
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        setError('Authentication failed');
      }
    } catch (err) {
      setError('Failed to authenticate with GitHub');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserData = async (token) => {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const userData = await response.json();
      setUser(userData);
    } catch (err) {
      setError('Failed to fetch user data');
    }
  };

  const fetchRepos = async (token) => {
    try {
      const response = await fetch('https://api.github.com/user/repos', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const reposData = await response.json();
      setRepos(reposData.map(repo => ({
        id: repo.id,
        name: repo.full_name,
      })));
    } catch (err) {
      setError('Failed to fetch repositories');
    }
  };

  const handleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const redirectUri = encodeURIComponent(window.location.origin);
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo`;
  };

  const handleLogout = () => {
    localStorage.removeItem('github_token');
    setAccessToken('');
    setIsAuthenticated(false);
    setUser(null);
    setRepos([]);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleCreateRepo = async () => {
    // Implementation for creating new repository
    setError('');
  };

  const handlePush = async () => {
    if (!selectedRepo) {
      setError('Please select a repository');
      return;
    }
    if (!commitMessage) {
      setError('Please enter a commit message');
      return;
    }
    if (uploadedFiles.length === 0) {
      setError('Please upload some files');
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      uploadedFiles.forEach(file => {
        formData.append('files', file);
      });
      formData.append('repository', selectedRepo);
      formData.append('commitMessage', commitMessage);

      const response = await fetch('http://localhost:3001/api/push', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to push to repository');
      }

      setUploadedFiles([]);
      setCommitMessage('');
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-96">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Github className="h-6 w-6" />
                CodePush
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? 'Connecting...' : 'Login with GitHub'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Github className="h-6 w-6" />
              CodePush
              {user && (
                <span className="text-sm font-normal ml-2">
                  ({user.login})
                </span>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Repository</label>
            <div className="flex gap-2">
              <Select value={selectedRepo} onValueChange={setSelectedRepo}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select repository" />
                </SelectTrigger>
                <SelectContent>
                  {repos.map(repo => (
                    <SelectItem key={repo.id} value={repo.name}>
                      <div className="flex items-center gap-2">
                        <FolderGit2 className="h-4 w-4" />
                        {repo.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleCreateRepo}>
                <GitBranchPlus className="h-4 w-4 mr-2" />
                New Repo
              </Button>
            </div>
          </div>

          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors ${
              isDragging ? 'border-primary bg-primary/10' : ''
            }`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput').click()}
          >
            <input 
              id="fileInput"
              type="file"
              multiple
              className="hidden"
              onChange={handleFileInput}
            />
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            {isDragging ? (
              <p>Drop the files here ...</p>
            ) : (
              <p>Drag 'n' drop files here, or click to select files</p>
            )}
          </div>

          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Uploaded Files</label>
              <div className="bg-muted p-4 rounded-lg">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="text-sm text-muted-foreground">
                    {file.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Commit Message</label>
            <div className="flex gap-2">
              <Input
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="Enter commit message"
                className="flex-1"
              />
              <Button 
                onClick={handlePush} 
                disabled={!selectedRepo || !commitMessage || uploadedFiles.length === 0 || isLoading}
              >
                <MessageSquarePlus className="h-4 w-4 mr-2" />
                {isLoading ? 'Pushing...' : 'Push to GitHub'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CodePush;
