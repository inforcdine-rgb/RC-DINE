import React, { useEffect, useRef, useState } from 'react';

const GOOGLE_IDENTITY_SCRIPT_ID = 'google-identity-services';
const GOOGLE_IDENTITY_SCRIPT_URL = 'https://accounts.google.com/gsi/client';

let googleIdentityScriptPromise;

const loadGoogleIdentityServices = () => {
    if (window.google?.accounts?.id) {
        return Promise.resolve(window.google);
    }

    if (!googleIdentityScriptPromise) {
        googleIdentityScriptPromise = new Promise((resolve, reject) => {
            const existingScript = document.getElementById(GOOGLE_IDENTITY_SCRIPT_ID);
            const script = existingScript || document.createElement('script');

            script.addEventListener('load', () => resolve(window.google), { once: true });
            script.addEventListener('error', () => reject(new Error('Unable to load Google sign-in.')), {
                once: true
            });

            if (!existingScript) {
                script.id = GOOGLE_IDENTITY_SCRIPT_ID;
                script.src = GOOGLE_IDENTITY_SCRIPT_URL;
                script.async = true;
                script.defer = true;
                document.head.appendChild(script);
            }
        });
    }

    return googleIdentityScriptPromise;
};

function OwnerGoogleSignIn({ clientId, onCredential, visible }) {
    const buttonRef = useRef(null);
    const initializedRef = useRef(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!visible || initializedRef.current) {
            return undefined;
        }

        if (!clientId) {
            setError('Google sign-in setup is pending. Please use your RC-DINE password.');
            return undefined;
        }

        let isActive = true;
        loadGoogleIdentityServices()
            .then((google) => {
                if (!isActive || !buttonRef.current || !google?.accounts?.id) {
                    return;
                }

                // Google Identity Services uses snake_case configuration keys.
                /* eslint-disable camelcase */
                google.accounts.id.initialize({
                    client_id: clientId,
                    callback: (response) => {
                        if (response?.credential) {
                            onCredential(response.credential);
                        }
                    },
                    auto_select: false
                });

                const availableWidth = buttonRef.current.parentElement?.clientWidth || 340;
                buttonRef.current.replaceChildren();
                google.accounts.id.renderButton(buttonRef.current, {
                    type: 'standard',
                    theme: 'outline',
                    size: 'large',
                    text: 'continue_with',
                    shape: 'rectangular',
                    logo_alignment: 'left',
                    width: Math.min(Math.max(availableWidth, 240), 400)
                });
                /* eslint-enable camelcase */
                initializedRef.current = true;
                setError('');
            })
            .catch(() => {
                if (isActive) {
                    setError('Google sign-in could not load. Please use your RC-DINE password.');
                }
            });

        return () => {
            isActive = false;
        };
    }, [clientId, onCredential, visible]);

    return (
        <div className="rc-owner-google" hidden={!visible}>
            <div className="rc-auth-divider" aria-hidden="true">
                <span>OR</span>
            </div>
            <div ref={buttonRef} className="rc-google-button" aria-label="Continue with Google as owner" />
            <p className="rc-google-help">For registered owner accounts only</p>
            {error && (
                <p className="rc-google-error" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}

export default OwnerGoogleSignIn;
