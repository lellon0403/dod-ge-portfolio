import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'http://localhost:3000'),
  title: 'DodGe — Character & Fan Art',
  description: '일러스트레이터 DodGe의 캐릭터, 애니메이션 스타일, 팬아트 포트폴리오.',
  openGraph: {
    title: 'DodGe — Character & Fan Art',
    description: '캐릭터와 좋아하는 순간을 그리는 DodGe의 일러스트 아카이브.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'DodGe — Character & Fan Art',
    description: '캐릭터와 좋아하는 순간을 그리는 DodGe의 일러스트 아카이브.',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
