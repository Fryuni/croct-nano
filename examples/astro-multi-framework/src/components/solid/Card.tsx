/** @jsxImportSource solid-js */

import {useStore} from '@nanostores/solid';
import {homeBannerStore} from '../state';

export function SolidCard(): JSX.Element {
    const {content} = useStore(homeBannerStore)();

    return (
        <div className="card">
            <div style="align: center">Solid-JS</div>
            <h1>{content.title}</h1>
            <div className="text"><strong>{content.subtitle}</strong></div>
            <p>
                <a href={content.cta.link}>{content.cta.label}</a>
            </p>
        </div>
    );
}
