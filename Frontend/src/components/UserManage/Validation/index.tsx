/* eslint-disable prettier/prettier */
// ================================|| Sales Validation ||================================ //
import * as yup from 'yup';
export const createUserValidation = yup.object().shape({
    // name: yup.string().required('Please enter name').nullable(),
    name: yup.string().when('is_resource', {
        is: true,
        then: yup.string().notRequired(),
        otherwise: yup.string().required('Please enter a name')
    }),
    designation: yup.string().required('Please enter designation').nullable(),
    employement_code: yup.number().required('Please enter employement code').min(1, 'Employement code should be greater than 0').nullable(),
    email: yup.string().email('Please enter a valid email').required('Please enter an email').nullable(),
    password: yup.string().required('Please enter a password').min(8, 'Password must be at least 8 characters'),
    confirm_password: yup
        .string()
        .oneOf([yup.ref('password'), null], 'Passwords must match')
        .required('Please confirm your password'),
    role_id: yup.string().required('Please select role').nullable(),
    is_resource: yup.boolean(),
    resource_id: yup.string().when('is_resource', {
        is: true,
        then: yup.string().required('Please select resource '),
        otherwise: yup.string().notRequired()
    })
});
