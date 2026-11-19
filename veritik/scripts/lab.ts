/// <reference types="node" />
/**
 * Laboratorio: pasa el JSON que genera tiktok_scraper_hibrido.py por el dominio y el SignalCalculator
 * y muestra el puntaje de autenticidad. Sirve para probar el Paso 4 con datos reales y ajustar umbrales.
 *
 * Uso:  npx tsx scripts/lab.ts ruta/al/usuario_hibrido.json [otro.json ...]
 */
import { readFileSync } from 'node:fs';
import { AnalysisResult, CommentSample, Profile, Username, VideoStats } from '../src/domain';
import { SignalCalculator } from '../src/application';

interface ScraperVideo {
  url: string;
  fecha?: string; // "YYYY-MM-DD HH:MM"
  vistas: number | null;
  likes: number | null;
  comentarios: number | null;
  compartidos: number | null;
  primeros_comentarios?: { texto: string }[];
}
interface ScraperFile {
  perfil: { usuario: string; seguidores: number; seguidos: number; likes_totales: number; videos: number };
  ultimos_videos: ScraperVideo[];
}

const SIGNAL_LABELS: Record<string, string> = {
  engagement: 'Engagement real',
  viewsToFollowers: 'Vistas / seguidores',
  commentQuality: 'Calidad de comentarios',
  followRatio: 'Seguidores / seguidos',
  postingRegularity: 'Publicaciones por semana',
  followerJumps: 'Saltos de seguidores',
};
const STATUS_TEXT = { good: 'Bien', warning: 'Atención', risk: 'Riesgo' } as const;
const LEVEL_TEXT = { high: 'ALTO', medium: 'MEDIO', low: 'BAJO' } as const;

/** EXPERIMENTAL (solo para este laboratorio): un comentario es "genérico" si es muy corto o no tiene letras (solo emojis/símbolos). */
function isGeneric(text: string): boolean {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length <= 2 || !/\p{L}/u.test(text);
}

function toProfile(data: ScraperFile): Profile {
  const videos = data.ultimos_videos.map((v) =>
    VideoStats.create({
      id: v.url.split('/').pop() ?? v.url,
      url: v.url,
      publishedAt: v.fecha ? new Date(v.fecha.replace(' ', 'T')) : new Date(),
      views: v.vistas ?? 0,
      likes: v.likes ?? 0,
      comments: v.comentarios ?? 0,
      shares: v.compartidos ?? 0,
    }),
  );
  const texts = data.ultimos_videos.flatMap((v) => (v.primeros_comentarios ?? []).map((c) => c.texto));
  const sample = texts.length > 0 ? CommentSample.create(texts.length, texts.filter(isGeneric).length) : null;
  const p = data.perfil;
  return Profile.create({
    username: Username.create(p.usuario), followers: p.seguidores, following: p.seguidos,
    totalLikes: p.likes_totales, videoCount: p.videos, videos, commentSample: sample, fetchedAt: new Date(),
  });
}

function fmt(n: number | null, digits = 3): string {
  return n === null ? '—' : n.toFixed(digits);
}

function analyze(path: string): void {
  const data = JSON.parse(readFileSync(path, 'utf-8')) as ScraperFile;
  const profile = toProfile(data);
  const signals = new SignalCalculator().calculate(profile);
  const result = AnalysisResult.create({ id: 'lab', profile, signals, analyzedAt: new Date() });

  console.log(`\n=== ${profile.username.handle} ===`);
  console.log(`Seguidores: ${profile.followers} · Seguidos: ${profile.following} · Videos analizados: ${profile.videos.length}`);
  console.log(`Comentarios en la muestra: ${profile.commentSample?.total ?? 0}\n`);
  console.log('Señal'.padEnd(26) + 'Valor medido'.padEnd(14) + 'Puntaje'.padEnd(9) + 'Estado'.padEnd(10) + 'Peso');
  for (const s of result.signals) {
    console.log(
      (SIGNAL_LABELS[s.id] ?? s.id).padEnd(26) + fmt(s.rawValue).padEnd(14) +
      (s.score === null ? '—' : s.score.toFixed(0)).padEnd(9) +
      (s.status ? STATUS_TEXT[s.status] : 'Sin datos').padEnd(10) + `${(s.weight * 100).toFixed(0)} %`,
    );
  }
  console.log(`\nPuntaje de autenticidad: ${result.score.value}/100 (${LEVEL_TEXT[result.level]})`);
  if (result.unavailableSignals.length > 0) {
    console.log(`Sin datos: ${result.unavailableSignals.map((s) => SIGNAL_LABELS[s.id] ?? s.id).join(', ')} (pesos renormalizados)`);
  }
}

const files = process.argv.slice(2);
if (files.length === 0) {
  console.log('Uso: npx tsx scripts/lab.ts usuario_hibrido.json [otro.json ...]');
  process.exit(1);
}
files.forEach(analyze);
