/* eslint-disable prettier/prettier */
import { yupResolver } from '@hookform/resolvers/yup';
import { Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { createFinanceWeeklystatus, getFinanceWeeklystatusId } from 'services/projectService';
import { AdditionalHoursComponent } from './AdditionalHours';
import { ProjectMilestoneComponent } from './ProjectMilestone';
import { FinanceValidation } from './Validation';
import { getDepartmentCategory, getHoursCategory } from 'services/categoryService';
import { useDispatch } from 'react-redux';
import { spinLoaderShow } from 'store/actions/spinLoader';
import useAuth from 'hooks/useAuth';
import MilestoneCommentsList from './MilestoneCommentsList';

export function FinanceComponent({ projectId }: { projectId: any }) {
    const dispatch = useDispatch();

    const [hoursCategory, setHoursCategory] = useState<any>([]);
    const [departmentCategory, setDepartmentCategory] = useState<any>([]);

    const [weeklyData, setWeeklyData] = useState<any>([]);
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
        resolver: yupResolver(FinanceValidation)
    });

    const { user } = useAuth();

    const [permission, setPermission] = useState({
        modules: {},
        permission: {
            id: '',
            name: ''
        }
    });

    useEffect(() => {
        const rolePermission: any = user?.role_mapping?.find((x: any) => x?.modules?.name == 'For Finance');
        setPermission(rolePermission);
    }, [projectId]);

    useEffect(() => {
        getHourCategoryData();
        getDepartmentData();
        getWeeklyStatus();
    }, []);

    //Project get Hour Category Data =============>

    const getHourCategoryData = async () => {
        dispatch(spinLoaderShow(true));
        getHoursCategory()
            .then((res: any) => {
                setHoursCategory(res);
                dispatch(spinLoaderShow(false));
            })
            .catch((err) => {
                toast.error(err);
                dispatch(spinLoaderShow(false));
            });
    };
    //Project get DepartmentData =============>

    const getDepartmentData = async () => {
        dispatch(spinLoaderShow(true));
        getDepartmentCategory()
            .then((res: any) => {
                setDepartmentCategory(res);
                dispatch(spinLoaderShow(false));
            })
            .catch((err) => {
                toast.error(err);
                dispatch(spinLoaderShow(false));
            });
    };
    const getWeeklyStatus = async () => {
        dispatch(spinLoaderShow(true));
        getFinanceWeeklystatusId(projectId)
            .then((res: any) => {
                setWeeklyData(res);
                dispatch(spinLoaderShow(false));
            })
            .catch((err) => {
                toast.error(err);
                dispatch(spinLoaderShow(false));
            });
    };
    // create admin data
    const createonSubmit = (data: any) => {
        dispatch(spinLoaderShow(true));
        createFinanceWeeklystatus(data)
            .then((res: any) => {
                getWeeklyStatus();
                toast.success('Record inserted Successfully');
                dispatch(spinLoaderShow(false));
            })

            .catch((err: any) => {
                dispatch(spinLoaderShow(false));
                toast.error(err);
            });
    };
    // ================================|| Onsubmit ||================================ //
    const log: any = window.localStorage.getItem('user');
    const localUsers = JSON.parse(log);

    const onSubmit = (data: any) => {
        data.project_id = projectId;
        data.user_id = localUsers?.id;
        data.commet = data?.commet;

        createonSubmit(data);
        reset();
    };

    return (
        <>
            <form>
                <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                    <Grid item xs={12} md={12} sm={12} direction="row" justifyContent="center" alignItems="center">
                        <ProjectMilestoneComponent projectId={projectId} disabled={permission?.permission?.name == 'read' ? true : false} />
                    </Grid>
                    {permission?.permission?.name !== 'read' && (
                        <>
                            <Grid item xs={12} md={12} sm={12} direction="row" justifyContent="center" alignItems="center">
                                <AdditionalHoursComponent
                                    projectId={projectId}
                                    hoursCategory={hoursCategory}
                                    departmentCategory={departmentCategory}
                                />
                            </Grid>

                            <Grid item xs={12} md={12} sm={12} direction="row" justifyContent="center" alignItems="center">
                                <MilestoneCommentsList projectId={projectId} />
                            </Grid>
                        </>
                    )}
                </Grid>
            </form>
        </>
    );
}
