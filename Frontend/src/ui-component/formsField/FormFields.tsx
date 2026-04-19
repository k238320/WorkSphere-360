/* eslint-disable */
import {
    Autocomplete,
    Button,
    Checkbox,
    Chip,
    CircularProgress,
    FormControl,
    FormControlLabel,
    FormHelperText,
    InputLabel,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    Switch,
    TextField,
    FormLabel
} from '@mui/material';
import { DatePicker, Skeleton, TimePicker } from '@mui/lab';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { Editor } from '@tinymce/tinymce-react';

// import { Editor } from '@tinymce/tinymce-react';
// import MuiPhoneNumber from 'mui-phone-number';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

export const TextFieldControlled: any = (props: any) => {
    const [load, setLoad] = useState(true);
    const {
        fieldName,
        label,
        control,
        iProps,
        rules,
        initValue,
        helperText,
        placeholder,
        errors,
        type,
        autoComplete,
        isLoading,
        multiline,
        rows,
        disabled,
        fullWidth,
        endAdornment
    } = props;

    useEffect(() => {
        props.valueGot && props.setValue(fieldName, props.valueGot);

        if (isLoading || props.valueGot || props.valueGot == '' || props.valueGot == null) setLoad(false);
    }, [props.valueGot, isLoading]);

    return (
        <>
            <Controller
                name={fieldName}
                control={control}
                defaultValue={initValue || initValue === 0 ? initValue : ''}
                rules={rules}
                render={({ field }) => (
                    <>
                        {load ? (
                            <Skeleton height={90} />
                        ) : type == 'hidden' ? (
                            <input {...field} type={type} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                        ) : (
                            <TextField
                                {...field}
                                error={errors}
                                margin={'normal'}
                                fullWidth={fullWidth == false ? false : true}
                                label={label}
                                type={type}
                                id={fieldName}
                                multiline={multiline}
                                rows={rows}
                                disabled={disabled}
                                placeholder={placeholder}
                                autoComplete={autoComplete}
                                helperText={helperText}
                                {...iProps}
                                onChange={(e: any) => {
                                    if (iProps?.onChange) {
                                        iProps?.onChange(e);
                                    }
                                    field.onChange(e);
                                }}
                            />
                        )}
                    </>
                )}
            />
        </>
    );
};

export const TextEditorField = (props: any) => {
    const { fieldName, initValue, control, errors, rules, isLoading, className, helperText, initialValue } = props;
    const [load, setLoad] = useState(true);
    const [value, setValue] = useState<any>('');
    useEffect(() => {
        if (props.valueGot) {
            props.valueGot && props.setValue(fieldName, props.valueGot);
            setValue(props.valueGot);
        }
        if (isLoading) setLoad(false);
    }, [props.valueGot, isLoading]);

    return (
        <div className={className}>
            <Controller
                name={fieldName}
                control={control}
                defaultValue={initValue || initValue === 0 ? initValue : ''}
                rules={rules}
                render={({ field }) => (
                    <>
                        {load ? (
                            <Skeleton height={90} />
                        ) : (
                            <Editor
                                apiKey="2lsoue1ha24xltn4wqeql7iuwoqc8ygldmun39lg3jengd3w"
                                textareaName={fieldName}
                                value={value}
                                disabled={props?.disabled ? props?.disabled : false}
                                onEditorChange={(newText: any) => {
                                    setValue(newText);
                                    props.setValue(fieldName, newText);
                                }}
                                initialValue={initialValue}
                                init={{
                                    plugins: 'emoticons textcolor',
                                    toolbar:
                                        'undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | outdent indent | emoticons |forecolor',
                                    toolbar_location: 'top',
                                    menubar: false
                                }}
                            />
                        )}
                        {errors && <FormHelperText error={errors}>{helperText}</FormHelperText>}
                    </>
                )}
            />
        </div>
    );
};

// export const PhoneNoField = (props: any) => {
//   // const classes = useStyles();

//   const {
//     fieldName,
//     label,
//     control,
//     iProps,
//     rules,
//     initValue,
//     helperText,
//     errors,
//     type,
//     autoComplete,
//     isLoading,
//     fullWidth,
//     countrycode
//   } = props;
//   const [load, setLoad] = useState(true);
//   useEffect(() => {
//     props.valueGot && props.setValue(fieldName, props.valueGot);
//     if (
//       props.valueGot ||
//       props.valueGot === "" ||
//       props.valueGot === null ||
//       isLoading
//     )
//       setLoad(false);
//   }, [props.valueGot]);

