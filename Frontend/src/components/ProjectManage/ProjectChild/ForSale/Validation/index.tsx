/* eslint-disable prettier/prettier */
// ================================|| Sales Validation ||================================ //

import * as yup from 'yup';
export const createSalesValidation = yup.object().shape({
    project_name: yup.string().required('Please enter Project Name').nullable(),
    category_id: yup.array().required('Category is required').min(1, 'At least one category is required').nullable(),
    technology_id: yup
        .array()
        .required('Please Select at least one Project Technology')
        .min(1, 'At least one technology is required')
        .nullable(),
    industry_id: yup.array().required('Please Select at least one Project Industry').min(1, 'At least one industry is required').nullable(),
    no_of_week: yup
        .number()
        .typeError('Enter number only')
        .nullable()
        .transform((value, originalValue) => (String(originalValue).trim() === '' ? null : value))
        .notRequired(),

    po_singed_documents: yup.string().required('Po Signed Documents is required'),
    // commercial_documents: yup.string().required('Commercial Documents is required'),
    // technical_documents: yup.string().required('Technical Documents is required'),
    specific_timeline: yup.string().required('Specific Timeline is required').nullable(),
    project_win_date: yup.string().required('project win date is required').nullable(),
    // additional_document_url: yup.string().matches(/^((http|https):\/\/)(www.)?(?!.*(http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+(\/)?.([\w\?[a-zA-Z-_%\/@?]+)*([^\/\w\?[a-zA-Z0-9_-]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/, "please enter correct Url").required('Please enter Additional Documents URL').nullable(),
    commitment: yup.string().required('Please enter Brif / Commitments').nullable()
    // projectDivisionId :  yup.string().required('Please select project division').nullable(),
});
