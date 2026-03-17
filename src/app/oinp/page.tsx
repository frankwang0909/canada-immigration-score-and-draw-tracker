import type { Metadata } from 'next';
import OINPCalculator from '@/components/OINPCalculator';

export const metadata: Metadata = {
  title: 'OINP EOI 算分',
  description:
    '安省提名 OINP EOI 分数计算器。按所选 Stream（外国工人、国际学生、硕士/博士毕业生）计算评分，了解您的安省提名机会。'
};

export default function OINPPage() {
  return <OINPCalculator />;
}
