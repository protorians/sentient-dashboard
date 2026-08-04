'use client';

import React, {useEffect, useRef, useState} from 'react';
import {
    Stepper,
    StepperContent,
    StepperIndicator,
    StepperItem,
    StepperNav,
    StepperPanel,
    StepperSeparator,
    StepperTrigger,
} from '@/components/reui/stepper';
import {useModal} from '@/core/presentation/modals/hooks/useModal';
import {Button} from '@/core/presentation/ui/button';
import {SizeEnum} from '@/core/domain/enums/size.enum';
import {ObjectableType} from "@/core/domain/entities/objectable.type";
import {ModalOptions} from "@/core/presentation/modals/types/modal.type";
import {toast} from 'sonner';
import {useUploadStore} from "@/core/infrastructure/stores/upload.store";
import {UploadProgressDialog} from "@/core/presentation/components/upload-progress-dialog";


export interface ModalStepperStep<T extends ObjectableType = any> {
    id: string | number;
    title: string;
    description?: string;
    required?: boolean;
    content: React.ReactNode | ((props: {
        next: () => void;
        prev: () => void;
        data: Partial<T>;
        updateData: (newData: any) => void
    }) => React.ReactNode);
    validation?: (data: Partial<T>, updateData: (data: Partial<T>) => void) => Promise<number | string | { step: number | string; lockNavigation?: boolean } | void>;
}

interface ModalStepperStageProps<T extends ObjectableType = any> {
    data: Partial<T>;
    index: number;
    id: string;
}

export interface ModalStepperAction {
    label?: string;
    hide?: boolean;
}

export interface ModalStepperActions {
    cancel?: ModalStepperAction;
    next?: ModalStepperAction;
    previous?: ModalStepperAction;
    done?: ModalStepperAction;
}

interface ModalStepperProps<T extends ObjectableType = any> {
    steps: ModalStepperStep<T>[];
    title?: string;
    initialData?: Partial<T>;
    setId?: () => string;
    onStep?: (props: ModalStepperStageProps<T>) => void;
    onEnd?: (props: ModalStepperStageProps<T>) => Promise<void> | void;
    onCancel?: () => void;
    actions?: ModalStepperActions;
}

type ModalStepperResult<T extends ObjectableType = any> = {
    result: T | null;
    id: string;
}

export function useModalStepper<T extends ObjectableType>(modalProps?: ModalOptions) {
    const {open, close} = useModal();

    return (props: ModalStepperProps<T>) => {
        return new Promise<ModalStepperResult<T>>((resolve) => {
            const id = open(
                ModalStepperContent,
                {
                    ...props,
                    setId: () => id,
                    onStep: (stage: ModalStepperStageProps<T>) => {
                        if (props.onStep) props.onStep({...stage, id: id});
                    },
                    onEnd: async (stage: ModalStepperStageProps<T>) => {
                        try {
                            await props.onEnd?.({...stage, id: id});
                            resolve({id: id, result: stage.data as T});
                            close(id);
                        } catch (error) {
                            throw error;
                        }
                    },
                    onCancel: () => {
                        resolve({id: id, result: null});
                        if (props.onCancel) props.onCancel();
                        close(id)
                    },
                },
                {
                    title: props.title,
                    size: 'LG',
                    ...(modalProps || {}),
                    scrollable: false,
                    useHeight: true
                }
            );
        });
    };
};

