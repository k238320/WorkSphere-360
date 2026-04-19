import { Controller } from 'react-hook-form';
import moment from 'moment';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

interface ITaskDetailsProps {
    apiData: any;
    control: any;
    errors: any;
    setValue: (name: string, value: any) => void;
    departments: any[];
}

const TaskDetails = ({ apiData, control, errors, setValue, departments }: ITaskDetailsProps) => {
    return (
        <div className="tasks__list__wrapper">
            <div className="task__detail">
                <p>Project/Brand</p>
                <span>{apiData?.project?.name}</span>
            </div>
            <div className="task__detail">
                <p>Category</p>
                <span>{apiData?.task_category?.name}</span>
            </div>
            <div className="task__detail">
                <p>Task Name</p>
                <span>{apiData?.name}</span>
            </div>
            <div className="task__detail">
                <p>Departments</p>
                <ul>
                    <li>
                        {departments?.find(
                            ({ id }) => id === (Array.isArray(apiData?.department) ? apiData?.department[0]?.id : apiData?.department)
                        )?.name || '-'}
                    </li>
                </ul>
            </div>
            <div className="task__detail">
                <p>Task Completion Date</p>
                <span>{moment(apiData?.completion_date).format('Do MMM, YYYY')}</span>
            </div>
            <div className="task__detail">
                <p>Attachment</p>
                <a href={apiData?.attachment} target="_blank" rel="noreferrer">
                    {apiData?.attachment}
                </a>
            </div>

            <div className="task__detail">
                <p>Description</p>
                <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                        <div className="custom-editor">
                            <CKEditor
                                editor={ClassicEditor as unknown as { create(...args: any): Promise<any> }}
                                data={apiData?.description}
                                disabled={true}
                                onChange={(event, editor) => {
                                    const data = editor.getData();
                                    field.onChange(data);
                                    setValue('description', data);
                                }}
                                onBlur={(event, editor) => {
                                    field.onBlur();
                                }}
                            />
                        </div>
                    )}
                />
                {errors?.description && <span style={{ color: 'red' }}>{errors.description.message}</span>}
            </div>
        </div>
    );
};

export default TaskDetails;
