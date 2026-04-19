/* eslint-disable prettier/prettier */
// ================================|| Sales Validation ||================================ //

import * as yup from 'yup';
export const MileStoneValidation = yup.object().shape({
    milestone_phase_id: yup.string().required('Please enter Milestone Phase').nullable(),
    milestone_payment: yup
        .number()
        .min(1, 'The minimum value is one')
        .typeError('The value invalid')
        .required('The value is required')
        .test('no-leading-zero', 'Zero is not allowed', (value: any, context: any) => {
            return context.originalValue && !context.originalValue.startsWith('0');
        })
});
