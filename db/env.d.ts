declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    FILES: R2Bucket;
    ADMIN_CODE?: string;
    ADMIN_SESSION_SECRET?: string;
  }
}
