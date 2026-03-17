export interface Result<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

export const ok = <T>(data: T, message = "Operation completed successfully."): Result<T> => ({
  success: true,
  data,
  message,
});

export const fail = <T>(message: string, error?: string): Result<T> => ({
  success: false,
  message,
  error,
});
