import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const GetUser = createParamDecorator((data : any , context : ExecutionContext) =>{
    var req = context.switchToHttp().getRequest()
    return req.user
})