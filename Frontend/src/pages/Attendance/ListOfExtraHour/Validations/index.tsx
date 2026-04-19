import * as yup from 'yup';
export const commentValidation = yup.object().shape({
    hours: yup.number().required('Please Enter an Extra Hour').typeError('Value is Invalid').nullable(),
    user_comment: yup.string().required('Please Select an Comment').nullable(),
    approve_by: yup.string().required('Please Select an User').nullable()
});
