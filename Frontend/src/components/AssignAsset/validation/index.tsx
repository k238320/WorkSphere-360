/* eslint-disable prettier/prettier */
// ================================|| Sales Validation ||================================ //
import * as yup from 'yup';
export const addAssetValidation = yup.object().shape({
    assets_id: yup
        .array()
        .of(
            yup.object().shape({
                asset_category_id: yup.string().required('Family Detail is required').nullable(),
                custom_asset_id: yup.string().required('Relationship is required').nullable()
            })
        )
        .min(1, 'At least one family detail is required')
});

export const addEmployeeAsset = yup.object().shape({
    user_id: yup.string().required('Please Select an Employee').nullable(),
    employee_id: yup.string().nullable(),
    department: yup.string().nullable(),
    designation: yup.string().nullable(),
    assets_id: yup
        .array()
        .of(
            yup.object().shape({
                asset_category_id: yup.string().required('Please select an Asset Category').nullable(),
                custom_asset_id: yup.string().required('Please select an available assets').nullable()
            })
        )
        .min(1, 'At least one Asset is required')
});
