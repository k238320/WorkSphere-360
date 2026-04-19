import { memo, useEffect, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Typography, useMediaQuery } from '@mui/material';

// project imports
import menuItem from 'menu-items';
import NavGroup from './NavGroup';
import useConfig from 'hooks/useConfig';
import { DashboardMenu } from 'menu-items/dashboard';

import LAYOUT_CONST from 'constant';
import { HORIZONTAL_MAX_ITEM } from 'config';

// ==============================|| SIDEBAR MENU LIST ||============================== //

const MenuList = () => {
    const theme: any = useTheme();
    const { layout } = useConfig();

    const matchDownMd = useMediaQuery(theme.breakpoints.down('md'));

    const [menuItems, setMenuItems] = useState<{ items: any[] }>({
        items: []
    });
    const local: any = localStorage.getItem('user');
    const user = JSON.parse(local);

    useEffect(() => {
        handlerMenuItem();
        // eslint-disable-next-line
    }, [user?.role_id]);

    useEffect(() => {
        setMenuItems(menuItem);
    }, [user?.role_id]);

    let getDash = DashboardMenu();
    const handlerMenuItem = () => {
        const isFound = menuItem.items.some((element) => {
            if (element.id === 'dashboard') {
                return true;
            }
            return false;
        });

        if (getDash?.id !== undefined && !isFound) {
            menuItem.items.splice(0, 0, getDash);
        }
    };

    // last menu-item to show in horizontal menu bar
    const lastItem = layout === LAYOUT_CONST.HORIZONTAL_LAYOUT && !matchDownMd ? HORIZONTAL_MAX_ITEM : null;

    let lastItemIndex = menuItems.items.length - 1;
    let remItems: any[] = [];
    let lastItemId: string;

    if (lastItem && lastItem < menuItems.items.length) {
        lastItemId = menuItems.items[lastItem - 1].id!;
        lastItemIndex = lastItem - 1;
        remItems = menuItems.items.slice(lastItem - 1, menuItems.items.length).map((item) => ({
            title: item.title,
            elements: item.children
        }));
    }

    const navItems = menuItems.items.slice(0, lastItemIndex + 1).map((item) => {
        switch (item.type) {
            case 'group':
                return <NavGroup key={item.id} item={item} lastItem={lastItem!} remItems={remItems} lastItemId={lastItemId} />;
            default:
                return (
                    <Typography key={item.id} variant="h6" color="error" align="center">
                        Menu Items Error
                    </Typography>
                );
        }
    });

    return <>{navItems}</>;
};

export default memo(MenuList);