//   return (
//     <>
//       <Controller
//         name={fieldName}
//         control={control}
//         defaultValue={initValue || initValue === 0 ? initValue : ""}
//         rules={rules}
//         render={({ field }) => (
//           <MuiPhoneNumber
//             // inputClass={classes.marginTopZero}
//             //name="phone"
//             data-cy="user-phone"
//             defaultCountry={countrycode ? countrycode.toLowerCase() : "ae"}
//             {...field}
//             error={errors}
//             variant="outlined"
//             className="phone-number"
//             fullWidth={fullWidth == false ? false : true}
//             label={label}
//             type={type}
//             id={fieldName}
//             size='medium'
//             autoComplete={autoComplete}
//             helperText={helperText}
//             {...iProps}

//           />
//         )}
//       />
//     </>
//   );
// };

export const DateField = (props: any) => {
    const { fieldName, label, control, iProps, rules, initValue, inputVariant, helperText, errors, isLoading } = props;
    const [load, setLoad] = useState(true);
    const [value, setValue] = useState<any>('');
    useEffect(() => {
        if (props.valueGot) {
            props.valueGot && props.setValue(fieldName, props.valueGot);
            setValue(props.valueGot);
        }
        if (isLoading) setLoad(false);
    }, [props.valueGot, isLoading]);

    return (
        <>
            <Controller
                name={fieldName}
                control={control}
                defaultValue={initValue || initValue === 0 ? initValue : ''}
                rules={rules}
                render={({ field }) => (
                    <DesktopDatePicker
                        {...field}
                        label={label}
                        {...iProps}
                        helperText={helperText}
                        error={errors}
                        value={value}
                        onChange={(e) => {
                            field?.onChange(e);
                            setValue(e);
                            iProps?.onChange && iProps?.onChange(e);
                        }}
                        KeyboardButtonProps={{
                            'aria-label': 'change date'
                        }}
                        renderInput={(params: any) => (
                            <TextField size="medium" helperText={helperText} fullWidth {...params} error={errors} />
                        )}
                    />

                    // <DatePicker
                    //   {...field}
                    //   margin="normal"
                    //   inputVariant="outlined"
                    //   KeyboardButtonProps={{
                    //     "aria-label": "change date",
                    //   }}
                    //   label={label}
                    //   {...iProps}
                    //   size="small"
                    //   helperText={helperText}
                    //   fullWidth
                    //   error={errors}
                    // />
                )}
            />
        </>
    );
};

// export const GenericDatePicker = (props: any) => {};

// interface DatePickerProps {
//     name: string;
//     label: string;
// }

// export const GenericDatePicker: React.FC<DatePickerProps> = ({ name, label }) => {
//     const { control } = useFormContext();

//     return (
//         <LocalizationProvider dateAdapter={AdapterDateFns}>
//             <Controller
//                 name={name}
//                 control={control}
//                 render={({ field }) => (
//                     <DatePicker
//                         renderInput={(props: any) => (
//                             <TextField {...props} fullWidth label={label} error={!!props?.helperText} helperText={props?.helperText} />
//                         )}
//                         {...field}
//                     />
//                 )}
//             />
//         </LocalizationProvider>
//     );
// };

