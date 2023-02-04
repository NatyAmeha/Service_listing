import { Inject, Injectable } from '@nestjs/common';
import { ClientSession } from 'mongoose';
import { BusinessDTO } from 'src/dto/business.dto';
import { DashBoardDTO } from 'src/dto/dashboard.dto';
import { ProductDTO } from 'src/dto/service_item.dto';
import { UserDTO } from 'src/dto/user.dto';
import { Business } from 'src/model/business.model';
import { ServiceItem } from 'src/model/service_item.model';
import { User } from 'src/model/user.model';
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

    async getUserInfo(userId: String): Promise<UserDTO> {
        var userResult = await this.userRepo.get(userId);
        var userDTOResult = new UserDTO({ user: userResult })
        return userDTOResult
    }

    async getUserFavoriteProducts(userId: String): Promise<UserDTO> {
        var userResult = await this.userRepo.get(userId , ["favoriteProducts"]);
        const {favoriteProducts , ...rest} = userResult
        var favoriteProductResult = (favoriteProducts as ServiceItem[]).map(product => new ProductDTO({serviceItem : product}))
        var userDTOResult = new UserDTO({ favoriteProducts : favoriteProductResult})
        return userDTOResult
    }

    async getUserFavoriteBusinesses(userId: String): Promise<UserDTO> {
        var userResult = await this.userRepo.get(userId , ["favoriteBusinesses"]);
        const {favoriteBusinesses , ...rest} = userResult
        var favoriteBusinessResult = (favoriteBusinesses as Business[]).map(business => new BusinessDTO({businessInfo : business}))
        var userDTOResult = new UserDTO({ favoriteBusinesses : favoriteBusinessResult})
        return userDTOResult
    }



}
