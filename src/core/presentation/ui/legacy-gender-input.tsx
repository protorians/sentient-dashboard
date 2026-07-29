import {LegacySelectInput, LegacySelectInputProps} from "@/core/presentation/ui/legacy-select-input";
import {UserGenderEnum} from "@/modules/users/domain/enums/user-gender.enum";


export function LegacyGenderInput(props: Omit<LegacySelectInputProps, 'options'>) {
    return (
        <LegacySelectInput
            id="gender"
            label="Genre"
            placeholder="Sélectionner"
            description={"Indiquez le genre pour plus de précision"}
            {...props}
            value={props.value || ''}
            onValueChange={(value) => props.onValueChange?.(value as UserGenderEnum)}
            options={[
                {value: UserGenderEnum.MALE, label: 'Homme'},
                {value: UserGenderEnum.FEMALE, label: 'Femme'},
                {value: UserGenderEnum.OTHER, label: 'Autre'},
            ]}
        />
    )
}