export const CheckboxFieldSecondary = (props: any) => {
    const { fieldName, label, control, iProps, rules, initValue, helperText, errors, isLoading, checked, disabled } = props;
    const [load, setLoad] = useState(true);
    useEffect(() => {
        props.valueGot && props.setValue(fieldName, props.valueGot);
        if (props.valueGot || props.valueGot === '' || props.valueGot === null || isLoading) setLoad(false);
    }, [props.valueGot, checked]);

    return (
        <>
            <Controller
                name={fieldName}
                control={control}
                defaultValue={initValue || initValue === 0 ? initValue : ''}
                rules={rules}
                render={({ field }: any) => (
                    <Checkbox
                        {...field}
                        {...iProps}
                        helperText={helperText}
                        name={fieldName}
                        checked={checked}
                        error={errors}
                        disabled={disabled}
                    />
                )}
            />
        </>
    );
};
export const SelectField = (props: any) => {
    const [load, setLoad] = useState(true);
    const [menuItems, setMenuItem] = useState([]);
    const { fieldName, label, control, iProps, rules, initValue, helperText, errors, type, autoComplete, placeHolder } = props;

    useEffect(() => {
        props.valueGot && props.setValue(fieldName, props.valueGot);
    }, [props.valueGot]);

    useEffect(() => {
        setMenuItem(props?.selectOptions);
        if (props?.selectOptions?.length > 0) setLoad(false);
    }, [props?.selectOptions]);

    return (
        <>
            <Controller
                name={fieldName}
                control={control}
                defaultValue={initValue || initValue === 0 ? initValue : ''}
                rules={rules}
                render={({ field }) => (
                    <>
                        {load ? (
                            <Skeleton height={58} />
                        ) : (
                            <FormControl
                                error={errors}
                                variant="outlined"
                                size="small"
                                margin="normal"
                                // className={classes.formControl}
                            >
                                <InputLabel id={label}>{label}</InputLabel>
                                <Select
                                    {...field}
                                    variant="outlined"
                                    fullWidth
                                    label={label}
                                    {...iProps}
                                    onChange={(e: any, data: any) => {
                                        field.onChange(e, data);
                                        if (iProps?.onChange) {
                                            iProps?.onChange(e, data);
                                        }

                                        props.setValue(fieldName, data?.props.value);
                                    }}
                                    size="small"
                                    type={type}
                                    id={fieldName}
                                    autoComplete={autoComplete}
                                >
                                    <MenuItem value="" disabled>
                                        {placeHolder}
                                    </MenuItem>
                                    {(menuItems || []).map((item: any, index: any) => {
                                        return (
                                            <MenuItem key={item.id} value={item.id}>
                                                {item.name}
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                                {helperText && <FormHelperText>{helperText}</FormHelperText>}
                            </FormControl>
                        )}
                    </>
                )}
            />
        </>
    );
};
export const LoadingButton = (props: any) => {
    const { onClick, loading, text } = props;
    return (
        <Button {...props} onClick={onClick} disabled={loading} variant="contained" color="primary">
            {loading && <CircularProgress size={23} />}
            {!loading && text}
        </Button>
    );
};
export const AutoCompleteField = (props: any) => {
    const [load, setLoad] = useState<any>(true);
    const [value, setValue] = React.useState<any>({});
    const [inputValue, setInputValue] = React.useState<any>('');

    const {
        fieldName,
        control,
        iProps,
        rules,
        initValue,
        helperText,
        errors,
        type,
        autoComplete,
        options,
        isLoading,
        optionKey,
        optionValue,
        label,
        returnObject,
        disabled,
        setUserInfo,
        reset,
        setReset // Added reset prop
    } = props;

    // useEffect(() => {
    //     if (isLoading) {
    //         setLoad(false);
    //         if (returnObject) {
    //             props.valueGot && props.setValue(fieldName, props?.valueGot);
    //         } else {
    //             props.valueGot && props.setValue(fieldName, props?.valueGot?.[optionKey]);
    //         }
    //     } else if (isLoading == false) {
    //         setLoad(true);
    //     }
    //     if (props.valueGot == undefined || props.valueGot == null) {
    //         setValue({});
    //         setInputValue({});
    //     } else {
    //         setValue(props.valueGot);
    //         setInputValue(props.valueGot?.[optionValue]);
    //     }
    // }, [props.valueGot, isLoading]);

    useEffect(() => {
        if (reset) {
            // Reset the state when the reset prop changes
            setValue({});
            setInputValue('');
            setReset(false);
        } else {
            if (isLoading) {
                setLoad(false);
                if (returnObject) {
                    props.valueGot && props.setValue(fieldName, props?.valueGot);
                } else {
                    props.valueGot && props.setValue(fieldName, props?.valueGot?.[optionKey]);
                }
            } else if (isLoading === false) {
                setLoad(true);
            }
            if (props.valueGot == undefined || props.valueGot == null) {
                setValue({});
                setInputValue({});
            } else {
                setValue(props.valueGot);
                setInputValue(props.valueGot?.[optionValue]);
            }
        }
    }, [props.valueGot, isLoading, reset]); // Added reset to dependency array

    return (
        <>
            <Controller
                name={fieldName}
                control={control}
                defaultValue={initValue || initValue === 0 ? initValue : ''}
                rules={rules}
                render={(field) => (
                    <>
                        {load ? (
                            <Skeleton height={65} />
                        ) : (
                            <Autocomplete
                                className="form-item"
                                options={options}
                                {...iProps}
                                autoComplete={false}
                                filterSelectedOptions
                                getOptionSelected={(option: any, value: any) => {
                                    return option?.[optionKey] === value?.[optionKey];
                                }}
                                getOptionLabel={(option: any) => {
                                    return option?.[optionValue] !== undefined ? option?.[optionValue] : '';
                                }}
                                value={value}
                                onChange={(event: any, newValue: any) => {
                                    setUserInfo && setUserInfo(newValue);
                                    setValue(newValue);
                                    if (iProps?.onChange) {
                                        iProps?.onChange(newValue);
                                    }
                                    if (returnObject) {
                                        props.setValue(fieldName, newValue);
                                    } else {
                                        props.setValue(fieldName, newValue?.[optionKey]);
                                    }
                                }}
                                disabled={disabled}
                                inputValue={inputValue}
                                onInputChange={(event, newInputValue) => {
                                    setInputValue(newInputValue);
                                }}
                                renderInput={(params) => {
                                    let _data = {
                                        ...params,
                                        inputProps: {
                                            ...params.inputProps,
                                            autoComplete: 'off'
                                        }
                                    };
                                    return (
                                        <TextField
                                            {..._data}
                                            error={errors}
                                            variant="outlined"
                                            label={label}
                                            margin="normal"
                                            size="medium"
                                            autoComplete={'off'}
                                            helperText={helperText}
                                        />
                                    );
                                }}
                            />
                        )}
                    </>
                )}
            />
        </>
    );
};

export const AutoCompleteMultipleField = (props: any) => {
    const [load, setLoad] = useState<any>(true);
    const [value, setValue] = React.useState<any>([]);
    const {
        fieldName,
        control,
        iProps,
        rules,
        initValue,
        helperText,
        errors,
        type,
        autoComplete,
        options,
        isLoading,
        optionKey,
        optionValue,
        label,
        ...otherProps
    } = props;

    useEffect(() => {
        props.valueGot && props.setValue(fieldName, props.valueGot);
        if (isLoading) {
            setLoad(false);
            props.setValue(fieldName, props?.valueGot);
        }
        // if (props.valueGot == undefined) {
        //     setValue([]);
        // } else {
        //     setValue(props.valueGot);
        // }
        if (props.valueGot !== undefined) {
            props.setValue(fieldName, props?.valueGot);
            setValue(props?.valueGot);
        }
        if (isLoading == false) {
            setLoad(true);
        }
    }, [props.valueGot, isLoading]);

    return (
        <>
            <Controller
                name={fieldName}
                control={control}
                defaultValue={initValue || initValue === 0 ? initValue : ''}
                rules={rules}
                render={(field) => (
                    <>
                        {load ? (
                            <Skeleton height={65} />
                        ) : (
                            <Autocomplete
                                size="small"
                                multiple
                                value={value}
                                {...iProps}
                                // disabled={props?.disabled ? props?.disabled : false}
                                autoComplete={false}
                                onChange={(event: any, newValue: any) => {
                                    setValue(newValue);
                                    iProps?.onChange(newValue);
                                    props.setValue(fieldName, newValue);
                                }}
                                options={options}
                                getOptionLabel={(option: any) => {
                                    return option?.[optionValue];
                                }}
                                // getOptionSelected={(option: any, value: any) => {
                                //   return option?.[optionKey] === value?.[optionKey];
                                // }}
                                defaultValue={'wqoruiwer'}
                                renderTags={(tagValue, getTagProps) =>
                                    tagValue.map((option: any, index: any) => {
                                        return <Chip size="small" label={option?.[optionValue]} {...getTagProps({ index })} />;
                                    })
                                }
                                renderInput={(params: any) => (
                                    <TextField
                                        {...params}
                                        error={errors}
                                        variant="outlined"
                                        label={label}
                                        margin="normal"
                                        size="medium"
                                        autoComplete={'no'}
                                        helperText={helperText}
                                        disabled={props?.disabled ? props?.disabled : false}
                                    />
                                )}
                                {...otherProps}
                            />
                        )}
                    </>
                )}
            />
        </>
    );
};

export const SwitchFieldDefault = (props: any) => {
    const [load, setLoad] = useState(false);
    const { fieldName, label, control, iProps, rules, initValue, helperText, errors, type, autoComplete, isLoading, defaultChecked } =
        props;

    useEffect(() => {
        props.valueGot && props.setValue(fieldName, props.valueGot);
        if (props.valueGot || props.valueGot === '' || props.valueGot === null || isLoading) setLoad(false);
    }, [props.valueGot]);

    return (
        <>
            <Controller
                name={fieldName}
                control={control}
                defaultValue={initValue || initValue === 0 ? initValue : ''}
                rules={rules}
                render={({ field }) => (
                    <>
                        {load ? (
                            <Skeleton height={90} />
                        ) : (
                            <>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e.target.checked);
                                                iProps?.onChange(e.target.checked);
                                            }}
                                            defaultChecked={defaultChecked}
                                            checked={field.value}
                                            id={fieldName}
                                            disabled={props?.disabled ? props?.disabled : false}
                                        />
                                    }
                                    label={label}
                                />
                                {helperText && (
                                    <FormHelperText error={errors} id={fieldName}>
                                        {helperText}
                                    </FormHelperText>
                                )}
                            </>
                        )}
                    </>
                )}
            />
        </>
    );
};
// export const SwitchField = (props: any) => {
//   const [load, setLoad] = useState(true);
//   const [isChecked, setIsChecked] = useState(false);
//   const {
//     fieldName,
//     label,
//     control,
//     iProps,
//     rules,
//     initValue,
//     helperText,
//     errors,
//     type,
//     autoComplete,
//     isLoading,
//     checked
//   } = props;

