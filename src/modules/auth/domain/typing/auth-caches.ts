import {UserInterface} from "@/modules/auth/domain/entities/user.interface";
import {StackableEntityType} from "@/core/infrastructure/capabilities/stackable/types";

export interface AuthCacheInterface extends StackableEntityType{
    user: UserInterface | null;
    token: string | null;
    device: string | null;
}
