/* eslint-disable prettier/prettier */
// ================================|| Sales Validation ||================================ //

import * as yup from 'yup';
export const FinanceValidation = yup.object().shape({
    commet: yup.string().required('Please enter Comments').nullable()
});
