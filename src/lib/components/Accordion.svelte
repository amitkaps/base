<script lang="ts">
	import { Accordion } from 'bits-ui';

	let { items }: { items: { value: string; title: string; content: string }[] } = $props();
</script>

<Accordion.Root type="single" class="accordion">
	{#each items as item (item.value)}
		<Accordion.Item value={item.value} class="accordion-item">
			<Accordion.Header>
				<Accordion.Trigger class="accordion-trigger">
					{item.title}
					<span aria-hidden="true">+</span>
				</Accordion.Trigger>
			</Accordion.Header>
			<Accordion.Content class="accordion-content">
				{item.content}
			</Accordion.Content>
		</Accordion.Item>
	{/each}
</Accordion.Root>

<style>
	:global(.accordion) {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		overflow: hidden;
	}

	:global(.accordion-item + .accordion-item) {
		border-top: 1px solid var(--border);
	}

	:global(.accordion-trigger) {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.85rem 1rem;
		background: var(--surface);
		border: 0;
		font: inherit;
		text-align: left;
		cursor: pointer;
	}

	:global(.accordion-trigger:hover) {
		background: var(--surface-hover);
	}

	:global(.accordion-content) {
		padding: 0 1rem 0.85rem;
		color: var(--text-muted);
		font-size: 0.9rem;
	}
</style>
