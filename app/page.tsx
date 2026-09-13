'use client';

import {
  ArrowUpRight, Check, GripVertical, LockKeyhole, LogOut,
  Menu, Pencil, Plus, Save, ShieldCheck, SlidersHorizontal, Sparkles, Trash2, Upload, X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { SubmitEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

type Project = {
  id: string;
  title: string;
  category: string;
  year: string;
  description: string;
  imageUrl: string;
  layout: 'portrait' | 'landscape' | 'square';
  sortOrder: number;
};

type Category = { id: string; name: string; sortOrder: number };

type SiteSettings = {
  artistName: string;
  artistMark: string;
  roleLine: string;
  heroNote: string;
  heroTitle: string;
  heroDescription: string;
  worksEyebrow: string;
  worksTitle: string;
  emptyTitle: string;
  emptyBody: string;
  aboutEyebrow: string;
  aboutHeadline: string;
  aboutNote: string;
  aboutBody: string;
  location: string;
  email: string;
  footerNote: string;
};

const defaultSettings: SiteSettings = {
  artistName: 'DodGe',
  artistMark: 'DG',
  roleLine: '일러스트 · 캐릭터 · 팬아트',
  heroNote: '',
  heroTitle: '',
  heroDescription: '',
  worksEyebrow: '01 · 작품',
  worksTitle: '작품 모음',
  emptyTitle: '첫 작품을 기다리고 있어요.',
  emptyBody: '관리자 화면에서 DodGe의 작품을 올리면 이곳에 바로 전시됩니다.',
  aboutEyebrow: '02 · 작가 소개',
  aboutHeadline: '좋아하는 순간을\n한 장의 그림으로.',
  aboutNote: '안녕하세요, DodGe입니다.',
  aboutBody: '애니메이션과 이야기, 방송 속 재미있는 순간에서 영감을 받아 캐릭터를 그립니다. 좋아하는 마음이 보이는 그림을 오래 그리고 싶어요.',
  location: '대한민국 서울',
  email: 'hello@example.com',
  footerNote: '좋아하는 모든 순간을 그림으로 ✦',
};

function LoadingMark() {
  return <div className="loading-mark" aria-label="작품 불러오는 중"><span/><span/><span/></div>;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [setupRequired, setSetupRequired] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);
  const [category, setCategory] = useState('전체');
  const [selected, setSelected] = useState<Project | null>(null);

  async function refresh() {
    const [projectResponse, categoryResponse, authResponse, settingsResponse] = await Promise.all([
      fetch('/api/projects'), fetch('/api/categories'), fetch('/api/auth'), fetch('/api/settings'),
    ]);
    if (projectResponse.ok) setProjects((await projectResponse.json()).projects);
    if (categoryResponse.ok) setCategories((await categoryResponse.json()).categories);
    if (authResponse.ok) {
      const auth = await authResponse.json();
      setAuthenticated(auth.authenticated);
      setSetupRequired(Boolean(auth.setupRequired));
    }
    if (settingsResponse.ok) setSettings((await settingsResponse.json()).settings);
    setLoaded(true);
  }

  useEffect(() => { refresh().catch(() => setLoaded(true)); }, []);
  useEffect(() => { document.title = `${settings.artistName} — 일러스트·팬아트`; }, [settings.artistName]);

  const filterNames = useMemo(() => {
    const source = categories.map((item) => item.name);
    return ['전체', ...source];
  }, [categories]);
  const filtered = projects.filter((work) => category === '전체' || work.category === category);

  return (
    <main id="top" className="portfolio-shell min-h-screen overflow-x-hidden bg-background text-foreground selection:bg-foreground selection:text-background">
      <header className="mobile-header">
        <a href="#top" className="display-font text-2xl tracking-[-0.04em]">{settings.artistMark}</a>
        <button aria-label="메뉴 열기" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={20}/> : <Menu size={20}/>}</button>
        {menuOpen && (
          <div className="mobile-menu">
            <p className="menu-label">작품</p>
            {filterNames.map((item) => <button key={item} onClick={() => { setCategory(item); setMenuOpen(false); }}>{item}</button>)}
            <a href="#about" onClick={() => setMenuOpen(false)}>작가 소개</a>
            <button onClick={() => { setAdminOpen(true); setMenuOpen(false); }}>관리자</button>
          </div>
        )}
      </header>

      <aside className="portfolio-sidebar">
        <div>
          <a href="#top" className="sidebar-brand"><strong className="display-font">{settings.artistName}</strong><span>{settings.artistMark}</span></a>
          <p className="sidebar-role">illustrator</p>
        </div>
        <nav className="sidebar-navigation" aria-label="포트폴리오 메뉴">
          <div>
            <p className="menu-label">작품</p>
            {filterNames.map((item) => <button key={item} onClick={() => setCategory(item)} className={category === item ? 'active' : ''}>{item}</button>)}
          </div>
          <div><p className="menu-label">정보</p><a href="#about">작가 소개</a><a href={`mailto:${settings.email}`}>문의하기</a></div>
          <button className="admin-entry" onClick={() => setAdminOpen(true)}><LockKeyhole size={12}/> 관리자</button>
        </nav>
        <p className="sidebar-location">{settings.location}</p>
      </aside>

      <div className="portfolio-content">
        <section id="works" className="works-section">
          <header className="blog-heading">
            <div><p>{settings.worksEyebrow}</p><h1>{category === '전체' ? 'WORKS' : category}</h1></div>
            <p className="blog-role">{settings.roleLine}</p>
          </header>

          {!loaded ? <LoadingMark/> : filtered.length ? (
            <div className="blog-art-grid">
              {filtered.map((work) => (
                <button key={work.id} onClick={() => setSelected(work)} className="blog-art-card group">
                  <div className={`blog-art-image ${work.layout}`}>
                    <img src={work.imageUrl} alt={work.title} />
                    <span><ArrowUpRight size={17}/></span>
                  </div>
                  <div className="blog-art-meta"><div><h2>{work.title}</h2><p>{work.category}</p></div><time>{work.year}</time></div>
                </button>
              ))}
            </div>
          ) : <div className="blog-empty"><p>{settings.emptyTitle}</p><span>{settings.emptyBody}</span></div>}
        </section>

        <section id="about" className="blog-about">
          <p className="menu-label">{settings.aboutEyebrow}</p>
          <div className="blog-about-grid"><h2 className="display-font whitespace-pre-line">{settings.aboutHeadline}</h2><div><p className="about-note">{settings.aboutNote}</p><p className="whitespace-pre-line">{settings.aboutBody}</p><a href={`mailto:${settings.email}`}>{settings.email} ↗</a></div></div>
        </section>

        <footer className="blog-footer"><span>© {new Date().getFullYear()} {settings.artistName}</span><a href="#top">↑ 맨 위로</a><span>{settings.footerNote}</span></footer>
      </div>

      {selected && <ArtworkModal work={selected} artistName={settings.artistName} onClose={() => setSelected(null)} />}
      {adminOpen && <AdminOverlay authenticated={authenticated} setupRequired={setupRequired} setAuthenticated={setAuthenticated} projects={projects} categories={categories} settings={settings} onSettingsSaved={setSettings} onRefresh={refresh} onClose={() => setAdminOpen(false)} />}
    </main>
  );
}

