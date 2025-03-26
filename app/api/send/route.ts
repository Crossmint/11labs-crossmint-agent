import { EmailTemplate } from '../../components/email-template';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { to, title, img_thumbnail, asin } = await request.json();
    
    const { data, error } = await resend.emails.send({
      from: 'Saratoga Store <onboarding@resend.dev>',
      to: [to],
      subject: 'Complete your purchase',
      react: EmailTemplate({ title: title, ASIN: asin, img_thumbnail: img_thumbnail }) as React.ReactNode,
    });

    if (error) {
      return Response.json({ error: error.message, success: false }, { status: 500 });
    }

    return Response.json({ 
      success: true, 
      message: `Email sent successfully to ${to}`,
      data 
    });
  } catch (error) {
    console.error('Exception sending email:', error);
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error', 
      success: false 
    }, { status: 500 });
  }
} 