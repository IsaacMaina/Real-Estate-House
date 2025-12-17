const fs = require('fs');
const path = require('path');

// Define the directory to be removed

// Function to remove directory recursively
function removeDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`Directory ${dirPath} does not exist, skipping...`);
    return;
  }

  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.lstatSync(filePath);

    if (stat.isDirectory()) {
      removeDir(filePath);
    } else {
      fs.unlinkSync(filePath);
      console.log(`Deleted file: ${filePath}`);
    }
  }

  fs.rmdirSync(dirPath);
  console.log(`Deleted directory: ${dirPath}`);
}

// Execute the removal
try {
  removeDir(dirToRemove);
  console.log('Old pages-management directory removed successfully!');
} catch (error) {
  console.error('Error removing directory:', error.message);
}