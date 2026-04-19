import * as yup from 'yup';
export const HoursDetailsValidation = yup.object().shape({
    hours: yup.string().matches(/^\d+$/, 'Allowed only Number').required('Please enter Hours').nullable(),
    // cost: yup.string().matches(/^\d+$/, "Allowed only Number").required('Please enter Cost').nullable(),
    number_of_resource: yup.string().matches(/^\d+$/, 'Allowed only Number').required('Please enter Number of Resorce').nullable(),
    department_id: yup.string().required('Please Select Department Name').nullable(),
    category_id: yup.string().required('Please Select Category').nullable()
});
