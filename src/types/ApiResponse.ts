import { Message, User } from "@/model/user";

export interface ApiResponse {
  success: boolean;
  message: string;
  isAcceptingMessages?: boolean;
  data?:User
  messages?: Array<Message>
};