// Migration script to import media-list.json data into Sanity
import { createClient } from '@sanity/client'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from .env.local
async function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local')
  try {
    const envFile = await fs.readFile(envPath, 'utf8')
    const envVars = {}
    envFile.split('\n').forEach(line => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim()
          // Remove quotes if present
          envVars[key.trim()] = value.replace(/^["']|["']$/g, '')
        }
      }
    })
    // Set process.env for each variable
    Object.keys(envVars).forEach(key => {
      if (!process.env[key]) {
        process.env[key] = envVars[key]
      }
    })
  } catch (error) {
    console.warn('⚠️  Could not read .env.local file. Make sure it exists in the project root.')
  }
}

// Load env before initializing client
await loadEnv()

// Initialize Sanity client
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_TOKEN || ''

if (!projectId) {
  console.error('❌ Error: NEXT_PUBLIC_SANITY_PROJECT_ID is not set')
  console.error('   Please create a .env.local file in your project root with:')
  console.error('   NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id')
  console.error('   NEXT_PUBLIC_SANITY_DATASET=production')
  console.error('   SANITY_API_TOKEN=your-api-token')
  process.exit(1)
}

if (!token) {
  console.error('❌ Error: SANITY_API_TOKEN is not set')
  console.error('   Please add SANITY_API_TOKEN to your .env.local file')
  console.error('   Get your token at: https://www.sanity.io/manage')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  useCdn: false,
  apiVersion: '2024-01-01',
  token,
})

async function migrateMediaToSanity() {
  try {
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
      throw new Error('NEXT_PUBLIC_SANITY_PROJECT_ID is not set in environment variables')
    }
    if (!process.env.SANITY_API_TOKEN) {
      throw new Error('SANITY_API_TOKEN is not set in environment variables. Create one at https://www.sanity.io/manage')
    }

    // Read the existing media-list.json
    const mediaListPath = path.join(__dirname, '..', 'src', 'app', 'media-list.json')
    const mediaListData = await fs.readFile(mediaListPath, 'utf8')
    const mediaList = JSON.parse(mediaListData)

    console.log(`\n🚀 Starting migration of ${mediaList.length} media items...\n`)

    // Check existing documents to avoid duplicates
    console.log('Checking for existing documents...')
    const existingDocs = await client.fetch('*[_type == "mediaAsset"]{name, order}')
    const existingNames = new Set(existingDocs.map(doc => doc.name))
    console.log(`Found ${existingNames.size} existing documents\n`)

    // For each media item, we need to:
    // 1. Upload the file to Sanity (if it exists locally)
    // 2. Create a mediaAsset document

    const publicDir = path.join(__dirname, '..', 'public')
    let successCount = 0
    let skipCount = 0
    let errorCount = 0

    for (let i = 0; i < mediaList.length; i++) {
      const item = mediaList[i]
      const progress = `[${i + 1}/${mediaList.length}]`
      
      try {
        // Skip if already exists
        if (existingNames.has(item.name)) {
          console.log(`${progress} ⏭️  Skipping ${item.name} (already exists)`)
          skipCount++
          continue
        }

        // Extract the file path from src (e.g., "/images/photo.png" -> "images/photo.png")
        // Handle URL-encoded paths
        const filePath = decodeURIComponent(item.src.replace(/^\//, ''))
        const fullPath = path.join(publicDir, filePath)

        // Check if file exists
        try {
          await fs.access(fullPath)
        } catch {
          console.warn(`${progress} ⚠️  File not found: ${fullPath}, skipping...`)
          skipCount++
          continue
        }

        // Read file buffer
        const fileBuffer = await fs.readFile(fullPath)
        const fileName = path.basename(filePath)
        const ext = path.extname(fileName).toLowerCase().slice(1)
        
        // Determine MIME type
        let mimeType
        if (item.type === 'video') {
          const videoMimeTypes = {
            'mp4': 'video/mp4',
            'webm': 'video/webm',
            'ogg': 'video/ogg',
            'mov': 'video/quicktime',
          }
          mimeType = videoMimeTypes[ext] || 'video/mp4'
        } else {
          const imageMimeTypes = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
          }
          mimeType = imageMimeTypes[ext] || 'image/jpeg'
        }

        console.log(`${progress} 📤 Uploading ${fileName}...`)

        // Upload file to Sanity
        const asset = await client.assets.upload('file', fileBuffer, {
          filename: fileName,
          contentType: mimeType,
        })

        // Create mediaAsset document
        const document = {
          _type: 'mediaAsset',
          name: item.name,
          type: item.type,
          asset: {
            _type: 'file',
            asset: {
              _type: 'reference',
              _ref: asset._id,
            },
          },
          alt: item.alt || item.name,
          width: item.width,
          height: item.height,
          order: item.id, // Use the existing ID as order
        }

        await client.create(document)
        console.log(`${progress} ✅ Successfully migrated ${item.name}\n`)
        successCount++
      } catch (error) {
        console.error(`${progress} ❌ Error migrating ${item.name}:`, error.message)
        errorCount++
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log('📊 Migration Summary:')
    console.log(`   ✅ Successfully migrated: ${successCount}`)
    console.log(`   ⏭️  Skipped (already exists or file missing): ${skipCount}`)
    console.log(`   ❌ Errors: ${errorCount}`)
    console.log('='.repeat(50))
    console.log('\n🎉 Migration complete! Visit http://localhost:3000/studio to see your assets.\n')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

// Run migration
migrateMediaToSanity()

