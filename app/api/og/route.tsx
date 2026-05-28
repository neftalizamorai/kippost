import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const title = searchParams.get('title') ?? 'KipPost'
  const author = searchParams.get('author') ?? ''

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '60px',
          background: '#0f0f0f',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Subtle grid accent */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.04) 0%, transparent 60%)',
          display: 'flex',
        }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: 18, color: '#666', margin: 0, letterSpacing: '0.05em' }}>
            {author || 'KipPost'}
          </p>
          <h1 style={{
            fontSize: title.length > 60 ? 44 : title.length > 40 ? 52 : 62,
            fontWeight: 700,
            color: '#f5f5f5',
            margin: 0,
            lineHeight: 1.15,
            maxWidth: '900px',
          }}>
            {title}
          </h1>
        </div>

        {/* KipPost branding */}
        <div style={{
          position: 'absolute', top: 52, right: 60,
          fontSize: 16, color: '#444', fontWeight: 600, letterSpacing: '0.02em',
          display: 'flex',
        }}>
          kippost.com
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
