# Product Management System

A modern, responsive product management application built with HTML, CSS, and JavaScript. Features include product CRUD operations, search functionality, pagination, and dark/light theme toggle.

## Features

- ✅ Product List Display (List View & Card View)
- ✅ Search with 500ms debounce
- ✅ Add and Edit Products
- ✅ Form Validation
- ✅ Pagination
- ✅ Dark/Light Theme Toggle
- ✅ Responsive Design
- ✅ Product Images

## Technologies Used

- HTML5
- CSS3 (with CSS Variables)
- Vanilla JavaScript

## Deployment

### Deploy to Vercel

1. **Using Vercel CLI:**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

2. **Using Vercel Dashboard:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your Git repository or drag & drop the project folder
   - Vercel will auto-detect the settings
   - Click "Deploy"

3. **Using Git Integration:**
   - Push your code to GitHub/GitLab/Bitbucket
   - Connect your repository to Vercel
   - Vercel will automatically deploy on every push

## Project Structure

```
project/
├── index.html      # Main HTML file
├── styles.css      # Styles with theme support
├── script.js       # Application logic
├── vercel.json     # Vercel configuration
└── package.json    # Project metadata
```

## Local Development

To run locally:

```bash
# Using npm
npm start

# Or using Python
python -m http.server 8000

# Or using Node.js http-server
npx http-server
```

Then open `http://localhost:8000` in your browser.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

