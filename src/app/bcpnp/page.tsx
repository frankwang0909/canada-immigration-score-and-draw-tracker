import type { Metadata } from 'next';
import BCPNPCalculator from '@/components/BCPNPCalculator';

const BASE = 'https://canada-immigration-tracker.vercel.app';

export const metadata: Metadata = {
  title: 'BCPNP Skills Immigration 算分计算器（2025年12月最新规则）',
  description:
    'BC省提名 BCPNP Skills Immigration 200分制算分工具（规则有效期：2025年12月4日）。计算工作经验、学历、语言（CLB）、BC职位时薪、工作地区等得分，了解您的注册评分和抽签机会。',
  alternates: { canonical: `${BASE}/bcpnp` },
  openGraph: { url: `${BASE}/bcpnp` }
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'BCPNP Skills Immigration 如何计分？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'BCPNP Skills Immigration 注册评分满分 200 分。人力资本因素最高 120 分（工作经验 40 分、教育 40 分、语言 40 分），经济因素最高 80 分（BC 职位时薪 55 分、工作地区 25 分）。规则依据 2025 年 12 月 4 日生效版本。'
      }
    },
    {
      '@type': 'Question',
      name: 'BCPNP 最低邀请分数是多少？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'BCPNP 最低邀请分数因职业类别和抽签轮次而异，通常在 80–140 分之间。Tech Pilot 类别分数线通常较低，一般类别较高。请查看本站 BCPNP 邀请历史获取最新数据。'
      }
    },
    {
      '@type': 'Question',
      name: 'BCPNP 工作地区如何划分？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'BC省分三个地区：Area 1 为大温哥华地区（Metro Vancouver Regional District，0分）；Area 2 为 Squamish、Abbotsford、Agassiz、Mission、Chilliwack（5分）；Area 3 为其他 BC 地区（15分）。在非大温地区工作可获更高分数。'
      }
    }
  ]
};

export default function BCPNPPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BCPNPCalculator />
    </>
  );
}
