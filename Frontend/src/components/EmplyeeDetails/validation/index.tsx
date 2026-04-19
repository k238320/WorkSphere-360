/* eslint-disable prettier/prettier */
// ================================|| Sales Validation ||================================ //
import * as yup from 'yup';
export const createEmployeeValidation = yup.object().shape({
    employmentcode: yup.string().required('Please Enter an Employee Code').nullable(),
    emplymentstatus: yup.string().required('Please Select an Employee Status').nullable(),
    gender: yup.string().required('Please Select an Gender').nullable(),
    fullname: yup.string().required('Please Enter Full Name').nullable(),
    date_of_birth: yup.date().typeError('Must be a valid date').required('Please Enter Date of Birth').nullable(),
    date_of_joining: yup
        .date()
        .typeError('Must be a valid date')
        .nullable()
        .required('Please Enter Date of Joining')
        .test('is-not-null', 'Date of Joining cannot be null', (value) => value !== null),
    designation: yup.string().required('Please Select a Designation').nullable(),
    department: yup.string().required('Please Enter a Department').nullable(),
    personal_phone_number: yup
        .string()
        .required('Please Enter Phone Number')
        .matches(/^\+?\d+$/, 'Phone number must contain only numbers and may start with a +')
        .min(10, 'Phone number must be at least 10 digits')
        .max(15, 'Phone number cannot exceed 15 digits')
        .nullable(),

    emergency_contact_number: yup
        .string()
        .required('Please Enter Phone Number')
        .matches(/^\+?\d+$/, 'Phone number must contain only numbers and may start with a +')
        .min(10, 'Phone number must be at least 10 digits')
        .max(15, 'Phone number cannot exceed 15 digits')
        .nullable(),

    cnic: yup
        .string()
        .required('Please Enter CNIC')
        .matches(/^[0-9+]{5}-[0-9+]{7}-[0-9]{1}$/, 'Invalid CNIC format. Use the format 12345-6789123-4')
        .nullable(),
    company_email_address: yup.string().email('Please Enter a Valid Email').required('Please Enter an Email').nullable(),
    personal_email_address: yup.string().email('Please Enter a Valid Email').required('Please Enter an Email').nullable(),
    address: yup.string().required('Please Enter an Address').nullable(),
    accounttitle: yup.string().required('Please Enter an Account Title').nullable(),
    bankname: yup.string().required('Please Enter a Bank Name').nullable(),
    ibn_number: yup.string().required('Please Enter IBAN Number').nullable(),
    account_number: yup
        .string()
        .min(6, 'Account Number must be at least 6 characters')
        .max(30, 'Account Number cannot exceed 30 characters')
        .required('Please Enter Account Number'),
    emergency_contact_person_name: yup.string().required('Please Enter Emergency contact person').nullable(),
    // description: yup.string().required('Please Enter The Reason').nullable()
    // resign_comment: yup.string().required('Please Enter The Reason').nullable()
    resign_comment: yup.string().when('emplyeestatusoption', {
        is: 'employee',
        then: yup.string().nullable(),
        otherwise: yup.string().nullable()
    })
});
