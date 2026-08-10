import { Op } from 'sequelize';
import { db } from '../../../config/database.js';
import customerRepo from '../../repositories/customer.repository.js';
import orderRepo from '../../repositories/order.repository.js';
import tableRepo from '../../repositories/table.repository.js';
import checkoutService from '../../services/checkout.service.js';
import notificationService from '../../services/notification.service.js';
import orderService from '../../services/order.service.js';

jest.mock('../../../config/database.js', () => ({
    db: {
        tables: { findOne: jest.fn() },
        hotel: { findOne: jest.fn() },
        orders: { count: jest.fn(), findOne: jest.fn(), update: jest.fn() }
    }
}));

jest.mock('../../repositories/customer.repository.js', () => ({ find: jest.fn() }));
jest.mock('../../repositories/order.repository.js', () => ({ find: jest.fn(), update: jest.fn() }));
jest.mock('../../repositories/table.repository.js', () => ({ update: jest.fn() }));
jest.mock('../../services/notification.service.js', () => ({ sendNotification: jest.fn() }));
jest.mock('../../services/order.service.js', () => ({ getNotificationUserIds: jest.fn() }));

describe('checkout settlement security', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        orderRepo.find.mockResolvedValue({ rows: [{ id: 'order-1', finalAmount: 250 }] });
        customerRepo.find.mockResolvedValue({
            rows: [
                {
                    id: 'customer-1',
                    table: { id: 'table-1', tableNumber: 4 }
                }
            ]
        });
        db.tables.findOne.mockResolvedValue({ id: 'table-1', tableNumber: 4 });
        tableRepo.update.mockResolvedValue([1]);
        orderService.getNotificationUserIds.mockResolvedValue(['owner-1']);
    });

    test('manual settlement selects unpaid served orders and remains successful if notification delivery fails', async () => {
        notificationService.sendNotification.mockRejectedValue(new Error('push unavailable'));

        await expect(
            checkoutService.payment({ customerId: 'customer-1', hotelId: 'hotel-1', manual: true })
        ).resolves.toEqual({ message: 'Success' });

        const query = orderRepo.find.mock.calls[0][0];
        expect(query.where.customerId).toBe('customer-1');
        expect(query.where.paymentStatus[Op.ne]).toBe('PAID');
        expect(tableRepo.update).toHaveBeenCalledWith(
            { where: { id: 'table-1', hotelId: 'hotel-1', customerId: 'customer-1' } },
            { status: 'PAYMENT_PENDING' }
        );
    });
});
