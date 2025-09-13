# RAs (Resultats d'Aprenentatge) - Organized Structure

## 📁 Folder Structure

```
RAs/
├── ra1/                    # RA1 - Digitalització en sectors productius
│   ├── ra1.html           # Main HTML file
│   ├── scripts/           # RA1-specific JavaScript files
│   │   ├── ra1.js         # Main slideshow functionality
│   │   └── canvas-collaboration.js # Interactive canvas system
│   └── styles/            # RA1-specific CSS files
│       └── ra1.css        # Complete RA1 styles
├── ra2/                    # RA2 - Future development
│   ├── scripts/           # RA2-specific JavaScript files
│   └── styles/            # RA2-specific CSS files
├── ra3/                    # RA3 - Future development
│   ├── scripts/           # RA3-specific JavaScript files
│   └── styles/            # RA3-specific CSS files
├── shared/                 # Shared resources across all RAs
│   ├── scripts/           # Common JavaScript utilities
│   │   ├── main.js        # Shared main functionality
│   │   └── animations.js  # Common animations
│   ├── styles/            # Shared SCSS partials
│   │   ├── _base.scss     # Base styles and resets
│   │   ├── _variables.scss # SCSS variables
│   │   ├── _mixins.scss   # SCSS mixins and functions
│   │   └── _navbar.scss   # Common navigation styles
│   └── images/            # Shared images and assets
│       └── IMG/           # Image collections
└── archive/               # Old/backup files for reference
    └── [various backup files]
```

## 🎯 Organization Benefits

### **Modular Structure**
- Each RA is completely self-contained
- Easy to work on individual RAs without affecting others
- Clear separation of concerns

### **Reusable Components**
- Shared styles and scripts for common functionality
- SCSS partials for consistent theming
- Common utilities available across all RAs

### **Scalable Architecture**
- Easy to add new RAs (ra4, ra5, ra6...)
- Consistent folder structure for all projects
- Separated specific functionality from shared code

## 📝 Usage

### **For RA1 (Current)**
- Main file: `ra1/ra1.html`
- Slideshow: `ra1/scripts/ra1.js`
- Canvas: `ra1/scripts/canvas-collaboration.js`
- Styles: `ra1/styles/ra1.css`

### **For Future RAs**
1. Create new folder: `ra2/`, `ra3/`, etc.
2. Add HTML file: `ra2/ra2.html`
3. Create specific scripts: `ra2/scripts/ra2.js`
4. Create specific styles: `ra2/styles/ra2.css`
5. Import shared resources as needed

### **Shared Resources**
- Import SCSS partials: `@import '../shared/styles/variables';`
- Use shared scripts: `<script src="../shared/scripts/main.js"></script>`
- Reference shared images: `../shared/images/IMG/...`

## 🔧 Development Workflow

1. **Work on specific RA**: Navigate to `/raX/` folder
2. **Modify shared code**: Edit files in `/shared/` folder
3. **Add new features**: Create in appropriate RA subfolder
4. **Archive old files**: Move to `/archive/` folder

## 🔗 Navigation Structure

### **Fixed Links:**
- **Main Index** → RA1: `./static/RAs/ra1/ra1.html` ✅
- **Main Index** → RA2: `./static/RAs/ra2/` ✅
- **Main Index** → RA3: `./static/RAs/ra3/` ✅
- **RA1** → Home: `../../../index.html` ✅
- **RA1** → RA2/RA3: `../ra2/`, `../ra3/` ✅
- **RA1** → Info: `../../info.html` ✅

### **Link Status:**
- ✅ **Working**: RA1, RA2 (placeholder), RA3 (placeholder), Info
- 🚫 **Disabled**: RA4, RA5, RA6 (styled as disabled in navigation)

This structure ensures clean, maintainable, and scalable development for all Resultats d'Aprenentatge.