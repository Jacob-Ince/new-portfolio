# Sanity Studio Migration Guide

This guide will walk you through migrating your media assets from `media-list.json` to Sanity Studio.

## Overview

Your portfolio currently uses a JSON file (`media-list.json`) to manage image and video assets. This migration will move all assets to Sanity Studio, providing:

- **Visual CMS**: Manage your media through a web interface
- **File Hosting**: Sanity CDN for fast asset delivery
- **Better Organization**: Easier to add, edit, and organize media
- **Scalability**: No need to manually update JSON files

## Prerequisites

- Node.js installed
- A Sanity account (free tier available at [sanity.io](https://www.sanity.io))

## Step 1: Install Dependencies

Install the required Sanity packages:

```bash
npm install @sanity/client @sanity/image-url next-sanity @sanity/vision sanity
```

## Step 2: Create a Sanity Project

1. Go to [sanity.io](https://www.sanity.io) and sign up/login
2. Click "Create new project"
3. Choose a project name (e.g., "grid-portfolio")
4. Choose a dataset name (default: "production")
5. Copy your **Project ID** from the project settings

## Step 3: Configure Environment Variables

1. Create a `.env.local` file in your project root (if it doesn't exist)
2. Add your Sanity credentials:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id-here
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your-api-token-here
```

### Getting Your API Token

1. Go to [sanity.io/manage](https://www.sanity.io/manage)
2. Select your project
3. Go to **API** → **Tokens**
4. Click **Add API token**
5. Name it (e.g., "Migration Token")
6. Give it **Editor** permissions
7. Copy the token and add it to `.env.local`

## Step 4: Initialize Sanity Studio

The Sanity Studio configuration is already set up in this project. You can access it at:

```
http://localhost:3000/studio
```

## Step 5: Run the Migration Script

The migration script will:

1. Read your existing `media-list.json`
2. Upload each file to Sanity
3. Create media asset documents in Sanity

**Important**: Make sure your media files are in the `public/images` and `public/videos` directories.

Run the migration:

```bash
node scripts/migrate-to-sanity.mjs
```

The script will:

- Upload each image/video file to Sanity
- Create a `mediaAsset` document for each item
- Preserve the order using the existing IDs

**Note**: This may take a while depending on the number and size of your files.

## Step 6: Verify Migration

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000/studio`
3. Log in with your Sanity account
4. You should see all your media assets in the "Media Asset" section

5. Visit `http://localhost:3000` - your portfolio should now be loading media from Sanity

## Step 7: Update Your Workflow

### Adding New Media

1. Go to `http://localhost:3000/studio`
2. Click **Media Asset** → **Create new**
3. Fill in the form:
   - **Name**: The filename
   - **Type**: Image or Video
   - **Media File**: Upload your file
   - **Alt Text**: Description for accessibility
   - **Width/Height**: Dimensions in pixels
   - **Display Order**: Order in the grid (lower numbers appear first)

4. Click **Publish**

### Editing Media

1. Go to Sanity Studio
2. Find the media asset you want to edit
3. Make your changes
4. Click **Publish**

### Reordering Media

Update the **Display Order** field for each media asset. Lower numbers appear first.

## Troubleshooting

### Media not loading

- Check that `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` are set correctly
- Verify your files were uploaded successfully in Sanity Studio
- Check the browser console for errors

### Migration script fails

- Ensure `SANITY_API_TOKEN` is set in `.env.local`
- Verify the token has Editor permissions
- Check that your media files exist in `public/images` and `public/videos`

### Studio not accessible

- Make sure you're running `npm run dev`
- Check that the route `/studio` is accessible
- Verify your Sanity project ID is correct

## File Structure

After migration, your project structure includes:

```
├── sanity/
│   ├── schemas/
│   │   └── mediaAsset.js      # Schema definition
│   └── lib/
│       ├── client.js          # Sanity client
│       ├── image.js           # Image URL builder
│       └── queries.js         # GROQ queries
├── src/
│   ├── app/
│   │   ├── studio/
│   │   │   └── [[...index]]/
│   │   │       └── page.js    # Studio route
│   │   └── lib/
│   │       └── sanity.js      # Helper functions
└── scripts/
    └── migrate-to-sanity.mjs  # Migration script
```

## Next Steps

1. **Remove old files** (optional): Once you've verified everything works, you can:
   - Remove `media-list.json` (or keep as backup)
   - Remove `scripts/generate-media-list.mjs` (no longer needed)
   - Remove the `generate-media` script from `package.json`

2. **Optimize images**: Consider using Sanity's image transformation API for responsive images

3. **Add metadata**: You can extend the schema to include:
   - Tags/categories
   - Descriptions
   - Project associations
   - Dates

## Support

- [Sanity Documentation](https://www.sanity.io/docs)
- [Next.js + Sanity Guide](https://www.sanity.io/docs/js-client)
- [Sanity Community](https://slack.sanity.io/)

