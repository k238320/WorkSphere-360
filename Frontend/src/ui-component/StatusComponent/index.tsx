import React, { useState } from "react";
// @material-ui/core components
import { makeStyles } from '@mui/styles';
import { useEffect } from "react";
import { Chip } from "@mui/material";


const styles: any = {
  success: {
    backgroundColor: "#81c784",
    color: "#fff",
    textTransform: "capitalize",
    // marginTop: 15,
    marginLeft: 30,
  },
  danger: {
    backgroundColor: "#f44336",
    color: "#fff",
    textTransform: "capitalize",
    // marginTop: 15,
    marginLeft: 30,
  },
  aligment: {


  }
};


interface Props { data: any | null }
const useStyles: any = makeStyles(styles);
export function StatusComponent(props: Props) {
  const classes = useStyles();
  const { data } = props;
  const [statusColor, setStatusColor] = useState<any>()
  useEffect(() => {
    if (data == 'Active' || data == true) {  

      
      setStatusColor(classes.success)
    } else if (data == 'Inactive' || data == false || data == null) {
      setStatusColor(classes.danger)
    }
  }, [props]); 
  return (<Chip
    className={statusColor}
    //color={statusColor}
    label={data == true || data == 'Active' ? 'Active' : 'Inactive'}
    size="small"
  />);;
}


