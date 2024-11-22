import { Response } from 'express'

enum AuthorisedRoles {
  ROLE_CSIP_PROCESSOR = 'ROLE_CSIP_PROCESSOR',
}

export default AuthorisedRoles

export const isCsipProcessor = (res: Response) => res.locals.user.userRoles.includes('CSIP_PROCESSOR')
