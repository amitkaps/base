// Remove build artifacts. `svelte-check` walks the whole workspace and does not
// honour tsconfig `exclude` or `.gitignore`, so stale `vp build` output under
// `.svelte-kit/` would otherwise be type-checked. Runs before `check:svelte`.
import { rmSync } from 'node:fs';

for (const dir of ['.svelte-kit/output', '.svelte-kit/cloudflare', 'build']) {
	rmSync(dir, { recursive: true, force: true });
}
