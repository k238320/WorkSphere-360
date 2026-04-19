import React, {
    useState,
    useEffect,
    forwardRef,
    useImperativeHandle,
  } from "react";

 
import { TextField } from "@mui/material";
import { DateTimePicker } from "@mui/lab";
  
  export default forwardRef((props:any, ref:any) => {
    const [selectedDate, setSelectedDate] = useState(null);
  
    function handleDateChange(d:any) {
  
      setSelectedDate(d);
    }
  
    useEffect(props.onDateChanged, [selectedDate]);
  
    useImperativeHandle(ref, () => {
      return {
        getDate: () => {
          return selectedDate;
        },
        setDate: (d:any) => {
          handleDateChange(d);
        },
      };
    });
  
    return (
        <DateTimePicker 
        label="DateTimePicker"
          value={selectedDate}
          onChange={handleDateChange}
          ampm={false}
          renderInput={(params:any) => <TextField size='medium'  fullWidth  {...params} />}
     
          />
    );
  });
  