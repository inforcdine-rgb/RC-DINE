import { db } from '../../../config/database.js';
import hotelController from '../../controllers/hotel.controller.js';
import customerRepo from '../../repositories/customer.repository.js';
import hotelRepo from '../../repositories/hotel.repository.js';
import hotelUserRelationRepo from '../../repositories/hotelUserRelation.repository.js';
import menuRepo from '../../repositories/menu.repository.js';
import orderRepo from '../../repositories/order.repository.js';
import tableRepo from '../../repositories/table.repository.js';
import hotelService from '../../services/hotel.service.js';
import { create, list, remove, update } from '../utils/dummy.hotel.js';

jest.mock('../../../config/database.js', () => ({
    db: {
        tables: {
            destroy: jest.fn().mockResolvedValue(1)
        },
        customer: {
            findAndCountAll: jest.fn().mockResolvedValue({ count: 0, rows: [] }),
            destroy: jest.fn().mockResolvedValue(1)
        },
        orders: {
            bulkCreate: jest.fn(),
            destroy: jest.fn().mockResolvedValue(1)
        },
        openOrders: {
            sum: jest.fn().mockResolvedValue(0),
            count: jest.fn().mockResolvedValue(0),
            findAll: jest.fn().mockResolvedValue([])
        },
        openOrderItems: {
            findAll: jest.fn().mockResolvedValue([])
        },
        categories: {
            destroy: jest.fn().mockResolvedValue(1)
        },
        menu: {
            name: 'menu',
            destroy: jest.fn().mockResolvedValue(1)
        },
        hotelUserRelation: {
            name: 'hotelUserRelation',
            destroy: jest.fn().mockResolvedValue(1)
        },
        subscriptions: {
            name: 'subscriptions',
            destroy: jest.fn().mockResolvedValue(1)
        },
        hotel: {
            name: 'hotel',
            destroy: jest.fn().mockResolvedValue(1),
            sequelize: {
                transaction: jest.fn()
            }
        },
        users: { name: 'users' }
    }
}));

// Initializing an empty response object
let res = {};

// Creating spies to track function calls
const hotelRepoSaveSpy = jest.spyOn(hotelRepo, 'save');
const hotelRepoUpdateSpy = jest.spyOn(hotelRepo, 'update');
const hotelRepoRemoveSpy = jest.spyOn(hotelRepo, 'remove');
const hotelRepoFindSpy = jest.spyOn(hotelRepo, 'find');
const hotelUserRelationRepoSaveSpy = jest.spyOn(hotelUserRelationRepo, 'save');
const hotelUserRelationRepoFindSpy = jest.spyOn(hotelUserRelationRepo, 'find');
const hotelUserRelationRepoRemoveSpy = jest.spyOn(hotelUserRelationRepo, 'remove');
const hotelUserRelationRepoCountSpy = jest.spyOn(hotelUserRelationRepo, 'count');
const customerRepoFindSpy = jest.spyOn(customerRepo, 'find');
const tableRepoCountSpy = jest.spyOn(tableRepo, 'count');
const menuRepoCountSpy = jest.spyOn(menuRepo, 'count');
const orderRepoFindSpy = jest.spyOn(orderRepo, 'find');
const orderRepoSumSpy = jest.spyOn(orderRepo, 'sum');
const orderRepoSumRevenueSpy = jest.spyOn(orderRepo, 'sumRevenueByCustomerIds');
const orderRepoFindSalesByHotelIdsSpy = jest.spyOn(orderRepo, 'findSalesByHotelIds');

