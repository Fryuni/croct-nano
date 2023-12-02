/** @jsxImportSource preact */

import {useStore} from "@nanostores/preact";
import {$counter, delta, reset} from "../state";

/** A counter written with Preact */
export function PreactCounter({children}) {
    const count = useStore($counter);

    const diff = Math.floor(Math.pow(10, Math.log10(Math.abs(count)) + 0.223));

    const add = () => delta(diff);
    const subtract = () => delta(-diff);

    return (
        <div className="card">
            <div className="text">{children}</div>
            <button onClick={reset}>reset</button>
            <div className="counter">
                <button onClick={subtract}>-{diff}</button>
                <pre>{count}</pre>
                <button onClick={add}>+{diff}</button>
            </div>
        </div>
    );
}
