import { Injectable } from "@nestjs/common";
import { IUserRepo, UserRepository } from "src/repo/user.repo";

@Injectable()
export class UserUsecase{
   constructor(userRepo : IUserRepo){}
}