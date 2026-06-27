import { RegisterForm } from "@/modules/auth/presentation/components/register-form";
import {FormScreen} from "@/core/presentation/FormScreen";

export function AuthSignUpView() {
    return (
        <FormScreen>
            <RegisterForm />
        </FormScreen>
    )
}