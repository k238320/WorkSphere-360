import * as yup from 'yup';

const emailValidation = yup
    .string()
    .required('Please enter an email address')
    .test('is-email', 'Invalid email format', (value: any) => {
        return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value);
    })
    .nullable();

export const ClientDetailValidation = yup.object().shape({
    name: yup.string().required('Please enter Client Name').nullable(),
    designation: yup.string().required('Please enter Client Designation').nullable(),
    number: yup
        .string()
        .matches(/^(\s*|\d+)$/, 'Please Enter  Correct number')
        .required('Please enter Client Number')
        .nullable(),
    email: emailValidation
});
