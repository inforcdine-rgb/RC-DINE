import React, { memo, useEffect, useRef, useState } from 'react';
import './style.css';

function SmartImage({
    className = '',
    alt = '',
    eager = false,
    src,
    fallbackSrc,
    onLoad,
    onError,
    ...props
}) {
    const containerRef = useRef(null);
    const [visible, setVisible] = useState(eager);
    const [loaded, setLoaded] = useState(false);
    const [failed, setFailed] = useState(false);
    const [currentSrc, setCurrentSrc] = useState(src);

    useEffect(() => {
        setCurrentSrc(src);
        setLoaded(false);
        setFailed(false);
    }, [src]);

    useEffect(() => {
        if (eager) setVisible(true);
    }, [eager]);

    useEffect(() => {
        if (eager || visible) return undefined;
        if (!('IntersectionObserver' in window)) {
            setVisible(true);
            return undefined;
        }

        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;
            setVisible(true);
            observer.disconnect();
        }, { rootMargin: '320px 0px' });

        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [eager, visible]);

    return (
        <span
            ref={containerRef}
            className={`smart-image ${loaded ? 'loaded' : ''} ${failed ? 'failed' : ''} ${className}`}
            aria-label={failed ? alt : undefined}
            role={failed && alt ? 'img' : undefined}
        >
            {!loaded && <span className="smart-image-shimmer" aria-hidden="true" />}
            {visible && (
                <img
                    {...props}
                    src={currentSrc}
                    alt={alt}
                    loading={eager ? 'eager' : 'lazy'}
                    decoding="async"
                    onLoad={(event) => {
                        setLoaded(true);
                        onLoad?.(event);
                    }}
                    onError={(event) => {
                        if (fallbackSrc && currentSrc !== fallbackSrc) {
                            setCurrentSrc(fallbackSrc);
                            setLoaded(false);
                            return;
                        }
                        setFailed(true);
                        setLoaded(true);
                        onError?.(event);
                    }}
                />
            )}
        </span>
    );
}

export default memo(SmartImage);
