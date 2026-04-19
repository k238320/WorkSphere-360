declare module '*.jpg';
declare module '*.jpeg';
declare module '*.png';
declare module '*.gif';
declare module '*.svg';
declare module '*.ico';

declare module 'assets/images/users' {
    const images: {
        default: string;
        [key: string]: string;
    };
    export = images;
}
