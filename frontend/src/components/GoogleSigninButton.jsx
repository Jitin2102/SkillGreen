import { useEffect, useRef, useState } from "react";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ;

let scriptLoadPromise = null;

function loadGoogleScript() {
    if (scriptLoadPromise) return scriptLoadPromise;
    scriptLoadPromise = new Promise((resolve, reject) => {
        if (window.google?.accounts?.id) {
            resolve();
            return;
        }
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Google Sign-In script."));
        document.head.appendChild(script);
    });
    return scriptLoadPromise;
}

export default function GoogleSignInButton({ onCredential, onError, text = "continue_with" }) {
    const buttonRef = useRef(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!GOOGLE_CLIENT_ID) {
            setError("Google sign-in is not configured (missing VITE_GOOGLE_CLIENT_ID).");
            return;
        }

        let cancelled = false;

        loadGoogleScript()
            .then(() => {
                if (cancelled || !buttonRef.current) return;

                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: (response) => {
                        if (response?.credential) {
                            onCredential(response.credential);
                        } else {
                            onError?.("No credential returned from Google.");
                        }
                    },
                });

                window.google.accounts.id.renderButton(buttonRef.current, {
                    theme: "outline",
                    size: "large",
                    width: 320,
                    text,
                });
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(err.message);
                    onError?.(err.message);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [onCredential, onError, text]);

    if (error) {
        return <p className="text-xs text-ink/50 text-center">{error}</p>;
    }

    return <div ref={buttonRef} className="flex justify-center" />;
}
