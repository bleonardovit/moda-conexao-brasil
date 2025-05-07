
import { createRoot } from 'react-dom/client'
import * as React from 'react'
import App from './App.tsx'
import './index.css'

// Make sure we have a valid DOM element before trying to render
const container = document.getElementById("root");
if (!container) {
  console.error("Failed to find the root element");
  throw new Error("Failed to find the root element");
}

// Create root and render App
try {
  const root = createRoot(container);
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Error rendering the application:", error);
}
