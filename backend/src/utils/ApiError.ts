export class ApiError extends Error {
  constructor(public statusCode: number, public code: string, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export const Errors = {
  invalidCredentials: () => new ApiError(401, "INVALID_CREDENTIALS", "Email or password is incorrect"),
  emailInUse: () => new ApiError(409, "EMAIL_IN_USE", "An account with this email already exists"),
  unauthorized: () => new ApiError(401, "UNAUTHORIZED", "Authentication is required"),
  forbidden: () => new ApiError(403, "FORBIDDEN", "You do not have permission to perform this action"),
  notFound: (what: string) => new ApiError(404, "NOT_FOUND", `${what} was not found`),
  accountLocked: () => new ApiError(423, "ACCOUNT_LOCKED", "Too many failed attempts. Try again later"),
  emailNotVerified: () => new ApiError(403, "EMAIL_NOT_VERIFIED", "Please verify your email before continuing"),
};
