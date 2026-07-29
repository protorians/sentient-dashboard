'use client';

import React from 'react';
import {useModalStore} from '../stores/useModalStore';
import {ModalInstance} from '../types/modal.type';
import {cn} from '@/core/infrastructure/utilities/utils';
import {SizeEnum, SizeHeightEnum} from "@/core/domain/enums/size.enum";
import {FaIcon, FaSizeEnum, FaTypeEnum} from "@/core/presentation/icons/glyphIcons";
import {COMMON_CLASSNAMES} from "@/core/domain/constant/common-classname.constant";
import {CircleXIcon, XIcon} from "lucide-react";

interface ModalBoxProps {
    modal: ModalInstance;
}

const ModalBox = ({modal}: ModalBoxProps) => {
    const closeModal = useModalStore((state) => state.closeModal);
    let {id, component: Component, props, options} = modal;

    options = options || {};
    options.scrollable = typeof options.scrollable === 'undefined' ? true : options.scrollable;

    return (
        <div
            className={cn(
                "relative w-full overflow-hidden flex flex-col rounded-lg! border bg-background text-foreground shadow-lg",
                COMMON_CLASSNAMES.Layer,
                SizeEnum[options.size || 'AUTO'],
                options?.useHeight && SizeHeightEnum[options.size || 'AUTO'],
                options?.className
            )}
        >
            {(options?.title || options?.closable !== false) && (
                <div className="flex items-center justify-between px-4 py-4">
                    <div className="flex flex-col px-2">
                        {options?.title && (
                            <h3 className="text-lg font-semibold text-foreground">
                                {options.title}
                            </h3>
                        )}
                        {options?.description && (
                            <p className="text-sm text-muted-foreground">
                                {options.description}
                            </p>
                        )}
                    </div>

                    {options?.closable !== false && (
                        <button
                            onClick={() => !options?.locked && closeModal(id)}
                            disabled={options?.locked}
                            className={cn(
                                "absolute top-0 right-0 p-1 m-2 rounded-full transition-colors text-foreground dark:text-zinc-400",
                                options?.locked ? "opacity-50 cursor-not-allowed" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            )}
                        >
                            <XIcon className="size-7"/>
                        </button>
                    )}
                </div>
            )}

            <div className={cn(
                "flex-auto w-full ",
                options?.scrollable && "overflow-y-auto",
                !options?.scrollable && "overflow-hidden",
            )}>
                {typeof Component === 'function' ? <Component {...props} /> : Component}
            </div>
        </div>
    );
};

export default ModalBox;
