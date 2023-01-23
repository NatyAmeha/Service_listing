import { Inject, Injectable } from '@nestjs/common';
import { ClientSession } from 'mongoose';
import { DashBoardDTO } from 'src/dto/dashboard.dto';
import { IUserRepo, UserRepository } from 'src/repo/user.repo';

@Injectable()
export class UserService {
    constructor(@Inject(UserRepository.injectName) private userRepo: IUserRepo) { }

    async addOrderToUser(userId: String, orderId: String, session?: ClientSession): Promise<Boolean> {
        if (session) {
            this.userRepo.addSession(session)
        }
        var updateResult = await this.userRepo.updateWithFilter({ _id: userId }, { $push: { orders: orderId } })
        return updateResult
    }

    async addProductToFavorite(productIds: String[], userId: String): Promise<Boolean> {
        var updateResult: Boolean = true
        for await (const id of productIds) {
            updateResult = await this.userRepo.updateWithFilter({ _id: userId }, { $addToSet: { favoriteProducts: id } })

        }
        return updateResult
    }

    async removeProductFromFavorite(productIds: String[], userId: String): Promise<Boolean> {
        var updateResult: Boolean = true
        for await (const id of productIds) {
            updateResult = await this.userRepo.updateWithFilter({ _id: userId }, { $pull: { favoriteProducts: id } })
        }
        return updateResult   
    }



}
