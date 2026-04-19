import * as yup from 'yup';

export const createAllocationValidation = yup.object().shape({
    resource_id: yup.string().required('Please select Resource Name').nullable(),
    start_date: yup.date().typeError('Start Date must be a valid date').required('Please select Start Date').nullable(),
    end_date: yup
        .date()
        .typeError('End Date must be a valid date')
        .min(yup.ref('start_date'), "End date can't be before Start date")
        .required('Please select End Date')
        .nullable(),
    task_hours: yup
        .number()
        .min(0.5, 'The minimum value is 0.5')
        .test('is-valid', 'Please enter a whole number or .5', (value) => {
            if (!value) {
                return false;
            }
            const isIntegerOrHalf = value % 1 === 0 || value % 1 === 0.5;
            return isIntegerOrHalf;
        })
        .typeError('The value is invalid')
        .required('The value is required')
});
