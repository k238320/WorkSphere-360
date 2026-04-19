import * as yup from "yup";


const passwordValidation = yup.object().shape({
    currentpassword:yup.string().required("Please enter current password").nullable(),
    password:yup.string().required("Please enter new password").matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~])[A-Za-z\d!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]{8,}$/,
        "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case Character"
      ),
    confirm_password: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match'),
})

export {
    passwordValidation,

}