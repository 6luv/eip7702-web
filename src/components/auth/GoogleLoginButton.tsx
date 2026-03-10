import { useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";

type GoogleJwtPayload = {
  email?: string;
  name?: string;
  picture?: string;
  sub?: string;
};

type Props = {
  onLogin: (user: {
    email?: string;
    name?: string;
    picture?: string;
    sub?: string;
    credential: string;
  }) => void;
};

export default function GoogleLoginButton({ onLogin }: Props) {
  const buttonRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      console.error("VITE_GOOGLE_CLIENT_ID가 없습니다.");
      return;
    }

    if (!window.google || !buttonRef.current) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: { credential: string }) => {
        const payload = jwtDecode<GoogleJwtPayload>(response.credential);

        onLogin({
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
          sub: payload.sub,
          credential: response.credential,
        });
      },
    });

    buttonRef.current.innerHTML = "";

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "rectangular",
      width: "100%",
    });
  }, [onLogin]);

  return <div ref={buttonRef} />;
}
