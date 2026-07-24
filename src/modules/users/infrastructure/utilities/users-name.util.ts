import {UserInterface} from "@/modules/auth/domain/entities/user.interface";


export function getFullName(user: UserInterface): string {
  return (user.userData && user.userData.firstname && user.userData.lastname)
      ? `${user.userData.firstname} ${user.userData.lastname}`
      : "N/A";
}

export function getRolesNames(user: UserInterface): string {
  return user.roles.map(role => role.name).join(", ");
}