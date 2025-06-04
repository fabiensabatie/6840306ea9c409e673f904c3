import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

function CourseOverview() {
  // Notify parent window about overview (index 0)
  useEffect(() => {
    if (window.parent) {
      window.parent.postMessage({
        type: 'slideNavigation',
        slideIndex: 0 // Overview is always index 0
      }, '*');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Course Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Teaching Kids Music: A Fun Approach
          </h1>
          <p className="text-xl text-gray-600 mb-2">Interactive Course</p>
          <div className="w-24 h-1 bg-black mx-auto"></div>
        </header>

        {/* Course Structure */}
        <div className="grid gap-6">
          
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-600 mb-4">
            Ready to start learning? Click on any slide above to begin!
          </p>
          
        </footer>
      </div>
    </div>
  );
}

export default CourseOverview;
