/* eslint-disable prettier/prettier */
// ================================|| Sales Validation ||================================ //
import * as yup from 'yup';
export const createFamilyInfoValidation = yup.object().shape({
    employmentid: yup.string().required('Employment ID is required'),
    marital_status: yup.string().required('Marital Status is required'),
    number_dependents: yup.number().required('Number of Dependents is required').typeError('The value invalid').nullable(),
    maternity_provision: yup.boolean().required('Employment Status is required'),
    family_details: yup
        .array()
        .of(
            yup.object().shape({
                family_detail: yup.string().required('Family Detail is required').nullable(),
                relationship: yup.string().required('Relationship is required').nullable(),
                date_of_birth: yup.string().required('Date of Birth is required').nullable(),
                cnic: yup.string().required('Please select CNIC').nullable(),
                
            })
        )
        .min(1, 'At least one family detail is required')
});
