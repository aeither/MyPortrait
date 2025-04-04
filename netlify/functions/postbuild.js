// This script ensures environment variables are available during Netlify Function execution
const fs = require('fs');
const path = require('path');

// Function to copy environment variables to Netlify Functions
function copyEnvToFunctions() {
  try {
    const envContent = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8');
    
    // Create the functions directory if it doesn't exist
    const functionsDir = path.join(process.cwd(), '.netlify/functions');
    if (!fs.existsSync(functionsDir)) {
      fs.mkdirSync(functionsDir, { recursive: true });
    }
    
    // Write the env file to the functions directory
    fs.writeFileSync(path.join(functionsDir, '.env'), envContent);
    console.log('Successfully copied .env file to Netlify Functions directory');
  } catch (error) {
    console.error('Error copying environment variables:', error);
  }
}

// Execute the function
copyEnvToFunctions();
