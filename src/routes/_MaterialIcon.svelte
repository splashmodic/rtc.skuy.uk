<script lang="ts">
	export let props: {
		type: string;
		class?: string;
		size?: string;
	};
</script>

<span
	class={`block material-icons${
		props.type === 'filled' ? '' : props.type === 'outlined' ? '-outlined' : ''
	} ${'class' in props ? props.class : ''}`}
	style={props.size ? `font-size: ${props.size};` : undefined}
>
	<slot />
</span>
