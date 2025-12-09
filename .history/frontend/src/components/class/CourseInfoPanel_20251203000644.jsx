import React from 'react';

export default function CourseInfoPanel({ children }) {
  // Wrapper panel for course information (we reuse existing detail UI outside)
  return (
    <div>{children}</div>
  );
}
