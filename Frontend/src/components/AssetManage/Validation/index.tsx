/* eslint-disable prettier/prettier */
// ================================|| Sales Validation ||================================ //
import * as yup from 'yup';
export const createAssetValidation = yup.object().shape({
    cost: yup
        .number()
        .transform((originalValue, originalObject) => {
            const parsedValue = parseFloat(originalValue);
            return isNaN(parsedValue) ? undefined : parsedValue;
        })
        .required('Please Enter an Cost')
        .nullable(),
    brand: yup.string().required('Please Enter an Brand').nullable(),
    asset_category_id: yup.string().required('Please Enter Asset Category').nullable(),
    location: yup.string().required('Please Enter Location').nullable(),
    model_number: yup.string().required('Please Enter an Model Number').nullable(),
    vendor_id: yup.string().required('Please Enter an Vendor').nullable(),
    approved_by: yup.string().required('Please Enter an Approved By').nullable(),
    purchased_date: yup.date().typeError('Invalid date format').nullable(),
    warranty_expiration: yup.date().typeError('Invalid date format').nullable(),
    invoice: yup.string().required('Please Enter invoice').nullable()
});
