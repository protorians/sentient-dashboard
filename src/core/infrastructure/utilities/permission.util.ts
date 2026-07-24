import {type UserPermissionCapabilities} from "@/modules/auth/domain/entities/user.interface";
import {DomainsEnum} from "@/core/domain/enums/domains.enum";

export function hasPermissions(capabilities: UserPermissionCapabilities, domains: DomainsEnum | DomainsEnum[], strict: boolean = true): boolean {
    const entries = Object.keys(capabilities)
    return (Array.isArray(domains) ? domains : [domains])
        [strict ? 'every' : 'some'](domain => entries.includes(domain))
}