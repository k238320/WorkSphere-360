import * as yup from 'yup';

export const createAssetComplainValidation = yup.object().shape({
    asset_category_id: yup.string().required('Please Select Asset Category ').nullable(),
    asset_id: yup.string().nullable(),
    description: yup.string().required('Please enter name').nullable()
});
