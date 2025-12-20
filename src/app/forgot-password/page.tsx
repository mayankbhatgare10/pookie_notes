import ForgotPasswordPage from '@/page-components/ForgotPasswordPage';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Forgot Password - Pookie Notes',
    description: 'Reset your password for Pookie Notes',
};

export default function ForgotPassword() {
    return <ForgotPasswordPage />;
}
