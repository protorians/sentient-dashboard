import {CacheStorageType} from "@/core/infrastructure/capabilities/cache-storage/enum";
import {StackableCapabilityInterface, StackableEntityType} from "@/core/infrastructure/capabilities/stackable/types";

export interface ICacheStorageCapability<T extends StackableEntityType> extends StackableCapabilityInterface<T> {
    readonly key: string;
    readonly type: CacheStorageType;

    save(): Promise<boolean>;

    load(): Promise<T>;
}