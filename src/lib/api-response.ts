export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "CONFLICT"
  | "INTERNAL_SERVER_ERROR";

export function apiError(
  status: number,
  code: ApiErrorCode,
  message: string,
  details?: unknown,
) {
  return Response.json(
    { error: { code, message, ...(details === undefined ? {} : { details }) } },
    { status },
  );
}

export function unauthorized() {
  return apiError(401, "UNAUTHORIZED", "Authentication is required.");
}

export function forbidden() {
  return apiError(403, "FORBIDDEN", "You do not have permission to perform this action.");
}
