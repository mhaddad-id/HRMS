'use server';

import { resend } from '@/lib/resend';
import { WelcomeEmail } from '@/emails/welcome-email';
import { MeetingInvitationEmail } from '@/emails/meeting-invitation';
import { render } from '@react-email/render';

export async function sendWelcomeEmail({
  to,
  firstName,
  employeeCode,
}: {
  to: string;
  firstName: string;
  employeeCode: string;
}) {
  try {
    const html = await render(
      WelcomeEmail({
        firstName,
        employeeCode,
      })
    );

    const { data, error } = await resend.emails.send({
      from: 'HRMS <onboarding@resend.dev>', // Replace with your verified domain
      to: [to],
      subject: 'Welcome to the Team!',
      html,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error sending email:', err);
    return { success: false, error: err };
  }
}

export async function sendMeetingInvitationEmail({
  to,
  recipientName,
  meetingTitle,
  scheduledAt,
  duration,
  location,
}: {
  to: string;
  recipientName: string;
  meetingTitle: string;
  scheduledAt: string;
  duration: number;
  location: string;
}) {
  try {
    const html = await render(
      MeetingInvitationEmail({
        recipientName,
        meetingTitle,
        scheduledAt,
        duration,
        location,
      })
    );

    const { data, error } = await resend.emails.send({
      from: 'HRMS <onboarding@resend.dev>', // Keep your verified sender domain
      to: [to],
      subject: `Meeting Invitation: ${meetingTitle}`,
      html,
    });

    if (error) {
      console.error('Error sending meeting email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error sending meeting email:', err);
    return { success: false, error: err };
  }
}
