import { Button, Grid, Stack } from '@mui/material';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import SubCard from 'ui-component/cards/SubCard';
import { AutoCompleteField, AutoCompleteMultipleField, TextFieldControlled } from 'ui-component/formsField/FormFields';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { yupResolver } from '@hookform/resolvers/yup';
import { createScreen, getScreen } from 'services/screenService';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { createRole, getRoleById, getRolePermissions, updateRole } from 'services/rolesService';
import React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import { getModules } from 'services/moduleService';
import { createRoleValidation } from './Validation';

type FormData = {
    screenInstances: {
        screen: string;
        permissions: string[];
    }[];
    status: boolean;
    name: string;
};

type FormErrors = {
    screenInstances: {
        screen?: string;
        permissions?: string;
    }[];
    status: boolean;
    name: string;
};

const RoleManage = () => {
    const defautlFormValues: any = {
        status: true,
        name: '',
        screenInstances: []
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
    }: any = useForm<FormData>({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: defautlFormValues,
        resolver: yupResolver(createRoleValidation)
    });

    const { fields, append, remove }: any = useFieldArray({
        control,
        name: 'screenInstances'
    });

    const [screens, setScreens] = useState<any>([]);
    const [permission, setPermission] = useState<any>([]);
    const [modules, setModules] = useState<any>([]);
    const [resDate, setResData] = useState<any>();

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const uuid = searchParams.get('uuid');

    const handleAddInstance = (e: any) => {
        e?.preventDefault();

        append({ screen: '', permissions: [] });
    };

    const handleRemoveInstance = (index: number) => {
        remove(index);
    };

    const onChangeScreen = (index: number) => (e: any) => {
        // const cloneScreenList = [...screenInstances];
        // let cloneSelectedScreens = [...selectedScreens];
        // const tempSelected = cloneSelectedScreens.find((x) => x.name == e.name);
        // if (!tempSelected) {
        //     const filter = screens.filter?.filter((x: any) => x?.name !== e.name);
        //     filter?.map((x: any) => {
        //         const tempSelected = cloneSelectedScreens.find((y) => y.name == x.name);
        //         if (!tempSelected) {
        //             cloneSelectedScreens.push(x);
        //         }
        //     });
        // } else {
        //     cloneSelectedScreens = cloneSelectedScreens?.filter((x) => x.name !== tempSelected?.name);
        // }
        // setSelectedScreens(cloneSelectedScreens);
        // const find: any = screens.all?.filter((x: any) => e?.name == x.name);
        // cloneScreenList[index].childScreen = find;
        // setScreenInstances(cloneScreenList);
    };

    const getScreenData = (modulesData: any) => {
        dispatch(spinLoaderShow(true));
        getScreen()
            .then((res: any) => {
                // let temp: any = [];

                // res?.map((x: any) => {
                //     const isExist = temp?.find((y: any) => y?.name == x?.name);

                //     if (!isExist) {
                //         temp.push(x);
                //     }
                // });

                modulesData?.forEach((element: any) => {
                    element.child = element.name;
                });
                let temp = [];
                temp = [...modulesData, ...res];

                if (uuid) {
                    getRoleByIdData(temp);
                }

                setScreens(temp);
            })
            .catch((err) => {
                console.log('err', err);
            })
            .finally(() => {
                dispatch(spinLoaderShow(false));
            });
    };

    const getRolePermissionsData = () => {
        dispatch(spinLoaderShow(true));
        getRolePermissions()
            .then((res) => {
                setPermission(res);
            })
            .catch((err) => {
                console.log(err);
            })
            .finally(() => {
                dispatch(spinLoaderShow(false));
            });
    };

    const getModulesData = () => {
        dispatch(spinLoaderShow(true));
        getModules()
            .then((res) => {
                getScreenData(res);
                setModules(res);
            })
            .catch((err) => {
                console.log(err);
            })
            .finally(() => {
                dispatch(spinLoaderShow(false));
            });
    };

    const getRoleByIdData = (screen: any) => {
        getRoleById(uuid)
            .then((res: any) => {
                setValue('name', res?.name);
                setResData(res);
                // setValue('screenInstances', res?.screens);
                let screenInstances: any[] = [];

                // console.log('screen', screen);

                const array_of_role = res?.screens?.map((item: any) => item);
                console.log(array_of_role, 'iowuerio');

                res?.screens?.map((item: any) => {
                    const findScreen: any[] = screen?.filter((x: any) => x.name == item.name);
                    const findPermission: any[] = permission?.filter((x: any) => x);

                    // const findPermission: any[] = item?.routes?.flatMap((x: any) => x.flatMap(({ permissions }: any) => permissions || ''));
                    // const findPermission: any[] = item?.routes?.map((x: any) => x);

                    console.log('findScreen  ===>', findPermission);
                    // console.log('item', item);
                    item.routes?.map((x: any) => {
                        const find = findScreen.find((y) => y.child == x.name);

                        if (find) {
                            screenInstances.push(find);
                        }
                    });

                    // const findScreen = child?.find((x: any) => x?.name === item.name);
                    // tempScreen.push(findScreen);

                    // const find = screen?.filter((x: any) => item?.name == x.name);

                    // find?.map((x: any) => {
                    //     temp.push(x);
                    // });

                    // item?.routes?.map((x: any) => {
                    //     const findChildScreen = screen?.find((y: any) => y?.child === x.name);
                    //     tempChildScreens.push(findChildScreen);
                    // });
                });

                if (screenInstances?.length > 0) {
                    screenInstances?.map((x: any, i: number) => {
                        append({});
                        console.log(x, 'flasdfjsdkl');

                        setValue(`screenInstances.[${i}].screen`, x?.id);
                        setValue(`screenInstances.[${i}].permissions`, ['64b7be68477f4cfbd9105752']);
                    });
                }
                console.log(screenInstances, 'sett field array');

                // if (screenInstances?.length > 0) {
                //     screenInstances?.map((x: any, i: number) => {
                //         setValue(`screenInstances.[${i}].permissions`, []);
                //     });
                // }
                console.log(res, 'wurvef');

                // setValue('screenInstances', screenInstances);
            })
            .catch((err) => {
                console.log('err', err);
            });
    };

    // console.log('getvalue', getValues('screenInstances'));

    // const createRoleSubmit = (body: any) => {
    //     createRole(body)
    //         .then(() => {
    //             toast.success('Role Created Successfully!');
    //             navigate('/role/listing');
    //         })
    //         .catch((err) => {
    //             console.log('err', err);
    //         });
    // };

    const updateRoleSubmit = (body: any) => {
        dispatch(spinLoaderShow(true));

        updateRole(uuid, body)
            .then((res) => {
                toast.success('Role Updated Successfully');
                navigate('/role/listing');
            })
            .finally(() => {
                dispatch(spinLoaderShow(false));
            });
    };

    const onSubmit = (data: any) => {
        let isError = false;
        if (data?.screenInstances?.length > 0) {
            let module: any = [];
            let screensArray: any = [];
            data.screenInstances?.map((x: any) => {
                const findModule = modules?.find((y: any) => y.id == x.screen);

                if (findModule?.id) {
                    if (findModule?.name == 'For Sales') {
                        const saleModule = screens?.find((y: any) => y.id == x.screen);
                        const findPermission = data.screenInstances?.find((y: any) => saleModule.id == y?.screen);

                        const findScreen = screens?.find((y: any) => y.child == 'Add Project');
                        const addProjectScreen = data.screenInstances?.find((y: any) => y.screen == findScreen.id);

                        const isExist = findPermission?.permissions?.find((per: any) => per?.name == 'create');

                        if (isExist && addProjectScreen) {
                            findPermission?.permissions?.map((item: any) => {
                                const obj = {
                                    permission_id: item?.id,
                                    module_id: findModule?.id
                                };
                                module.push(obj);
                            });
                            isError = false;
                        } else {
                            isError = true;
                            toast.error('Please Select Add Project Screen or Add Create Permission !');
                        }
                    } else {
                        const addProjectScreen = screens?.find((y: any) => y.id == x.screen);

                        const findPermission = data.screenInstances?.find((y: any) => addProjectScreen.id == y?.screen);

                        findPermission?.permissions?.map((item: any) => {
                            const obj = {
                                permission_id: item?.id,
                                module_id: findModule?.id
                            };
                            module.push(obj);
                        });
                    }
                } else {
                    if (x.screen) {
                        const findScreen = screens.find((screen: any) => screen?.id === x.screen);
                        let index = screensArray?.findIndex((x: any) => x.name === findScreen?.name);

                        if (index != -1) {
                            screensArray[index].routes.push({
                                name: findScreen?.child,
                                route: findScreen.route,
                                permissions: x?.permissions
                            });
                        } else {
                            let obj = {
                                name: findScreen?.name,
                                routes: [{ name: findScreen?.child, route: findScreen.route, permissions: x?.permissions }]
                            };
                            screensArray.push(obj);
                        }
                    }
                }
            });

            if (!isError) {
                const obj = {
                    name: data?.name,
                    screens: screensArray,
                    module: module,
                    status: true
                };

                if (uuid) {
                    delete obj.module;
                    updateRoleSubmit(obj);
                } else {
                    dispatch(spinLoaderShow(true));
                    createRole(obj)
                        .then((res: any) => {
                            toast.success(res);
                        })
                        .catch((err: any) => {
                            toast.error(err);
                        })
                        .finally(() => {
                            dispatch(spinLoaderShow(false));
                        });
                }
            }
        } else {
            toast.error('At leas add one screen');
        }
    };

    useEffect(() => {
        getRolePermissionsData();
        getModulesData();
        if (!uuid) {
            reset();
        }
    }, [uuid]);

    // console.log(screens, 'new Data');
    // console.log(getValues('screenInstances'), 'new Data');

    return (
        <>
            <form>
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

                        <Grid item xs={12} md={12} sm={12}>
                            {fields &&
                                fields?.map((fieldItem: any, index: any) => {
                                    return (
                                        <Grid item md={12} key={fieldItem.id}>
                                            <Grid container spacing={3}>
                                                <Grid item md={4}>
                                                    <AutoCompleteField
                                                        errors={!!errors?.screenInstances?.[index]?.screen}
                                                        fieldName={`screenInstances.[${index}].screen`}
                                                        autoComplete="off"
                                                        label="Screens *"
                                                        control={control}
                                                        setValue={setValue}
                                                        options={screens}
                                                        // valueGot={''}
                                                        returnObject={false}
                                                        isLoading={true}
                                                        optionKey="id"
                                                        optionValue="child"
                                                        helperText={errors?.screenInstances?.[index]?.screen || ''}
                                                        valueGot={screens?.find(({ id }: any) => {
                                                            // return id == userInfo?.userDeatils?.marital_status;
                                                            // return name == 'List of Attendance';
                                                            console.log(
                                                                id,
                                                                getValues('screenInstances')?.[index]?.screen,
                                                                'new Data inner'
                                                            );
                                                            return id == getValues('screenInstances')?.[index]?.screen;
                                                        })}
                                                    />
                                                </Grid>
                                                <Grid item md={4}>
                                                    {/* <AutoCompleteField */}
                                                    <AutoCompleteMultipleField
                                                        errors={!!errors?.screenInstances?.[index]?.permissions}
                                                        fieldName={`screenInstances.[${index}].permissions`}
                                                        autoComplete="off"
                                                        label="Permissions *"
                                                        control={control}
                                                        setValue={setValue}
                                                        options={permission || []}
                                                        returnObject={false}
                                                        isLoading={true}
                                                        optionKey="id"
                                                        optionValue="name"
                                                        helperText={errors?.screenInstances?.[index]?.permissions || []}
                                                        // valueGot={permission?.filter(({ id }: any) => '64b7be68477f4cfbd9105752')}

                                                        // valueGot={permission?.filter(({ id }: any) => {
                                                        //     console.log(
                                                        //         getValues('screenInstances')?.[index]?.permissions?.[0],
                                                        //         "getValues('screenInstances')?.[index]?.permissions"
                                                        //     );
                                                        //     id === getValues('screenInstances')?.[index]?.permissions?.[0];
                                                        // })}
                                                    />
                                                </Grid>
                                                <Grid item md={4} sx={{ mt: 3 }}>
                                                    <DeleteIcon
                                                        sx={{ width: 27, height: 27 }}
                                                        color="error"
                                                        onClick={() => {
                                                            handleRemoveInstance(index);
                                                        }}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    );
                                })}
                        </Grid>

                        <Button onClick={handleAddInstance}>Add Screen</Button>

                        <Grid item xs={6} md={12} sm={6} sx={{ mt: 2 }}>
                            <Grid sx={{ mb: 3 }} container spacing={3} direction="row" justifyContent="flex-end" alignItems="center">
                                <Grid container direction="row" justifyContent="flex-end" alignItems="flex-end">
                                    <Stack direction="row">
                                        <AnimateButton>
                                            <Button
                                                onClick={handleSubmit(onSubmit)}
                                                variant="contained"
                                                type="submit"
                                                sx={{ m: 3 }}
                                                className={'red'}
                                            >
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

export default RoleManage;
