import type { Metadata } from 'next';
import OINPCalculator from '@/components/OINPCalculator';

const BASE = 'https://score.debugcanada.com';

export const metadata: Metadata = {
  title: 'OINP EOI 算分计算器 | 安省提名',
  description:
    '安省提名 OINP EOI 分数计算器。支持 Employer Job Offer（外国工人/技能短缺/国际学生）及硕士/博士毕业生 Stream。按 NOC TEER、时薪、语言 CLB、学历、地区等因素计算您的 EOI 评分。',
  alternates: { canonical: `${BASE}/oinp` },
  openGraph: { url: `${BASE}/oinp` }
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'OINP EOI 如何计分？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '安省提名 OINP EOI 按所选 Stream 计分。评分因素包括：职位 NOC TEER（最高10分）、职业大类（最高10分）、时薪（最高10分）、工签状态（10分）、在职时长（3分）、税务收入（3分）、学历（最高10分）、专业领域（最高12分）、加拿大教育经历（最高10分）、语言能力（最高10分）、官方语言种类（最高10分）及地区化加分（最高10分）。'
      }
    },
    {
      '@type': 'Question',
      name: 'OINP 有哪些 Stream？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'OINP 主要 Stream 包括：Employer Job Offer - Foreign Worker（外国工人）、Employer Job Offer - In-Demand Skills（技能短缺）、Employer Job Offer - International Student（国际学生）、Masters Graduate（硕士毕业生）、PhD Graduate（博士毕业生）。不同 Stream 适用的评分因素不同。'
      }
    },
    {
      '@type': 'Question',
      name: 'OINP 地区化加分如何计算？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'OINP 地区化加分分为工作地区和学习地区两项，各最高10分。Northern Ontario 得10分，GTA以外其他地区得8分，GTA（不含Toronto）得3分，Toronto得0分。非本地上课的学历学习地区得0分。'
      }
    }
  ]
};

export default function OINPPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <OINPCalculator />
    </>
  );
}
