// api/src/app/org-users/dto/add-org-user.dto.ts
import { OrgRole } from '../../../entities/role.enum';

export class AddOrgUserDto {
  email: string;
  fullName: string;
  role: OrgRole;
  password?: string; // optional temp password
}
