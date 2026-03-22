import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface MeetingInvitationEmailProps {
  recipientName: string;
  meetingTitle: string;
  scheduledAt: string;
  duration: number;
  location: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const MeetingInvitationEmail = ({
  recipientName,
  meetingTitle,
  scheduledAt,
  duration,
  location,
}: MeetingInvitationEmailProps) => {
  const formattedDate = new Date(scheduledAt).toLocaleString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  return (
    <Html>
      <Head />
      <Preview>Meeting Invitation: {meetingTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>Meeting Invitation</Heading>
          </Section>
          <Section style={content}>
            <Text style={paragraph}>Hi {recipientName},</Text>
            <Text style={paragraph}>
              You have been invited to a new meeting: <br /> <strong>{meetingTitle}</strong>.
            </Text>

            <Section style={detailsBox}>
              <Text style={detailRow}>
                <strong>When:</strong> {formattedDate} ({duration} minutes)
              </Text>
              <Text style={detailRow}>
                <strong>Location:</strong> {location || 'No location specified'}
              </Text>
            </Section>

            <Text style={paragraph}>
              You can log in to the HRMS portal to see all your upcoming meetings.
            </Text>
            <Section style={btnContainer}>
              <Button style={button} href={`${baseUrl}/dashboard/meetings`}>
                View Meetings
              </Button>
            </Section>

            <Text style={paragraph}>
              Best regards,
              <br />
              The HR Team
            </Text>
          </Section>
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} HRMS Inc. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default MeetingInvitationEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '8px',
  border: '1px solid #e6ebf1',
  maxWidth: '600px',
};

const header = {
  padding: '32px',
  textAlign: 'center' as const,
  backgroundColor: '#10b981', // Emerald-500
  borderRadius: '8px 8px 0 0',
};

const h1 = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
};

const content = {
  padding: '32px',
};

const paragraph = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
};

const detailsBox = {
  backgroundColor: '#f4f4f5',
  borderRadius: '4px',
  padding: '16px',
  textAlign: 'left' as const,
  margin: '24px 0',
};

const detailRow = {
  color: '#3f3f46',
  fontSize: '15px',
  margin: '8px 0',
};

const btnContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#10b981',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  padding: '0 32px',
};

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
};
