import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface WelcomeEmailProps {
  firstName: string;
  employeeCode: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const WelcomeEmail = ({
  firstName,
  employeeCode,
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to the Team, {firstName}!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={h1}>HRMS Portal</Heading>
        </Section>
        <Section style={content}>
          <Text style={paragraph}>Hi {firstName},</Text>
          <Text style={paragraph}>
            Welcome to the company! We are thrilled to have you join our team.
            Your employee account has been successfully created.
          </Text>
          <Section style={codeBox}>
            <Text style={codeTitle}>Your Employee Code</Text>
            <Text style={codeValue}>{employeeCode}</Text>
          </Section>
          <Text style={paragraph}>
            You can now log in to the HRMS portal to complete your onboarding,
            update your profile, and manage your documents.
          </Text>
          <Section style={btnContainer}>
            <Button style={button} href={`${baseUrl}/login`}>
              Log in to Portal
            </Button>
          </Section>
          <Text style={paragraph}>
            If you have any questions, feel free to reply to this email or contact the HR department.
          </Text>
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

export default WelcomeEmail;

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

const codeBox = {
  backgroundColor: '#f4f4f5',
  borderRadius: '4px',
  padding: '16px',
  textAlign: 'center' as const,
  margin: '24px 0',
};

const codeTitle = {
  color: '#71717a',
  fontSize: '12px',
  fontWeight: 'bold',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 8px',
};

const codeValue = {
  color: '#09090b',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
  letterSpacing: '4px',
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
