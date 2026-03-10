export type VisitQrToken = {
  token: string;
  qrUrl: string;
  expiresAt: number;
};

export type VisitQrTokenResponse = {
  tokens: VisitQrToken[];
};

export type DynamicVisitQrToken = {
  token: string;
  qrUrl: string;
  expiresAt: number;
  refreshAfterSeconds: number;
};
