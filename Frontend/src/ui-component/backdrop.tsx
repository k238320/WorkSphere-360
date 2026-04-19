// **
// *
// * BackDrop
// *
// */
import * as React from 'react';
import { Backdrop, CircularProgress } from '@mui/material';
import useAuth from 'hooks/useAuth'
import { useSelector } from 'react-redux';

interface Props { }

export default function BackDrop(props: Props) {
    const spinLoaderShow: any = useSelector(
        (state: any) => state?.spinLoader?.spinLoaderShow
    );
    return (
        <div>
            <Backdrop
                className="back-drop"
                style={{ zIndex: 1200 }}
                open={spinLoaderShow}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </div>
    );

};