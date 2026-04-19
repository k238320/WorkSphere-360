import * as yup from 'yup';
export const ProjectStatusValidation = yup.object().shape({
    comments: yup.string().required('Please enter Comment').nullable(),
    category: yup.string().required('Please Select Category').nullable(),
    project_status: yup.string().required('Please Select Status').nullable(),
    days_delayed: yup.string().when('project_status', {
        is: (status: any) => status === '64e33c6b7e43103c1afd5255', // Check if project_status is 'delayed'
        then: yup.string().required('Please Enter Days Delayed'), // Require days_delayed if project_status is 'delayed'
        otherwise: yup.string().nullable() // Allow days_delayed to be nullable for other project_status values
    })
});
