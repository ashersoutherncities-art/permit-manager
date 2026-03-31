'use client';

import { useEffect, useRef, useCallback } from 'react';
import { User, decodeJwt, setCurrentUser, saveUser, getAllUsers } from '../auth';

declare global {
  var google: any;
}

interface GoogleLoginProps {
  onSuccess: (user: User) => void;
  onError?: () => void;
}

export default function GoogleLogin({ onSuccess, onError }: GoogleLoginProps) {
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const initAttempts = useRef(0);
  const maxAttempts = 5;

  const handleCredentialResponseCallback = useCallback((response: any) => {
    const decoded = decodeJwt(response.credential);
    if (decoded) {
      const newUser: User = {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name || decoded.email.split('@')[0],
        picture: decoded.picture,
        createdAt: new Date().toISOString(),
      };

      // Save user to global users list
      saveUser(newUser);
      
      // Set as current user
      setCurrentUser(newUser);
      
      onSuccess(newUser);
    } else if (onError) {
      onError();
    }
  }, [onSuccess, onError]);

  useEffect(() => {
    const initGoogleButton = () => {
      if (typeof window === 'undefined' || !window.google) {
        if (initAttempts.current < maxAttempts) {
          initAttempts.current++;
          setTimeout(initGoogleButton, 500);
        }
        return;
      }

      if (googleButtonRef.current && window.google?.accounts?.id) {
        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          {
            theme: 'outline',
            size: 'large',
            width: '100%',
          }
        );

        window.google.accounts.id.callback = handleCredentialResponseCallback;
      }
    };

    // Load Google script if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGoogleButton;
      document.head.appendChild(script);
    } else {
      initGoogleButton();
    }

    return () => {
      if (typeof window !== 'undefined' && window.google?.accounts?.id) {
        try {
          window.google.accounts.id.cancel();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [handleCredentialResponseCallback]);

  return <div ref={googleButtonRef} className="w-full" />;
}
