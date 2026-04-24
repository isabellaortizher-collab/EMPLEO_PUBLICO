const nodemailer = require('nodemailer');

exports.enviarCorreoRecuperacion = async ({ correo, nuevaContrasena }) => {
  const transporte = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#0d2b4e;padding:24px;text-align:center">
        <h1 style="color:white;margin:0;font-size:22px">SIGEP II</h1>
        <p style="color:#8ab4d8;margin:4px 0 0;font-size:13px">Función Pública</p>
      </div>
      <div style="padding:28px;background:white">
        <p>Su nueva contraseña temporal es:</p>
        <div style="background:#f0f4f8;border-left:4px solid #1a4a7a;padding:14px 20px;margin:20px 0;border-radius:4px">
          <code style="font-size:18px;font-weight:bold;color:#1a4a7a;letter-spacing:2px">${nuevaContrasena}</code>
        </div>
        <div style="background:#fff3e0;border:1px solid #ffc107;padding:12px;border-radius:4px;font-size:13px;color:#856404">
          ⚠️ Cambie esta contraseña inmediatamente al ingresar al sistema.
        </div>
      </div>
      <div style="background:#f8f9fa;padding:16px;text-align:center;font-size:12px;color:#6c757d">
        Departamento Administrativo de la Función Pública de Colombia
      </div>
    </div>`;

  await transporte.sendMail({
    from: process.env.SMTP_FROM,
    to: correo,
    subject: 'SIGEP II – Recuperación de contraseña',
    html
  });
};