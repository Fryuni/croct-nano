import {useStore} from "@nanostores/react";
import {$counter, delta} from "../state";

/** A counter written with Preact */
export function Counter({children}) {
    const count = useStore($counter);

    const add = () => delta(1);
    const subtract = () => delta(-1);

    return (
        <div className="card">
            <div className="text">{children}</div>
            <div className="counter">
                <button onClick={subtract}>-</button>
                <pre>{count}</pre>
                <button onClick={add}>+</button>
            </div>
        </div>
    );
}
