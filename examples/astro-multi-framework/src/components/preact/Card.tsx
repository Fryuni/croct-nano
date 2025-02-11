/** @jsxImportSource preact */

import { useStore } from '@nanostores/preact';
import { homeBannerStore } from '../state';

export function PreactCard(): Element {
    const { content } = useStore(homeBannerStore);

    return (
        <div class="card">
            <div style="align: center">Preact</div>
            <h1>{content.title}</h1>
            <div class="text">
                <strong>{content.subtitle}</strong>
            </div>
            <p>
                <a href={content.cta.link}>{content.cta.label}</a>
            </p>
        </div>
    );
}
