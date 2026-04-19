// import React, { useState } from 'react';
// import Switch from '@mui/material/Switch';
// import OnHoldModel from 'components/OnHoldModel';
// import GenericModal from 'components/uiComopnents/GenericModal/GenericModal';

// const SwitchComponent = () => {
//     const [checked, setChecked] = useState(true);
//     const [openMOdel, setOpenModel] = useState(false);
//     const [open, setOpen] = useState(false);
//     const [modalChildren, setModalChildren] = useState<ReactNode | undefined>(undefined);
//     // const [modalChildren, setModalChildren] = useState();

//     const handleOnHold = () => {
//         // setOpenModel(true);
//         // setModalChildren(<OnHoldModel />);
//         setModalChildren(() => undefined);
//         setOpenModel(true);
//         setModalChildren(() => <OnHoldModel />);
//     };

//     const handleClose = () => {
//         setOpen(false);
//         setModalChildren(() => undefined);
//     };

//     return (
//         <div>
//             <GenericModal isOpen={openMOdel} onClose={handleClose} children={modalChildren} />
//         </div>
//     );
// };

// export default SwitchComponent;

import React, { useState, ReactNode } from 'react';
import Switch from '@mui/material/Switch';
import OnHoldModel from 'components/OnHoldModel';
import GenericModal from 'components/uiComopnents/GenericModal/GenericModal';
import ViewOnHoldModel from 'components/ViewOnHoldModel/ViewOnHoldModel';
import moment from 'moment';

const SwitchComponent = (data: any) => {
    const [checked, setChecked] = useState(false);
    const [openMOdel, setOpenModel] = useState(false);
    const [modalChildren, setModalChildren] = useState<ReactNode>(undefined);

    const handleOnHold = () => {
        setModalChildren(() => undefined);
        setOpenModel(true);
        setModalChildren(() => <OnHoldModel data={data} closingModal={handleClose} setPropsChanged={data?.setPropsChanged} />);
    };

    const handleClose = () => {
        setOpenModel(false);
        setModalChildren(() => undefined);
    };
    const handleViewOnholdDetail = () => {
        setModalChildren(() => undefined);
        setOpenModel(true);
        setModalChildren(() => <ViewOnHoldModel data={data} />);
    };
    // console.log(moment().isSameOrAfter(moment(data?.data?.onhold?.[0]?.dateend)), 'checcccccc');
    // console.log(moment().isSameOrAfter(moment('2023-12-03')), 'checcccccc');

    return (
        <div>
            <Switch
                checked={data?.data?.onhold?.[0]?.permanentlyhold}
                // onChange={() => setChecked(!checked)}
                onClick={
                    data?.data?.onhold?.[0]?.permanentlyhold === null ||
                    data?.data?.onhold?.[0]?.permanentlyhold === undefined ||
                    data?.data?.onhold?.[0]?.permanentlyhold === false
                        ? handleOnHold
                        : () => {}
                }
                disabled={data?.disabled}
            />
            <p onClick={handleViewOnholdDetail} style={{ cursor: 'pointer' }}>
                view reason*
            </p>
            <GenericModal isOpen={openMOdel} onClose={handleClose} children={modalChildren} />
        </div>
    );
};

export default SwitchComponent;
