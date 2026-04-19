import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import { Button, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import SubCard from 'ui-component/cards/SubCard';
import MainCard from 'ui-component/cards/MainCard';
import { getComments, postComments } from 'services/Allocation/taskServices';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { toast } from 'react-toastify';

interface ICommentsTabProps {
    taskId: string;
}

const CommentsTab = ({ taskId }: ICommentsTabProps) => {
    const dispatch = useDispatch();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    const localStorageData: any = localStorage.getItem('user');
    const localStorageuser = JSON.parse(localStorageData);

    useEffect(() => {
        if (taskId) {
            getTaskComments();
        }
    }, [taskId]);

    const getTaskComments = async () => {
        dispatch(spinLoaderShow(true));
        getComments(taskId)
            .then((res: any) => {
                if (res?.comments?.length > 0) {
                    setMessages(res?.comments);
                }
                dispatch(spinLoaderShow(false));
            })
            .catch((err) => {
                toast.error(err);
                dispatch(spinLoaderShow(false));
            });
    };

    const handleInputChange = (event: any) => {
        setNewMessage(event.target.value);
    };

    const handleSendMessage = async () => {
        if (newMessage?.trim() !== '') {
            const data = {
                resource_id: localStorageuser?.resource_id,
                name: localStorageuser?.name ?? '',
                message: newMessage.trim(),
                created_at: new Date(),
                role: localStorageuser?.role?.name ?? ''
            };

            const clone = JSON.parse(JSON.stringify(messages));
            clone?.push(data);

            dispatch(spinLoaderShow(true));

            postComments(taskId, clone)
                .then(async (res) => {
                    await getTaskComments();
                    dispatch(spinLoaderShow(false));
                    setNewMessage('');
                })
                .catch((err) => {
                    toast.error(err);
                    dispatch(spinLoaderShow(false));
                });
        } else {
            toast.error('Kindly enter comment');
        }
    };

    return (
        <SubCard sx={{ marginTop: '20px' }}>
            <Grid item xs={12} md={12} sm={12}>
                <Grid container spacing={1}>
                    <Grid item xs={12}>
                        <MainCard content={false}>
                            <TableContainer>
                                <Table sx={{ minWidth: 350 }} aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell
                                                sx={{
                                                    pl: 3,
                                                    width: '20%',
                                                    borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                                                }}
                                                size="medium"
                                            >
                                                <Typography fontWeight={'700'} fontSize={'16px'}>
                                                    Date
                                                </Typography>
                                            </TableCell>
                                            <TableCell size="medium" sx={{ width: '50%', borderRight: '1px solid rgba(0, 0, 0, 0.1)' }}>
                                                <Typography fontWeight={'700'} fontSize={'16px'}>
                                                    Comment
                                                </Typography>
                                            </TableCell>
                                            <TableCell size="medium" sx={{ width: '15%', borderRight: '1px solid rgba(0, 0, 0, 0.1)' }}>
                                                <Typography fontWeight={'700'} fontSize={'16px'}>
                                                    Commentor
                                                </Typography>
                                            </TableCell>
                                            <TableCell size="medium" sx={{ width: '15%' }}>
                                                <Typography fontWeight={'700'} fontSize={'16px'}>
                                                    Role
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {messages &&
                                            messages?.map((row: any, index: number) => (
                                                <TableRow hover key={index}>
                                                    <TableCell sx={{ pl: 3, borderRight: '1px solid rgba(0, 0, 0, 0.1)' }} size="medium">
                                                        <div className="tasks__date__wrapper">
                                                            <span>{moment(row?.created_at).format('Do MMM, YYYY')}</span>
                                                            <span>{moment(row?.created_at).format('LT')}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell size="medium" sx={{ borderRight: '1px solid rgba(0, 0, 0, 0.1)' }}>
                                                        <Typography fontSize={'16px'}>{row?.message}</Typography>
                                                    </TableCell>
                                                    <TableCell size="medium" sx={{ borderRight: '1px solid rgba(0, 0, 0, 0.1)' }}>
                                                        {row?.name}
                                                    </TableCell>
                                                    <TableCell size="medium">{row?.role}</TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </MainCard>
                    </Grid>
                </Grid>
                <Grid item xs={12} md={12} sm={12} sx={{ mt: '24px' }}>
                    <TextField
                        placeholder="Enter Comment..."
                        multiline={true}
                        rows={2}
                        value={newMessage}
                        onChange={(e) => handleInputChange(e)}
                        style={{ width: '100%', minHeight: '100px' }}
                    />
                    <Button variant="contained" onClick={() => handleSendMessage()} sx={{ float: 'right', marginBottom: '24px' }}>
                        Add
                    </Button>
                </Grid>
            </Grid>
        </SubCard>
    );
};

export default CommentsTab;
