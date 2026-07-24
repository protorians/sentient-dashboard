"use client"

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
import {useEffect} from "react";
import {useModuleStore} from "@/core/infrastructure/stores/module.store";
import usersActivitiesModule from "@/modules/user-activities";

export function ModulesDefinition() {
    const {addModules, modules} = useModuleStore()

    useEffect(() => {
        const fn = () => {
            addModules([
                DashboardModule,
                AccessControlModule,
                UsersModule,
                BillingModule,
                BloggingModule,
                CrmModule,
                NotificationsModule,
                OrganizationsModule,
                ProjectManagementModule,
                RestaurantModule,
                StockModule,
                StorageModule,
                usersActivitiesModule,
            ])
        }
        const timer = setTimeout(fn, 1000)
        return () => clearTimeout(timer)
    }, [])

    // useEffect(() => {
    //     console.log("ModulesProvider: modules changed", modules.length)
    // }, [modules]);

    return null;
}