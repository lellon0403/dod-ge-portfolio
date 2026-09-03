'use client';

import {
  ArrowDownRight, ArrowUpRight, Check, GripVertical, LockKeyhole, LogOut,
  Menu, Pencil, Plus, Sparkles, Trash2, Upload, X,
} from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type Project = {
  id: string;
  title: string;
  category: string;
  year: string;
  description: string;
  imageUrl: string;
  layout: 'portrait' | 'landscape' | 'square';
  sortOrder: number;
  sample?: boolean;
  position?: string;
};

type Category = { id: string; name: string; sortOrder: number };

const sampleWorks: Project[] = [
  { id: 'sample-1', title: 'Neon Signal', category: 'CHARACTER', year: '2026', description: '빛을 모으는 오리지널 캐릭터', imageUrl: '/og.png', layout: 'portrait', sortOrder: 0, sample: true, position: '8% 18%' },
  { id: 'sample-2', title: 'Stream Mode!', category: 'FAN ART', year: '2026', description: '좋아하는 방송의 에너지를 담은 팬아트', imageUrl: '/og.png', layout: 'landscape', sortOrder: 1, sample: true, position: '52% 18%' },
  { id: 'sample-3', title: 'Red Thread', category: 'ILLUSTRATION', year: '2025', description: '붉은 실과 검은 고양이', imageUrl: '/og.png', layout: 'portrait', sortOrder: 2, sample: true, position: '91% 18%' },
  { id: 'sample-4', title: 'Lucky Bunny', category: 'CHARACTER', year: '2025', description: '행운을 배달하는 토끼 소녀', imageUrl: '/og.png', layout: 'square', sortOrder: 3, sample: true, position: '12% 66%' },
  { id: 'sample-5', title: 'Midnight Chat', category: 'FAN ART', year: '2025', description: '새벽 채팅창의 푸른 온도', imageUrl: '/og.png', layout: 'square', sortOrder: 4, sample: true, position: '52% 64%' },
  { id: 'sample-6', title: 'Umbrella Waltz', category: 'ILLUSTRATION', year: '2024', description: '비 오는 날의 캐릭터 키 비주얼', imageUrl: '/og.png', layout: 'portrait', sortOrder: 5, sample: true, position: '89% 64%' },
];

