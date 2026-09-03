import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'http://localhost:3000'),
  title: 'DAHYUN — Character & Fan Art',
  description: '서울에서 작업하는 일러스트레이터 다현의 캐릭터, 애니메이션 스타일, 팬아트 포트폴리오.',
  openGraph: {
    title: 'DAHYUN — Character & Fan Art',
    description: '캐릭터와 좋아하는 순간을 그리는 다현의 일러스트 아카이브.',
    images: [{ url: '/og.png', width: 1672, height: 941, alt: 'DAHYUN Character & Fan Art' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DAHYUN — Character & Fan Art',
    description: '캐릭터와 좋아하는 순간을 그리는 다현의 일러스트 아카이브.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