//   useEffect(() => {
//     props.valueGot && props.setValue(fieldName, checked);
//     if (
//       props.valueGot ||
//       props.valueGot === "" ||
//       props.valueGot === null
//     ) {
//       setLoad(false);
//       setIsChecked(checked)
//     }
//   }, [props.valueGot]);

//   return (
//     <>
//       <Controller
//         name={fieldName}
//         control={control}
//         defaultValue={initValue || initValue === 0 ? initValue : ""}
//         rules={rules}
//         render={({ field }) => (
//           <>

//             <Switch
//               {...field}
//               {...iProps}
//               onChange={(e) => {
//                 field.onChange(e)
//                 iProps?.onChange(e)
//                 setIsChecked(!isChecked)
//               }}
//               checked={isChecked}
//               id={fieldName}
//               label={label}
//             />
//             {helperText && <FormHelperText error={errors} id={fieldName}>{helperText}</FormHelperText>}

//           </>
//         )}
//       />
//     </>
//   );
// };
export const SwitchField = (props: any) => {
    const [load, setLoad] = useState(true);
    const [isChecked, setIsChecked] = useState(false);
    const { fieldName, label, control, iProps, rules, initValue, helperText, errors, type, autoComplete, isLoading, checked } = props;

    useEffect(() => {
        props.valueGot && props.setValue(fieldName, checked);
        if (props.valueGot || props.valueGot === '' || props.valueGot === null || isLoading) {
            setLoad(false);
            setIsChecked(checked);
        }
    }, [props.valueGot]);

    return (
        <>
            <Controller
                name={fieldName}
                control={control}
                defaultValue={initValue || initValue === 0 ? initValue : ''}
                rules={rules}
                render={({ field }) => (
                    <>
                        {load ? (
                            <Skeleton height={90} />
                        ) : (
                            <>
                                <Switch
                                    {...field}
                                    {...iProps}
                                    onChange={(e) => {
                                        field.onChange(e);
                                        iProps?.onChange(e);
                                        setIsChecked(!isChecked);
                                    }}
                                    checked={isChecked}
                                    id={fieldName}
                                    label={label}
                                    disabled={props?.disabled ? props?.disabled : false}
                                />
                                {helperText && (
                                    <FormHelperText error={errors} id={fieldName}>
                                        {helperText}
                                    </FormHelperText>
                                )}
                            </>
                        )}
                    </>
                )}
            />
        </>
    );
};
// export const TextEditorField = (props: any) => {
//   const {
//     fieldName,
//     initValue,
//     control,
//     errors,
//     rules,
//     isLoading,
//     className,
//     helperText,
//     initialValue
//   } = props;
//   const [load, setLoad] = useState(true);
//   const [value, setValue] = useState<any>('')
//   useEffect(() => {

