/* eslint-disable prettier/prettier */
// ================================|| Sales Validation ||================================ //
import * as yup from 'yup';
export const createVendorValidation = yup.object().shape({
    name: yup.string().required('Please Enter Vendor Name').nullable(),
    phone_number: yup
        .string()
        .required('Please Enter Phone Number')
        .matches(/^\d+$/, 'Phone number must contain only numbers')
        .min(10, 'Phone number must be at least 10 digits')
        .max(15, 'Phone number cannot exceed 15 digits')
        .nullable(),
    email: yup.string().email('Please Enter a Valid Email').required('Please Enter an Email').nullable(),
    location: yup.string().required('Please Enter Location').nullable(),
    // address: yup.string().required('Please Enter an Address').nullable(),
    account_title: yup.string().required('Please Enter an Account Title').nullable(),
    bank_name: yup.string().required('Please Enter a Bank Name').nullable(),
    // ibn_number: yup.string().required('Please Enter IBAN Number').nullable(),
    ibn_number: yup.string().nullable(),
    // account_number: yup.string().required('Please Enter Account Number').nullable(),
    // account_number: yup
    //     .string()
    //     .min(6, 'Account Number must be at least 6 characters')
    //     .max(30, 'Account Number cannot exceed 30 characters')
    //     .required('Please Enter Account Number'),
    account_number: yup.string(),

    // NTN: yup
    //     .string()
    //     .required('Please Enter NTN')
    //     .matches(/^\d{7}-\d{1}$/, 'Invalid NTN format. Use the format "1234567-8"'),
    NTN: yup.string(),

    CNIC: yup
        .string()
        .required('Please Enter CNIC')
        .matches(/^[0-9+]{5}-[0-9+]{7}-[0-9]{1}$/, 'Invalid CNIC format. Use the format "12345-6789123-4')
        .nullable(),
    address: yup
        .string()
        .required('Please Enter Home Address')
        .min(5, 'Home address must be at least 5 characters')
        .max(255, 'Home address cannot exceed 255 characters')
});
