"use client"

import React, {useState, useRef} from "react";
import {useQuery} from "@tanstack/react-query";
import {CustomerInterface, CustomerType} from "@/modules/beverage-sales/domain/customer.interface";
import {BeverageSalesApiService} from "@/modules/beverage-sales/application/service/beverage-sales-api-service";
import {CustomerApiService} from "@/modules/customer/application/service/customer-api-service";
import {Button} from "@/core/presentation/ui/button";
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
    const [isCreating, setIsCreating] = useState(false);
    const prevCustomerRef = useRef<CustomerInterface | null>(customer);
    const isProgrammaticChange = prevCustomerRef.current !== customer;
    prevCustomerRef.current = customer;

    const {data: results, isFetching} = useQuery<CustomerInterface[]>({
        queryKey: ['beverage-sales', 'customers', search],
        queryFn: async () => {
            const response = await BeverageSalesApiService.searchCustomers(search);
            return response.data?.data || [];
        },
        enabled: search.trim().length >= 2,
    });

    const {data: recentCustomers, isFetching: isFetchingRecent} = useQuery<CustomerInterface[]>({
        queryKey: ['beverage-sales', 'customers', 'recent'],
        queryFn: async () => {
            const response = await CustomerApiService.getAll();
            const all = response.data?.data as CustomerInterface[] | undefined;
            return (all ?? []).sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
            }).slice(0, 10);
        },
        staleTime: 30_000,
    });

    const customers = search.trim().length >= 2 ? (results ?? []) : (recentCustomers ?? []);
    const showCreateButton = search.trim().length >= 2 && customers.length === 0 && !isFetching;

    const handleCreateCustomer = async () => {
        const name = search.trim();
        if (!name || isCreating) return;
        setIsCreating(true);
        try {
            const parts = name.split(/\s+/);
            const firstname = parts[0] || '';
            const lastname = parts.slice(1).join(' ') || undefined;
            const response = await CustomerApiService.create({
                type: CustomerType.PERSON,
                firstname,
                ...(lastname ? { lastname } : {}),
            });
            const created = response.data?.data as CustomerInterface | undefined;
            if (created) {
                onSelect(created);
                onNameChange(getCustomerLabel(created));
                setSearch("");
            }
        } catch {
            // ignore
        } finally {
            setIsCreating(false);
        }
    };

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
                if (isProgrammaticChange) {
                    onNameChange(value);
                    return;
                }
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
                    {(isFetching || isFetchingRecent) ? (
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
                {showCreateButton ? (
                    <ComboboxEmpty>
                        <div className="flex flex-col items-center gap-3 py-1">
                            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                                <UserPlusIcon className="size-4"/>
                                Aucun client trouvé
                            </span>
                            <Button
                                size="sm"
                                variant="outline"
                                className="rounded-lg"
                                onClick={handleCreateCustomer}
                                disabled={isCreating || search.trim().length < 2}
                            >
                                {isCreating ? <WaitingActivity size={14}/> : <UserPlusIcon className="size-3.5"/>}
                                Créer « {search.trim()} »
                            </Button>
                        </div>
                    </ComboboxEmpty>
                ) : null}
            </ComboboxContent>
        </Combobox>
    );
}
