import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

type ContactProps = {
  siteKey: string;
};

export default function Contact({ siteKey }: ContactProps) {
  const [responseMessage, setResponseMessage] = useState({
    text: '',
    isError: false,
  });
  const [loading, setLoading] = useState(false);
  const [formEvent, setFormEvent] = useState<HTMLFormElement | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const onReCAPTCHAChange = async (token: string | null) => {
    try {
      if (!token || !formEvent) throw new Error('NoCaptcha');

      const form = formEvent;
      const formData = new FormData(form);

      const data = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        message: formData.get('message') as string,
        token,
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const res = await response.json();

      if (!response.ok) throw new Error(res.message || 'Error en el envío');

      setResponseMessage({ text: res.message, isError: false });
      form.reset();
      recaptchaRef.current?.reset();

      setTimeout(() => {
        setResponseMessage({ text: '', isError: false });
      }, 10000);
    } catch (err) {
      handleSubmissionError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmissionError = (error: unknown) => {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        setResponseMessage({
          text: 'Tiempo de espera agotado. Intenta de nuevo.',
          isError: true,
        });
      } else if (error.message === 'NoCaptcha') {
        setResponseMessage({
          text: 'Por favor, completa el reCAPTCHA.',
          isError: true,
        });
      } else {
        setResponseMessage({
          text: error.message || 'Error al enviar el mensaje',
          isError: true,
        });
      }
    }
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target as HTMLFormElement;
    setFormEvent(form);

    recaptchaRef.current?.execute();
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
      <ReCAPTCHA
        sitekey={siteKey}
        ref={recaptchaRef}
        size="invisible"
        onChange={onReCAPTCHAChange}
      />
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
