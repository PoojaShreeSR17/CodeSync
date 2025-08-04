import { Language } from '../types';

export const LANGUAGE_OPTIONS: Language[] = [
  {
    id: 'javascript',
    name: 'JavaScript',
    extension: 'js',
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    extension: 'ts',
  },
  {
    id: 'python',
    name: 'Python',
    extension: 'py',
  },
  {
    id: 'java',
    name: 'Java',
    extension: 'java',
  },
  {
    id: 'cpp',
    name: 'C++',
    extension: 'cpp',
  },
  {
    id: 'csharp',
    name: 'C#',
    extension: 'cs',
  },
  {
    id: 'go',
    name: 'Go',
    extension: 'go',
  },
  {
    id: 'rust',
    name: 'Rust',
    extension: 'rs',
  },
  {
    id: 'html',
    name: 'HTML',
    extension: 'html',
  },
  {
    id: 'css',
    name: 'CSS',
    extension: 'css',
  },
  {
    id: 'json',
    name: 'JSON',
    extension: 'json',
  },
];

export const DEFAULT_LANGUAGE: Language = LANGUAGE_OPTIONS[0];

export const getLanguageById = (id: string): Language => {
  return LANGUAGE_OPTIONS.find((lang) => lang.id === id) || DEFAULT_LANGUAGE;
};