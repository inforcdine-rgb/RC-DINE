import { createSlice } from '@reduxjs/toolkit';
import { FIELD_CLASS } from '../../utils/constants';
import { HOTEL } from '../types';

const hotelSlice = createSlice({
    name: HOTEL,
    initialState: {
        data: {
            rows: [],
            count: 0
        },
        hotelOptions: {
            hotelName: {
                name: 'name',
                type: 'text',
                label: 'Hotel Name',
                className: FIELD_CLASS,
                placeholder: 'Enter hotel name'
            },
            address: {
                name: 'address',
                type: 'text',
                label: 'Address',
                className: FIELD_CLASS,
                placeholder: 'Enter complete address'
            },
            careNumber: {
                name: 'careNumber',
                type: 'text',
                label: 'Customer Care Number',
                className: FIELD_CLASS,
                placeholder: 'Enter 10-digit mobile number',
                maxLength: 10
            },
            logoFile: { name: 'logoFile', type: 'image', label: 'Hotel Logo', className: FIELD_CLASS },
            gstNumber: {
                name: 'gstNumber',
                type: 'text',
                label: 'GSTIN',
                className: FIELD_CLASS,
                placeholder: 'Example: 27ABCDE1234F1Z5',
                maxLength: 15
            },
            openTime: {
                name: 'openTime',
                type: 'time',
                label: 'Open Time',
                className: FIELD_CLASS
            },
            closeTime: {
                name: 'closeTime',
                type: 'time',
                label: 'Close Time',
                className: FIELD_CLASS
            }
        },
        deleteHotelConfirm: false,
        formData: false,
        globalHotelId: null,
        hotelDetails: {}
    },
    reducers: {
        setHotelOptions(state, action) {
            state.hotelOptions = action.payload;
        },
        createHotelRequest() {},
        getHotelRequest() {},
        getHotelSuccess(state, action) {
            state.data = action.payload || {
                rows: [],
                count: 0
            };
        },
        updateHotelRequest() {},
        updateHotelSuccess(state, action) {
            const updatedHotel = action.payload;

            if (!updatedHotel?.id || !Array.isArray(state.data?.rows)) {
                return;
            }

            const index = state.data.rows.findIndex(
                (item) => item.id === updatedHotel.id
            );

            if (index !== -1) {
                state.data.rows[index] = {
                    ...state.data.rows[index],
                    ...updatedHotel
                };
            }

            state.formData = false;
        },
        removeHotelRequest() {},
        removeHotelSuccess(state, action) {
            state.deleteHotelConfirm = false;

            if (!Array.isArray(state.data?.rows)) {
                return;
            }

            const index = state.data.rows.findIndex(
                (item) => item.id === action.payload
            );

            if (index !== -1) {
                state.data.rows.splice(index, 1);
                state.data.count = Math.max(
                    Number(state.data.count || 0) - 1,
                    0
                );
            }
        },
        setDeleteHotelConfirm(state, action) {
            state.deleteHotelConfirm = action.payload;
        },
        setHotelFormData(state, action) {
            state.formData = action.payload;
        },
        getAssignableManagerRequest() {},
        setAssignableManagers() {},
        setGlobalHotelId(state, action) {
            state.globalHotelId = action.payload;
        },
        clearGlobalHotelId(state) {
            state.globalHotelId = null;
        }
    }
});

export const {
    setHotelOptions,
    createHotelRequest,
    getHotelRequest,
    getHotelSuccess,
    removeHotelRequest,
    removeHotelSuccess,
    updateHotelRequest,
    updateHotelSuccess,
    setDeleteHotelConfirm,
    setHotelFormData,
    getAssignableManagerRequest,
    setAssignableManagers,
    setGlobalHotelId,
    clearGlobalHotelId
} = hotelSlice.actions;

export const hotelReducer = hotelSlice.reducer;
