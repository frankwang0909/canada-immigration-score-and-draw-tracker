import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = '加拿大移民算分工具 - EE CRS / BCPNP / OINP';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #991b1b 0%, #b91c1c 50%, #dc2626 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          padding: '60px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
          <div
            style={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '16px',
              padding: '12px 24px',
              color: '#fecaca',
              fontSize: '18px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            Canada Immigration
          </div>
        </div>
        <div
          style={{
            color: '#ffffff',
            fontSize: '64px',
            fontWeight: 'bold',
            textAlign: 'center',
            lineHeight: 1.2,
            marginBottom: '24px',
          }}
        >
          加拿大移民算分
        </div>
        <div
          style={{
            color: '#fca5a5',
            fontSize: '32px',
            textAlign: 'center',
            marginBottom: '48px',
          }}
        >
          EE CRS · BCPNP · OINP
        </div>
        <div
          style={{
            display: 'flex',
            gap: '16px',
          }}
        >
          {['CRS 算分', 'BCPNP 200分', 'OINP EOI', '邀请历史'].map((label) => (
            <div
              key={label}
              style={{
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '12px',
                padding: '10px 20px',
                color: '#ffffff',
                fontSize: '20px',
              }}
            >
              {label}
            </div>
          ))}
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '32px',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '16px',
          }}
        >
          score.debugcanada.com
        </div>
      </div>
    ),
    { ...size }
  );
}
