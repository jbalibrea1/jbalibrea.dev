import { useEffect, useRef, useState } from 'react';
import type { SubmitEvent } from 'react';

const TURNSTILE_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: { sitekey: string; callback: (token: string) => void },
  ) => string;
  reset: (widgetId?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

type ContactProps = {
  contactEndpoint: string;
  turnstileSiteKey: string;
};

export default function Contact({
  contactEndpoint,
  turnstileSiteKey,
}: ContactProps) {
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);
  const [token, setToken] = useState('');
  const [responseMessage, setResponseMessage] = useState({
    text: '',
    isError: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const renderWidget = () => {
      if (!window.turnstile || !turnstileRef.current || widgetId.current) return;
      widgetId.current = window.turnstile.render(turnstileRef.current, {
        sitekey: turnstileSiteKey,
        callback: setToken,
      });
    };

    if (window.turnstile) {
      renderWidget();
      return;
    }

    let script = document.querySelector<HTMLScriptElement>(
      `script[src="${TURNSTILE_SRC}"]`,
    );
    if (!script) {
      script = document.createElement('script');
      script.src = TURNSTILE_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener('load', renderWidget);
    return () => script?.removeEventListener('load', renderWidget);
  }, [turnstileSiteKey]);

  const handleSubmissionError = (error: unknown) => {
    if (error instanceof Error && error.name === 'AbortError') {
      setResponseMessage({
        text: 'Tiempo de espera agotado. Intenta de nuevo.',
        isError: true,
      });
    } else {
      setResponseMessage({
        text:
          error instanceof Error && error.message
            ? error.message
            : 'Error al enviar el mensaje',
        isError: true,
      });
    }
  };

  const submit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('name') as string;

    if (!token) {
      setResponseMessage({
        text: 'Completa la verificación antes de enviar.',
        isError: true,
      });
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(contactEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: formData.get('email'),
          message: formData.get('message'),
          botcheck: formData.get('botcheck') ? true : '',
          token,
        }),
        signal: controller.signal,
      });

      const res = await response.json();

      if (!response.ok || !res.success) {
        throw new Error(res.message || 'Error en el envío');
      }

      setResponseMessage({
        text: 'Mensaje enviado correctamente. ¡Gracias por tu mensaje! En caso de ser necesario me pondré en contacto contigo lo antes posible.',
        isError: false,
      });
      form.reset();

      setTimeout(() => {
        setResponseMessage({ text: '', isError: false });
      }, 10000);
    } catch (err) {
      handleSubmissionError(err);
    } finally {
      clearTimeout(timeoutId);
      window.turnstile?.reset(widgetId.current);
      setToken('');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" id="contact-form">
      <input
        placeholder="Tu nombre"
        type="text"
        name="name"
        autoComplete="off"
        required
      />
      <input
        placeholder="Tu email"
        type="email"
        name="email"
        autoComplete="email"
        required
      />
      <textarea
        placeholder="Redacta tu mensaje aquí"
        name="message"
        required
        className="min-h-[150px] max-h-[250px] h-min "
      />
      <input
        type="checkbox"
        name="botcheck"
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <div ref={turnstileRef} />
      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 px-4"
      >
        {loading && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="-1 0 24 24"
            className="w-6 h-6 text-blue-500 animate-[spin_2s_ease-in-out_infinite]"
          >
            <path
              fill="#758CA3"
              fillRule="evenodd"
              clipRule="evenodd"
              d="M9.5 2c0-2 3-2 3 0v5c0 2-3 2-3 0V2zm0 15c0-2 3-2 3 0v5c0 2-3 2-3 0v-5zm9.41-11.299c1.732-1 3.232 1.598 1.5 2.598l-4.33 2.5c-1.732 1-3.232-1.598-1.5-2.598l4.33-2.5zm-12.99 7.5c1.732-1 3.232 1.598 1.5 2.598l-4.33 2.5c-1.732 1-3.232-1.598-1.5-2.598l4.33-2.5zM1.59 8.299c-1.732-1-.232-3.598 1.5-2.598l4.33 2.5c1.732 1 .232 3.598-1.5 2.598l-4.33-2.5zm12.99 7.5c-1.732-1-.232-3.598 1.5-2.598l4.33 2.5c1.732 1 .232 3.598-1.5 2.598l-4.33-2.5z"
            />
          </svg>
        )}
        {loading ? 'Enviando...' : 'Enviar'}
      </button>
      {responseMessage.text && (
        <p
          className={`mt-4 rounded-lg px-4 py-3 text-sm border ${
            responseMessage.isError
              ? 'bg-red-100 text-red-800 border-red-300'
              : 'bg-green-100 text-green-800 border-green-300'
          }`}
        >
          {responseMessage.text}
        </p>
      )}
    </form>
  );
}
