// import React from 'react';
// import { useForm, Controller } from 'react-hook-form';
// import TextareaAutosize from '@mui/material/TextareaAutosize';

// const GenericTextarea = ({ label, fieldName, control, placeholder, defaultValue = '', rows = 10 , errors, helperText}: any) => {
//     return (
//         <div>
//             {label && <label>{label}</label>}
//             <Controller
//                 name={fieldName}
//                 control={control}
//                 defaultValue={defaultValue}
//                 render={({ field }) => (
//                     <TextareaAutosize
//                         minRows={rows}
//                         placeholder={placeholder}
//                         {...field}
//                         style={{
//                             width: '100%',
//                             padding: '16px',
//                             fontFamily: 'sans-serif',
//                             border: '1px solid #C1C1C1',
//                             borderRadius: '8px'
//                         }}
//                     />
//                     {errors && <span style={{ color: 'red' }}>{helperText}</span>}
//                 )}
//             />
//         </div>
//     );
// };

// export default GenericTextarea;

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import TextareaAutosize from '@mui/material/TextareaAutosize';

const GenericTextarea = ({
    label,
    fieldName,
    control,
    placeholder,
    defaultValue = '',
    rows = 10,
    errors,
    helperText,
    backgroundColor,
    className = ''
}: any) => {
    return (
        <div>
            {label && <label>{label}</label>}
            <Controller
                name={fieldName}
                control={control}
                defaultValue={defaultValue}
                render={({ field }) => (
                    <div>
                        <TextareaAutosize
                            minRows={rows}
                            placeholder={placeholder}
                            {...field}
                            className={className}
                            // sx={sx}
                            // sx={{ marginTop: '100px' }}
                            style={{
                                width: '100%',
                                padding: '16px',
                                fontFamily: 'sans-serif',
                                border: errors ? '1px solid red' : '1px solid #C1C1C1', // Change border color on error
                                borderRadius: '8px',
                                outline: 'none',
                                backgroundColor: backgroundColor ? '#f8fafc' : '#fff'
                            }}
                        />
                        {errors && <span style={{ color: 'red' }}>{helperText}</span>}
                    </div>
                )}
            />
        </div>
    );
};

export default GenericTextarea;
