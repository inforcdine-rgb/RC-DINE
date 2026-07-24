import * as Yup from 'yup';

export const hotelRegistrationSchema = Yup.object().shape({
    name: Yup.string()
        .min(3, 'Hotel name must be at least 3 characters')
        .max(30, 'Hotel name can at most be 30 characters')
        .required('Hotel Name is required'),
    address: Yup.string()
        .min(10, 'Hotel address must be at least 10 characters')
        .max(100, 'Hotel address can at most be 100 characters')
        .required('Address is required'),
    careNumber: Yup.string()
        .matches(/^[0-9]{10}$/, 'Customer care number must be exactly 10 digits')
        .required('Customer Care Number is required'),
    gstNumber: Yup.string()
        .transform((value) => String(value || '').trim().toUpperCase())
        .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/, 'Valid 15-character GSTIN enter karo')
        .required('GSTIN is required')
});
