/* eslint-disable prettier/prettier */
import * as yup from 'yup';

// const screenSchema = yup.object().shape({
//     screen: yup.string().required('Screen is required'),
//     permissions: yup.array().of(yup.string()).required('Permissions are required')
// });

// export const createRoleValidation = yup.object().shape({
//     name: yup.string().required('Name is required'),
//     screens: yup.array().of(screenSchema).required('At least one screen is required')
// });

export const createRoleValidation = yup.object().shape({
    name: yup.string().required('Name is required')
    // screenInstances: yup.array().of(
    //     yup.object().shape({
    //         screen: yup.string().required('Screen is required'),
    //         permissions: yup.array().of(yup.string()).required('Permissions are required')
    //     })
    // )
});
