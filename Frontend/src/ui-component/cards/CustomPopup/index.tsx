/**
 *
 * CustomPopup
 *
 */
import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { makeStyles } from '@mui/styles';
// import { Typography } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { Typography } from '@mui/material';
// import useHistory  from 'react-router-dom';
// import { useHistory } from 'react-router-dom';

interface Props {}

const styles: any = {
    dialog88: {
        // zIndex: "1000 !important"
    }
};
const useStyles = makeStyles(styles);
export function CustomPopup(props: any) {
    const dispatch = useDispatch();
    // const history = useHistory()
    const classes = useStyles();
    const { handleClose, open, title, editData } = props;
    return (
        <Dialog
            className={classes.dialog88}
            maxWidth={'sm'}
            scroll={'body'}
            fullWidth={true}
            open={open}
            onClose={handleClose}
            aria-labelledby="form-dialog-title"
        >
            <DialogTitle id="form-dialog-title">
                <Typography variant="h2" align={'justify'} gutterBottom>
                    {title}
                </Typography>
            </DialogTitle>
            <DialogContent style={{ overflow: 'hidden' }}>{props.content}</DialogContent>
        </Dialog>
    );
}
