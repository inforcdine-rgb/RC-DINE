import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import CryptoJS from 'crypto-js';
import { toast } from 'react-toastify';
import ForgotPassword from '../../../pages/ForgetPassword/index.jsx';
import Signup from '../../../pages/Signup/index.jsx';
import { registerUser, resetOwnerPassword } from '../../../services/auth.service.js';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate
}));

jest.mock('../../../config/env.js', () => ({
    __esModule: true,
    default: { cryptoSecret: 'frontend-test-secret' }
}));

jest.mock('../../../services/auth.service.js', () => ({
    registerUser: jest.fn(),
    resetOwnerPassword: jest.fn()
}));

jest.mock('react-toastify', () => ({
    toast: { success: jest.fn(), error: jest.fn() }
}));

describe('OWNER recovery-code UI', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('signup shows fixed RC prefix and accepts only four numeric digits', () => {
        render(<Signup />);

        const recoveryCode = screen.getByLabelText('Recovery Code');
        const confirmRecoveryCode = screen.getByLabelText('Confirm Recovery Code');

        expect(screen.getAllByText('RC')).toHaveLength(2);
        expect(recoveryCode).toHaveAttribute('inputmode', 'numeric');
        expect(recoveryCode).toHaveAttribute('maxlength', '4');

        fireEvent.change(recoveryCode, { target: { value: '48a2 9!' } });
        fireEvent.change(confirmRecoveryCode, { target: { value: '48299' } });

        expect(recoveryCode).toHaveValue('4829');
        expect(confirmRecoveryCode).toHaveValue('4829');
    });

    test('signup does not put recovery data in Redux and sends it directly to the API', async () => {
        registerUser.mockResolvedValue({ id: 'owner-1' });
        render(<Signup />);

        fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Rachit' } });
        fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Kumar' } });
        fireEvent.change(screen.getByLabelText('Recovery Code'), { target: { value: '4829' } });
        fireEvent.change(screen.getByLabelText('Confirm Recovery Code'), { target: { value: '4829' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'owner@example.com' } });
        fireEvent.change(screen.getByLabelText('Phone Number'), { target: { value: '9876543210' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Strong@123' } });
        fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'Strong@123' } });

        const submit = screen.getByRole('button', { name: /Create Account/ });
        await waitFor(() => expect(submit).toBeEnabled());
        fireEvent.click(submit);

        await waitFor(() => expect(registerUser).toHaveBeenCalledTimes(1));
        const request = registerUser.mock.calls[0][0];
        expect(request.recoveryCode).toBe('4829');
        expect(request.confirmRecoveryCode).toBe('4829');
        expect(request).not.toHaveProperty('confirmPassword');
        expect(request.password).not.toBe('Strong@123');
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    test('forgot password normalizes email, encrypts passwords, and redirects on success', async () => {
        resetOwnerPassword.mockResolvedValue({
            message: 'Password reset successfully. Please login with your new password.'
        });
        render(<ForgotPassword />);

        const newPassword = screen.getByLabelText('New Password');
        expect(newPassword).toHaveAttribute('type', 'password');
        fireEvent.click(screen.getByRole('button', { name: 'Show New Password' }));
        expect(newPassword).toHaveAttribute('type', 'text');

        fireEvent.change(screen.getByLabelText('Registered Email'), {
            target: { value: ' OWNER@EXAMPLE.COM ' }
        });
        fireEvent.change(screen.getByLabelText('Recovery Code'), { target: { value: '48x29' } });
        fireEvent.change(newPassword, { target: { value: 'Changed@123' } });
        fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'Changed@123' } });

        const submit = screen.getByRole('button', { name: 'Reset Password' });
        await waitFor(() => expect(submit).toBeEnabled());
        fireEvent.click(submit);

        await waitFor(() => expect(resetOwnerPassword).toHaveBeenCalledTimes(1));
        const request = resetOwnerPassword.mock.calls[0][0];
        expect(request.email).toBe('owner@example.com');
        expect(request.recoveryCode).toBe('4829');
        expect(CryptoJS.AES.decrypt(request.newPassword, 'frontend-test-secret').toString(CryptoJS.enc.Utf8)).toBe(
            'Changed@123'
        );
        expect(
            CryptoJS.AES.decrypt(request.confirmNewPassword, 'frontend-test-secret').toString(CryptoJS.enc.Utf8)
        ).toBe('Changed@123');
        expect(toast.success).toHaveBeenCalledWith('Password reset successfully. Please login with your new password.');
        expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    });
});
