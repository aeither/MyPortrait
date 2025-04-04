// scripts/netlify-build.js
console.log('Starting Netlify build script...');

// Check for required environment variables
const requiredEnvVars = [
  'REPLICATE_API_TOKEN',
  'DATABASE_URL',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_ENDPOINT',
  'R2_BUCKET'
];

const missingEnvVars = requiredEnvVars.filter(
  (name) => !process.env[name]
);

if (missingEnvVars.length) {
  console.warn(`⚠️ Missing environment variables: ${missingEnvVars.join(', ')}`);
  console.warn('Please make sure to add these in your Netlify environment settings.');
} else {
  console.log('✅ All required environment variables are set');
}

// Log some deployment information
console.log('Node version:', process.version);
console.log('Environment:', process.env.NODE_ENV);
console.log('Build directory:', process.env.BUILD_DIR || 'build');

console.log('Netlify build script completed successfully.');