//     if (props.valueGot) {
//       props.valueGot && props.setValue(fieldName, props.valueGot);
//       setValue(props.valueGot)
//     }
//     if (isLoading)
//       setLoad(false);
//   }, [props.valueGot, isLoading]);

//   return (
//     <div className={className}>
//       <Controller

//         name={fieldName}
//         control={control}
//         defaultValue={initValue || initValue === 0 ? initValue : ""}
//         rules={rules}
//         render={({ field }) => (
//           <>
//             {load ? (
//               <Skeleton height={90} />
//             ) : (
//               <Editor
//                 apiKey="2lsoue1ha24xltn4wqeql7iuwoqc8ygldmun39lg3jengd3w"
//                 textareaName={fieldName}
//                 value={value}
//                 disabled={props?.disabled ? props?.disabled : false}
//                 onEditorChange={(newText) => { setValue(newText); props.setValue(fieldName, newText) }}
//                 initialValue={initialValue}
//                 init={{
//                   plugins: "emoticons textcolor",
//                   toolbar: 'undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | outdent indent | emoticons |forecolor',
//                   toolbar_location: "top",
//                   menubar: false,
//                 }
//                 }
//               />

//             )}
//             {errors && <FormHelperText error={errors} >{helperText}</FormHelperText>}
//           </>

