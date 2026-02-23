import {z} from 'zod'
export const MessageSchema =z.object({
    content:z.string().min(10,{message:"content must be of atleast ten characters"}).max(300,{message:"message must be below 300 characters"}),
})