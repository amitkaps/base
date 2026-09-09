<script lang="ts">
	import { Dialog } from 'bits-ui';
	import type { Snippet } from 'svelte';

	let {
		title,
		description,
		trigger,
		children
	}: {
		title: string;
		description?: string;
		trigger: Snippet;
		children: Snippet;
	} = $props();

	let open = $state(false);
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger class="btn">
		{@render trigger()}
	</Dialog.Trigger>
	<Dialog.Portal>
		<Dialog.Overlay class="dialog-overlay" />
		<Dialog.Content class="dialog-content">
			<Dialog.Title class="dialog-title">{title}</Dialog.Title>
			{#if description}
				<Dialog.Description class="dialog-description">{description}</Dialog.Description>
			{/if}
			<div class="dialog-body">
				{@render children()}
			</div>
			<Dialog.Close class="btn">Close</Dialog.Close>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>

<style>
	/* Plain CSS. Bits UI ships no styles — everything visual is ours. */
	:global(.dialog-overlay) {
		position: fixed;
		inset: 0;
		background: rgb(0 0 0 / 0.4);
		backdrop-filter: blur(2px);
	}

	:global(.dialog-content) {
		position: fixed;
		left: 50%;
		top: 50%;
		translate: -50% -50%;
		width: min(90vw, 28rem);
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1.5rem;
		border-radius: var(--radius);
		background: var(--surface);
		border: 1px solid var(--border);
		box-shadow: var(--shadow);
	}

	:global(.dialog-title) {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 600;
	}

	:global(.dialog-description) {
		margin: 0;
		color: var(--text-muted);
		font-size: 0.9rem;
	}
</style>
