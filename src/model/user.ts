import mongoose,{Schema,Document} from "mongoose";

export interface Message extends Document{
    _id:string,
    content : string,
    createdAt:Date,
    isFlagged?: boolean;
    moderationResult?: {
        toxicity?: number;
        categories?: string[];
    };
    category?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    status?: 'new' | 'read' | 'archived';
    anonVisitorId?: string;
    deviceInfo?: {
        deviceType?: string;
        country?: string;
    };
}

const messageSchema : Schema<Message>= new Schema({
    content:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        required:true,
        default:Date.now
    },
    isFlagged: {
        type: Boolean,
        default: false
    },
    moderationResult: {
        toxicity: Number,
        categories: [String]
    },
    category: {
        type: String,
        default: 'general'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['new', 'read', 'archived'],
        default: 'new'
    },
    anonVisitorId: {
        type: String
    },
    deviceInfo: {
        deviceType: String,
        country: String
    }
})
export interface User extends Document{
  username :string,
  email:string,
  password:string,
  verifyCode:string,
  verifyCodeExpiry:Date,
  isVerified:boolean,
  isAcceptingMessage:boolean,
  messages:Message[],
  qaModeEnabled?: boolean;
  settings?: {
    defaultTheme?: string;
    analyticsOptIn?: boolean;
    emailNotifications?: boolean;
  };
}

const UserSchema : Schema<User>= new Schema({
    username:{
        type:String,
        trim:true,
        unique:true,
        required:[true,"Username is required"]
    },
    email:{
        type:String,
        unique:true,
        required:[true,"Email is required"],
        match:[
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Please add a valid email"
        ]
    },
    password:{
        type:String,
        required:true
    },
    isVerified:{
        type:Boolean,
        required:true,
        default:false
    },
    verifyCode:{
        type:String,
        required:true
    },
    verifyCodeExpiry:{
        type:Date,
        required:true
    },
    isAcceptingMessage:{
        type:Boolean,
        required:true,
        default:true
    },
    messages:[messageSchema],
    qaModeEnabled: {
        type: Boolean,
        default: false
    },
    settings: {
        defaultTheme: {
            type: String,
            default: 'default'
        },
        analyticsOptIn: {
            type: Boolean,
            default: true
        },
        emailNotifications: {
            type: Boolean,
            default: false
        }
    }
})

// Check if the model already exists to prevent recompilation
const UserModel = mongoose.models.AnnonymousMessageUser || mongoose.model<User>("AnnonymousMessageUser", UserSchema);
export default UserModel;