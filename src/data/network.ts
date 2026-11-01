/* The account hierarchy.

   One admin sits at the top. Distributors sit under the admin, retailers sit
   under a distributor. A retailer is the leaf — nobody is ever onboarded below
   one, which is why the retailer console has no User Management section at all.

   Commission flows up: the percentage recorded on an account is the share its
   parent keeps. A retailer on 1% who collects ₹1,00,000 passes ₹1,000 up and
   keeps ₹99,000. */

export type Role = 'admin' | 'distributor' | 'retailer'

export type AccountStatus = 'active' | 'inactive' | 'banned'

export const ROLE_LABEL: Record<Role, string> = {
  admin: 'Admin',
  distributor: 'Distributor',
  retailer: 'Retailer',
}

/** Who each role may onboard. The empty list is what removes the whole
    User Management section from the retailer console. */
export const CAN_ONBOARD: Record<Role, InviteRole[]> = {
  admin: ['distributor', 'retailer'],
  distributor: ['retailer'],
  retailer: [],
}

/** Only the admin takes the final decision on an application. */
export const CAN_APPROVE: Record<Role, boolean> = {
  admin: true,
  distributor: false,
  retailer: false,
}

export type Account = {
  /** The auth user's uuid once live; the merchant code in the fixtures. It is
      what every relationship keys off, and it is never shown. */
  id: string
  /** What people read and quote at each other: MER2026… */
  merchantCode: string
  name: string
  email: string
  mobile: string
  role: Role
  /** null only for the admin. */
  parentId: string | null
  status: AccountStatus
  /** Share this account's parent keeps on everything it collects. */
  commissionPercent: number
  joined: string
  payin: number
  disbursement: number
  wallet: number
}

export const ADMIN_ID = 'ADM202600001'

export const seedAccounts: Account[] = [
  {
    id: ADMIN_ID,
    merchantCode: ADMIN_ID,
    name: 'SAI MOBILES HQ',
    email: 'admin@saimobiles.in',
    mobile: '9025232475',
    role: 'admin',
    parentId: null,
    status: 'active',
    commissionPercent: 0,
    joined: '2026-04-01T09:00:00',
    payin: 0,
    disbursement: 0,
    wallet: 0,
  },
  {
    id: 'MER202604654',
    merchantCode: 'MER202604654',
    name: 'PENNEARASSY',
    email: 'saimobilespondy@gmail.com',
    mobile: '9025232475',
    role: 'distributor',
    parentId: ADMIN_ID,
    status: 'active',
    commissionPercent: 0.75,
    joined: '2026-04-18T10:02:00',
    payin: 21068649.66,
    disbursement: 20282006,
    wallet: 8.06,
  },
  {
    id: 'MER202605120',
    merchantCode: 'MER202605120',
    name: 'ARUN TRADERS',
    email: 'arun.traders@gmail.com',
    mobile: '9842277310',
    role: 'distributor',
    parentId: ADMIN_ID,
    status: 'active',
    commissionPercent: 0.6,
    joined: '2026-06-02T11:40:00',
    payin: 8844200,
    disbursement: 8510900,
    wallet: 2140.8,
  },
  {
    id: 'MER202608112',
    merchantCode: 'MER202608112',
    name: 'RAMAN VENKATESAN',
    email: 'raman.venkatesan@gmail.com',
    mobile: '9843122087',
    role: 'retailer',
    parentId: 'MER202604654',
    status: 'active',
    commissionPercent: 1,
    joined: '2026-09-14T10:24:00',
    payin: 1284500,
    disbursement: 1180200,
    wallet: 4210.55,
  },
  {
    id: 'MER202608456',
    merchantCode: 'MER202608456',
    name: 'METTUR MUBARAK JEEWAS',
    email: 'mubarak.jeewas@gmail.com',
    mobile: '9025771340',
    role: 'retailer',
    parentId: 'MER202604654',
    status: 'active',
    commissionPercent: 1,
    joined: '2026-09-21T09:10:00',
    payin: 2946000,
    disbursement: 2702350,
    wallet: 1865.2,
  },
  {
    id: 'MER202609903',
    merchantCode: 'MER202609903',
    name: 'S NAGARADJANE',
    email: 'nagaradjane.s@gmail.com',
    mobile: '9367605320',
    role: 'retailer',
    parentId: 'MER202604654',
    status: 'inactive',
    commissionPercent: 1.25,
    joined: '2026-10-02T14:55:00',
    payin: 0,
    disbursement: 0,
    wallet: 0,
  },
  {
    id: 'MER202610554',
    merchantCode: 'MER202610554',
    name: 'D RAMKUMAR',
    email: 'ramkumar.d@gmail.com',
    mobile: '6381295496',
    role: 'retailer',
    parentId: 'MER202604654',
    status: 'active',
    commissionPercent: 1,
    joined: '2026-10-11T08:20:00',
    payin: 158900,
    disbursement: 142600,
    wallet: 312.9,
  },
  {
    id: 'MER202609341',
    merchantCode: 'MER202609341',
    name: 'K PRABAKARAN',
    email: 'prabakaran.k@gmail.com',
    mobile: '9080455321',
    role: 'retailer',
    parentId: 'MER202605120',
    status: 'active',
    commissionPercent: 0.9,
    joined: '2026-09-26T12:05:00',
    payin: 412000,
    disbursement: 398500,
    wallet: 980.4,
  },
  {
    id: 'MER202609477',
    merchantCode: 'MER202609477',
    name: 'T ANBUSELVAM',
    email: 'anbuselvam.t@gmail.com',
    mobile: '9566310224',
    role: 'retailer',
    parentId: 'MER202605120',
    status: 'banned',
    commissionPercent: 1,
    joined: '2026-09-29T16:48:00',
    payin: 0,
    disbursement: 0,
    wallet: 0,
  },
]

