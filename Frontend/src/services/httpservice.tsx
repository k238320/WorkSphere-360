import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL: any = process.env.REACT_APP_API_URL;

const instance = axios.create({
    baseURL: API_URL
});

instance.interceptors.request.use(
    function (config: any) {
        var token = localStorage.getItem('token');
        config.headers.Authorization = 'Bearer ' + token;
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);
var win: any = window;
instance.interceptors.response.use(
    (res) => res?.data?.data,
    (err: any) => {
        let errorMessage: any = err?.response?.data?.result;
        if (typeof errorMessage === 'string' && errorMessage !== null) {
            toast.error(({ data }) => `Error ${data}`, {
                data: errorMessage
            });
        } else if (errorMessage?.[0]?.message) {
            toast.error(({ data }) => `Error ${data}`, {
                data: errorMessage?.[0]?.message?.replace(/\"/g, '')
            });
        } else if (errorMessage?.message) {
            toast.error(({ data }) => `Error ${data}`, {
                data: errorMessage?.message
            });
        } else if (err?.response?.data?.message) {
            toast.error(({ data }) => `Error ${data}`, {
                data: err?.response?.data?.message
            });
            if (err?.response?.data?.statusCode === 401) {
                win.location = '/login';
                localStorage?.clear();
            }
            return Promise.reject(err);
        }
        if (err == undefined) {
            toast.error(({ data }) => `Error ${data}`, {
                data: 'Network connection.'
            });
        }
        if (err !== undefined) throw new Error(err);
    }
);

export default instance;
