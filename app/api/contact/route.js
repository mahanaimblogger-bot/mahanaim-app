// app/api/contact/route.js
import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Por favor, completa todos los campos.' },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: 'Mahanaim <onboarding@resend.dev>',
      to: ['mahanaim.blogger@gmail.com'],
      subject: `Nuevo mensaje de ${name} desde Mahanaim`,
      reply_to: email,
      html: `
        <h2>Nuevo mensaje de contacto</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${message.replace(/\n/g, '<br/>')}</p>
      `,
    });

    if (error) {
      console.error('Error de Resend:', error);
      return NextResponse.json(
        { error: 'No se pudo enviar el mensaje. Intenta más tarde.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Mensaje enviado correctamente' });
  } catch (error) {
    console.error('Error en el endpoint:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}