/* eslint-disable prettier/prettier */
// ================================|| Sales Validation ||================================ //
import * as yup from 'yup';
export const updateUserValidation = yup.object().shape({
    name: yup.string().when('is_resource', {
        is: true,
        then: yup.string().notRequired(),
        otherwise: yup.string().required('Please enter a name')
    }),
    email: yup.string().email('Please enter a valid email').required('Please enter an email').nullable(),
    role_id: yup.string().required('Please select role').nullable(),
    is_resource: yup.boolean(),
    designation: yup.string().required('Please enter designation').nullable(),
    employement_code: yup.number().required('Please enter employement code').min(1, 'Employement code should be greater than 0').nullable(),
    resource_id: yup.string().when('is_resource', {
        is: true,
        then: yup.string().required('Please select resource '),
        otherwise: yup.string().notRequired()
    })
});
