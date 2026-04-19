import { Button, Grid, Stack } from '@mui/material';
import { useForm } from 'react-hook-form';
import SubCard from 'ui-component/cards/SubCard';
import { TextFieldControlled } from 'ui-component/formsField/FormFields';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { yupResolver } from '@hookform/resolvers/yup';
import { createScreenValidation } from './Validation';
import { createScreen } from 'services/screenService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';

const ScreenManage = () => {
    const defautlFormValues = {
        status: true
    };
    const {
        control,
        register,
        reset,
        setError,
        formState: { errors },
        setValue,
        getValues,
        handleSubmit
    } = useForm<any>({
        mode: 'onChange',
        reValidateMode: 'onChange',
        //Validations=================>
        defaultValues: defautlFormValues,
        resolver: yupResolver(createScreenValidation)
    });

    const navigate = useNavigate();

    const onSubmit = (data: any) => {
        createScreen(data).then((res) => {
            toast.success('Screen Created Succssfully!');
            navigate('/dashboard/default');
        });
    };

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                <SubCard>
                    <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                        <Grid item xs={6} md={6} sm={6}>
                            <TextFieldControlled
                                errors={!!errors?.name}
                                fullWidth={true}
                                fieldName="name"
                                type="text"
                                autoComplete="off"
                                label="Name *"
                                control={control}
                                valueGot={''}
                                setValue={setValue}
                                helperText={errors?.name && errors?.name?.message}
                            />
                        </Grid>
                        <Grid item xs={6} md={6} sm={6}>
                            <TextFieldControlled
                                errors={!!errors?.child}
                                fullWidth={true}
                                fieldName="child"
                                type="text"
                                autoComplete="off"
                                label="Child *"
                                control={control}
                                valueGot={''}
                                setValue={setValue}
                                helperText={errors?.child && errors?.child?.message}
                            />
                        </Grid>

                        <Grid item xs={6} md={6} sm={6}>
                            <TextFieldControlled
                                errors={!!errors?.route}
                                fullWidth={true}
                                fieldName="route"
                                type="text"
                                autoComplete="off"
                                label="Route *"
                                control={control}
                                valueGot={''}
                                setValue={setValue}
                                helperText={errors?.route && errors?.route?.message}
                            />
                        </Grid>

                        <Grid item xs={6} md={12} sm={6} sx={{ mt: 2 }}>
                            <Grid sx={{ mb: 3 }} container spacing={3} direction="row" justifyContent="flex-end" alignItems="center">
                                <Grid container direction="row" justifyContent="flex-end" alignItems="flex-end">
                                    <Stack direction="row">
                                        <AnimateButton>
                                            <Button variant="contained" type="submit" sx={{ m: 3 }} className={'red'}>
                                                save
                                            </Button>
                                        </AnimateButton>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </SubCard>
            </form>
        </>
    );
};

export default ScreenManage;
