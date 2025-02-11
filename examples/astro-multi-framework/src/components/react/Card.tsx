import { useStore } from '@nanostores/react';
import React from 'react';
import { homeBannerStore } from '../state';

export function ReactCard(): React.JSX.Element {
    const { content } = useStore(homeBannerStore);

    return (
        <div className="card">
            <div style={{ align: 'center' }}>React</div>
            <h1>{content.title}</h1>
            <div className="text">
                <strong>{content.subtitle}</strong>
            </div>
            <p>
                <a href={content.cta.link}>{content.cta.label}</a>
            </p>
        </div>
    );
}
