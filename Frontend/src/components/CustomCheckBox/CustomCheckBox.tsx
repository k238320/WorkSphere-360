import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import Checkbox from '@mui/material/Checkbox';

const CustomCheckBox = ({ label, name, id, control, defaultChecked = false }: any) => {
    return (
        <div>
            {/* <input type="hidden" {...control.register(name)} value={JSON.stringify({ id, checked: defaultChecked })} /> */}
            {/* <input type="hidden" {...control.register(name)} value={{ id, checked: defaultChecked }} /> */}
            <Controller
                name={`${name}`}
                control={control}
                defaultValue={defaultChecked}
                render={({ field }) => (
                    <Checkbox
                        {...field}
                        checked={field.value}
                        disabled={defaultChecked}
                        onChange={(e) => {
                            const updatedValue = { id, checked: e.target.checked };
                            field.onChange(updatedValue);
                            console.log(updatedValue);
                        }}
                    />
                )}
            />
            <label>{label}</label>
        </div>
    );
};

export default CustomCheckBox;
