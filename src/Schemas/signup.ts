import {z} from 'zod';

export const usernameValidation = z.string().min(3,'Username must be at least 3 characters long').max(15,'username must be at most 10 characters long').regex( /^[a-zA-Z0-9_]+$/,'username must contain only letters, numbers, and underscores');
export const signUpSchema = z.object({
    username: usernameValidation,
    email: z.string().email({message: 'invalid email'}),
    password: z.string().min(6,{message:'password must be at least 6 characters long'}).max(20,'password must be at most 20 characters long'),
});
