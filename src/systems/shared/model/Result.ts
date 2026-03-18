export type Result<TData, TError = string> =
  | { ok: true; data: TData }
  | { ok: false; error: TError };

export const success = <TData>(data: TData): Result<TData> => ({
  ok: true,
  data,
});

export const failure = <TError>(error: TError): Result<never, TError> => ({
  ok: false,
  error,
});
