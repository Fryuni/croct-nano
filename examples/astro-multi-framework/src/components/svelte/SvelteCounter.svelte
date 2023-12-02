<!-- @component -->
<script lang="ts">
	import {homeBannerStore} from '../state';
</script>

<div class="card" id="solid">
	<div style="align: center">Svelte</div>
	<h1>{$homeBannerStore.content.title}</h1>
	<div className="text"><strong>{$homeBannerStore.content.subtitle}</strong></div>
	<p>
		<a href={$homeBannerStore.content.cta.link}>{$homeBannerStore.content.cta.label}</a>
	</p>
</div>
