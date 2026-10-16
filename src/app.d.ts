/** @prose
 * # App types
 *
 * What the app's platform gives each request on Cloudflare, typed for SvelteKit
 * ([its types](https://svelte.dev/docs/kit/types#app.d.ts)).
 */
declare global {
  namespace App {
    interface Platform {
      env: Env;
      ctx: ExecutionContext;
      caches: CacheStorage;
      cf?: IncomingRequestCfProperties;
    }

    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
  }
}

export {};
