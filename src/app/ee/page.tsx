import type { Metadata } from 'next';
import EECalculator from '@/components/EECalculator';

export const metadata: Metadata = {
  title: '联邦 EE CRS 算分',
  description:
    '免费联邦 Express Entry CRS 分数计算器（2026最新规则）。输入年龄、学历、语言、工作经验等信息，一键计算您的 CRS 综合排名系统总分。'
};

export default function EEPage() {
  return <EECalculator />;
}
