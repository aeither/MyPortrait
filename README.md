# MyPortrait

## Description
MyPortrait is a Lukso Mini App that allows users to generate and save personalized AI-powered portraits linked to their blockchain addresses. With a focus on creating whimsical, Studio Ghibli-inspired artwork, users can describe themselves through text prompts and receive unique, artistic representations to showcase their digital identity.

## How It Works
The application leverages advanced AI image generation to create custom portraits based on user-provided text descriptions. These portraits are stored and associated with the user's blockchain address. The system features:

- AI-powered portrait generation with a whimsical, hand-drawn animation style
- Blockchain address integration for identity verification
- Secure cloud storage for saving and retrieving portraits
- A responsive, modern UI with an ornate frame design for displaying portraits

## User Flow
1. User navigate to a universaleverything profile to view the portrait of the profile owner
2. If you're the owner of the address, Connect your wallet to generate a new portrait or update existing portrait:
   - Enter a text description of your desired portrait
   - Click "Generate" to create your AI portrait
   - Preview the result and choose to save
3. If you're viewing someone else's portrait, you can see their generated artwork
4. Your portrait is accessible via a unique URL that contains your address

## Technical Details
- **Frontend**: Next.js, React 19, Tailwind CSS
- **AI Integration**: AI SDK with Replicate's flux-schnell model
- **Storage**: Cloudflare R2 (S3-compatible)
- **Authentication**: Lukso Universal Profile integration
- **Database**: PostgreSQL with Drizzle ORM
- **Deployment**: Optimized for serverless environments

## User Adoption Plan
- **Phase 1**: Launch for the Lukso blockchain community as a Mini App
- **Phase 2**: Optimize integration with Universal Profiles and LSPs
- **Phase 3**: Add social sharing features to increase visibility within the Lukso ecosystem
- **Phase 4**: Implement portrait showcase galleries for Lukso community building

## Future Plans
- Multiple portrait styles and themes
- Animation options for dynamic portraits
- NFT minting capability for portraits
- Enhanced customization with additional parameters

## Adding the Widget to Your Profile
To embed your portrait on your profile:

```bash
https://basically-enough-clam.ngrok-free.app/portrait?address=0xYOUR_ADDRESS_HERE
```

Replace `0xYOUR_ADDRESS_HERE` with your blockchain address. Example:
```bash
https://basically-enough-clam.ngrok-free.app/portrait?address=0xB96Bd2BA2d0e785d0408dc17af8bcCC7e1413Ad6
```
