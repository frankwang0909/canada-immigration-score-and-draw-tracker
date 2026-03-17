import type { Metadata } from 'next';
import BCPNPCalculator from '@/components/BCPNPCalculator';

export const metadata: Metadata = {
  title: 'BCPNP Skills Immigration 算分',
  description:
    'BC省提名 BCPNP Skills Immigration 200分制算分器。计算工作经验、教育、语言、时薪、工作地区等因素得分，了解您的注册评分。'
};

export default function BCPNPPage() {
  return <BCPNPCalculator />;
}
