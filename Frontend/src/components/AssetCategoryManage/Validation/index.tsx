/* eslint-disable prettier/prettier */
// ================================|| Sales Validation ||================================ //
import * as yup from 'yup';
export const assetCategoryValidation = yup.object().shape({
    name: yup.string().required('Please Enter Asset Name').nullable(),
    code: yup
        .string()
        .required('Please Enter Code')
        .matches(/^[A-Z]{3}$/, 'Code must be three capital letters')
});
