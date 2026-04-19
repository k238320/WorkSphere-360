import * as yup from 'yup';
export const ProjectManageValidation = yup.object().shape({
    pm_name: yup.array().required('Please select at least one Project Manager').nullable(),
    kickoff_date: yup
        .date()
        .typeError('Please select a valid Kickoff Date') // Custom error for invalid dates
        .required('Please select a Kickoff Date')
        .nullable(), // Allow null values
    go_live_date: yup
        .date()
        .typeError('Please select a valid Go live Date') // Custom error for invalid dates
        .required('Please select a Go Live Date')
        .nullable()
    // project_plan: yup.string().required('Please add a Project Plan').min(10, 'Project Plan must be at least 10 characters'),
    // srs: yup.string().required('Please add an SRS').min(10, 'SRS must be at least 10 characters'),
    // weburl: yup.string().url('Please enter a valid URL').nullable()
});

export const ProjectManageLeadValidation = yup.object().shape({
    pm_name: yup.array().required('Please select at least one Project Manager').nullable()
});
