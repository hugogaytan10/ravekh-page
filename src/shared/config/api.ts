const DEFAULT_API_BASE_URL = "https://apipos.ravekh.com/api/";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;
export const POS_API_BASE_URL = import.meta.env.VITE_POS_API_BASE_URL ?? API_BASE_URL;
