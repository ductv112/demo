/**
 * Centralized file icon utility — ánh xạ MIME type → icon màu sắc
 *
 * Dùng chung cho tất cả component hiển thị icon file trong DMS.
 * Export 3 items: getFileIconConfig, getFileIconByExtension, FileTypeIcon
 */

import {
  File,
  FileArchive,
  FileAudio,
  FileCode,
  FileImage,
  FileJson,
  FileSpreadsheet,
  FileText,
  FileType,
  FileVideo,
  Presentation,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

// ─── Interface ─────────────────────────────────────────────────────────────────

export interface FileIconConfig {
  icon: LucideIcon;
  color: string;
  bg: string;
  label: string;
}

// ─── Mapping MIME type → config ────────────────────────────────────────────────

/**
 * Nhận MIME type, trả về config icon { icon, color, bg, label }.
 * Khi mimeType là generic (application/octet-stream), fallback sang fileName extension.
 */
export function getFileIconConfig(mimeType: string, fileName?: string): FileIconConfig {
  const m = mimeType.toLowerCase();

  // Fallback: khi mimeType generic, thử đoán từ extension
  if (m === 'application/octet-stream' && fileName) {
    return getFileIconByExtension(fileName);
  }

  // PDF
  if (m === 'application/pdf') {
    return { icon: FileText, color: 'text-red-500', bg: 'bg-red-50', label: 'PDF' };
  }

  // Word / DOCX
  if (
    m.includes('word') ||
    m.includes('wordprocessingml') ||
    m === 'application/msword'
  ) {
    return { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50', label: 'DOCX' };
  }

  // Excel / Spreadsheet / CSV
  if (
    m.includes('sheet') ||
    m.includes('spreadsheetml') ||
    m.includes('excel') ||
    m === 'text/csv'
  ) {
    return { icon: FileSpreadsheet, color: 'text-green-500', bg: 'bg-green-50', label: 'XLSX' };
  }

  // PowerPoint / Presentation
  if (m.includes('presentation') || m.includes('powerpoint')) {
    return { icon: Presentation, color: 'text-orange-500', bg: 'bg-orange-50', label: 'PPTX' };
  }

  // Image
  if (m.startsWith('image/')) {
    return { icon: FileImage, color: 'text-purple-500', bg: 'bg-purple-50', label: 'Ảnh' };
  }

  // Video
  if (m.startsWith('video/')) {
    return { icon: FileVideo, color: 'text-pink-500', bg: 'bg-pink-50', label: 'Video' };
  }

  // Audio
  if (m.startsWith('audio/')) {
    return { icon: FileAudio, color: 'text-violet-500', bg: 'bg-violet-50', label: 'Âm thanh' };
  }

  // Archive / ZIP / RAR / 7z / gz
  if (
    m === 'application/zip' ||
    m.includes('compressed') ||
    m.includes('archive') ||
    m.includes('x-rar') ||
    m.includes('x-7z') ||
    m === 'application/gzip' ||
    m === 'application/x-tar'
  ) {
    return { icon: FileArchive, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Nén' };
  }

  // JSON
  if (m === 'application/json') {
    return { icon: FileJson, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'JSON' };
  }

  // Code (JS/TS/XML/HTML/CSS/Python/Java/YAML…)
  if (
    m.includes('javascript') ||
    m.includes('typescript') ||
    m.includes('xml') ||
    m.includes('html') ||
    m.includes('css') ||
    m.includes('python') ||
    m.includes('java') ||
    m.includes('yaml')
  ) {
    return { icon: FileCode, color: 'text-slate-600', bg: 'bg-slate-50', label: 'Code' };
  }

  // Plain text
  if (m === 'text/plain') {
    return { icon: FileType, color: 'text-gray-500', bg: 'bg-gray-50', label: 'TXT' };
  }

  // Other text/*
  if (m.startsWith('text/')) {
    return { icon: FileText, color: 'text-gray-500', bg: 'bg-gray-50', label: 'Văn bản' };
  }

  // Default
  return { icon: File, color: 'text-gray-400', bg: 'bg-gray-50', label: 'Tệp' };
}

// ─── Extension → MIME type mapping ────────────────────────────────────────────

const EXT_TO_MIME: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/msword',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.ms-excel',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.ms-powerpoint',
  png: 'image/png',
  jpg: 'image/png',
  jpeg: 'image/png',
  gif: 'image/png',
  webp: 'image/png',
  svg: 'image/png',
  bmp: 'image/png',
  mp4: 'video/mp4',
  avi: 'video/mp4',
  mov: 'video/mp4',
  mkv: 'video/mp4',
  webm: 'video/mp4',
  mp3: 'audio/mpeg',
  wav: 'audio/mpeg',
  ogg: 'audio/mpeg',
  flac: 'audio/mpeg',
  aac: 'audio/mpeg',
  zip: 'application/zip',
  rar: 'application/zip',
  '7z': 'application/zip',
  gz: 'application/gzip',
  tar: 'application/x-tar',
  json: 'application/json',
  js: 'application/javascript',
  ts: 'application/javascript',
  jsx: 'application/javascript',
  tsx: 'application/javascript',
  html: 'text/html',
  htm: 'text/html',
  css: 'text/css',
  xml: 'application/xml',
  py: 'text/x-python',
  txt: 'text/plain',
  csv: 'text/csv',
};

/**
 * Nhận tên file (hoặc chỉ extension), trả về config icon.
 * Dùng khi chỉ có fileName mà không có mimeType (vd: citation-card).
 */
export function getFileIconByExtension(fileName: string): FileIconConfig {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  const mime = EXT_TO_MIME[ext] ?? 'application/octet-stream';
  return getFileIconConfig(mime);
}

// ─── React component ───────────────────────────────────────────────────────────

interface FileTypeIconProps {
  mimeType: string;
  fileName?: string;
  className?: string;
}

/**
 * React component render icon file theo mimeType.
 * Khi mimeType là generic (application/octet-stream), fallback sang fileName extension.
 * Dùng: <FileTypeIcon mimeType={doc.mimeType} fileName={doc.fileName} className="h-8 w-8" />
 */
export function FileTypeIcon({ mimeType, fileName, className }: FileTypeIconProps): React.ReactElement {
  const { icon: Icon, color } = getFileIconConfig(mimeType, fileName);
  return React.createElement(Icon, { className: cn('shrink-0', color, className) });
}
