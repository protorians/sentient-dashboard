"use client"

import React, {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {CustomerInterface} from "@/modules/beverage-sales/domain/customer.interface";
import {BeverageSalesApiService} from "@/modules/beverage-sales/application/service/beverage-sales-api-service";
import {
    Combobox,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxInput,
    ComboboxEmpty,
} from "@/core/presentation/ui/combobox";
import {UserIcon, SearchIcon, UserPlusIcon} from "lucide-react";
import {WaitingActivity} from "@/core/presentation/waiting-activity";

export function getCustomerLabel(customer: CustomerInterface): string {
    return [customer.firstname, customer.lastname].filter(Boolean).join(' ') || customer.companyName || 'Client';
}

interface CustomerComboboxProps {
    customer: CustomerInterface | null;
    onSelect: (customer: CustomerInterface | null) => void;
    onNameChange: (name: string) => void;
}

export function CustomerCombobox({customer, onSelect, onNameChange}: CustomerComboboxProps) {
    const [search, setSearch] = useState("");

    const {data: results, isFetching} = useQuery<CustomerInterface[]>({
        queryKey: ['beverage-sales', 'customers', search],
        queryFn: async () => {
            const response = await BeverageSalesApiService.searchCustomers(search);
            return response.data?.data || [];
        },
        enabled: search.trim().length >= 2,
    });

    const customers = results ?? [];

    return (
        <Combobox
            value={customer}
            onValueChange={(selected) => {
                const value = selected as CustomerInterface | null;
                onSelect(value);
                if (value) onNameChange(getCustomerLabel(value));
                setSearch("");
            }}
            onInputValueChange={(value, eventDetails) => {
                const reason = eventDetails?.reason;
                if (reason === 'item-press' || reason === 'list-navigation' || reason === 'none') return;
                onSelect(null);
                onNameChange(value);
                setSearch(value);
            }}
            isItemEqualToValue={(item, value) => item?.id === value?.id}
            itemToStringLabel={(item) => getCustomerLabel(item as CustomerInterface)}
            filter={null}
        >
            <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground z-10"/>
                <ComboboxInput
                    className="pl-9 w-full h-10 rounded-xl"
                    placeholder="Rechercher un client ou saisir un nom..."
                    showTrigger={false}
                    showClear={!!customer}
                />
            </div>
            <ComboboxContent>
                <ComboboxList>
                    {isFetching ? (
                        <div className="flex justify-center p-3">
                            <WaitingActivity size={20}/>
                        </div>
                    ) : customers.map(customerOption => (
                        <ComboboxItem key={customerOption.id} value={customerOption}>
                            <UserIcon className="size-3.5 text-muted-foreground"/>
                            <span className="font-medium">{getCustomerLabel(customerOption)}</span>
                            {customerOption.phone && (
                                <span className="text-xs text-muted-foreground ml-auto">{customerOption.phone}</span>
                            )}
                        </ComboboxItem>
                    ))}
                </ComboboxList>
                <ComboboxEmpty>
                    <span className="inline-flex items-center gap-1.5">
                        <UserPlusIcon className="size-4"/>
                        Aucun client trouvé — le nom sera créé à la volée
                    </span>
                </ComboboxEmpty>
            </ComboboxContent>
        </Combobox>
    );
}
