import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const title = searchParams.get('title') ?? 'KipPost'
  const author = searchParams.get('author') ?? ''

  const fontSize = title.length > 60 ? 44 : title.length > 40 ? 52 : 62

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
          background: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top-left: Pila mark + KipPost */}
        <div style={{
          position: 'absolute',
          top: 52,
          left: 60,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ width: '16px', height: '3px', background: '#37352f', borderRadius: '1px' }} />
            <div style={{ width: '16px', height: '3px', background: '#37352f', borderRadius: '1px' }} />
            <div style={{ width: '9px', height: '3px', background: '#37352f', borderRadius: '1px' }} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#37352f', letterSpacing: '0.01em' }}>KipPost</span>
        </div>

        {/* Bottom: author + title */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {author && (
            <p style={{ fontSize: 18, color: '#787774', margin: 0 }}>
              {author}
            </p>
          )}
          <h1 style={{
            fontSize,
            fontWeight: 700,
            color: '#37352f',
            margin: 0,
            lineHeight: 1.2,
            maxWidth: '960px',
          }}>
            {title}
          </h1>
        </div>

        {/* Bottom-right: kippost.com */}
        <div style={{
          position: 'absolute',
          bottom: 52,
          right: 60,
          fontSize: 15,
          color: '#b9b9b6',
          display: 'flex',
        }}>
          kippost.com
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
