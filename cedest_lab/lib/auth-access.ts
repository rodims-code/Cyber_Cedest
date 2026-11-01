import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

export const ac = createAccessControl(defaultStatements);

export const gerant = ac.newRole({ ...adminAc.statements });
export const operateur = ac.newRole({});
export const technicien = ac.newRole({});

export const roles = { gerant, operateur, technicien };