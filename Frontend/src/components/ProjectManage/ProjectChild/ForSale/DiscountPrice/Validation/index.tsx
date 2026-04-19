
import * as yup from 'yup'
export const DiscountPriceValidation = yup.object().shape({
    discount_cost: yup.string().matches(/^\d+$/, 'please enter Number').required('Please enter Discount Cost').nullable(),
    discount_reason: yup.string().required('Please enter Reason').nullable(),

})