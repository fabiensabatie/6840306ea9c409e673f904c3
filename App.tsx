import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CourseOverview from './components/CourseOverview';
import EditableOverlay from './components/EditableOverlay';


function App() {
  return (
    <Router>
      <EditableOverlay />
      <Routes>
        <Route path="/" element={<CourseOverview />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
