/** @jsxImportSource solid-js */

import {useStore} from "@nanostores/solid";
import {$counter, delta} from "../state";

/** A counter written with Solid */
export default function SolidCounter({ children }) {
	const count = useStore($counter);

	const add = () => delta(1);
	const subtract = () => delta(-1);

	return (
		<div id="solid" class="card">
			<div class="text">{children}</div>
			<div class="counter">
				<button onClick={subtract}>-</button>
				<pre>{count()}</pre>
				<button onClick={add}>+</button>
			</div>
		</div>
	);
}
