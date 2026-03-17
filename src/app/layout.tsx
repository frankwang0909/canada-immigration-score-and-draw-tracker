import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import NavBar from '@/components/NavBar';
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  metadataBase: new URL('https://score.debugcanada.com'),
  title: {
    default: '加拿大移民算分计算器 & 邀请历史 | EE CRS / BCPNP / OINP 2026',
    template: '%s | 加拿大移民算分计算器'
  },
  description:
    '免费加拿大移民算分工具（2026最新规则）：联邦 Express Entry CRS 分数、BCPNP Skills Immigration 200分、OINP EOI 分数一键计算。EE/BCPNP/OINP 邀请历史每日自动更新，数据来自 IRCC 官网。Canada immigration CRS score calculator, draw history tracker.',
  keywords: [
    '加拿大移民算分',
    'CRS计算器',
    'EE算分',
    'Express Entry',
    'CRS score calculator',
    'BCPNP算分',
    'BC省提名',
    'OINP',
    '安省提名',
    '移民分数',
    '邀请历史',
    'draw history',
    'Canada immigration 2026',
    'EE draw',
    'ITA',
    'CRS score',
    '综合排名系统'
  ],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg'
  },
  authors: [{ name: 'Canada Immigration Score Calculator & Draw Tracker' }],
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large'
  },
  alternates: {
    canonical: 'https://score.debugcanada.com/',
    languages: {
      'zh-CN': 'https://score.debugcanada.com/',
      'en-CA': 'https://score.debugcanada.com/',
      'x-default': 'https://score.debugcanada.com/'
    }
  },
  openGraph: {
    type: 'website',
    url: 'https://score.debugcanada.com/',
    siteName: '加拿大移民算分计算器 & 邀请历史追踪',
    title: '加拿大移民算分计算器 & 邀请历史 | EE CRS / BCPNP / OINP 2026',
    description:
      '免费加拿大移民算分工具（2026最新规则）：EE CRS 分数、BCPNP 200分、OINP EOI 一键计算，邀请历史每日更新。',
    images: [
      {
        url: 'https://score.debugcanada.com/og-image.png',
        width: 1200,
        height: 630,
        alt: '加拿大移民算分工具 - EE CRS / BCPNP / OINP'
      }
    ],
    locale: 'zh_CN'
  },
  twitter: {
    card: 'summary_large_image',
    title: '加拿大移民算分计算器 & 邀请历史 | EE CRS / BCPNP / OINP 2026',
    description:
      '免费加拿大移民算分计算器：EE CRS 分数、BCPNP 200分、OINP EOI 一键计算，邀请历史每日更新。',
    images: ['https://score.debugcanada.com/og-image.png']
  },
  other: {
    'theme-color': '#b91c1c'
  }
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://score.debugcanada.com/#website',
      url: 'https://score.debugcanada.com/',
      name: '加拿大移民算分计算器 & 邀请历史追踪',
      description: '加拿大联邦 EE CRS、BCPNP、OINP 移民算分工具及邀请历史追踪',
      inLanguage: ['zh-CN', 'en-CA']
    },
    {
      '@type': 'WebApplication',
      '@id': 'https://score.debugcanada.com/#app',
      name: '加拿大移民算分计算器 & 邀请历史追踪',
      url: 'https://score.debugcanada.com/',
      description:
        '免费在线工具，计算加拿大联邦 EE CRS 分数、BCPNP Skills Immigration 分数、OINP EOI 分数，并追踪最新邀请历史。',
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Any',
      isAccessibleForFree: true,
      inLanguage: ['zh-CN', 'en-CA'],
      about: {
        '@type': 'Thing',
        name: '加拿大移民',
        sameAs: 'https://www.canada.ca/en/immigration-refugees-citizenship.html'
      },
      featureList: [
        '联邦 Express Entry CRS 分数计算（2026最新规则）',
        'BC省提名 BCPNP Skills Immigration 200分制计算',
        '安省提名 OINP EOI 分数计算',
        'EE 邀请历史（官网每日自动抓取）',
        'BCPNP 邀请历史（官网每日自动抓取）',
        'OINP 邀请历史（官网每日自动抓取）'
      ]
    }
  ]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <div className="app-shell">
          <header className="app-header">
            <h1>Canada Immigration Score Calculator &amp; Draw Tracker</h1>
            <p className="header-subtitle">加拿大移民算分计算器 &amp; 邀请历史追踪</p>
          </header>
          <NavBar />
          <main>{children}</main>
          <footer className="app-footer">
            <p>
              免责声明：本工具所有内容仅供参考，不构成任何移民建议或法律意见。移民政策随时可能变化，计算结果可能与官方系统存在偏差，请以加拿大移民局（IRCC）官方信息为准。如需专业移民指导，请咨询持牌移民顾问（RCIC）或移民律师。
            </p>
            <p>
              Disclaimer: All content on this tool is for informational purposes only and does not
              constitute immigration advice or legal counsel. Immigration policies are subject to
              change. Scores are estimates only — please verify with official IRCC sources. Consult a
              licensed immigration consultant (RCIC) or lawyer for professional guidance.
            </p>
          </footer>
        </div>
        <Analytics />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-YG54NEBYWM"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-YG54NEBYWM');
          `}
        </Script>
      </body>
    </html>
  );
}
