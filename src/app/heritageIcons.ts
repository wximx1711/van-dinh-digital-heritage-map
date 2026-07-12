import type { HeritageType } from '../core/types';

import ChuaSvg from '../assets/icons/heritage/Chùa.svg';
import DinhSvg from '../assets/icons/heritage/Đình.svg';
import PhuSvg from '../assets/icons/heritage/Phủ.svg';
import MieuSvg from '../assets/icons/heritage/Miếu.svg';
import NhaCoSvg from '../assets/icons/heritage/Nhà cổ.svg';
import NhaThoHoSvg from '../assets/icons/heritage/Nhà thờ họ.svg';
import QuanSvg from '../assets/icons/heritage/Quán.svg';

import ChuaSvgRaw from '../assets/icons/heritage/Chùa.svg?raw';
import DinhSvgRaw from '../assets/icons/heritage/Đình.svg?raw';
import PhuSvgRaw from '../assets/icons/heritage/Phủ.svg?raw';
import MieuSvgRaw from '../assets/icons/heritage/Miếu.svg?raw';
import NhaCoSvgRaw from '../assets/icons/heritage/Nhà cổ.svg?raw';
import NhaThoHoSvgRaw from '../assets/icons/heritage/Nhà thờ họ.svg?raw';
import QuanSvgRaw from '../assets/icons/heritage/Quán.svg?raw';

const FALLBACK_SVG = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#ccc"/><text x="12" y="16" text-anchor="middle" font-size="14" fill="white">?</text></svg>'
);

const emojiFallbacks: Partial<Record<HeritageType, string>> = {
  den: '⛩️',
  lang: '🪦',
};

function emojiToDataUri(emoji: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><text x="12" y="18" text-anchor="middle" font-family="'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif" font-size="18">${emoji}</text></svg>`
  )}`;
}

function hasSvgIcon(type: HeritageType): boolean {
  return type in heritageIconUrls;
}

const heritageIconUrls: Record<string, string> = {
  chua: ChuaSvg,
  dinh: DinhSvg,
  phu: PhuSvg,
  mieu: MieuSvg,
  nhacu: NhaCoSvg,
  nhatho: NhaThoHoSvg,
  quan: QuanSvg,
};

const heritageIconRawSvgs: Record<string, string> = {
  chua: ChuaSvgRaw,
  dinh: DinhSvgRaw,
  phu: PhuSvgRaw,
  mieu: MieuSvgRaw,
  nhacu: NhaCoSvgRaw,
  nhatho: NhaThoHoSvgRaw,
  quan: QuanSvgRaw,
};

const focusViewBoxes: Record<string, string> = {
  chua: 'viewBox="490 234 931 546"',
  dinh: 'viewBox="520 247 883 515"',
  phu: 'viewBox="729 234 462 550"',
  mieu: 'viewBox="549 240 823 542"',
  nhacu: 'viewBox="613 268 639 544"',
  nhatho: 'viewBox="566 284 728 528"',
  quan: 'viewBox="624 340 823 513"',
};

function getIconUrl(type: HeritageType): string {
  if (type in heritageIconUrls) return heritageIconUrls[type];
  if (type in emojiFallbacks) return emojiToDataUri(emojiFallbacks[type]!);
  return FALLBACK_SVG;
}

function getIconDataUri(type: HeritageType): string {
  if (type in heritageIconRawSvgs) {
    const raw = heritageIconRawSvgs[type];
    const vb = focusViewBoxes[type];
    if (vb && raw.includes('viewBox="0 0 1920 1080"')) {
      const focused = raw.replace('viewBox="0 0 1920 1080"', vb);
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(focused)}`;
    }
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(raw)}`;
  }
  if (type in emojiFallbacks) return emojiToDataUri(emojiFallbacks[type]!);
  return FALLBACK_SVG;
}

export { hasSvgIcon, emojiFallbacks, getIconUrl, getIconDataUri };
