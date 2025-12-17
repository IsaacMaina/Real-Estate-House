const fs = require('fs');
const path = require('path');

// Paths to the directories to be removed
const pagesDir = path.join(__dirname, 'src', 'app', 'admin', 'pages');
const pagesApiDir = path.join(__dirname, 'src', 'app', 'api', 'admin', 'pages');

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
  // Remove pages directory
  if (fs.existsSync(pagesDir)) {
    removeDirectory(pagesDir);
    console.log('Pages directory removed successfully!');
  } else {
    console.log('Pages directory does not exist, skipping...');
  }

  // Remove pages API directory
  if (fs.existsSync(pagesApiDir)) {
    removeDirectory(pagesApiDir);
    console.log('Pages API directory removed successfully!');
  } else {
    console.log('Pages API directory does not exist, skipping...');
  }
} catch (error) {
  console.error('Error removing directories:', error.message);
}