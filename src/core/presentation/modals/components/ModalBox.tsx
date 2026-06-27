'use client';

import React from 'react';
import {useModalStore} from '../stores/useModalStore';
import {ModalInstance} from '../types/modal.type';
import {cn} from '@/core/infrastructure/utilities/utils';
import {SizeEnum} from "@/core/domain/enums/size.enum";
import {FaIcon, FaTypeEnum} from "@/core/presentation/icons/glyphIcons";
import { COMMON_CLASSNAMES } from "@/core/domain/constant/common-classname.constant";

interface ModalBoxProps {
    modal: ModalInstance;
}

const ModalBox = ({modal}: ModalBoxProps) => {
    const closeModal = useModalStore((state) => state.closeModal);
    const {id, component: Component, props, options} = modal;

    return (
        <div
            className={cn(
                "relative w-full overflow-hidden flex flex-col rounded-lg border bg-background text-foreground shadow-lg",
                COMMON_CLASSNAMES.Layer,
                options?.size || SizeEnum.MD,
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
                            <FaIcon name={'times-circle'} type={FaTypeEnum.Solid}/>
                        </button>
                    )}
                </div>
            )}

            <div className="flex-auto overflow-y-auto w-full ">
                {typeof Component === 'function' ? <Component {...props} /> : Component}
            </div>
        </div>
    );
};

export default ModalBox;