/* ------------------------------------------------------------- invitations */

export type InviteRole = 'distributor' | 'retailer'

/** pending   — link generated, nobody has filled it in yet
    submitted — applicant finished the form; sits with whoever invited them
    forwarded — a distributor reviewed a retailer and sent it up to the admin
    approved  — admin took the final decision; the account now exists
    rejected  — turned down, with a reason */
export type InviteStatus = 'pending' | 'submitted' | 'forwarded' | 'approved' | 'rejected'

import type { UploadedDoc } from '@/lib/documents'

export type Submission = {
  fullName: string
  email: string
  emailVerified: boolean
  mobile: string
  /** SMS is not wired up yet, so this stays false and the reviewer sees it. */
  mobileVerified: boolean
  shopName: string
  address: string
  pan: string
  panFront: string
  panBack: string
  aadhaar: string
  aadhaarFront: string
  aadhaarBack: string
  photo: string
  accountNumber: string
  ifsc: string
  cancelledCheque: string
  /** What the applicant actually uploaded, ready to open in review. */
  documents: UploadedDoc[]
  submittedAt: string
}

export type Invitation = {
  token: string
  invitedBy: string
  inviteRole: InviteRole
  note: string
  createdAt: string
  expiresAt: string
  status: InviteStatus
  submission?: Submission
  /** Set when a distributor passes a retailer up to the admin. */
  forwardedAt?: string
  proposedPercent?: number
  /** Set by the admin on the final decision. */
  decidedAt?: string
  commissionPercent?: number
  rejectionReason?: string
  accountId?: string
  /** The MPIN emailed to the applicant on approval — this is what they sign
      in with. Kept on the invitation because it is a record of what was sent,
      not a stored credential. */
  issuedMpin?: string
}

const DAY = 24 * 60 * 60 * 1000

export function expiryFrom(iso: string, days = 7) {
  return new Date(new Date(iso).getTime() + days * DAY).toISOString()
}