function LoadingMark() {
  return <div className="loading-mark" aria-label="작품 불러오는 중"><span/><span/><span/></div>;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [category, setCategory] = useState('ALL');
  const [selected, setSelected] = useState<Project | null>(null);

  async function refresh() {
    const [projectResponse, categoryResponse, authResponse] = await Promise.all([
      fetch('/api/projects'), fetch('/api/categories'), fetch('/api/auth'),
    ]);
    if (projectResponse.ok) setProjects((await projectResponse.json()).projects);
    if (categoryResponse.ok) setCategories((await categoryResponse.json()).categories);
    if (authResponse.ok) setAuthenticated((await authResponse.json()).authenticated);
    setLoaded(true);
  }

  useEffect(() => { refresh().catch(() => setLoaded(true)); }, []);

  const visibleWorks = projects.length ? projects : sampleWorks;
  const filterNames = useMemo(() => {
    const source = projects.length ? categories.map((item) => item.name) : ['CHARACTER', 'FAN ART', 'ILLUSTRATION'];
    return ['ALL', ...source];
  }, [categories, projects.length]);
  const filtered = visibleWorks.filter((work) => category === 'ALL' || work.category === category);

  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <header className="sticky top-0 z-40 flex h-[72px] items-center justify-between border-b border-white/15 bg-foreground/90 px-5 text-background backdrop-blur-xl md:px-10">
        <a href="#top" className="display-font text-[27px] leading-none tracking-[-0.04em]">DAHYUN<span className="text-primary">✦</span></a>
        <nav className="hidden items-center gap-8 text-[11px] font-semibold tracking-[0.14em] md:flex">
          <a className="nav-link" href="#works">WORKS</a><a className="nav-link" href="#about">ABOUT</a>
          <button className="nav-link flex items-center gap-1.5" onClick={() => setAdminOpen(true)}><LockKeyhole size={12}/> STUDIO</button>
        </nav>
        <button aria-label="메뉴 열기" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button>
        {menuOpen && (
          <div className="absolute inset-x-0 top-[71px] flex flex-col gap-5 border-b border-white/15 bg-foreground p-6 text-sm font-semibold tracking-widest md:hidden">
            <a href="#works" onClick={() => setMenuOpen(false)}>WORKS</a><a href="#about" onClick={() => setMenuOpen(false)}>ABOUT</a>
            <button className="text-left" onClick={() => { setAdminOpen(true); setMenuOpen(false); }}>STUDIO</button>
          </div>
        )}
      </header>

      <section id="top" className="hero-grid relative min-h-[calc(100svh-72px)] overflow-hidden bg-foreground text-background">
        <div className="hero-copy relative z-10 flex flex-col justify-between px-5 py-10 md:px-10 md:py-14">
          <div className="flex items-center gap-3 text-[10px] font-bold tracking-[0.16em] text-background/60"><span className="h-2 w-2 rounded-full bg-primary animate-pulse"/>ILLUSTRATION · CHARACTER · FAN ART</div>
          <div>
            <p className="scribble mb-3 text-primary">draw what you love!</p>
            <h1 className="display-font text-[clamp(4.3rem,10vw,9.6rem)] leading-[0.75] tracking-[-0.075em]">FRAME<br/><span className="ml-[7vw] italic text-secondary">BY</span><br/>FRAME.</h1>
            <p className="mt-9 max-w-md text-sm leading-6 text-background/70">다현이 그리는 캐릭터와 좋아하는 크리에이터들의 순간.<br/>표정과 움직임, 애정을 한 장씩 모았습니다.</p>
          </div>
          <a href="#works" className="flex w-fit items-center gap-3 text-[11px] font-bold tracking-[0.14em]">VIEW THE ARCHIVE <span className="grid h-10 w-10 place-items-center rounded-full border border-background/40 transition hover:-rotate-12 hover:bg-primary hover:text-foreground"><ArrowDownRight size={18}/></span></a>
        </div>
        <div className="hero-art relative min-h-[52vh] overflow-hidden border-l border-white/15">
          <img src="/og.png" alt="다현 포트폴리오의 애니메이션 캐릭터 샘플 콜라주" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/45 via-transparent to-transparent" />
          <div className="absolute right-5 top-5 rotate-3 bg-primary px-3 py-2 text-[10px] font-black tracking-[0.13em] text-foreground shadow-[4px_4px_0_#18131f]">NEW DRAWINGS!</div>
        </div>
      </section>

      <section id="works" className="px-5 py-16 md:px-10 md:py-24">
        <div className="mb-12 flex flex-col justify-between gap-7 md:flex-row md:items-end">
          <div><p className="eyebrow text-primary">01 · ART ARCHIVE</p><h2 className="display-font mt-2 text-5xl tracking-[-0.045em] md:text-7xl">Selected works</h2></div>
          <div className="flex max-w-2xl flex-wrap gap-2" aria-label="카테고리 필터">
            {filterNames.map((item) => <button key={item} onClick={() => setCategory(item)} className={`category-pill ${category === item ? 'active' : ''}`}>{item}</button>)}
          </div>
        </div>

        {!loaded ? <LoadingMark/> : filtered.length ? (
          <div className="grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-12">
            {filtered.map((work, index) => (
              <button key={work.id} onClick={() => setSelected(work)} className={`art-card group text-left ${work.layout === 'landscape' ? 'lg:col-span-7' : index % 3 === 0 ? 'lg:col-span-5' : 'lg:col-span-6'}`}>
                <div className={`art-frame relative overflow-hidden bg-foreground ${work.layout === 'portrait' ? 'aspect-[4/5]' : work.layout === 'landscape' ? 'aspect-[7/5]' : 'aspect-square'}`}>
                  <img src={work.imageUrl} alt={work.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]" style={{ objectPosition: work.position || 'center' }} />
                  <div className="absolute inset-0 bg-foreground/0 transition group-hover:bg-foreground/10"/>
                  <span className="absolute bottom-4 right-4 grid h-10 w-10 translate-y-3 place-items-center rounded-full bg-primary text-foreground opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100"><ArrowUpRight size={19}/></span>
                  {work.sample && <span className="absolute left-3 top-3 bg-background px-2 py-1 text-[9px] font-black tracking-[0.1em] text-foreground">SAMPLE</span>}
                </div>
                <div className="mt-3 flex items-start justify-between gap-4 border-t border-foreground/25 pt-3"><div><h3 className="display-font text-2xl italic">{work.title}</h3><p className="mt-1 text-xs text-muted-foreground">{work.description}</p></div><p className="shrink-0 text-[9px] font-bold tracking-[0.12em] text-muted-foreground">{work.category}<br/>{work.year}</p></div>
              </button>
            ))}
          </div>
        ) : <div className="grid min-h-64 place-items-center border border-dashed border-foreground/30 text-center"><div><Sparkles className="mx-auto mb-3 text-primary"/><p className="display-font text-2xl italic">첫 작품을 기다리고 있어요.</p></div></div>}
      </section>

      <section id="about" className="grid border-t border-foreground/15 md:grid-cols-2">
        <div className="relative overflow-hidden bg-secondary p-8 text-secondary-foreground md:p-14"><div className="absolute -right-12 -top-12 h-40 w-40 rounded-full border-[24px] border-primary/70"/><p className="eyebrow">02 · ABOUT</p><p className="display-font relative mt-16 text-[clamp(2.8rem,6vw,6rem)] leading-[0.88] tracking-[-0.05em]">Characters<br/>feel alive<br/><span className="italic text-background">when loved.</span></p></div>
        <div className="flex flex-col justify-between gap-20 bg-foreground p-8 text-background md:p-14"><div><p className="scribble mb-6 text-primary">hello, I'm Dahyun</p><p className="max-w-lg text-lg leading-8 text-background/80">애니메이션과 이야기, 방송 속 재미있는 순간에서 영감을 받아 캐릭터를 그립니다. 좋아하는 마음이 보이는 그림을 오래 그리고 싶어요.</p></div><div className="flex items-end justify-between border-t border-background/20 pt-5 text-xs tracking-wider"><span>SEOUL, KOREA</span><a className="underline decoration-primary underline-offset-4" href="mailto:hello@example.com">GET IN TOUCH ↗</a></div></div>
      </section>

      <footer className="flex flex-col gap-4 border-t border-foreground/15 px-5 py-7 text-[10px] font-semibold tracking-[0.14em] md:flex-row md:items-center md:justify-between md:px-10"><span>© 2026 DAHYUN STUDIO</span><span>MADE FOR EVERY FAVORITE MOMENT ✦</span></footer>

      {selected && <ArtworkModal work={selected} onClose={() => setSelected(null)} />}
      {adminOpen && <AdminOverlay authenticated={authenticated} setAuthenticated={setAuthenticated} projects={projects} categories={categories} onRefresh={refresh} onClose={() => setAdminOpen(false)} />}
    </main>
  );
}