function ArtworkModal({ work, artistName, onClose }: { work: Project; artistName: string; onClose: () => void }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={work.title} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="grid max-h-[92vh] w-full max-w-6xl overflow-auto bg-foreground text-background md:grid-cols-[1.35fr_.65fr]">
        <div className="grid min-h-[45vh] place-items-center bg-black/25"><img src={work.imageUrl} alt={work.title} className="max-h-[82vh] w-full object-contain"/></div>
        <div className="flex flex-col justify-between p-7 md:p-10"><button aria-label="닫기" onClick={onClose} className="ml-auto"><X/></button><div className="py-14"><p className="eyebrow text-primary">{work.category} · {work.year}</p><h2 className="display-font mt-3 text-5xl italic">{work.title}</h2>{work.description && <p className="mt-6 leading-7 text-background/65">{work.description}</p>}</div><p className="text-[10px] tracking-[0.14em] text-background/45">{artistName} 작품 아카이브</p></div>
      </div>
    </div>
  );
}

function AdminOverlay({ authenticated, setupRequired, setAuthenticated, projects, categories, settings, onSettingsSaved, onRefresh, onClose }: {
  authenticated: boolean; setupRequired: boolean; setAuthenticated: (value: boolean) => void; projects: Project[]; categories: Category[]; settings: SiteSettings; onSettingsSaved: (settings: SiteSettings) => void; onRefresh: () => Promise<void>; onClose: () => void;
}) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<'works' | 'categories' | 'site' | 'security'>('works');
  const [editing, setEditing] = useState<Project | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [dragId, setDragId] = useState<string | null>(null);
  const [ordered, setOrdered] = useState(projects);
  const [notice, setNotice] = useState('');

  useEffect(() => setOrdered(projects), [projects]);

  async function login(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    const response = await fetch('/api/auth', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ code }) });
    const body = await response.json(); setBusy(false);
    if (!response.ok) return setError(body.error || '코드를 확인해 주세요.');
    setAuthenticated(true);
  }

  async function logout() { await fetch('/api/auth', { method: 'DELETE' }); setAuthenticated(false); }

  async function uploadImage(file: File) {
    const prepareResponse = await fetch('/api/uploads', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size }),
    });
    const prepared = await prepareResponse.json();
    if (!prepareResponse.ok) throw new Error(prepared.error || '이미지 업로드를 준비하지 못했어요.');
    const { error: uploadError } = await getSupabaseBrowser().storage
      .from('portfolio-images').uploadToSignedUrl(prepared.path, prepared.token, file, { contentType: file.type });
    if (uploadError) throw new Error('이미지를 올리지 못했어요. 잠시 후 다시 시도해 주세요.');
    return prepared.path as string;
  }

  async function upload(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const file = form.get('image');
      if (!(file instanceof File) || !file.size) throw new Error('이미지 파일을 선택해 주세요.');
      const imageKey = await uploadImage(file);
      const response = await fetch('/api/projects', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          imageKey, title: form.get('title'), category: form.get('category'), year: form.get('year'),
          description: form.get('description'), layout: form.get('layout'),
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || '업로드하지 못했어요.');
      formElement.reset(); setNotice('새 작품을 올렸어요.'); await onRefresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '업로드하지 못했어요.');
    } finally { setBusy(false); }
  }

  async function saveEdit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault(); if (!editing) return; setBusy(true); setError('');
    const form = new FormData(event.currentTarget);
    try {
      const file = form.get('image');
      const imageKey = file instanceof File && file.size ? await uploadImage(file) : undefined;
      const response = await fetch('/api/projects', {
        method: 'PATCH', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          id: editing.id, imageKey, title: form.get('title'), category: form.get('category'), year: form.get('year'),
          description: form.get('description'), layout: form.get('layout'),
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || '수정하지 못했어요.');
      setEditing(null); setNotice('작품 정보를 저장했어요.'); await onRefresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '수정하지 못했어요.');
    } finally { setBusy(false); }
  }

  async function removeProject(id: string) {
    if (!window.confirm('이 작품을 삭제할까요? 삭제 후에는 되돌릴 수 없어요.')) return;
    const response = await fetch('/api/projects', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id }) });
    if (!response.ok) setError((await response.json()).error || '삭제하지 못했어요.'); else await onRefresh();
  }

  async function dropOn(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const next = [...ordered]; const from = next.findIndex((item) => item.id === dragId); const to = next.findIndex((item) => item.id === targetId);
    const [moved] = next.splice(from, 1); next.splice(to, 0, moved); setOrdered(next); setDragId(null);
    const response = await fetch('/api/projects', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ order: next.map((item) => item.id) }) });
    if (!response.ok) setError('순서를 저장하지 못했어요.'); else await onRefresh();
  }

  async function addCategory(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault(); if (!newCategory.trim()) return;
    const response = await fetch('/api/categories', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: newCategory }) });
    const body = await response.json(); if (!response.ok) setError(body.error); else { setNewCategory(''); await onRefresh(); }
  }

  async function removeCategory(category: Category) {
    const response = await fetch('/api/categories', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify(category) });
    const body = await response.json(); if (!response.ok) setError(body.error); else await onRefresh();
  }

  async function renameCategory(category: Category, name: string) {
    const response = await fetch('/api/categories', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: category.id, oldName: category.name, name }) });
    const body = await response.json(); if (!response.ok) setError(body.error); else { setNotice('카테고리 이름을 바꿨어요.'); await onRefresh(); }
  }

  async function saveSettings(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch('/api/settings', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(values) });
    const body = await response.json(); setBusy(false);
    if (!response.ok) return setError(body.error || '사이트 문구를 저장하지 못했어요.');
    if (body.settings) onSettingsSaved(body.settings);
    setNotice('사이트 문구를 저장했어요. 화면에 바로 반영했습니다.');
  }

  async function changeCode(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    const form = new FormData(event.currentTarget);
    const currentCodeValue = form.get('currentCode');
    const newCodeValue = form.get('newCode');
    const confirmCodeValue = form.get('confirmCode');
    const currentCode = typeof currentCodeValue === 'string' ? currentCodeValue : '';
    const newCode = typeof newCodeValue === 'string' ? newCodeValue : '';
    const confirmCode = typeof confirmCodeValue === 'string' ? confirmCodeValue : '';
    if (newCode !== confirmCode) { setBusy(false); return setError('새 코드가 서로 일치하지 않아요.'); }
    const response = await fetch('/api/auth', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ currentCode, newCode }) });
    const body = await response.json(); setBusy(false);
    if (!response.ok) return setError(body.error || '관리자 코드를 바꾸지 못했어요.');
    event.currentTarget.reset(); setNotice('관리자 코드를 변경했어요. 새 코드만 안전한 곳에 보관해 주세요.');
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="admin-title" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      {!authenticated ? (
        <form onSubmit={login} className="w-full max-w-md bg-background p-7 text-foreground shadow-2xl">
          <div className="mb-10 flex items-start justify-between"><div><p className="eyebrow text-primary">관리자 로그인</p><h2 id="admin-title" className="display-font mt-2 text-4xl">관리 화면 열기</h2></div><button type="button" aria-label="닫기" onClick={onClose}><X size={20}/></button></div>
          <label className="text-xs font-semibold tracking-wider" htmlFor="admin-code">관리자 코드</label>
          <Input id="admin-code" type="password" value={code} onChange={(event) => setCode(event.target.value)} placeholder="코드를 입력하세요" className="mt-2 h-12 rounded-none border-foreground/25 px-4" autoFocus />
          {setupRequired && <p className="mt-3 border border-destructive/30 bg-destructive/5 p-3 text-xs leading-5 text-destructive">아직 Supabase 환경 변수가 연결되지 않았어요. Vercel 설정을 확인한 뒤 다시 배포해 주세요.</p>}
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
          <Button disabled={busy || setupRequired} className="mt-4 h-12 w-full rounded-none font-bold tracking-[0.14em]">{busy ? '확인 중…' : '관리 화면 열기'}</Button>
          <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">로그인이 되지 않으면 Vercel의 ADMIN_CODE를 확인하고 재배포해 주세요.</p>
        </form>
      ) : (
        <div className="admin-panel h-[92vh] w-full max-w-6xl overflow-hidden bg-background text-foreground shadow-2xl">
          <header className="flex h-16 items-center justify-between border-b border-foreground/15 px-5 md:px-7"><div><p className="eyebrow text-primary">{settings.artistName} 관리</p><h2 id="admin-title" className="display-font text-2xl">포트폴리오 관리</h2></div><div className="flex items-center gap-1"><Button variant="ghost" size="sm" onClick={logout}><LogOut/> 로그아웃</Button><Button variant="ghost" size="icon" onClick={onClose} aria-label="닫기"><X/></Button></div></header>
          <div className="grid h-[calc(92vh-64px)] md:grid-cols-[260px_1fr]">
            <aside className="border-b border-foreground/15 bg-foreground p-4 text-background md:border-b-0 md:border-r md:p-6"><p className="mb-3 text-[10px] font-bold tracking-[0.16em] text-background/45">관리 메뉴</p><button onClick={() => setTab('works')} className={`admin-nav ${tab === 'works' ? 'active' : ''}`}><Upload size={16}/>작품 관리</button><button onClick={() => setTab('categories')} className={`admin-nav ${tab === 'categories' ? 'active' : ''}`}><Sparkles size={16}/>카테고리</button><button onClick={() => setTab('site')} className={`admin-nav ${tab === 'site' ? 'active' : ''}`}><SlidersHorizontal size={16}/>사이트 문구</button><button onClick={() => setTab('security')} className={`admin-nav ${tab === 'security' ? 'active' : ''}`}><ShieldCheck size={16}/>보안 설정</button><div className="mt-8 border-t border-background/15 pt-5 text-xs leading-5 text-background/55">작품 카드를 끌어다 놓으면 방문자에게 보이는 순서가 바로 바뀝니다. 모든 변경은 서버에 안전하게 저장됩니다.</div></aside>
            <div className="overflow-y-auto p-5 md:p-8">
              {error && <div className="mb-5 flex items-center justify-between bg-destructive/10 p-3 text-sm text-destructive"><span>{error}</span><button onClick={() => setError('')}><X size={16}/></button></div>}
              {notice && <div className="mb-5 flex items-center justify-between bg-primary/15 p-3 text-sm"><span className="flex items-center gap-2"><Check size={16}/>{notice}</span><button onClick={() => setNotice('')}><X size={16}/></button></div>}
              {tab === 'works' && (
                <div className="grid gap-8 lg:grid-cols-[minmax(280px,360px)_1fr]">
                  {editing ? <ProjectForm title="작품 정보 수정" categories={categories} project={editing} busy={busy} onSubmit={saveEdit} onCancel={() => setEditing(null)} /> : <UploadForm categories={categories} busy={busy} onSubmit={upload} />}
                  <div><div className="mb-4 flex items-center justify-between"><div><p className="eyebrow">전시 순서</p><h3 className="display-font text-3xl">작품 순서</h3></div><span className="text-xs text-muted-foreground">작품 {ordered.length}개</span></div>
                    {ordered.length ? <div className="space-y-2">{ordered.map((work) => <div key={work.id} draggable onDragStart={() => setDragId(work.id)} onDragOver={(event) => event.preventDefault()} onDrop={() => dropOn(work.id)} className="flex cursor-grab items-center gap-3 border border-foreground/15 bg-card p-2 active:cursor-grabbing"><GripVertical className="shrink-0 text-muted-foreground" size={17}/><img src={work.imageUrl} alt="" className="h-14 w-14 shrink-0 object-cover"/><div className="min-w-0 flex-1"><p className="truncate font-semibold">{work.title}</p><p className="text-[10px] tracking-wider text-muted-foreground">{work.category} · {work.year}</p></div><Button variant="ghost" size="icon" onClick={() => setEditing(work)} aria-label="수정"><Pencil/></Button><Button variant="destructive" size="icon" onClick={() => removeProject(work.id)} aria-label="삭제"><Trash2/></Button></div>)}</div> : <div className="border border-dashed border-foreground/25 p-10 text-center text-sm text-muted-foreground">아직 올린 작품이 없어요.<br/>왼쪽 폼에서 첫 작품을 추가해 보세요.</div>}
                  </div>
                </div>
              )}
              {tab === 'categories' && (
                <div className="mx-auto max-w-xl"><p className="eyebrow text-primary">분류 정리</p><h3 className="display-font mt-1 text-4xl">카테고리 관리</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">새 카테고리를 만들거나 이름을 바로 수정할 수 있어요. 사용 중인 카테고리를 삭제하려면 먼저 작품을 다른 카테고리로 옮겨 주세요.</p><form onSubmit={addCategory} className="mt-7 flex gap-2"><Input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="예: SD 캐릭터, 커미션" className="h-11 rounded-none"/><Button className="h-11 rounded-none"><Plus/>추가</Button></form><div className="mt-5 divide-y divide-foreground/15 border-y border-foreground/15">{categories.map((item) => <CategoryRow key={item.id} category={item} onRename={renameCategory} onRemove={removeCategory}/>)}</div></div>
              )}
              {tab === 'site' && <SiteSettingsForm key={JSON.stringify(settings)} settings={settings} busy={busy} onSubmit={saveSettings}/>}
              {tab === 'security' && <SecurityPanel busy={busy} onSubmit={changeCode}/>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryRow({ category, onRename, onRemove }: { category: Category; onRename: (category: Category, name: string) => Promise<void>; onRemove: (category: Category) => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  return (
    <div className="flex items-center gap-2 py-3">
      {editing ? <Input value={name} onChange={(event) => setName(event.target.value)} className="h-9 rounded-none font-bold tracking-wider" autoFocus/> : <span className="flex-1 font-bold tracking-wider">{category.name}</span>}
      {editing ? <><Button size="icon" onClick={async () => { await onRename(category, name); setEditing(false); }} aria-label="이름 저장"><Check/></Button><Button variant="ghost" size="icon" onClick={() => { setName(category.name); setEditing(false); }} aria-label="취소"><X/></Button></> : <Button variant="ghost" size="icon" onClick={() => setEditing(true)} aria-label={`${category.name} 이름 수정`}><Pencil/></Button>}
      {!editing && <Button variant="ghost" size="icon" onClick={() => onRemove(category)} aria-label={`${category.name} 삭제`}><Trash2/></Button>}
    </div>
  );
}

function SiteSettingsForm({ settings, busy, onSubmit }: { settings: SiteSettings; busy: boolean; onSubmit: (event: SubmitEvent<HTMLFormElement>) => void }) {
  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl pb-10">
      <p className="eyebrow text-primary">화면 내용</p><h3 className="display-font mt-1 text-4xl">사이트 문구 편집</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">저장하면 방문자 화면에 바로 반영됩니다. 줄바꿈도 그대로 표시돼요.</p>
      <div className="mt-7 grid gap-6 border border-foreground/15 bg-card p-5 md:grid-cols-2 md:p-7">
        <label className="form-label">활동명<Input name="artistName" defaultValue={settings.artistName} required className="mt-1 h-10 rounded-none"/></label>
        <label className="form-label">상단·첫 화면의 DG 표기<Input name="artistMark" defaultValue={settings.artistMark} required className="mt-1 h-10 rounded-none"/></label>
        <label className="form-label">작품 목록 작은 제목<Input name="worksEyebrow" defaultValue={settings.worksEyebrow} className="mt-1 h-10 rounded-none"/></label>
        <label className="form-label">작품 목록 큰 제목<Input name="worksTitle" defaultValue={settings.worksTitle} required className="mt-1 h-10 rounded-none"/></label>
        <label className="form-label">작품이 없을 때 제목<Input name="emptyTitle" defaultValue={settings.emptyTitle} className="mt-1 h-10 rounded-none"/></label>
        <label className="form-label md:col-span-2">작품이 없을 때 안내<Textarea name="emptyBody" defaultValue={settings.emptyBody} className="mt-1 min-h-20 rounded-none"/></label>
        <label className="form-label">소개 작은 제목<Input name="aboutEyebrow" defaultValue={settings.aboutEyebrow} className="mt-1 h-10 rounded-none"/></label>
        <label className="form-label">소개 손글씨 문구<Input name="aboutNote" defaultValue={settings.aboutNote} className="mt-1 h-10 rounded-none"/></label>
        <label className="form-label">소개 큰 제목<Textarea name="aboutHeadline" defaultValue={settings.aboutHeadline} className="mt-1 min-h-28 rounded-none"/></label>
        <label className="form-label">작가 소개글<Textarea name="aboutBody" defaultValue={settings.aboutBody} className="mt-1 min-h-28 rounded-none"/></label>
        <label className="form-label">활동 지역<Input name="location" defaultValue={settings.location} className="mt-1 h-10 rounded-none"/></label>
        <label className="form-label">연락 이메일<Input name="email" type="email" defaultValue={settings.email} className="mt-1 h-10 rounded-none"/></label>
        <label className="form-label md:col-span-2">맨 아래 문구<Input name="footerNote" defaultValue={settings.footerNote} className="mt-1 h-10 rounded-none"/></label>
        <Button disabled={busy} className="h-11 rounded-none md:col-span-2"><Save/>{busy ? '저장 중…' : '사이트 문구 저장'}</Button>
      </div>
    </form>
  );
}

function SecurityPanel({ busy, onSubmit }: { busy: boolean; onSubmit: (event: SubmitEvent<HTMLFormElement>) => void }) {
  return (
    <div className="mx-auto max-w-2xl pb-10">
      <p className="eyebrow text-primary">보안 설정</p><h3 className="display-font mt-1 text-4xl">관리자 보안</h3>
      <div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="security-card"><ShieldCheck/><div><strong>서버에서만 확인</strong><p>코드 원문은 화면 코드에 들어가지 않아요.</p></div></div><div className="security-card"><LockKeyhole/><div><strong>로그인 시도 제한</strong><p>반복해서 틀리면 일정 시간 잠깁니다.</p></div></div><div className="security-card"><Check/><div><strong>보안 쿠키</strong><p>로그인 정보는 다른 사이트에서 읽을 수 없어요.</p></div></div><div className="security-card"><Save/><div><strong>코드 해시 저장</strong><p>변경한 코드는 강한 해시로만 저장됩니다.</p></div></div></div>
      <form onSubmit={onSubmit} className="mt-7 space-y-4 border border-foreground/15 bg-card p-5 md:p-7"><div><p className="eyebrow">코드 변경</p><h4 className="display-font text-3xl">관리자 코드 변경</h4><p className="mt-2 text-xs leading-5 text-muted-foreground">4자리 코드도 사용할 수 있지만, 더 긴 코드를 쓰면 훨씬 안전합니다.</p></div><label className="form-label">현재 코드<Input name="currentCode" type="password" required className="mt-1 h-10 rounded-none" autoComplete="current-password"/></label><label className="form-label">새 코드<Input name="newCode" type="password" minLength={4} required className="mt-1 h-10 rounded-none" autoComplete="new-password"/></label><label className="form-label">새 코드 다시 입력<Input name="confirmCode" type="password" minLength={4} required className="mt-1 h-10 rounded-none" autoComplete="new-password"/></label><Button disabled={busy} className="h-11 w-full rounded-none"><ShieldCheck/>{busy ? '변경 중…' : '관리자 코드 변경'}</Button></form>
    </div>
  );
}

function UploadForm({ categories, busy, onSubmit }: { categories: Category[]; busy: boolean; onSubmit: (event: SubmitEvent<HTMLFormElement>) => void }) {
  return <ProjectForm title="새 작품 올리기" categories={categories} busy={busy} onSubmit={onSubmit} upload/>;
}

function ProjectForm({ title, categories, project, busy, onSubmit, onCancel, upload = false }: { title: string; categories: Category[]; project?: Project; busy: boolean; onSubmit: (event: SubmitEvent<HTMLFormElement>) => void; onCancel?: () => void; upload?: boolean }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 border border-foreground/15 bg-card p-5">
      <div><p className="eyebrow text-primary">{upload ? '새 작품' : '작품 수정'}</p><h3 className="display-font text-3xl">{title}</h3></div>
      <label className="grid min-h-28 cursor-pointer place-items-center border border-dashed border-foreground/30 bg-muted/40 text-center transition hover:border-primary hover:bg-primary/5"><span><Upload className="mx-auto mb-2"/><span className="text-xs font-semibold">{upload ? '이미지를 선택하세요 · 최대 15MB' : '새 이미지로 바꾸기 · 선택 사항'}</span></span><Input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required={upload} className="sr-only"/></label>
      <label className="form-label">작품 제목<Input name="title" defaultValue={project?.title} required className="mt-1 h-10 rounded-none" placeholder="작품 제목"/></label>
      <div className="grid grid-cols-2 gap-3"><label className="form-label">카테고리<select name="category" defaultValue={project?.category || categories[0]?.name} className="form-select">{categories.map((item) => <option key={item.id}>{item.name}</option>)}</select></label><label className="form-label">연도<Input name="year" defaultValue={project?.year || new Date().getFullYear()} className="mt-1 h-10 rounded-none"/></label></div>
      <label className="form-label">보이는 비율<select name="layout" defaultValue={project?.layout || 'portrait'} className="form-select"><option value="portrait">세로형</option><option value="landscape">가로형</option><option value="square">정사각형</option></select></label>
      <label className="form-label">짧은 설명<Textarea name="description" defaultValue={project?.description} className="mt-1 min-h-20 rounded-none" placeholder="작품에 관한 한두 문장"/></label>
      <div className="flex gap-2"><Button disabled={busy} className="h-11 flex-1 rounded-none">{busy ? '저장 중…' : <><Check/>{upload ? '작품 올리기' : '변경 저장'}</>}</Button>{onCancel && <Button type="button" variant="outline" className="h-11 rounded-none" onClick={onCancel}>취소</Button>}</div>
    </form>
  );
}