// Describing the test suite for hotel registration functionality
describe('testing hotel cases', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        db.hotel.sequelize.transaction.mockResolvedValue({
            commit: jest.fn().mockResolvedValue(),
            rollback: jest.fn().mockResolvedValue()
        });
        db.customer.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });
        db.customer.destroy.mockResolvedValue(1);
        db.tables.destroy.mockResolvedValue(1);
        db.orders.destroy.mockResolvedValue(1);
        db.openOrders.sum.mockResolvedValue(0);
        db.openOrders.count.mockResolvedValue(0);
        db.openOrders.findAll.mockResolvedValue([]);
        db.openOrderItems.findAll.mockResolvedValue([]);
        customerRepoFindSpy.mockImplementation((options) => db.customer.findAndCountAll(options));
        hotelUserRelationRepoFindSpy.mockResolvedValue({ count: 1, rows: [] });
        db.categories.destroy.mockResolvedValue(1);
        db.menu.destroy.mockResolvedValue(1);
        db.hotelUserRelation.destroy.mockResolvedValue(1);
        db.subscriptions.destroy.mockResolvedValue(1);
        db.hotel.destroy.mockResolvedValue(1);
        // Resetting response object
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
    });

    // create hotel
    test('test payload validation', async () => {
        const { validationTest } = create;
        await hotelController.register(validationTest.req, res);

        // Expectations for response status and data
        expect(res.status).toHaveBeenCalledWith(validationTest.res.status);
        expect(res.send).toHaveBeenCalledWith(validationTest.res.data);
    });

    test('test too many request error', async () => {
        const { tooManyRequest } = create;

        // Mocking resolved values for repository functions
        hotelUserRelationRepoFindSpy.mockResolvedValue(tooManyRequest.db.data);

        // Calling the hotel registration controller function
        await hotelController.register(tooManyRequest.req, res);

        // Expectations for function calls and response data
        expect(hotelUserRelationRepoFindSpy).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(tooManyRequest.response.status);
        expect(res.send).toHaveBeenCalledWith(tooManyRequest.response.data);
    });

    test('test create hotel without manager', async () => {
        const { ownerTest } = create;

        // Mocking resolved values for repository functions
        hotelRepoSaveSpy.mockResolvedValue(ownerTest.db.hotel);
        hotelUserRelationRepoSaveSpy.mockResolvedValue({});
        hotelUserRelationRepoFindSpy.mockResolvedValue({ count: 5 });

        // Calling the hotel registration controller function
        await hotelController.register(ownerTest.req, res);

        // Expectations for function calls and response data
        expect(hotelRepoSaveSpy).toHaveBeenCalled();
        expect(hotelUserRelationRepoSaveSpy).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(ownerTest.res.status);
        expect(res.send).toHaveBeenCalledWith(ownerTest.db.hotel);
    });

    test('test create hotel with manager', async () => {
        const { managerTest } = create;

        // Mocking resolved values for repository functions
        hotelRepoSaveSpy.mockResolvedValue(managerTest.db.hotel);
        hotelUserRelationRepoSaveSpy.mockResolvedValue();
        hotelUserRelationRepoFindSpy.mockResolvedValue({ count: 5 });

        // Calling the hotel registration controller function
        await hotelController.register(managerTest.req, res);

        // Expectations for function calls and response data
        expect(res.status).toHaveBeenCalledWith(managerTest.res.status);
        expect(hotelUserRelationRepoSaveSpy).toHaveBeenCalledTimes(2);
        expect(res.send).toHaveBeenCalledWith(managerTest.db.hotel);
    });

    test('test create hotel error', async () => {
        const { errorTest } = create;
        // Mocking rejected value for repository function
        hotelRepoSaveSpy.mockRejectedValue(errorTest.error);
        hotelUserRelationRepoFindSpy.mockResolvedValue({ count: 5 });

        // Calling the hotel registration controller function
        await hotelController.register(errorTest.req, res);

        // Expectations for error handling
        expect(res.status).toHaveBeenCalledWith(errorTest.res.status);
        expect(res.send).toHaveBeenCalledWith(errorTest.res.data);
    });

    // update hotel
    test('test update hotel successfully', async () => {
        const { success } = update;

        hotelRepoUpdateSpy.mockResolvedValue(1);

        await hotelController.update(success.req, res);

        expect(res.status).toHaveBeenCalledWith(success.res.status);
        expect(hotelRepoUpdateSpy).toHaveBeenCalled();
        expect(res.send).toHaveBeenCalledWith(success.res.data);
    });

    test('test update hotel throw error', async () => {
        const { error } = update;
        hotelRepoUpdateSpy.mockRejectedValue(new Error(error.error));
        await hotelController.update(error.req, res);

        expect(res.status).toHaveBeenCalledWith(error.res.status);
        expect(hotelRepoUpdateSpy).toHaveBeenCalled();
        expect(res.send).toHaveBeenCalledWith(error.res.data);
    });

    // list hotels
    test('test list hotel success', async () => {
        const { success } = list;
        hotelUserRelationRepoFindSpy.mockResolvedValue(success.db.data);
        orderRepoFindSalesByHotelIdsSpy.mockResolvedValue([]);
        db.openOrders.findAll.mockResolvedValue([{ hotelId: 'test-hotel-id-1', sales: '75.50' }]);

        await hotelController.list(success.req, res);

        expect(hotelUserRelationRepoFindSpy).toHaveBeenCalled();
        expect(orderRepoFindSalesByHotelIdsSpy).toHaveBeenCalledWith(['test-hotel-id-1', 'test-hotel-id-2']);
        expect(res.status).toHaveBeenCalledWith(success.res.status);
        expect(res.send).toHaveBeenCalledWith(
            expect.objectContaining({
                count: success.res.data.count,
                rows: [
                    expect.objectContaining({ id: 'test-hotel-id-1', sales: 75.5 }),
                    expect.objectContaining({ id: 'test-hotel-id-2', sales: 0 })
                ]
            })
        );
    });

    test('dashboard combines QR and completed Manager POS analytics without duplicate records', async () => {
        const today = new Date().toISOString().slice(0, 10);
        const month = today.slice(0, 7);

        hotelRepoFindSpy.mockResolvedValue({ id: 'hotel-1', name: 'Cafe' });
        customerRepoFindSpy.mockResolvedValue({ rows: [{ id: 'customer-1' }], count: 1 });
        hotelUserRelationRepoCountSpy.mockResolvedValue(2);
        tableRepoCountSpy.mockResolvedValue(3);
        menuRepoCountSpy.mockResolvedValue(4);
        orderRepoSumSpy.mockResolvedValue(100);
        orderRepoFindSpy
            .mockResolvedValueOnce({ rows: [{ date: today, totalPrice: '100' }] })
            .mockResolvedValueOnce({ rows: [{ month, totalPrice: '100' }] })
            .mockResolvedValueOnce({
                rows: [{ menuName: 'Burger', totalQuantity: '2', totalPrice: '100' }]
            });

        db.openOrders.sum.mockResolvedValue(50);
        db.openOrders.count.mockResolvedValue(1);
        db.openOrders.findAll
            .mockResolvedValueOnce([{ period: today, totalPrice: '50' }])
            .mockResolvedValueOnce([{ period: month, totalPrice: '50' }]);
        db.openOrderItems.findAll.mockResolvedValue([
            { menuName: 'Burger', totalQuantity: '1', totalPrice: '40' },
            { menuName: 'Fries', totalQuantity: '2', totalPrice: '20' }
        ]);

        const result = await hotelService.dashboard('hotel-1', { role: 'OWNER' });

        expect(result.cardsData.sale).toBe(150);
        expect(result.cardsData.orders).toBe(2);
        expect(result.weeklyData.week).toBe(150);
        expect(result.monthlyData.year).toBe(150);
        expect(result.top5.Burger).toEqual({ quantity: 3, revenue: 140 });
        expect(result.top5.Fries).toEqual({ quantity: 2, revenue: 20 });
        expect(db.orders.bulkCreate).not.toHaveBeenCalled();
    });

    test('owner revenue reports completed Manager POS sales even when there are no QR customers', async () => {
        const today = new Date().toISOString().slice(0, 10);
        const month = today.slice(0, 7);

        hotelUserRelationRepoFindSpy.mockResolvedValue({
            rows: [{ hotel: { id: 'hotel-1', name: 'Cafe' } }]
        });
        customerRepoFindSpy.mockResolvedValue({ rows: [], count: 0 });
        orderRepoSumRevenueSpy.mockResolvedValue(0);
        orderRepoFindSpy.mockResolvedValue({ rows: [] });
        orderRepoFindSalesByHotelIdsSpy.mockResolvedValue([]);
        db.openOrders.sum
            .mockResolvedValueOnce(10)
            .mockResolvedValueOnce(20)
            .mockResolvedValueOnce(30)
            .mockResolvedValueOnce(40);
        db.openOrders.findAll
            .mockResolvedValueOnce([{ period: today, totalPrice: '20' }])
            .mockResolvedValueOnce([{ period: month, totalPrice: '40' }])
            .mockResolvedValueOnce([{ hotelId: 'hotel-1', sales: '40' }]);

        const result = await hotelService.revenue('owner-1');

        expect(result.summary).toEqual({ today: 10, week: 20, month: 30, year: 40 });
        expect(result.weeklyTrend[today.slice(-2)]).toBe(20);
        expect(Object.values(result.monthlyTrend)).toContain(40);
        expect(result.hotelBreakdown).toEqual([{ hotelId: 'hotel-1', hotelName: 'Cafe', revenue: 40 }]);
        expect(db.openOrders.sum).toHaveBeenCalledTimes(4);
    });

    test('test list hotel failed', async () => {
        const { error } = list;

        hotelUserRelationRepoFindSpy.mockRejectedValue(new Error(error.error));
        await hotelController.list(error.req, res);

        expect(hotelUserRelationRepoFindSpy).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(error.res.status);
        expect(res.send).toHaveBeenCalledWith(error.res.data);
    });

    // remove hotel
    test('test remove hotel success', async () => {
        const { success } = remove;

        hotelRepoRemoveSpy.mockResolvedValue(success.db);
        hotelUserRelationRepoRemoveSpy.mockResolvedValue(success.db);

        await hotelController.remove(success.req, res);

        expect(hotelRepoRemoveSpy).toHaveBeenCalled();
        expect(hotelUserRelationRepoRemoveSpy).toHaveBeenCalled();

        expect(res.status).toHaveBeenCalledWith(success.response.status);
        expect(res.send).toHaveBeenCalledWith(success.response.data);
    });

    test('test remove hotel error', async () => {
        const { error } = remove;
        hotelRepoRemoveSpy.mockRejectedValue(new Error(error.error));

        await hotelController.remove(error.req, res);

        expect(hotelRepoRemoveSpy).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(error.response.status);
        expect(res.send).toHaveBeenCalledWith(error.response.data);
    });
});
