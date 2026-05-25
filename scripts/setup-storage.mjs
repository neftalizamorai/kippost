import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key)

const { error } = await supabase.storage.createBucket('covers', {
  public: true,
  fileSizeLimit: 10485760, // 10 MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
})

if (error && !error.message.includes('already exists')) {
  console.error('Error:', error.message)
  process.exit(1)
}

console.log('✓ Bucket "covers" listo')
