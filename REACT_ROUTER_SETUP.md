# React Router v6 Setup Guide

This guide explains how to set up React Router v6 in your React application for client-side routing.

## 1. Installing the Package

First, install `react-router-dom` using npm or yarn:

```bash
npm install react-router-dom
```

Or with yarn:

```bash
yarn add react-router-dom
```

**Note:** Make sure you're installing version 6.x (the latest version). You can verify by checking your `package.json`:

```json
{
  "dependencies": {
    "react-router-dom": "^6.x.x"
  }
}
```

---

## 2. Wrapping the App with BrowserRouter

The `BrowserRouter` component enables routing in your React app. It should wrap your entire application at the top level.

### In `src/App.jsx`:

```jsx
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        {/* Routes will go here */}
      </div>
    </Router>
  );
}

export default App;
```

**Key Points:**
- `BrowserRouter` (aliased as `Router`) provides routing context to all child components
- It uses HTML5 history API for clean URLs (e.g., `/dashboard` instead of `/#/dashboard`)
- Must wrap all components that need routing functionality

**Alternative:** If you're using React 18+ with a router provider pattern, you can also wrap it in `src/main.jsx` or `src/index.js`:

```jsx
import { BrowserRouter } from 'react-router-dom';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
```

---

## 3. Defining Routes

React Router v6 uses the `Routes` and `Route` components to define your application's routes.

### Complete `src/App.jsx` Example:

```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AITools from './pages/AITools';
import Clients from './pages/Clients';
import Tasks from './pages/Tasks';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
        <Navbar />
        <Routes>
          {/* Default route - shows Dashboard */}
          <Route path="/" element={<Dashboard />} />
          
          {/* Dashboard route */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* AI Tools route */}
          <Route path="/ai-tools" element={<AITools />} />
          
          {/* Clients route */}
          <Route path="/clients" element={<Clients />} />
          
          {/* Tasks route */}
          <Route path="/tasks" element={<Tasks />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
```

### Route Component Explanation:

- **`Routes`**: Container component that renders the first matching route
- **`Route`**: Defines a single route with:
  - `path`: URL path to match (e.g., `/dashboard`)
  - `element`: Component to render when path matches

### Key Differences from v5:

- **No `component` prop**: Use `element={<Component />}` instead of `component={Component}`
- **No `exact` prop**: Routes are exact by default in v6
- **No `Switch`**: Use `Routes` instead

### Adding a 404 Route:

```jsx
<Routes>
  <Route path="/" element={<Dashboard />} />
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/ai-tools" element={<AITools />} />
  <Route path="/clients" element={<Clients />} />
  <Route path="/tasks" element={<Tasks />} />
  
  {/* Catch-all route for 404 */}
  <Route path="*" element={<NotFound />} />
</Routes>
```

---

## 4. Link Components in Navbar for Navigation

Use the `Link` component from `react-router-dom` instead of regular `<a>` tags for client-side navigation.

### In `src/components/Navbar.jsx`:

```jsx
import { Link } from 'react-router-dom';

const Navbar = () => {
  const navLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'AI Tools', href: '/ai-tools' },
    { name: 'Clients', href: '/clients' },
    { name: 'Tasks', href: '/tasks' },
  ];

  return (
    <nav>
      {/* Logo as Link */}
      <Link to="/" className="logo">
        CreatorCommand
      </Link>

      {/* Navigation Links */}
      <div>
        {navLinks.map((link) => (
          <Link
            key={link.name}
            to={link.href}
            className="nav-link"
          >
            {link.name}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
```

### Link Component Props:

- **`to`**: The path to navigate to (replaces `href` from `<a>` tags)
- **`className`**: CSS classes (works the same as regular elements)
- **`onClick`**: Event handler (useful for closing mobile menus)

### Complete Navbar Example with Mobile Menu:

```jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'AI Tools', href: '/ai-tools' },
    { name: 'Clients', href: '/clients' },
    { name: 'Tasks', href: '/tasks' },
  ];

  return (
    <nav>
      <Link to="/">CreatorCommand</Link>
      
      {/* Desktop Navigation */}
      <div className="desktop-nav">
        {navLinks.map((link) => (
          <Link key={link.name} to={link.href}>
            {link.name}
          </Link>
        ))}
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-nav">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};
```

### Why Use Link Instead of <a>?

- **Client-side navigation**: No page reload, faster transitions
- **Preserves React state**: Component state persists during navigation
- **Better UX**: Smooth transitions without full page refresh
- **Active state**: Can use `NavLink` for active link styling (see below)

---

## 5. Advanced: Using NavLink for Active States

`NavLink` is a special version of `Link` that adds styling when the link is active:

```jsx
import { NavLink } from 'react-router-dom';

<NavLink
  to="/dashboard"
  className={({ isActive }) =>
    isActive ? 'active-link' : 'normal-link'
  }
>
  Dashboard
</NavLink>
```

Or with Tailwind:

```jsx
<NavLink
  to="/dashboard"
  className={({ isActive }) =>
    `px-3 py-2 rounded-md ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-700 hover:bg-gray-100'
    }`
  }
>
  Dashboard
</NavLink>
```

---

## 6. Programmatic Navigation

To navigate programmatically (e.g., after form submission), use the `useNavigate` hook:

```jsx
import { useNavigate } from 'react-router-dom';

const MyComponent = () => {
  const navigate = useNavigate();

  const handleSubmit = () => {
    // Do something
    navigate('/dashboard'); // Navigate to dashboard
  };

  return <button onClick={handleSubmit}>Submit</button>;
};
```

---

## Summary Checklist

✅ Install `react-router-dom` package  
✅ Wrap app with `BrowserRouter`  
✅ Define routes using `Routes` and `Route`  
✅ Import page components  
✅ Replace `<a>` tags with `Link` components  
✅ Use `to` prop instead of `href`  
✅ Test navigation between pages  

Your React Router v6 setup is now complete! 🎉


