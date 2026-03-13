export const EMERGENCY_NUMBERS = {
  POLICE: '100',
  WOMEN_HELPLINE: '1091',
  CYBER_CRIME: '1930',
};

export const ARTICLE_CATEGORIES = [
  'Indian Constitution & Women',
  'Reproductive Rights',
  'Women Rights under BNSS',
  'Sexual Offences Against Women',
  'Offences Relating to Marriage',
  'Cyber Crimes Against Women',
];

export const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
export const API_URL = `${API_BASE_URL}/api`;
export const SOCKET_URL = API_BASE_URL || '';

export const USER_ROLES = {
  USER: 'user',
  ADVOCATE: 'advocate',
  ADMIN: 'admin',
} as const;

export const VERIFICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;
