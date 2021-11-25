<script lang="ts">
	export let props: { class?: string; size?: string };
</script>

<span
	class={`material-icons-outlined ${'class' in props ? props.class : ''}`}
	style={props.size ? `font-size: ${props.size};` : undefined}
>
	<slot />
</span>
