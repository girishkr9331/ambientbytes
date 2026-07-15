import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import VideoBackground from './components/VideoBackground';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import NewPost from './pages/NewPost';
import EditPost from './pages/EditPost';
import Login from './pages/Login';
import Signup from './pages/Signup';

export default function App() {
  const [musicPlaying, setMusicPlaying] = useState(false);

  return (
    <BrowserRouter>
      <AuthProvider>
        <VideoBackground />
        <div className="app-wrapper">
          <Navbar
            musicPlaying={musicPlaying}
            onToggleMusic={() => setMusicPlaying(p => !p)}
          />
          <Routes>
            <Route path="/"          element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/post/:slug" element={<PostDetail />} />
            <Route path="/login"     element={<Login />} />
            <Route path="/signup"    element={<Signup />} />
            <Route path="/new"       element={<PrivateRoute><NewPost /></PrivateRoute>} />
            <Route path="/edit/:id"  element={<PrivateRoute><EditPost /></PrivateRoute>} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