//         )}

//       />
//     </div>
//   )
// }
export const TimePickerField = (props: any) => {
    const { fieldName, label, control, iProps, rules, initValue, helperText, errors, isLoading } = props;
    const [load, setLoad] = useState(true);
    useEffect(() => {
        props.valueGot && props.setValue(fieldName, props.valueGot);
        if (props.valueGot || props.valueGot === '' || props.valueGot === null || isLoading) setLoad(false);
    }, [props.valueGot]);

    return (
        <>
            <Controller
                name={fieldName}
                control={control}
                defaultValue={initValue || initValue === 0 ? initValue : ''}
                rules={rules}
                render={({ field }: any) => (
                    <TimePicker
                        {...field}
                        label={label}
                        {...iProps}
                        helperText={helperText}
                        error={errors}
                        KeyboardButtonProps={{
                            'aria-label': 'change date'
                        }}
                        disabled={props?.disabled ? props?.disabled : false}
                        renderInput={(params: any) => <TextField size="medium" helperText={helperText} fullWidth {...params} />}
                    />
                    // <TimePicker
                    //   {...field}
                    //   renderInput={(props: any) => <TextField {...props} margin="normal" inputVariant="outlined" size="small" />}
                    //   label={label}
                    //   {...iProps}
                    //   margin="normal" inputVariant="outlined"
                    //   size="small"
                    //   clearable={true}
                    //   helperText={helperText}
                    //   fullWidth
                    //   error={errors}
                    // />
                )}
            />
        </>
    );
};
export const CheckboxField = (props: any) => {
    const { fieldName, label, control, iProps, rules, initValue, helperText, errors, isLoading, checked } = props;
    const [load, setLoad] = useState(true);
    const [isChecked, setIsChecked] = useState(false);
    useEffect(() => {
        props.valueGot && props.setValue(fieldName, props.valueGot);
        if (props.valueGot || props.valueGot === '' || props.valueGot === null || isLoading) setLoad(false);
    }, [props.valueGot]);

    return (
        <>
            <Controller
                name={fieldName}
                control={control}
                defaultValue={initValue || initValue === 0 ? initValue : ''}
                rules={rules}
                render={({ field }: any) => (
                    <FormControlLabel
                        control={
                            <Checkbox
                                {...field}
                                {...iProps}
                                helperText={helperText}
                                name={fieldName}
                                onChange={(e) => {
                                    field.onChange(e);
                                    // iProps?.onChange(e)
                                    setIsChecked(!isChecked);
                                }}
                                checked={field.value}
                                error={errors}
                                style={{ color: '#39a9a5' }}
                                // #39a9a5
                                // sx={{ color: '#39a9a5' }}
                            />
                        }
                        label={label}
                    />

                    // <Checkbox
                    //   {...field}
                    //   {...iProps}
                    //   helperText={helperText}
                    //   name={fieldName}
                    //   checked={checked}
                    //   error={errors}
                    //   label={label}
                    // />
                )}
            />
        </>
    );
};
export const RadioField = (props: any) => {
    const { fieldName, label, control, iProps, rules, initValue, helperText, errors, isLoading, checked } = props;
    const [load, setLoad] = useState(true);
    useEffect(() => {
        props.valueGot && props.setValue(fieldName, props.valueGot);
        if (props.valueGot || props.valueGot === '' || props.valueGot === null || isLoading) setLoad(false);
    }, [props.valueGot, checked]);

    return (
        <>
            <Controller
                name={fieldName}
                control={control}
                defaultValue={initValue || initValue === 0 ? initValue : ''}
                render={({ field }) => {
                    const { name, onBlur, onChange, value } = field;
                    return (
                        <RadioGroup
                            value={value}
                            onBlur={onBlur}
                            onChange={(e) => {
                                onChange(e);
                            }}
                        >
                            <FormControlLabel value="" control={<Radio />} label="Business" />
                        </RadioGroup>
                    );
                }}
            />
        </>
    );
};

