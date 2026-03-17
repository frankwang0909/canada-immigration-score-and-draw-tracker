import type { Metadata } from 'next';
import './globals.css';
import NavBar from '@/components/NavBar';

export const metadata: Metadata = {
  metadataBase: new URL('https://canada-immigration-tracker.vercel.app'),
  title: {
    default: '加拿大移民算分 & 邀请历史 | EE CRS / BCPNP / OINP 计算器 2026',
    template: '%s | 加拿大移民算分工具'
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
  authors: [{ name: 'Canada Immigration Score & Draw Tracker' }],
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large'
  },
  alternates: {
    canonical: 'https://canada-immigration-tracker.vercel.app/',
    languages: {
      'zh-CN': 'https://canada-immigration-tracker.vercel.app/',
      'en-CA': 'https://canada-immigration-tracker.vercel.app/',
      'x-default': 'https://canada-immigration-tracker.vercel.app/'
    }
  },
  openGraph: {
    type: 'website',
    url: 'https://canada-immigration-tracker.vercel.app/',
    siteName: '加拿大移民算分 & 邀请历史追踪',
    title: '加拿大移民算分 & 邀请历史 | EE CRS / BCPNP / OINP 计算器 2026',
    description:
      '免费加拿大移民算分工具（2026最新规则）：EE CRS 分数、BCPNP 200分、OINP EOI 一键计算，邀请历史每日更新。',
    images: [
      {
        url: 'https://canada-immigration-tracker.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: '加拿大移民算分工具 - EE CRS / BCPNP / OINP'
      }
    ],
    locale: 'zh_CN'
  },
  twitter: {
    card: 'summary_large_image',
    title: '加拿大移民算分 & 邀请历史 | EE CRS / BCPNP / OINP 计算器 2026',
    description:
      '免费加拿大移民算分工具：EE CRS 分数、BCPNP 200分、OINP EOI 一键计算，邀请历史每日更新。',
    images: ['https://canada-immigration-tracker.vercel.app/og-image.png']
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
      '@id': 'https://canada-immigration-tracker.vercel.app/#website',
      url: 'https://canada-immigration-tracker.vercel.app/',
      name: '加拿大移民算分 & 邀请历史追踪',
      description: '加拿大联邦 EE CRS、BCPNP、OINP 移民算分工具及邀请历史追踪',
      inLanguage: ['zh-CN', 'en-CA'],
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://canada-immigration-tracker.vercel.app/'
      }
    },
    {
      '@type': 'WebApplication',
      '@id': 'https://canada-immigration-tracker.vercel.app/#app',
      name: '加拿大移民算分 & 邀请历史追踪',
      url: 'https://canada-immigration-tracker.vercel.app/',
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
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: '如何计算 Express Entry CRS 分数？',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '综合排名系统（CRS）满分 1,200 分，由四部分组成：A 核心人力资本因素（年龄、学历、语言、加拿大工作经验），B 配偶因素，C 技能可转换因素，D 附加分（省提名、加拿大学历、在加兄弟姐妹、法语加分）。本工具依据 IRCC 最新规则免费计算您的 CRS 分数。'
          }
        },
        {
          '@type': 'Question',
          name: 'BCPNP Skills Immigration 如何计分？',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'BCPNP Skills Immigration 注册评分满分 200 分，分为人力资本因素（最高 120 分，含直接相关工作经验 40 分、教育 40 分、语言 40 分）和经济因素（最高 80 分，含 BC 职位时薪 55 分、工作地区 25 分）。规则依据 2025 年 12 月 4 日生效版本。'
          }
        },
        {
          '@type': 'Question',
          name: 'OINP EOI 如何计分？',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '安省提名 OINP EOI 按所选 Stream 计分，评分因素包括：职位 NOC TEER、职业大类、时薪、工签状态、在职时长、税务收入、学历、专业领域、加拿大教育经历、语言能力和地区化加分。不同 Stream 适用的因素不同。'
          }
        },
        {
          '@type': 'Question',
          name: 'EE 邀请数据多久更新一次？',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '本工具通过 GitHub Actions 每天自动抓取 IRCC 官网最新邀请数据，通常在每次 EE 抽签后数小时内完成更新。数据来源为加拿大移民局（IRCC）官方网站。'
          }
        },
        {
          '@type': 'Question',
          name: '2026 年 EE 最低 CRS 分数是多少？',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'EE 最低邀请分数因抽签轮次和类别而异，近期一般类别（General）约在 480–530 分之间，特定项目类别（如医疗卫生、STEM、法语）分数更低。请查看本站邀请历史页面了解最新数据。'
          }
        },
        {
          '@type': 'Question',
          name: 'What is the minimum CRS score to get an ITA in 2026?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The minimum CRS score for an Invitation to Apply (ITA) varies by round. General draws typically require 480–530+ points. Category-based draws (healthcare, STEM, French language, etc.) often have lower cutoffs. Check our draw history tracker for the latest rounds.'
          }
        }
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
            <h1>Canada Immigration Score &amp; Draw Tracker</h1>
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
      </body>
    </html>
  );
}
