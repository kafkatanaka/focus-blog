import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import type { Locale } from './locale';
import type { EnNavCategory } from '../data/media-taxonomy';
import { EN_NAV_CATEGORIES } from '../data/media-taxonomy';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export type CategoryQuestion = {
  label: string;
  anchor?: string;
};

export type CategoryEditorialConfig = {
  tagline?: string;
  startHere?: string[];
  questions?: CategoryQuestion[];
};

export type CategoryEditorialFile = {
  categories: Record<string, CategoryEditorialConfig>;
};

export function loadCategoryEditorial(locale: Locale): CategoryEditorialFile {
  const file =
    locale === 'ja'
      ? path.join(ROOT, 'src', 'data', 'editorial', 'ja-categories.yml')
      : path.join(ROOT, 'src', 'data', 'editorial', 'en-categories.yml');
  if (!fs.existsSync(file)) {
    return { categories: {} };
  }
  return parseYaml(fs.readFileSync(file, 'utf8')) as CategoryEditorialFile;
}

export function getCategoryEditorial(
  locale: Locale,
  category: string
): CategoryEditorialConfig | undefined {
  return loadCategoryEditorial(locale).categories[category];
}

export function isEnCategoryPage(category: string): category is EnNavCategory {
  return (EN_NAV_CATEGORIES as readonly string[]).includes(category);
}
