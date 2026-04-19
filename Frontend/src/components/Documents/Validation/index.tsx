import * as yup from 'yup';

export const createDocumentValidation = yup.object().shape({
    experience_letter: yup.string().nullable(),
    resignation_letter: yup.string().nullable(),
    educational_document: yup
        .string()
        .nullable()
        .test('is-json-array', 'Must be a valid JSON array of strings', (value) => {
            if (!value) return true; // Allow null or empty value
            try {
                const parsed = JSON.parse(value);
                return Array.isArray(parsed) && parsed.every((item) => typeof item === 'string');
            } catch {
                return false;
            }
        }),
    pay_slip: yup.string().nullable(),
    cnic: yup.string().required('Please select file').nullable(),
    updated_resume: yup.string().required('Please select file').nullable(),
    power_picture: yup.string().required('Please select file').nullable()
});
