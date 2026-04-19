import { Grid, FormControl, TextField, Autocomplete, Button, FormControlLabel, Switch } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const FiltersSection = ({
    departments,
    department,
    setDepartment,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    handleSearch,
    roleName,
    disabled,
    isTeamLeads ,
    handleTeamLeadsToggle
}: {
    departments: any;
    department: any;
    setDepartment: (value: any) => void;
    customStartDate: Date | null;
    setCustomStartDate: (value: Date | null) => void;
    customEndDate: Date | null;
    setCustomEndDate: (value: Date | null) => void;
    handleSearch: () => void;
    roleName: string;
    disabled?: boolean;
    isTeamLeads?: boolean;
    handleTeamLeadsToggle : (event: React.ChangeEvent<HTMLInputElement>)=> void;
}) => (
    <Grid container alignItems="center" justifyContent="center" spacing={2}>
        <Grid item sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {['Super Admin', 'Human Resource', 'Human Resource Operations'].includes(roleName) && (
                <>
                    <FormControlLabel
                        control={<Switch checked={isTeamLeads} onChange={handleTeamLeadsToggle} color="primary" />}
                        label="Team Leads"
                        labelPlacement="top"
                        sx={{ width: 40 }}
                    />

                    {!disabled &&<FormControl sx={{ minWidth: 300 }}>
                        <Autocomplete
                            options={departments}
                            getOptionLabel={(option) => option.name}
                            value={departments.find((d: any) => d.id === department) || null}
                            onChange={(_, newValue) => setDepartment(newValue?.id || null)}
                            renderInput={(params) => <TextField {...params} label="Department" sx={{ height: 40 }} />}
                            disabled={disabled}
                        />
                    </FormControl>}
                </>
            )}

            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Grid container spacing={2} alignItems="center" sx={{ marginTop: 0 }}>
                    <Grid item>
                        <DatePicker
                            value={customStartDate}
                            label="Start Date"
                            onChange={(newValue: any) => setCustomStartDate(newValue)}
                            renderInput={(params: any) => <TextField {...params} size="medium" sx={{ width: '100%' }} />}
                        />
                    </Grid>
                    <Grid item>
                        <DatePicker
                            label="End Date"
                            value={customEndDate}
                            onChange={(newValue: any) => setCustomEndDate(newValue)}
                            renderInput={(params: any) => <TextField {...params} size="medium" sx={{ width: '100%' }} />}
                        />
                    </Grid>
                </Grid>
            </LocalizationProvider>

            <Button sx={{ mt: 2 }} variant="contained" color="primary" onClick={handleSearch}>
                Search
            </Button>
        </Grid>
    </Grid>
);

export default FiltersSection;
