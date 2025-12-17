const fs = require('fs');
const path = require('path');

// Path to the pages directory to be removed
const pagesDir = path.join(__dirname, 'src', 'app', 'admin', 'pages');

// Function to recursively remove a directory
function removeDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`Directory ${dirPath} does not exist.`);
    return;
  }

  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      removeDirectory(filePath);
    } else {
      fs.unlinkSync(filePath);
      console.log(`Deleted file: ${filePath}`);
    }
  }

  fs.rmdirSync(dirPath);
  console.log(`Deleted directory: ${dirPath}`);
}

try {
  removeDirectory(pagesDir);
  console.log('Pages directory removed successfully!');
} catch (error) {
  console.error('Error removing pages directory:', error.message);
}