"use client"

import {FormScreen} from "@/core/presentation/form-screen";
import {SelectOrganizationForm} from "@/modules/auth/presentation/components/select-organization-form";

export function AuthSelectOrganizationView() {
    return (
        <FormScreen hideSideImage={false}>
            <SelectOrganizationForm/>
        </FormScreen>
    )
}
