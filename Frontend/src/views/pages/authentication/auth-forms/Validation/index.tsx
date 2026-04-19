/* eslint-disable prettier/prettier */
// ================================|| Sales Validation ||================================ //
import * as yup from 'yup';
export const forgetValidations = yup.object().shape({
    email: yup.string().email('Please enter a valid email').required('Please enter an email').nullable()
});
