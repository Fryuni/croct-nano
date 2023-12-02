<!-- @component
A counter written with Svelte
-->
<script lang="ts">
	import {counter, delta} from "../state";

	function add() {
		delta(1);
	}

	function subtract() {
		delta(-1);
	}
</script>

<div id="solid" class="card">
	<div class="text"><slot /></div>
	<div class="counter">
		<button on:click={subtract}>-</button>
		<pre>{$counter}</pre>
		<button on:click={add}>+</button>
	</div>
</div>
