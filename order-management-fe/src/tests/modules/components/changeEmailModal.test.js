import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import CryptoJS from 'crypto-js';
import { toast } from 'react-toastify';
import ChangeEmailModal from '../../../components/ChangeEmailModal';
import { changeOwnerEmail } from '../../../services/auth.service';

const mockDispatch = jest.fn();
const mockNavigate = jest.fn();

jest.mock('react-redux', () => ({
    useDispatch: () => mockDispatch
}));

jest.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate
}));

jest.mock('../../../config/env.js', () => ({
    __esModule: true,
    default: { cryptoSecret: 'frontend-test-secret' }
}));

jest.mock('../../../services/auth.service.js', () => ({
    changeOwnerEmail: jest.fn()
}));

jest.mock('react-toastify', () => ({
    toast: { success: jest.fn(), error: jest.fn() }
}));

describe('ChangeEmailModal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('validates account fields and toggles current password visibility', async () => {
        render(<ChangeEmailModal show currentEmail="owner@example.com" onClose={jest.fn()} />);

        const password = screen.getByLabelText('Current Password *');
        expect(password).toHaveAttribute('type', 'password');
        fireEvent.click(screen.getByRole('button', { name: 'Show current password' }));
        expect(password).toHaveAttribute('type', 'text');

        fireEvent.change(password, { target: { value: 'Strong@123' } });
        const newEmail = screen.getByLabelText(/^New Email/);
        fireEvent.change(newEmail, { target: { value: 'OWNER@EXAMPLE.COM' } });
        fireEvent.change(screen.getByLabelText(/^Confirm New Email/), { target: { value: 'owner@example.com' } });
        fireEvent.blur(newEmail);

        await waitFor(() =>
            expect(screen.getByText('New email must be different from your current email.')).toBeInTheDocument()
        );
        expect(screen.getByRole('button', { name: 'Update Email' })).toBeDisabled();
    });

    test('submits once, normalizes emails, closes modal, and clears the owner session', async () => {
        const onClose = jest.fn();
        changeOwnerEmail.mockResolvedValue({ success: true });
        render(<ChangeEmailModal show currentEmail="owner@example.com" onClose={onClose} />);

        fireEvent.change(screen.getByLabelText('Current Password *'), { target: { value: 'Strong@123' } });
        fireEvent.change(screen.getByLabelText(/^New Email/), { target: { value: ' NEW@EXAMPLE.COM ' } });
        fireEvent.change(screen.getByLabelText(/^Confirm New Email/), { target: { value: ' new@example.com ' } });

        const submit = screen.getByRole('button', { name: 'Update Email' });
        await waitFor(() => expect(submit).toBeEnabled());
        fireEvent.click(submit);
        fireEvent.click(submit);

        await waitFor(() => expect(changeOwnerEmail).toHaveBeenCalledTimes(1));
        const request = changeOwnerEmail.mock.calls[0][0];
        expect(request.newEmail).toBe('new@example.com');
        expect(request.confirmEmail).toBe('new@example.com');
        expect(CryptoJS.AES.decrypt(request.currentPassword, 'frontend-test-secret').toString(CryptoJS.enc.Utf8)).toBe(
            'Strong@123'
        );
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(toast.success).toHaveBeenCalledWith(
            'Email updated successfully. Please sign in with your new email.'
        );
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'USER/logoutRequest',
                payload: expect.objectContaining({ redirectTo: '/login', reload: false, skipUnregister: true })
            })
        );
    });
});
