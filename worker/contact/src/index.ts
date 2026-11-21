export interface Env {
  RESEND_API_KEY: string;
  TURNSTILE_SECRET: string;
  CONTACT_TO: string;
  MAIL_FROM: string;
  REPLY_TO: string;
  ALLOWED_ORIGINS: string;
  // Binding de rate limiting (ver wrangler.toml). Opcional para poder correr en local.
  RATE_LIMITER?: RateLimit;
}

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  token?: unknown;
  botcheck?: unknown;
};

const MAX_NAME = 100;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 5000;
const MAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Evita inyección de cabeceras / romper el display name del From
function sanitizeHeader(text: string): string {
  return text.replace(/[\r\n"<>]/g, ' ').trim();
}

function corsHeaders(origin: string | null, env: Env): Record<string, string> {
  const allowed = (env.ALLOWED_ORIGINS ?? '').split(',').map((o) => o.trim());
  if (!origin || !allowed.includes(origin)) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(
  body: { success: boolean; message: string },
  status: number,
  headers: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  ms = 10000,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

// Hostnames permitidos, derivados de ALLOWED_ORIGINS
function allowedHostnames(env: Env): string[] {
  return (env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((o) => {
      try {
        return new URL(o.trim()).hostname;
      } catch {
        return '';
      }
    })
    .filter(Boolean);
}

async function verifyTurnstile(
  token: string,
  ip: string | null,
  origin: string,
  env: Env,
): Promise<boolean> {
  const body = new URLSearchParams({
    secret: env.TURNSTILE_SECRET,
    response: token,
  });
  if (ip) body.set('remoteip', ip);

  const res = await fetchWithTimeout(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    { method: 'POST', body },
  );
  const result = (await res.json()) as { success?: boolean; hostname?: string };
  if (result.success !== true) return false;

  // Un token emitido para otro sitio no vale. En local las claves de prueba de
  // Turnstile devuelven siempre `example.com`, así que ahí no se comprueba.
  const originHost = new URL(origin).hostname;
  if (originHost === 'localhost') return true;
  return (
    typeof result.hostname === 'string' &&
    allowedHostnames(env).includes(result.hostname)
  );
}

async function sendMail(
  env: Env,
  mail: {
    from: string;
    to: string;
    reply_to?: string;
    subject: string;
    text: string;
    html: string;
  },
): Promise<void> {
  const res = await fetchWithTimeout('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(mail),
  });
  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${await res.text()}`);
  }
}

function notificationHtml(name: string, email: string, message: string) {
  return `
  <div style="font-family: sans-serif; background-color: #f4f4f4; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: #fff; padding: 24px; border-radius: 8px;">
      <h2 style="margin-top: 0;">Nuevo mensaje desde jbalibrea.dev</h2>
      <p><strong>De:</strong> ${name} (${email})</p>
      <p><strong>Mensaje:</strong></p>
      <blockquote style="border-left: 4px solid #ccc; margin: 10px 0; padding-left: 12px; color: #555; white-space: pre-wrap;">${message}</blockquote>
      <hr style="margin: 24px 0;" />
      <p style="font-size: 14px; color: #666;">
        Este mensaje fue enviado desde el formulario de contacto de
        <a href="https://jbalibrea.dev" style="color: #1a0dab; text-decoration: none;" target="_blank" rel="noopener noreferrer">jbalibrea.dev</a>
      </p>
      <p style="font-size: 12px; color: #aaa;">
        Puedes responder directamente a este correo para ponerte en contacto.
      </p>
    </div>
  </div>`;
}

// El autoreply NO incluye el texto del visitante: si no, el Worker serviría para
// enviar contenido arbitrario a cualquier dirección desde nuestro dominio.
function confirmationHtml(name: string) {
  return `
  <div style="font-family: sans-serif; background-color: #f4f4f4; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: #fff; padding: 24px; border-radius: 8px;">
      <h2>¡Hola ${name}!</h2>
      <p>¡Gracias por tu mensaje! Lo he recibido correctamente.</p>
      <p>En caso de ser necesario, me pondré en contacto contigo lo antes posible.</p>
      <p>
        Un saludo,<br />
        <strong>Jorge Balibrea</strong>
        <a href="https://github.com/jbalibrea1" style="display: inline-block; text-decoration: none; color: #1a0dab;" target="_blank" rel="noopener noreferrer">@jbalibrea1</a>
      </p>
      <p style="font-size: 12px; color: gray; margin-top: 20px;">
        Este mensaje ha sido enviado automáticamente desde
        <a href="https://jbalibrea.dev" style="color: #1a0dab; text-decoration: none;">jbalibrea.dev</a>
        porque alguien (esperamos que tú) usó el formulario de contacto con esta dirección.
      </p>
    </div>
  </div>`;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin');
    const cors = corsHeaders(origin, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: cors['Access-Control-Allow-Origin'] ? 204 : 403,
        headers: cors,
      });
    }

    if (request.method !== 'POST') {
      return json(
        { success: false, message: 'Método no permitido' },
        405,
        cors,
      );
    }

    // Solo aceptamos peticiones desde los orígenes permitidos
    if (!cors['Access-Control-Allow-Origin']) {
      return json({ success: false, message: 'Origen no permitido' }, 403, {});
    }

    // Rate limiting por IP (best effort, por ubicación de Cloudflare)
    if (env.RATE_LIMITER) {
      const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
      const { success } = await env.RATE_LIMITER.limit({ key: ip });
      if (!success) {
        return json(
          {
            success: false,
            message: 'Demasiados intentos. Prueba de nuevo en un minuto.',
          },
          429,
          cors,
        );
      }
    }

    let data: ContactPayload;
    try {
      data = (await request.json()) as ContactPayload;
    } catch {
      return json({ success: false, message: 'Petición no válida' }, 400, cors);
    }

    // Honeypot: fingimos éxito sin enviar nada
    if (data.botcheck) {
      return json(
        { success: true, message: 'Mensaje enviado correctamente.' },
        200,
        cors,
      );
    }

    const { name, email, message, token } = data;
    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof message !== 'string' ||
      !name.trim() ||
      !email.trim() ||
      !message.trim()
    ) {
      return json(
        { success: false, message: 'Faltan datos obligatorios' },
        400,
        cors,
      );
    }

    if (
      name.length > MAX_NAME ||
      email.length > MAX_EMAIL ||
      message.length > MAX_MESSAGE
    ) {
      return json(
        { success: false, message: 'Datos demasiado largos' },
        400,
        cors,
      );
    }

    if (!MAIL_REGEX.test(email)) {
      return json({ success: false, message: 'Email no válido' }, 400, cors);
    }

    if (typeof token !== 'string' || !token) {
      return json({ success: false, message: 'Captcha requerido' }, 403, cors);
    }

    try {
      const human = await verifyTurnstile(
        token,
        request.headers.get('CF-Connecting-IP'),
        origin as string,
        env,
      );
      if (!human) {
        return json({ success: false, message: 'Captcha inválido' }, 403, cors);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return json(
          {
            success: false,
            message: 'Timeout al verificar el captcha. Intenta de nuevo.',
          },
          408,
          cors,
        );
      }
      console.error('Turnstile error', error);
      return json(
        { success: false, message: 'Error al verificar el captcha.' },
        500,
        cors,
      );
    }

    const safeName = escapeHtml(name.trim());
    const safeEmail = escapeHtml(email.trim());
    const safeMessage = escapeHtml(message.trim());
    const headerName = sanitizeHeader(name);

    try {
      await sendMail(env, {
        from: `${headerName} via jbalibrea.dev <${env.MAIL_FROM}>`,
        to: env.CONTACT_TO,
        reply_to: email.trim(),
        subject: `jbalibrea.dev contact me - nuevo mensaje de ${headerName}`,
        text: `De: ${name} (${email})\n\n${message}`,
        html: notificationHtml(safeName, safeEmail, safeMessage),
      });
    } catch (error) {
      console.error('Notification mail failed', error);
      return json(
        {
          success: false,
          message: 'Ha ocurrido un error al enviar el mensaje.',
        },
        500,
        cors,
      );
    }

    // El autoreply es secundario: si falla, el aviso ya ha llegado
    try {
      await sendMail(env, {
        from: `Jorge Balibrea <${env.MAIL_FROM}>`,
        to: email.trim(),
        reply_to: env.REPLY_TO,
        subject: 'Gracias por contactar conmigo en jbalibrea.dev',
        text: `Hola ${headerName}, gracias por tu mensaje. Lo he recibido correctamente.`,
        html: confirmationHtml(safeName),
      });
    } catch (error) {
      console.error('Autoreply mail failed', error);
    }

    return json(
      {
        success: true,
        message:
          'Mensaje enviado correctamente. ¡Gracias por tu mensaje! En caso de ser necesario me pondré en contacto contigo lo antes posible.',
      },
      200,
      cors,
    );
  },
};