// export const GenericRadioGroup = ({ label, options, defaultValue, onChange, ...props }: any) => {
//     return (
//         <FormControl sx={{ m: '24px' }}>
//             <FormLabel id="row-radio-buttons-group-label">{label}</FormLabel>
//             <RadioGroup
//                 row
//                 aria-labelledby="row-radio-buttons-group-label"
//                 name="row-radio-buttons-group"
//                 defaultValue={defaultValue}
//                 onChange={onChange}
//                 {...props}
//             >
//                 {options.map((option: any) => (
//                     <FormControlLabel
//                         key={option.value}
//                         value={option.value}
//                         control={<Radio />}
//                         label={option.label}
//                         disabled={option.disabled}
//                     />
//                 ))}
//             </RadioGroup>
//         </FormControl>
//     );
// };

export const GenericRadioGroup = ({ label, options, defaultValue, fieldName, ...props }: any) => {
    return (
        <FormControl sx={{ m: '24px' }}>
            <FormLabel id="row-radio-buttons-group-label">{label}</FormLabel>
            <Controller
                name={fieldName}
                control={props.control}
                defaultValue={defaultValue}
                render={({ field }: any) => (
                    <RadioGroup
                        row
                        aria-labelledby="row-radio-buttons-group-label"
                        name="row-radio-buttons-group"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                    >
                        {options.map((option: any) => (
                            <FormControlLabel
                                key={option.value}
                                value={option.value}
                                control={<Radio />}
                                label={option.label}
                                disabled={option.disabled || props.disabled}

                                // disabled={option.disabled}
                            />
                        ))}
                    </RadioGroup>
                )}
            />
        </FormControl>
    );
};

// export const MuiDatePicker = ({ label, name, control, error }: any) => {
//     return (
//         <div>
//             <Controller
//                 name={name}
//                 control={control}
//                 defaultValue={null}
//                 render={({ field }) => (
//                     <DesktopDatePicker
//                         // {...field}
//                         // renderInput={(params: any) => (
//                         //     <TextField {...params} label={label} error={!!error} helperText={error ? error.message : ''} />
//                         // )}

//                         {...field}
//                         label={label}
//                         helperText={helperText}
//                         error={errors}
//                         value={value}
//                         onChange={(e) => {
//                             field?.onChange(e);
//                             setValue(e);
//                             iProps?.onChange && iProps?.onChange(e);
//                         }}
//                         KeyboardButtonProps={{
//                             'aria-label': 'change date'
//                         }}
//                         renderInput={(params: any) => (
//                             <TextField size="medium" helperText={helperText} fullWidth {...params} error={errors} />
//                         )}
//                     />
//                 )}
//             />
//         </div>
//     );
// };

export const MuiDatePicker = ({ label, name, control, error, helperText, margin, iProps, disabled }: any) => {
    return (
        <div style={{ margin: margin }}>
            <Controller
                name={name}
                control={control}
                defaultValue={null}
                render={({ field }) => (
                    <DesktopDatePicker
                        label={label}
                        // helperText={helperText}
                        value={field.value}
                        disabled={disabled}
                        onChange={(date) => {
                            field.onChange(date);
                            iProps?.onChange && iProps.onChange(date);
                        }}
                        // KeyboardButtonProps={{
                        //     'aria-label': 'change date'
                        // }}
                        renderInput={(params: any) => (
                            <TextField size="medium" helperText={helperText} fullWidth {...params} error={error} />
                        )}
                    />
                )}
            />
        </div>
    );
};
