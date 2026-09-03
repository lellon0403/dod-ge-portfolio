import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const STORAGE_BUCKET = 'portfolio-images';
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
export const IMAGE_EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
} as const;

export type ProjectRow = {
  id: string;
  title: string;
  category: string;
  year: string;
  description: string;
  image_key: string;
  layout: string;
  sort_order: number;
  created_at: string;
};

export type SettingsRow = {
  artist_name: string;
  artist_mark: string;
  role_line: string;
  hero_note: string;
  hero_title: string;
  hero_description: string;
  works_eyebrow: string;
  works_title: string;
  empty_title: string;
  empty_body: string;
  about_eyebrow: string;
  about_headline: string;
  about_note: string;
  about_body: string;
  location: string;
  email: string;
  footer_note: string;
  updated_at?: string;
};

export const defaultSettingsRow: SettingsRow = {
  artist_name: 'DodGe',
  artist_mark: 'DG',
  role_line: '일러스트 · 캐릭터 · 팬아트',
  hero_note: '',
  hero_title: '',
  hero_description: '',
  works_eyebrow: '01 · 작품',
  works_title: '작품 모음',
  empty_title: '첫 작품을 기다리고 있어요.',
  empty_body: '관리자 화면에서 DodGe의 작품을 올리면 이곳에 바로 전시됩니다.',
  about_eyebrow: '02 · 작가 소개',
  about_headline: '좋아하는 순간을\n한 장의 그림으로.',
  about_note: '안녕하세요, DodGe입니다.',
  about_body: '애니메이션과 이야기, 방송 속 재미있는 순간에서 영감을 받아 캐릭터를 그립니다. 좋아하는 마음이 보이는 그림을 오래 그리고 싶어요.',
  location: '대한민국 서울',
  email: 'hello@example.com',
  footer_note: '좋아하는 모든 순간을 그림으로 ✦',
};

export const defaultCategories = [
  { id: 'category-character-ko', name: '캐릭터', sortOrder: 0 },
  { id: 'category-fan-art-ko', name: '팬아트', sortOrder: 1 },
  { id: 'category-illustration-ko', name: '일러스트', sortOrder: 2 },
  { id: 'category-sketch-ko', name: '스케치', sortOrder: 3 },
];

export function toSettings(row: SettingsRow) {
  return {
    artistName: row.artist_name,
    artistMark: row.artist_mark,
    roleLine: row.role_line,
    heroNote: row.hero_note,
    heroTitle: row.hero_title,
    heroDescription: row.hero_description,
    worksEyebrow: row.works_eyebrow,
    worksTitle: row.works_title,
    emptyTitle: row.empty_title,
    emptyBody: row.empty_body,
    aboutEyebrow: row.about_eyebrow,
    aboutHeadline: row.about_headline,
    aboutNote: row.about_note,
    aboutBody: row.about_body,
    location: row.location,
    email: row.email,
    footerNote: row.footer_note,
    updatedAt: row.updated_at,
  };
}

export function toProject(row: ProjectRow) {
  const { data } = getSupabaseAdmin().storage.from(STORAGE_BUCKET).getPublicUrl(row.image_key);
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    year: row.year,
    description: row.description,
    imageUrl: data.publicUrl,
    layout: row.layout,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

export function extensionFor(contentType: string) {
  return IMAGE_EXTENSIONS[contentType as keyof typeof IMAGE_EXTENSIONS] || null;
}