function ArtworkModal({ work, onClose }: { work: Project; onClose: () => void }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={work.title} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="grid max-h-[92vh] w-full max-w-6xl overflow-auto bg-foreground text-background md:grid-cols-[1.35fr_.65fr]">
        <div className="grid min-h-[45vh] place-items-center bg-black/25"><img src={work.imageUrl} alt={work.title} className="max-h-[82vh] w-full object-contain" style={{ objectPosition: work.position || 'center' }}/></div>
        <div className="flex flex-col justify-between p-7 md:p-10"><button aria-label="닫기" onClick={onClose} className="ml-auto"><X/></button><div className="py-14"><p className="eyebrow text-primary">{work.category} · {work.year}</p><h2 className="display-font mt-3 text-5xl italic">{work.title}</h2><p className="mt-6 leading-7 text-background/65">{work.description || '다현의 아트 아카이브에 기록된 작업입니다.'}</p></div><p className="text-[10px] tracking-[0.14em] text-background/45">DAHYUN ART ARCHIVE</p></div>
      </div>
    </div>
  );
}

function AdminOverlay({ authenticated, setAuthenticated, projects, categories, onRefresh, onClose }: {
  authenticated: boolean; setAuthenticated: (value: boolean) => void; projects: Project[]; categories: Category[]; onRefresh: () => Promise<void>; onClose: () => void;
}) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<'works' | 'categories'>('works');
  const [editing, setEditing] = useState<Project | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [dragId, setDragId] = useState<string | null>(null);
  const [ordered, setOrdered] = useState(projects);

  useEffect(() => setOrdered(projects), [projects]);

  async function login(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    const response = await fetch('/api/auth', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ code }) });
    const body = await response.json(); setBusy(false);
    if (!response.ok) return setError(body.error || '코드를 확인해 주세요.');
    setAuthenticated(true);
  }

  async function logout() { await fetch('/api/auth', { method: 'DELETE' }); setAuthenticated(false); }

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    const response = await fetch('/api/projects', { method: 'POST', body: new FormData(event.currentTarget) });
    const body = await response.json(); setBusy(false);
    if (!response.ok) return setError(body.error || '업로드하지 못했어요.');
    event.currentTarget.reset(); await onRefresh();
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!editing) return; setBusy(true); setError('');
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/projects', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: editing.id, title: form.get('title'), category: form.get('category'), year: form.get('year'), description: form.get('description'), layout: form.get('layout') }) });
    const body = await response.json(); setBusy(false);
    if (!response.ok) return setError(body.error || '수정하지 못했어요.');
    setEditing(null); await onRefresh();
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

  async function addCategory(event: FormEvent) {
    event.preventDefault(); if (!newCategory.trim()) return;
    const response = await fetch('/api/categories', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: newCategory }) });
    const body = await response.json(); if (!response.ok) setError(body.error); else { setNewCategory(''); await onRefresh(); }
  }

  async function removeCategory(category: Category) {
    const response = await fetch('/api/categories', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify(category) });
    const body = await response.json(); if (!response.ok) setError(body.error); else await onRefresh();
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="admin-title" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      {!authenticated ? (
        <form onSubmit={login} className="w-full max-w-md bg-background p-7 text-foreground shadow-2xl">
          <div className="mb-10 flex items-start justify-between"><div><p className="eyebrow text-primary">STUDIO ACCESS</p><h2 id="admin-title" className="display-font mt-2 text-4xl">작업실 열기</h2></div><button type="button" aria-label="닫기" onClick={onClose}><X size={20}/></button></div>
          <label className="text-xs font-semibold tracking-wider" htmlFor="admin-code">관리자 코드</label>
          <Input id="admin-code" type="password" value={code} onChange={(event) => setCode(event.target.value)} placeholder="코드를 입력하세요" className="mt-2 h-12 rounded-none border-foreground/25 px-4" autoFocus />
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
          <Button disabled={busy} className="mt-4 h-12 w-full rounded-none font-bold tracking-[0.14em]">{busy ? '확인 중…' : 'ENTER STUDIO'}</Button>
          <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">로그인하면 작품 추가, 정보 수정, 순서 변경을 할 수 있어요.</p>
        </form>
      ) : (
        <div className="admin-panel h-[92vh] w-full max-w-6xl overflow-hidden bg-background text-foreground shadow-2xl">
          <header className="flex h-16 items-center justify-between border-b border-foreground/15 px-5 md:px-7"><div><p className="eyebrow text-primary">DAHYUN STUDIO</p><h2 id="admin-title" className="display-font text-2xl">포트폴리오 관리</h2></div><div className="flex items-center gap-1"><Button variant="ghost" size="sm" onClick={logout}><LogOut/> 로그아웃</Button><Button variant="ghost" size="icon" onClick={onClose} aria-label="닫기"><X/></Button></div></header>
          <div className="grid h-[calc(92vh-64px)] md:grid-cols-[260px_1fr]">
            <aside className="border-b border-foreground/15 bg-foreground p-4 text-background md:border-b-0 md:border-r md:p-6"><p className="mb-3 text-[10px] font-bold tracking-[0.16em] text-background/45">MANAGE</p><button onClick={() => setTab('works')} className={`admin-nav ${tab === 'works' ? 'active' : ''}`}><Upload size={16}/>작품 관리</button><button onClick={() => setTab('categories')} className={`admin-nav ${tab === 'categories' ? 'active' : ''}`}><Sparkles size={16}/>카테고리</button><div className="mt-8 border-t border-background/15 pt-5 text-xs leading-5 text-background/55">작품 카드를 끌어다 놓으면 방문자에게 보이는 순서가 바로 바뀝니다.</div></aside>
            <div className="overflow-y-auto p-5 md:p-8">
              {error && <div className="mb-5 flex items-center justify-between bg-destructive/10 p-3 text-sm text-destructive"><span>{error}</span><button onClick={() => setError('')}><X size={16}/></button></div>}
              {tab === 'works' ? (
                <div className="grid gap-8 lg:grid-cols-[minmax(280px,360px)_1fr]">
                  {editing ? <ProjectForm title="작품 정보 수정" categories={categories} project={editing} busy={busy} onSubmit={saveEdit} onCancel={() => setEditing(null)} /> : <UploadForm categories={categories} busy={busy} onSubmit={upload} />}
                  <div><div className="mb-4 flex items-center justify-between"><div><p className="eyebrow">DISPLAY ORDER</p><h3 className="display-font text-3xl">작품 순서</h3></div><span className="text-xs text-muted-foreground">{ordered.length} works</span></div>
                    {ordered.length ? <div className="space-y-2">{ordered.map((work) => <div key={work.id} draggable onDragStart={() => setDragId(work.id)} onDragOver={(event) => event.preventDefault()} onDrop={() => dropOn(work.id)} className="flex cursor-grab items-center gap-3 border border-foreground/15 bg-card p-2 active:cursor-grabbing"><GripVertical className="shrink-0 text-muted-foreground" size={17}/><img src={work.imageUrl} alt="" className="h-14 w-14 shrink-0 object-cover"/><div className="min-w-0 flex-1"><p className="truncate font-semibold">{work.title}</p><p className="text-[10px] tracking-wider text-muted-foreground">{work.category} · {work.year}</p></div><Button variant="ghost" size="icon" onClick={() => setEditing(work)} aria-label="수정"><Pencil/></Button><Button variant="destructive" size="icon" onClick={() => removeProject(work.id)} aria-label="삭제"><Trash2/></Button></div>)}</div> : <div className="border border-dashed border-foreground/25 p-10 text-center text-sm text-muted-foreground">아직 올린 작품이 없어요.<br/>왼쪽 폼에서 첫 작품을 추가해 보세요.</div>}
                  </div>
                </div>
              ) : (
                <div className="mx-auto max-w-xl"><p className="eyebrow text-primary">ORGANIZE</p><h3 className="display-font mt-1 text-4xl">카테고리 관리</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">그림 스타일에 맞춰 카테고리를 추가하세요. 사용 중인 카테고리는 작품을 다른 곳으로 옮긴 뒤 삭제할 수 있어요.</p><form onSubmit={addCategory} className="mt-7 flex gap-2"><Input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="예: CHIBI, COMMISSION" className="h-11 rounded-none"/><Button className="h-11 rounded-none"><Plus/>추가</Button></form><div className="mt-5 divide-y divide-foreground/15 border-y border-foreground/15">{categories.map((item) => <div key={item.id} className="flex items-center justify-between py-4"><span className="font-bold tracking-wider">{item.name}</span><Button variant="ghost" size="icon" onClick={() => removeCategory(item)} aria-label={`${item.name} 삭제`}><Trash2/></Button></div>)}</div></div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UploadForm({ categories, busy, onSubmit }: { categories: Category[]; busy: boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <ProjectForm title="새 작품 올리기" categories={categories} busy={busy} onSubmit={onSubmit} upload/>;
}

function ProjectForm({ title, categories, project, busy, onSubmit, onCancel, upload = false }: { title: string; categories: Category[]; project?: Project; busy: boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onCancel?: () => void; upload?: boolean }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 border border-foreground/15 bg-card p-5">
      <div><p className="eyebrow text-primary">{upload ? 'ADD NEW' : 'EDIT'}</p><h3 className="display-font text-3xl">{title}</h3></div>
      {upload && <label className="grid min-h-28 cursor-pointer place-items-center border border-dashed border-foreground/30 bg-muted/40 text-center transition hover:border-primary hover:bg-primary/5"><span><Upload className="mx-auto mb-2"/><span className="text-xs font-semibold">이미지를 선택하세요 · 최대 15MB</span></span><Input name="image" type="file" accept="image/*" required className="sr-only"/></label>}
      <label className="form-label">작품 제목<Input name="title" defaultValue={project?.title} required className="mt-1 h-10 rounded-none" placeholder="작품 제목"/></label>
      <div className="grid grid-cols-2 gap-3"><label className="form-label">카테고리<select name="category" defaultValue={project?.category || categories[0]?.name} className="form-select">{categories.map((item) => <option key={item.id}>{item.name}</option>)}</select></label><label className="form-label">연도<Input name="year" defaultValue={project?.year || new Date().getFullYear()} className="mt-1 h-10 rounded-none"/></label></div>
      <label className="form-label">보이는 비율<select name="layout" defaultValue={project?.layout || 'portrait'} className="form-select"><option value="portrait">세로형</option><option value="landscape">가로형</option><option value="square">정사각형</option></select></label>
      <label className="form-label">짧은 설명<Textarea name="description" defaultValue={project?.description} className="mt-1 min-h-20 rounded-none" placeholder="작품에 관한 한두 문장"/></label>
      <div className="flex gap-2"><Button disabled={busy} className="h-11 flex-1 rounded-none">{busy ? '저장 중…' : <><Check/>{upload ? '작품 올리기' : '변경 저장'}</>}</Button>{onCancel && <Button type="button" variant="outline" className="h-11 rounded-none" onClick={onCancel}>취소</Button>}</div>
    </form>
  );
}
