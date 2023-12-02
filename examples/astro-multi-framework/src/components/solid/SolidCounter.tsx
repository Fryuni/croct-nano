/** @jsxImportSource solid-js */

import {useStore} from '@nanostores/solid';
import {homeBannerStore} from '../state';

/** A counter written with Solid */
export default function SolidCounter(): JSX.Element {
    const {content} = useStore(homeBannerStore)();

    return (
        <div class="card">
            <div style="align: center">Solid-JS</div>
            <h1>{content.title}</h1>
            <div class="text"><strong>{content.subtitle}</strong></div>
            <p>
                <a href={content.cta.link}>{content.cta.label}</a>
            </p>
        </div>
    );
}
