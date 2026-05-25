import { createClient } from '@/lib/supabase/server'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  const supabase = createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, bio')
    .eq('username', params.username)
    .single()

  if (!profile) return new Response('Not Found', { status: 404 })

  const { data: posts } = await supabase
    .from('posts')
    .select('title, excerpt, slug, created_at')
    .eq('user_id', profile.id)
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(20)

  const base = new URL(request.url).origin
  const blogUrl = `${base}/blog/${params.username}`

  const items = (posts ?? []).map(p => `
  <item>
    <title>${escapeXml(p.title)}</title>
    <description>${escapeXml(p.excerpt || '')}</description>
    <link>${blogUrl}/${p.slug}</link>
    <guid isPermaLink="true">${blogUrl}/${p.slug}</guid>
    <pubDate>${new Date(p.created_at).toUTCString()}</pubDate>
  </item>`).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(profile.name)}</title>
    <description>${escapeXml(profile.bio || `Blog de ${profile.name}`)}</description>
    <link>${blogUrl}</link>
    <atom:link href="${blogUrl}/rss" rel="self" type="application/rss+xml"/>
    <language>es</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
