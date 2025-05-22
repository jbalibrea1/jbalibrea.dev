export const prerender = false;
import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';
import escapeHtml from '@utils/escapeHtml';

const CONTACT_EMAIl = import.meta.env.CONTACT_EMAIL;
const CONTACT_PASSWORD = import.meta.env.CONTACT_PASSWORD;
const CONTACT_TO_SEND = import.meta.env.CONTACT_TO_SEND;
const RECAPTCHA_SECRET_KEY = import.meta.env.RECAPTCHA_SECRET_KEY;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { name, email, message, token } = data;

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Faltan datos obligatorios',
        }),
        { status: 400 },
      );
    }

    // regex to validate email
    const mailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!mailRegex.test(email)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Email no válido',
        }),
        { status: 400 },
      );
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message);

    // captcha verification
    const verifyCaptcha = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: RECAPTCHA_SECRET_KEY || '',
          response: token,
        }),
      },
    );

    const captchaResult = await verifyCaptcha.json();

    if (!captchaResult.success) {
      return new Response(
        JSON.stringify({ success: false, message: 'Captcha inválido' }),
        { status: 400 },
      );
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: CONTACT_EMAIl,
        pass: CONTACT_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"${safeName}" <${CONTACT_TO_SEND}>`,
      to: CONTACT_TO_SEND,
      replyTo: safeEmail,
      subject: `jbalibrea.dev contact me - nuevo mensaje de ${safeName}`,
      text: safeMessage,
      html: `
      <div style="font-family: sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #fff; padding: 24px; border-radius: 8px;">
          <h2 style="margin-top: 0;">Nuevo mensaje desde jbalibrea.dev</h2>
          <p><strong>De:</strong> ${safeName} (${safeEmail})</p>
          <p><strong>Mensaje:</strong></p>
          <blockquote style="border-left: 4px solid #ccc; margin: 10px 0; padding-left: 12px; color: #555;">
            ${safeMessage}
          </blockquote>
          <hr style="margin: 24px 0;" />
          <p style="font-size: 14px; color: #666;">
            Este mensaje fue enviado desde el formulario de contacto de 
            <a href="https://jbalibrea.dev" 
              style="color: #1a0dab; text-decoration: none;" 
              target="_blank" 
              rel="noopener noreferrer">
                jbalibrea.dev
            </a>.
          </p>
          <p style="font-size: 12px; color: #aaa;">
            Puedes responder directamente a este correo para ponerte en contacto.
          </p>
        </div>
      </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    const confirmationMail = {
      from: `"Jorge Balibrea" <${CONTACT_TO_SEND}>`,
      to: email,
      subject: `Gracias por contactar conmigo en jbalibrea.dev`,
      text: `Hola ${safeName}, gracias por tu mensaje.`,
      html: `
      <div style="font-family: sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #fff; padding: 24px; border-radius: 8px;">
          <h2>¡Hola ${safeName}!</h2>
          <p>¡Gracias por tu mensaje! Se ha recibido correctamente:</p>
          <blockquote style="border-left: 4px solid #ccc; margin: 10px 0; padding-left: 10px; color: #555;">
            ${safeMessage}
          </blockquote>
          <hr style="margin: 24px 0;" />
          <p>En caso de ser necesario, me pondré en contacto contigo lo antes posible.</p>
          <p>
            Un saludo,<br />
            <strong>Jorge Balibrea</strong> 
            <a href="https://github.com/jbalibrea1" style="display: inline-block; text-decoration: none; color: #1a0dab;" target="_blank" rel="noopener noreferrer">
              @jbalibrea1
            </a>
          </p>
          <p style="font-size: 12px; color: gray; margin-top: 20px;">
            Este mensaje ha sido enviado automáticamente desde 
            <a href="https://jbalibrea.dev" style="color: #1a0dab; text-decoration: none;">jbalibrea.dev</a>
          </p>
        </div>
      </div>
    `,
    };

    await transporter.sendMail(confirmationMail);

    return new Response(
      JSON.stringify({
        success: true,
        message:
          'Mensaje enviado correctamente. ¡Gracias por tu mensaje! En caso de ser necesario me pondré en contacto contigo lo antes posible.',
      }),
      { status: 200 },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Ha ocurrido un error al enviar el mensaje.',
        error: error.message,
      }),
      { status: 500 },
    );
  }
};