export const seedInvitations: Invitation[] = [
  {
    token: 'inv_8kQ2mXp4Rt',
    invitedBy: ADMIN_ID,
    inviteRole: 'distributor',
    note: 'Cuddalore territory',
    createdAt: '2026-10-28T11:20:00',
    expiresAt: '2026-11-04T11:20:00',
    status: 'submitted',
    submission: {
      fullName: 'V SRIRAMKUMAR',
      email: 'sriramkumar.v@gmail.com',
      emailVerified: true,
      mobile: '9790582300',
      mobileVerified: false,
      shopName: 'Sriram Mobiles',
      address: '14, Bharathi Street, Manjakuppam, Cuddalore, Tamil Nadu, 607001',
      pan: 'AFZPS2910L',
      panFront: 'pan-front.jpg',
      panBack: '',
      aadhaar: 'XXXX XXXX 8821',
      aadhaarFront: 'aadhaar-front.jpg',
      aadhaarBack: 'aadhaar-back.jpg',
      photo: 'photo.jpg',
      accountNumber: '1681155000076136',
      ifsc: 'KVBL0001681',
      cancelledCheque: 'cheque.pdf',
      documents: [
        { kind: 'pan_front', name: 'pan-front.jpg', mime: 'image/jpeg', size: 0, url: '' },
        { kind: 'aadhaar_front', name: 'aadhaar-front.jpg', mime: 'image/jpeg', size: 0, url: '' },
        { kind: 'aadhaar_back', name: 'aadhaar-back.jpg', mime: 'image/jpeg', size: 0, url: '' },
        { kind: 'photo', name: 'photo.jpg', mime: 'image/jpeg', size: 0, url: '' },
        { kind: 'cheque', name: 'cheque.pdf', mime: 'application/pdf', size: 0, url: '' },
      ],
      submittedAt: '2026-10-30T16:05:00',
    },
  },
  {
    token: 'inv_Lw9dHs1Vb7',
    invitedBy: 'MER202604654',
    inviteRole: 'retailer',
    note: 'Villianur shop',
    createdAt: '2026-10-29T09:15:00',
    expiresAt: '2026-11-05T09:15:00',
    status: 'submitted',
    submission: {
      fullName: 'L VIGNESHWARAN',
      email: 'vigneshwaran.l@gmail.com',
      emailVerified: true,
      mobile: '9655744464',
      mobileVerified: false,
      shopName: 'Vignesh Mobile Care',
      address: '7, Kamaraj Nagar, Villianur, Pondicherry, 605110',
      pan: 'BQXPV4471M',
      panFront: 'pan-front.jpg',
      panBack: 'pan-back.jpg',
      aadhaar: 'XXXX XXXX 3390',
      aadhaarFront: 'aadhaar-front.jpg',
      aadhaarBack: 'aadhaar-back.jpg',
      photo: 'photo.jpg',
      accountNumber: '50100393292469',
      ifsc: 'HDFC0001939',
      cancelledCheque: 'cheque.pdf',
      documents: [
        { kind: 'pan_front', name: 'pan-front.jpg', mime: 'image/jpeg', size: 0, url: '' },
        { kind: 'pan_back', name: 'pan-back.jpg', mime: 'image/jpeg', size: 0, url: '' },
        { kind: 'aadhaar_front', name: 'aadhaar-front.jpg', mime: 'image/jpeg', size: 0, url: '' },
        { kind: 'aadhaar_back', name: 'aadhaar-back.jpg', mime: 'image/jpeg', size: 0, url: '' },
        { kind: 'photo', name: 'photo.jpg', mime: 'image/jpeg', size: 0, url: '' },
        { kind: 'cheque', name: 'cheque.pdf', mime: 'application/pdf', size: 0, url: '' },
      ],
      submittedAt: '2026-10-31T10:22:00',
    },
  },
  {
    token: 'inv_Pz3nCk8Yd2',
    invitedBy: ADMIN_ID,
    inviteRole: 'retailer',
    note: 'Walk-in, Rajbhavan',
    createdAt: '2026-10-31T15:00:00',
    expiresAt: '2026-11-07T15:00:00',
    status: 'pending',
  },
]
