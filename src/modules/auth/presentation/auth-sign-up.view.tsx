import { RegisterFormStepper } from "@/modules/auth/presentation/components/register-form-stepper";
import {FormScreen} from "@/core/presentation/FormScreen";

export function AuthSignUpView() {
    return (
        <FormScreen hideSideImage>
            <RegisterFormStepper />
        </FormScreen>
    )
}