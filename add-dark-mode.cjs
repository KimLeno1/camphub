const fs = require('fs');
const path = require('path');

const mappings = {
  'bg-white': 'bg-white dark:bg-slate-900',
  'bg-slate-50': 'bg-slate-50 dark:bg-slate-950',
  'bg-slate-100': 'bg-slate-100 dark:bg-slate-800',
  'bg-slate-200': 'bg-slate-200 dark:bg-slate-700',
  'text-slate-900': 'text-slate-900 dark:text-slate-50',
  'text-slate-800': 'text-slate-800 dark:text-slate-100',
  'text-slate-700': 'text-slate-700 dark:text-slate-200',
  'text-slate-600': 'text-slate-600 dark:text-slate-300',
  'text-slate-500': 'text-slate-500 dark:text-slate-400',
  'text-slate-400': 'text-slate-400 dark:text-slate-500',
  'border-slate-200': 'border-slate-200 dark:border-slate-700/50',
  'border-slate-100': 'border-slate-100 dark:border-slate-800',
  'border-slate-300': 'border-slate-300 dark:border-slate-700',
  'ring-slate-200': 'ring-slate-200 dark:ring-slate-700',
  'ring-slate-100': 'ring-slate-100 dark:ring-slate-800',
  'divide-slate-100': 'divide-slate-100 dark:divide-slate-800',
  'divide-slate-200': 'divide-slate-200 dark:divide-slate-700',
  'hover:bg-slate-50': 'hover:bg-slate-50 dark:hover:bg-slate-800',
  'hover:bg-slate-100': 'hover:bg-slate-100 dark:hover:bg-slate-800/80',
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;
  
  // We need to carefully replace words, avoiding replacing already added dark variants.
  // For example, if 'bg-white' is present, replace it with 'bg-white dark:bg-slate-900' only if it's not already followed by 'dark:bg-slate-900'.
  
  for (const [light, dark] of Object.entries(mappings)) {
    // Regex explanation:
    // (?<!dark:) -> ensure it's not preceded by 'dark:' (e.g. dark:bg-white shouldn't match if it exists)
    // \b -> word boundary
    // light -> the class
    // (?!\s+dark:) -> ensure it's not already followed by the dark variant. Actually we can just do a replace, then clean up any duplicates.
    
    // Simpler: replace word matching `light` with a placeholder, then replace placeholder.
    // Actually, just find the `light` class using a regex that checks for whitespace or quotes around it.
    const regex = new RegExp(`(?<![:a-zA-Z0-9\\-])(${light.replace(/-/g, '\\-')})(?![a-zA-Z0-9\\-])(?!\\s+dark:)`, 'g');
    content = content.replace(regex, dark);
  }

  // Deduplicate any accidental double darks (e.g. 'bg-white dark:bg-slate-900 dark:bg-slate-900')
  content = content.replace(/dark:bg-slate-900\s+dark:bg-slate-900/g, 'dark:bg-slate-900');
  content = content.replace(/dark:bg-slate-950\s+dark:bg-slate-950/g, 'dark:bg-slate-950');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      processFile(fullPath);
    }
  });
}

walkDir('./src');
console.log('Done');
