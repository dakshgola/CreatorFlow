# How to Run the App Locally

This guide will help you set up and run the CreatorCommand React app on your local machine.

## Prerequisites

Make sure you have the following installed:
- **Node.js** (version 16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**

To check if you have them installed:
```bash
node --version
npm --version
```

## Step 1: Install Dependencies

Open your terminal in the project directory and run:

```bash
npm install
```

This will install all required packages including:
- React
- React Router DOM
- Tailwind CSS
- Vite (build tool)

## Step 2: Start the Development Server

Run the development server:

```bash
npm run dev
```

You should see output like:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## Step 3: Open in Browser

Open your browser and navigate to:
```
http://localhost:5173
```

The app should now be running! 🎉

## Available Scripts

- `npm run dev` - Start development server (with hot reload)
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Troubleshooting

### Port Already in Use
If port 5173 is already in use, Vite will automatically use the next available port (5174, 5175, etc.)

### Module Not Found Errors
If you see module errors, try:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Tailwind CSS Not Working
Make sure `tailwind.config.js` and `postcss.config.js` are properly configured.

## Project Structure

```
CREATORFLOW/
├── src/
│   ├── components/     # Reusable components (Navbar, etc.)
│   ├── pages/          # Page components (Dashboard, Clients, etc.)
│   ├── hooks/          # Custom hooks (useDarkMode, useFetch)
│   └── App.jsx         # Main app component
├── index.html          # HTML entry point
├── package.json        # Dependencies and scripts
└── vite.config.js     # Vite configuration
```

## Next Steps

Once the app is running:
1. Navigate between pages using the navbar
2. Test dark mode toggle
3. Try the different pages (Dashboard, AI Tools, Clients, Tasks)
4. Start building your features!


