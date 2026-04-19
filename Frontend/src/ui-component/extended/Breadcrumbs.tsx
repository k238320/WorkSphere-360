import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Card, Divider, Grid, Typography } from '@mui/material';
import MuiBreadcrumbs from '@mui/material/Breadcrumbs';

// project imports
import { BASE_PATH } from 'config';
import { gridSpacing } from 'store/constant';

// assets
import { IconTallymark1 } from '@tabler/icons';
import AccountTreeTwoToneIcon from '@mui/icons-material/AccountTreeTwoTone';
import HomeIcon from '@mui/icons-material/Home';
import HomeTwoToneIcon from '@mui/icons-material/HomeTwoTone';

const linkSX = {
    display: 'flex',
    color: 'grey.900',
    textDecoration: 'none',
    alignContent: 'center',
    alignItems: 'center'
};

interface BreadCrumbSxProps extends React.CSSProperties {
    mb?: string;
    bgcolor?: string;
}

interface BreadCrumbsProps {
    card?: boolean;
    divider?: boolean;
    icon?: boolean;
    icons?: boolean;
    maxItems?: number;
    navigation?: any;
    rightAlign?: boolean;
    separator?: any;
    title?: boolean;
    titleBottom?: boolean;
    sx?: BreadCrumbSxProps;
    heading?: string;
    name?: string;
}

// ==============================|| BREADCRUMBS ||============================== //

const Breadcrumbs = ({
    card,
    divider,
    icon,
    icons,
    maxItems,
    navigation,
    rightAlign,
    separator,
    title,
    titleBottom,
    heading,
    name,
    ...others
}: BreadCrumbsProps) => {
    const theme: any = useTheme();

    const iconStyle = {
        marginRight: theme.spacing(0.75),
        marginTop: `-${theme.spacing(0.25)}`,
        width: '16px',
        height: '16px',
        color: theme.palette.secondary.main
    };

    const [main, setMain] = useState<any | undefined>();
    const [item, setItem] = useState<any>();

    useEffect(() => {
        navigation?.items?.map((menu: any | any, index: number) => {
            if (menu.type && menu.type === 'group') {
                getCollapse(menu as { children: any[]; type?: string });
            }
            return false;
        });
    });

    // set active item state

    const getCollapse = (menu: any) => {
        if (menu.children) {
            menu.children.filter((collapse: any) => {
                if (collapse.type && collapse.type === 'collapse') {
                    getCollapse(collapse as { children: any[]; type?: string });
                } else if (collapse.type && collapse.type === 'item') {
                    if (document.location.pathname === BASE_PATH + collapse.url) {
                        setMain(menu);
                        setItem(collapse);
                    }
                }
                return false;
            });
        }
    };

    // item separator
    const SeparatorIcon = separator!;
    const separatorIcon = separator ? <SeparatorIcon stroke={1.5} size="16px" /> : <IconTallymark1 stroke={1.5} size="16px" />;

    let mainContent;
    let itemContent;
    let breadcrumbContent: React.ReactElement = <Typography />;
    let itemTitle: any['title'] = '';
    let CollapseIcon;
    let ItemIcon;

    // collapse item
    if (main && main.type === 'collapse') {
        CollapseIcon = main.icon ? main.icon : AccountTreeTwoToneIcon;
        mainContent = (
            <Typography component={Link} to="#" variant="subtitle1" sx={linkSX}>
                {icons && <CollapseIcon style={iconStyle} />}
                {main.title}
            </Typography>
        );
    }

    // items
    // if (item && item.type === 'item') {
    // itemTitle = item.title;

    // ItemIcon = item.icon ? item.icon : AccountTreeTwoToneIcon;
    itemContent = (
        <Typography
            variant="subtitle1"
            sx={{
                display: 'flex',
                textDecoration: 'none',
                alignContent: 'center',
                alignItems: 'center',
                color: 'grey.500'
            }}
        >
            {/* {icons && <ItemIcon style={iconStyle} />} */}
            {/* {itemTitle} */}

            {heading}
        </Typography>
    );
    // }

    // main
    // if (item.breadcrumbs !== false) {
    breadcrumbContent = (
        <Card
            sx={{
                marginBottom: card === false ? 0 : theme.spacing(gridSpacing),
                // border: card === false ? 'none' : '1px solid',
                // borderColor: theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.primary[200] + 75,
                background: card === false ? 'transparent' : theme.palette.background.default
            }}
            {...others}
        >
            <Box sx={{ p: 2, pl: card === false ? 0 : 2 }}>
                <Grid
                    container
                    direction={rightAlign ? 'row' : 'column'}
                    justifyContent={rightAlign ? 'space-between' : 'flex-start'}
                    alignItems={rightAlign ? 'center' : 'flex-start'}
                    spacing={1}
                >
                    {title && !titleBottom && (
                        <Grid item>
                            <>
                                {name && (
                                    <Typography variant="h3" sx={{ fontWeight: 500 }}>
                                        {/* {item.title} */}
                                        {heading + ' ' + name}
                                    </Typography>
                                )}
                                {name == undefined && (
                                    <Typography variant="h3" sx={{ fontWeight: 500 }}>
                                        {/* {item.title} */}
                                        {heading}
                                    </Typography>
                                )}
                            </>
                        </Grid>
                    )}
                    <Grid item>
                        <MuiBreadcrumbs
                            sx={{ '& .MuiBreadcrumbs-separator': { width: 16, ml: 1.25, mr: 1.25 } }}
                            aria-label="breadcrumb"
                            maxItems={maxItems || 8}
                            separator={separatorIcon}
                        >
                            <Typography component={Link} to="/" color="inherit" variant="subtitle1" sx={linkSX}>
                                {icons && <HomeTwoToneIcon sx={iconStyle} />}
                                {icon && <HomeIcon sx={{ ...iconStyle, mr: 0 }} />}
                                {!icon && 'Dashboard'}
                            </Typography>
                            {mainContent}
                            {itemContent}
                        </MuiBreadcrumbs>
                    </Grid>
                    {title && titleBottom && (
                        <Grid item>
                            <Typography variant="h3" sx={{ fontWeight: 500 }}>
                                {/* {item.title} */}
                                Title
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            </Box>
            {card === false && divider !== false && <Divider sx={{ borderColor: theme.palette.primary.main, mb: gridSpacing }} />}
        </Card>
    );
    // }
    // }

    return breadcrumbContent;
};

export default Breadcrumbs;
