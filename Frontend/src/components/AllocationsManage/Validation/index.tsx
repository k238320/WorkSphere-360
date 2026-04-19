/* eslint-disable prettier/prettier */
// ================================|| Sales Validation ||================================ //
import * as yup from 'yup';
export const createTaskValidation = yup.object().shape({
    // department_id: yup.string().required('Please select Department Name').nullable(),
    // resource_id: yup.string().required('Please select Resource Name').nullable(),
    project_id: yup.string().required('Please Select Project ').nullable(),
    task_category_id: yup.string().required('Please Select Project Category').nullable(),
    name: yup.string().required('Please enter name').nullable(),
    // url: yup.string().required('Please enter Url').nullable(),
    // department: yup.array().required('At least one department is required').min(1, 'At least one department is required').nullable(),
    // department: yup.array().required('At least one department is required').nullable(),
    attachment: yup
        .string()
        // .matches(
        //     /^((http|https):\/\/)(www.)?(?!.*(http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+(\/)?.([\w\?[a-zA-Z-_%\/@?]+)*([^\/\w\?[a-zA-Z0-9_-]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/,
        //     'please enter correct Url'
        // )
        .required('Please enter Additional Documents URL')
        .nullable(),
    start_date: yup.date(),
    completion_date: yup.date().typeError('Invalid date format').nullable(),
    description: yup.string().required('Please enter description').nullable()
    // end_date: yup.date().min(yup.ref('start_date'), "End date can't be before Start date"),
    // task_hours: yup.number().min(1, 'The minimum value is one').typeError('The value invalid').required('The value is required'),
    // .test('no-leading-zero', 'Zero is not allowed', (value: any, context: any) => {
    //     return context?.originalValue && !context?.originalValue?.startsWith('0');
    // })
    // task_status_id: yup.string().required('Please Select task Status').nullable()
});
