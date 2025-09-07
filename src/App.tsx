import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Marketing } from './pages/Marketing';
import { Brand } from './pages/Brand';
import Editor from './pages/Editor';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/marketing" element={<Marketing />} />
          <Route path="/brand" element={<Brand />} />
          <Route path="/editor" element={<Editor />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;