/* eslint-disable prettier/prettier */
// ================================|| Sales Validation ||================================ //

import * as yup from 'yup';
export const AdditionalHoursValidation = yup.object().shape({
    hours: yup
        .number()
        .min(1, 'The minimum value is one')
        .typeError('The value invalid')
        .required('The value is required')
        .test('no-leading-zero', 'Zero is not allowed', (value: any, context: any) => {
            return context.originalValue && !context.originalValue.startsWith('0');
        }),
    // no_resource: yup
    //     .number()
    //     .min(1, 'The minimum value is one')
    //     .typeError('The value invalid')
    //     .required('The value is required')
    //     .test('no-leading-zero', 'Zero is not allowed', (value: any, context: any) => {
    //         return context.originalValue && !context.originalValue.startsWith('0');
    //     }),
    department_id: yup.string().required('Please Select Department Name').nullable(),
    category_id: yup.string().required('Please Select Category ').nullable()
});
