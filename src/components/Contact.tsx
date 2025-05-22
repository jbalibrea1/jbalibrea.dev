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
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    setLoading(true);
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      message: formData.get('message') as string,
      token: recaptchaRef.current?.getValue(),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      if (!data.token) {
        throw new Error('NoCaptcha');
      }

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
    } catch (err) {
      if (err.name === 'AbortError') {
        setResponseMessage({
          text: 'Tiempo de espera agotado. Intenta de nuevo.',
          isError: true,
        });
      } else if (err.message === 'NoCaptcha') {
        setResponseMessage({
          text: 'Por favor, completa el reCAPTCHA.',
          isError: true,
        });
      } else {
        setResponseMessage({
          text: 'Error al enviar el mensaje',
          isError: true,
        });
      }
    } finally {
      setLoading(false);
      if (!responseMessage.isError) {
        setTimeout(() => {
          setResponseMessage({ text: '', isError: false });
        }, 10000);
      }
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <label htmlFor="name" className="text-lg">
        Nombre:
      </label>
      <input type="text" name="name" id="name" required />
      <label htmlFor="email" className="text-lg">
        Email:
      </label>
      <input type="email" name="email" id="email" required />
      <label htmlFor="message" className="text-lg">
        Mensaje:
      </label>
      <textarea
        name="message"
        id="message"
        autoComplete="off"
        required
        className="min-h-[150px] max-h-[250px] h-min p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <ReCAPTCHA sitekey={siteKey} ref={recaptchaRef} />
      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-60"
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
              fill-rule="evenodd"
              clip-rule="evenodd"
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
