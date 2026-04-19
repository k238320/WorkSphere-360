// material-ui
import { useTheme } from '@mui/material/styles';
import MySVGComponent from 'assets/images/dg-logo.svg';

/**
 * if you want to use image instead of <svg> uncomment following.
 *
 * import logoDark from 'assets/images/logo-dark.svg';
 * import logo from 'assets/images/logo.svg';
 *
 */

// ==============================|| LOGO SVG ||============================== //

const Logo = () => {
    const theme = useTheme();

    return <img src={MySVGComponent} alt="Logo" width="130" />;
};

export default Logo;
