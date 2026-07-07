import {RestaurantService} from "@/modules/restaurant/application/service/restaurant.service";
import {ModuleDeclarationInterface} from "@/core/domain/entities/module.interface";
import {RestaurantWidget} from "@/modules/restaurant/presentation/widgets/restaurant.widget";

const restaurantModule: ModuleDeclarationInterface = {
    id: 'restaurant',
    key: 'RESTAURANT',
    name: 'Restaurant',
    description: 'Gestion de restaurant',
    icon: "UtensilsIcon",
    logo: undefined,
    widgets: {
        analytics: RestaurantWidget
    },
    service: {
        fetch: RestaurantService
    },
    url: '/restaurant',
    isEnabled: true,
    isDefault: true,
    type: 'INTERNAL',
}

export default restaurantModule
