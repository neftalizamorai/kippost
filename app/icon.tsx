import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: 3,
          paddingLeft: 6,
        }}
      >
        <div style={{ width: 20, height: 3, background: '#37352f', borderRadius: 1 }} />
        <div style={{ width: 20, height: 3, background: '#37352f', borderRadius: 1 }} />
        <div style={{ width: 11, height: 3, background: '#37352f', borderRadius: 1 }} />
      </div>
    ),
    { width: 32, height: 32 }
  )
}
