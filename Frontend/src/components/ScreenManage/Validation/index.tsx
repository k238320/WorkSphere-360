/* eslint-disable prettier/prettier */
// ================================|| Sales Validation ||================================ //
import * as yup from 'yup';
export const createScreenValidation = yup.object().shape({
    name: yup.string().required('Please enter name').nullable(),
    child: yup.string().required('Please enter child').nullable(),
    route: yup
        .string()
        // .matches(
        //     /^((http|https):\/\/)(www.)?(?!.*(http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+(\/)?.([\w\?[a-zA-Z-_%\/@?]+)*([^\/\w\?[a-zA-Z0-9_-]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/,
        //     'please enter correct Url'
        // )
        .required('Please enter route')
        .nullable()
});
