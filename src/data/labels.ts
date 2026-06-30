import type { HeritageType, Classification, HeritageStatus } from '../core/types';

export const typeLabels: Record<HeritageType, { vi: string; en: string }> = {
  dinh: { vi: 'Đình', en: 'Communal House' },
  chua: { vi: 'Chùa', en: 'Pagoda' },
  den: { vi: 'Đền', en: 'Temple' },
  mieu: { vi: 'Miếu', en: 'Shrine' },
  phu: { vi: 'Phủ', en: 'Palace' },
  quan: { vi: 'Quán', en: 'Taoist Temple' },
  nhacu: { vi: 'Nhà cổ', en: 'Ancient House' },
  nhatho: { vi: 'Nhà thờ họ', en: 'Clan House' },
  lang: { vi: 'Lăng Mộ', en: 'Mausoleum' },
};

export const classificationLabels: Record<Classification, { vi: string; en: string }> = {
  national: { vi: 'Quốc gia', en: 'National' },
  city: { vi: 'Thành phố', en: 'City' },
  unranked: { vi: 'Chưa xếp hạng', en: 'Unranked' },
};

export const statusLabels: Record<HeritageStatus, { vi: string; en: string }> = {
  active: { vi: 'Đang hoạt động', en: 'Active' },
  maintenance: { vi: 'Đang trùng tu', en: 'Under Renovation' },
  closed: { vi: 'Tạm đóng cửa', en: 'Temporarily Closed' },
};
