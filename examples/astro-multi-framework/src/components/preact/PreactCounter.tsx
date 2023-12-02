/** @jsxImportSource preact */

import {useStore} from '@nanostores/preact';
import {homeBannerStore} from '../state';

/** A counter written with Preact */
export function PreactCounter(): Element {
    const {content} = useStore(homeBannerStore);

    return (
        <div className="card">
            <div style="align: center">Preact</div>
            <h1>{content.title}</h1>
            <div className="text"><strong>{content.subtitle}</strong></div>
            <p>
                <a href={content.cta.link}>{content.cta.label}</a>
            </p>
        </div>
    );
}
