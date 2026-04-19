export const template = `<!DOCTYPE html
PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>User Email Template</title>
</head>

<body>
<table cellpadding="0" cellspacing="0" width="550" align="center">
    <tr>
        <td>
            <table cellpadding="0" bgcolor="#fff" cellspacing="0" width="100%" align="center"   style="background:#e3204a;">
                <tbody>
                    <tr>
                        <td height="40">&nbsp;</td>
                    </tr>
                    <tr align="center">
                        <td>
                        <img align="middle"
                                src="https://www.digitalgravity.ae/assets/images/dglogo.gif"
                                alt="logo">
                        </td>
                    </tr>
                    <tr>
                        <td height="40">&nbsp;</td>
                    </tr>
                </tbody>
            </table>

            <table width="100%" cellspacing="0" cellpadding="30" align="center" bgcolor="#f7f7f9"
                style="font-family:Arial, Helvetica, sans-serif;">
                <tbody>
                    <tr>
                        <tr>
                            <td style=" font-size: 22px; color: black; font-weight: bold; text-align: center"
                                align="center">[replaceHeader]</td>
                        </tr>
                      
                        <td>
                            Dear [replaceUserName],<br><br><br>

                            [message]
                            <br>
                            <br>
                            Have a great day!<br><br><br>

                            Sincerely, <br><br>
                            Team WorkSphere 360<br>
                           
                        </td>
                    </tr>
                </tbody>
            </table>
            <table>
                <tr>
                    <td height="10" style="line-height:9px">&nbsp;</td>
                </tr>
            </table>
            <table cellpadding="0" align="center" cellspacing="0" height="30" width="100%">
                <tr>
                    <td align="center" headers="20"
                        style="background:#e3204a; color:#FFF; font-size:14px; line-height:9px; font-family:Arial, Helvetica, sans-serif;">
                        All rights are reserved for WorkSphere 360.</td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>

</html>`;
