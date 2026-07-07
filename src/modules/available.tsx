import UsersModule from "@/modules/users";
import DashboardModule from "@/modules/dashboard";
import AccessControlModule from "@/modules/access-control";
import BillingModule from "@/modules/billing";
import BloggingModule from "@/modules/blogging";
import CrmModule from "@/modules/crm";
import NotificationsModule from "@/modules/notifications";
import OrganizationsModule from "@/modules/organizations";
import ProjectManagementModule from "@/modules/project-management";
import RestaurantModule from "@/modules/restaurant";
import StockModule from "@/modules/stock";
import StorageModule from "@/modules/storage";

import {ModuleDeclarationInterface} from "@/core/domain/entities/module.interface";

export default [
    DashboardModule,
    UsersModule,
    AccessControlModule,
    BillingModule,
    BloggingModule,
    CrmModule,
    NotificationsModule,
    OrganizationsModule,
    ProjectManagementModule,
    RestaurantModule,
    StockModule,
    StorageModule
] as ModuleDeclarationInterface[]