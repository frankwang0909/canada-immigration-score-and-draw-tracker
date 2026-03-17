import type { Metadata } from 'next';
import EECalculator from '@/components/EECalculator';

const BASE = 'https://canada-immigration-tracker.vercel.app';

export const metadata: Metadata = {
  title: '联邦 EE CRS 算分计算器（2026最新规则）',
  description:
    '免费联邦 Express Entry CRS 综合排名系统算分工具（2026最新规则）。输入年龄、学历、语言成绩（雅思/CELPIP CLB）、加拿大工作经验等，一键计算 CRS 分数，支持配偶因素和全部附加分项。',
  alternates: { canonical: `${BASE}/ee` },
  openGraph: { url: `${BASE}/ee` }
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '如何计算 Express Entry CRS 分数？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'CRS 综合排名系统满分 1,200 分，由四部分组成：A 核心人力资本（年龄、学历、语言、加拿大工作经验，最高 500 分），B 配偶因素（最高 40 分），C 技能可转换因素（最高 100 分），D 附加分（省提名 +600、加拿大学历、在加兄弟姐妹、法语加分，最高 600 分）。本工具依据 IRCC 2026 年最新规则免费计算。'
      }
    },
    {
      '@type': 'Question',
      name: '2026 年 EE 最低 CRS 分数是多少？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'EE 最低邀请分数因轮次和类别而异。近期一般类别（General）通常需要 480–530 分；特定类别（医疗卫生、STEM、法语、农业等）分数线更低，部分低至 300 分左右。请查看本站邀请历史获取最新数据。'
      }
    },
    {
      '@type': 'Question',
      name: 'What is the minimum CRS score to get an ITA in 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The minimum CRS score for an Invitation to Apply (ITA) varies by draw type. General draws typically require 480–530+ points. Category-based draws (healthcare, STEM, French language, agriculture, etc.) often have lower cutoffs, sometimes as low as 300. Check our draw history tracker for the latest rounds.'
      }
    },
    {
      '@type': 'Question',
      name: '雅思多少分对应 CLB 几级？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '雅思与 CLB 换算（听/读/写/说）：CLB 9 = 8.0/7.0/7.0/7.0；CLB 10 = 8.5/8.0/7.5/7.5；CLB 11 = 9.0/8.5/8.0/8.0；CLB 12 = 9.0/9.0/9.0/9.0。具体换算请以 IRCC 官方对照表为准。'
      }
    }
  ]
};

export default function EEPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <EECalculator />
    </>
  );
}
