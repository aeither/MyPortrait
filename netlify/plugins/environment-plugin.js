// Netlify build plugin to log environment variable status
module.exports = {
  onPreBuild: ({ utils }) => {
    // Log which required environment variables are set
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
      utils.build.failBuild(
        `Missing required environment variables: ${missingEnvVars.join(', ')}`
      );
    } else {
      console.log('✅ All required environment variables are set');
    }
  }
};