function ModalStepperContent<T extends ObjectableType>(
    {
        steps,
        initialData = {} as T,
        setId,
        onStep,
        onEnd,
        onCancel,
        actions,
    }: ModalStepperProps<T>
) {
    const [activeStep, setActiveStep] = useState(1);
    const [isLocked, setIsLocked] = useState(false);
    const [data, setData] = useState<Partial<T>>(initialData);
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const stepperScrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (stepperScrollRef.current) {
            const activeItem = stepperScrollRef.current.querySelector<HTMLElement>('[data-state="active"]');
            if (activeItem) {
                activeItem.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'center'});
            }
        }
    }, [activeStep]);

    const modalId: string = typeof setId == 'function' ? setId() : Math.random().toString(36).substring(2, 9);
    const updateData = (newData: Partial<T>) => {
        setData((prev: Partial<T>) => ({...prev, ...newData}));
    };

    const validateStep = () => {
        const currentStep = steps[activeStep - 1];
        if (!currentStep.required) return true;

        if (containerRef.current) {
            const inputs = containerRef.current.querySelectorAll('input, select, textarea');
            let isAllValid = true;

            inputs.forEach((input: any) => {
                if (input.required || input.pattern) {
                    if (!input.checkValidity()) {
                        input.reportValidity();
                        isAllValid = false;
                    }
                }
            });

            return isAllValid;
        }

        return true;
    };

    const resolveTargetStep = (target: number | string | { step: number | string; lockNavigation?: boolean }): { stepIndex: number; lock?: boolean } => {
        if (typeof target === 'number') return { stepIndex: Math.max(1, Math.min(target, steps.length)) };
        if (typeof target === 'string') {
            const found = steps.findIndex(s => s.id === target);
            return { stepIndex: found !== -1 ? found + 1 : activeStep };
        }
        const { step, lockNavigation } = target;
        if (typeof step === 'number') return { stepIndex: Math.max(1, Math.min(step, steps.length)), lock: lockNavigation };
        const found = steps.findIndex(s => s.id === step);
        return { stepIndex: found !== -1 ? found + 1 : activeStep, lock: lockNavigation };
    };

    const handleNext = async () => {
        if (!validateStep()) return;

        const currentStep = steps[activeStep - 1];
        if (currentStep.validation) {
            try {
                const result = await currentStep.validation(data, updateData);
                if (result !== undefined) {
                    const { stepIndex, lock } = resolveTargetStep(result as any);
                    if (lock) setIsLocked(true);
                    index = stepIndex;
                    onStep?.({data, index, id: modalId});
                    setActiveStep(stepIndex);
                    return;
                }
            } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Validation échouée');
                return;
            }
        }

        if (activeStep < steps.length) {
            index = activeStep + 1;
            onStep?.({data, index, id: modalId});
            setActiveStep(index);
        } else {
            index = steps.length;
            await finish();
        }
    };

    const finish = async () => {
        const hasActiveUploads = useUploadStore.getState().hasActiveUploads;
        if (hasActiveUploads) {
            setShowUploadDialog(true);
            return;
        }
        try {
            await onEnd?.({data, index: steps.length, id: modalId});
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Une erreur est survenue');
            return;
        }
    };

    const handleFinishAfterUploads = () => {
        setShowUploadDialog(false);
        void finish();
    };

    const handlePrev = () => {
        if (isLocked) return;
        if (activeStep > 1) {
            index = activeStep - 1;
            onStep?.({data, index, id: modalId});
            setActiveStep(index);
        }
    };

    const handleCancel = () => {
        onCancel?.();
    };

    const isHiddenAction = (action: keyof ModalStepperActions) =>
        typeof actions?.[action]?.hide !== 'boolean' || (typeof actions?.[action]?.hide === 'boolean' && !actions?.[action]?.hide);

    let index = 0;

    return (
        <div className="flex flex-col w-full h-full min-h-[400px]" ref={containerRef}>
            <div className="flex-auto overflow-hidden">
                <Stepper value={activeStep} onValueChange={isLocked ? undefined : setActiveStep} className="space-y-8 w-full h-full ">
                    <div ref={stepperScrollRef}
                         className="overflow-x-auto scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        <StepperNav className="w-max p-6 ">
                            {steps.map((step, index) => {
                                const stepNumber = index + 1;
                                return (
                                    <StepperItem key={step.id} step={stepNumber}>
                                        <StepperTrigger className="min-w-[200px]">
                                            <StepperIndicator>{stepNumber}</StepperIndicator>
                                            <div className="flex flex-col text-left ml-2">
                                                <span className="text-sm font-medium">{step.title}</span>
                                                {step.description && (
                                                    <span
                                                        className="text-xs text-muted-foreground">{step.description}</span>
                                                )}
                                            </div>
                                        </StepperTrigger>
                                        {index < steps.length - 1 && <StepperSeparator/>}
                                    </StepperItem>
                                );
                            })}
                        </StepperNav>
                    </div>

                    <StepperPanel className="mt-8 w-full h-full overflow-y-auto p-6">
                        {steps.map((step, index) => {
                            const stepNumber = index + 1;
                            return (
                                <StepperContent key={step.id} value={stepNumber} className={""}>
                                    <div className="py-4">
                                        {typeof step.content === 'function'
                                            ? step.content({next: handleNext, prev: handlePrev, data: data, updateData})
                                            : step.content}
                                    </div>
                                </StepperContent>
                            );
                        })}
                    </StepperPanel>
                </Stepper>
            </div>

            <div className="px-6 py-4 border-t flex justify-between bg-muted/20">
                <div className="flex-auto">
                    {isHiddenAction('cancel') && (
                        <Button variant="ghost" onClick={handleCancel} size="lg" className="rounded-sm!">
                            {actions?.cancel?.label || 'Quitter'}
                        </Button>
                    )}
                </div>
                <div className="flex gap-2">
                    {isHiddenAction('previous') && (!isLocked && activeStep > 1 && (
                        <Button variant="outline" onClick={handlePrev} size="lg" className="rounded-sm!">
                            Précédent
                        </Button>
                    ))}
                    {isHiddenAction('previous') && (
                        <Button onClick={handleNext} size="lg" className="rounded-sm!">
                            {activeStep === steps.length ? 'Terminer' : 'Suivant'}
                        </Button>
                    )}
                </div>
            </div>

            <UploadProgressDialog
                open={showUploadDialog}
                onOpenChange={setShowUploadDialog}
                onAllComplete={handleFinishAfterUploads}
            />
        </div>
    );
};
