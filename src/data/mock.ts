/* Fixture data mirroring the live merchant console, so layout and number
   formatting are exercised against realistic values rather than lorem. */

export type Status = 'success' | 'failed' | 'pending' | 'verified' | 'refunded'

export const merchant = {
  name: 'PENNEARASSY',
  role: 'Distributor',
  initials: 'PA',
  ccWallet: 8.06,
  commissionWallet: 574.81,
  paymentLink:
    'https://merchant.saimobiles.in/payment-process/pBJ1Cuh1TTDTY8Gtiz7UgGgGmFx8-2lbkrU-05Rg2_MC9wSJW6FlnQ',
}

export const walletSummary = {
  balance: 8.06,
  totalCredit: 21068649.66,
  totalDebit: 21068641.6,
  transactions: 1328,
}

/* ---------------------------------------------------------------- payouts */

export type Payout = {
  orderId: string
  date: string
  beneficiary: string
  account: string
  ifsc: string
  mobile: string
  mode: 'IMPS' | 'NEFT' | 'RTGS'
  amount: number
  status: Status
}

export const payouts: Payout[] = [
  { orderId: 'PO179346340419294CB18', date: '2026-10-31T21:46:00', beneficiary: 'HARIMOORTHY .', account: '163101505315', ifsc: 'ICIC0001631', mobile: '9585975507', mode: 'IMPS', amount: 90018, status: 'success' },
  { orderId: 'PO1793461094004D003CC', date: '2026-10-31T21:08:00', beneficiary: 'PRAKASH NAGARADJANE', account: '1242200100007047', ifsc: 'DCBL0000374', mobile: '7871178737', mode: 'IMPS', amount: 990, status: 'success' },
  { orderId: 'PO1793459868231F18FA2', date: '2026-10-31T20:47:00', beneficiary: 'Mr. G ANANDBABU', account: '1361155000078594', ifsc: 'CIUB0000532', mobile: '9003621006', mode: 'IMPS', amount: 96515, status: 'success' },
  { orderId: 'PO1793458968052A40C80', date: '2026-10-31T20:32:00', beneficiary: 'D Rajesh', account: '50220004842582', ifsc: 'ESMF0001304', mobile: '9894391350', mode: 'IMPS', amount: 31525, status: 'success' },
  { orderId: 'PO1793281272917FBD605', date: '2026-10-29T19:11:00', beneficiary: 'PRAKASH NAGARADJANE', account: '1242200100007047', ifsc: 'DCBL0000374', mobile: '7871178737', mode: 'IMPS', amount: 1770, status: 'success' },
  { orderId: 'PO179326887535485F82A', date: '2026-10-29T15:44:00', beneficiary: 'HARIMOORTHY .', account: '163101505315', ifsc: 'ICIC0001631', mobile: '9585975507', mode: 'IMPS', amount: 90018, status: 'failed' },
  { orderId: 'PO179326097373617F788', date: '2026-10-29T13:32:00', beneficiary: 'SASI KUMAR J', account: '1681155000074561', ifsc: 'KKBK0008790', mobile: '9940388499', mode: 'IMPS', amount: 93213, status: 'success' },
  { orderId: 'PO179320119111660B5F0', date: '2026-10-28T20:56:00', beneficiary: 'N Saravanan', account: '1242200100003258', ifsc: 'ESFB0001005', mobile: '9789695596', mode: 'IMPS', amount: 4040, status: 'success' },
  { orderId: 'PO1793195772950311E49', date: '2026-10-28T19:26:00', beneficiary: 'Mr. AKSHAYA RAJ SELVAGANDHI', account: '1361155000072212', ifsc: 'CIUB0000299', mobile: '7339361475', mode: 'IMPS', amount: 52992, status: 'success' },
  { orderId: 'PO179319360715195AD6B', date: '2026-10-28T18:50:00', beneficiary: 'N SARAVANAN', account: '1242200100008833', ifsc: 'PUNB0124220', mobile: '9789695596', mode: 'IMPS', amount: 49242, status: 'success' },
  { orderId: 'PO1793193395077BE7CE1', date: '2026-10-28T18:46:00', beneficiary: 'SARATHI S', account: '50100393295514', ifsc: 'HDFC0000492', mobile: '9840049674', mode: 'IMPS', amount: 44119, status: 'success' },
  { orderId: 'PO17931915061915DE2F6', date: '2026-10-28T18:15:00', beneficiary: 'SARATHI S', account: '50100393295514', ifsc: 'HDFC0000492', mobile: '9840049674', mode: 'IMPS', amount: 45097, status: 'success' },
  { orderId: 'PO179318554925743ECBB', date: '2026-10-28T16:35:00', beneficiary: 'Sathish Kumar', account: '553332265', ifsc: 'IDIB000M133', mobile: '9791516524', mode: 'IMPS', amount: 19558, status: 'success' },
]

export const disbursementSummary = {
  settled: 20282006,
  inProgress: 0,
  failedCount: 16,
  failedRange: '19 Sep 2026 – 29 Oct 2026',
}

/* ---------------------------------------------------------- beneficiaries */

export type Beneficiary = {
  id: number
  date: string
  ifsc: string
  account: string
  name: string
  mobile: string
  status: Status
}

export const beneficiaries: Beneficiary[] = [
  { id: 1, date: '2026-10-31T15:00:00', ifsc: 'ESMF0001304', account: '50220004842582', name: 'D Rajesh', mobile: '9894391350', status: 'verified' },
  { id: 2, date: '2026-10-29T10:12:00', ifsc: 'ICIC0001631', account: '163101505315', name: 'HARIMOORTHY .', mobile: '9585975507', status: 'verified' },
  { id: 3, date: '2026-10-28T11:03:00', ifsc: 'IDIB000M133', account: '553332265', name: 'Sathish Kumar', mobile: '9791516524', status: 'verified' },
  { id: 4, date: '2026-10-28T09:45:00', ifsc: 'KVBL0001681', account: '1681155000076136', name: 'V SRIRAMKUMAR', mobile: '9790582300', status: 'verified' },
  { id: 5, date: '2026-10-28T09:32:00', ifsc: 'HDFC0001939', account: '50100393292469', name: 'L VIGNESHWARAN', mobile: '9655744464', status: 'verified' },
  { id: 6, date: '2026-10-28T08:58:00', ifsc: 'CIUB0000532', account: '1361155000078594', name: 'Mr. G ANANDBABU', mobile: '9003621006', status: 'verified' },
  { id: 7, date: '2026-10-28T08:14:00', ifsc: 'HDFC0000492', account: '50100393295514', name: 'SARATHI S', mobile: '9840049674', status: 'verified' },
  { id: 8, date: '2026-10-27T18:40:00', ifsc: 'KKBK0008790', account: '1681155000074561', name: 'SASI KUMAR J', mobile: '9940388499', status: 'verified' },
  { id: 9, date: '2026-10-27T16:22:00', ifsc: 'ESFB0001005', account: '1242200100003258', name: 'N Saravanan', mobile: '9789695596', status: 'verified' },
  { id: 10, date: '2026-10-27T14:05:00', ifsc: 'CIUB0000299', account: '1361155000072212', name: 'Mr. AKSHAYA RAJ SELVAGANDHI', mobile: '7339361475', status: 'verified' },
  { id: 11, date: '2026-10-27T12:34:00', ifsc: 'SBIN0006718', account: '20040264637', name: 'Mr. ANANDARUBAN .', mobile: '9944099806', status: 'verified' },
  { id: 12, date: '2026-10-27T09:17:00', ifsc: 'PUNB0124220', account: '1242200100008833', name: 'N SARAVANAN', mobile: '9789695596', status: 'verified' },
  { id: 13, date: '2026-10-27T08:06:00', ifsc: 'PUNB0124220', account: '1242200100008666', name: 'S NAGARADJANE', mobile: '9367605320', status: 'verified' },
  { id: 14, date: '2026-10-27T06:10:00', ifsc: 'SBIN0016854', account: '20281436309', name: 'Mr. MANIKANDAN P', mobile: '8870123669', status: 'verified' },
  { id: 15, date: '2026-10-27T04:59:00', ifsc: 'IOBA0001976', account: '197601000013094', name: 'D Ramkumar', mobile: '6381295496', status: 'verified' },
  { id: 16, date: '2026-10-26T08:03:00', ifsc: 'ICIC0000001', account: '000101606565', name: 'VENKATESWARAN M', mobile: '9943521681', status: 'verified' },
  { id: 17, date: '2026-10-25T03:59:00', ifsc: 'IDIB000K072', account: '6404153570', name: 'P ARAVINDHARAJAN SO PERUMAL', mobile: '6380095710', status: 'verified' },
  { id: 18, date: '2026-10-25T03:50:00', ifsc: 'UTIB0000209', account: '923010002095355', name: 'VASANTHKUMAR E', mobile: '6374861759', status: 'verified' },
  { id: 19, date: '2026-10-24T13:15:00', ifsc: 'SBIN0012931', account: '31496867262', name: 'Mr. THIYAGARAJAN P', mobile: '8300370903', status: 'verified' },
  { id: 20, date: '2026-10-24T09:49:00', ifsc: 'SBIN0000900', account: '30188060552', name: 'Mr. V JENARDANAN', mobile: '9943699868', status: 'verified' },
]

export const beneficiaryTotal = 256

/* --------------------------------------------------------- payment links */

export type PaymentLink = {
  id: number
  date: string
  gateway: string
  product: string
  customer: string
  mobile: string
  amount: number
  status: Status
}

export const paymentLinks: PaymentLink[] = [
  { id: 103944, date: '2026-10-31T20:41:00', gateway: 'SAIFIRE', product: 'Travel', customer: 'bakiaraj', mobile: '9003621006', amount: 20113, status: 'failed' },
  { id: 103930, date: '2026-10-31T20:39:00', gateway: 'SAIFIRE', product: 'Travel', customer: 'bakiaraj', mobile: '9003621006', amount: 49997, status: 'success' },
  { id: 103908, date: '2026-10-31T20:34:00', gateway: 'SAIFIRE', product: 'Ferry', customer: 'bakiaraj', mobile: '9003621006', amount: 49998, status: 'failed' },
  { id: 103895, date: '2026-10-31T20:30:00', gateway: 'SAIFIRE', product: 'Ferry', customer: 'bakiaraj', mobile: '9003621006', amount: 49999, status: 'success' },
  { id: 103878, date: '2026-10-31T20:27:00', gateway: 'SAIFIRE', product: 'Travel', customer: 'rajesh', mobile: '9894391350', amount: 32501, status: 'success' },
  { id: 91949, date: '2026-10-29T15:39:00', gateway: 'SAIWATER', product: 'Ferry', customer: 'Harimoorthy', mobile: '9585975507', amount: 42119, status: 'success' },
  { id: 91928, date: '2026-10-29T15:36:00', gateway: 'SAIWATER', product: 'Ferry', customer: 'Harimoorthy', mobile: '9585975507', amount: 49999, status: 'success' },
  { id: 89290, date: '2026-10-28T18:39:00', gateway: 'SAIWATER', product: 'Ferry', customer: 'sarathi', mobile: '9840049674', amount: 45001, status: 'success' },
  { id: 89241, date: '2026-10-28T18:12:00', gateway: 'SAIWATER', product: 'Travel', customer: 'sarathi', mobile: '9840049674', amount: 45097, status: 'success' },
  { id: 88904, date: '2026-10-28T16:28:00', gateway: 'SAIFIRE', product: 'Travel', customer: 'sathish', mobile: '9791516524', amount: 19558, status: 'failed' },
]

export const paymentLinkSummary = {
  total: 184,
  range: '01 Sep 2026 – 31 Oct 2026',
  collected: 3945547,
  awaiting: 0,
  failed: 66,
}

/* ------------------------------------------------------------ wallet ledger */

export type LedgerEntry = {
  date: string
  type: 'credit' | 'debit'
  source: string
  sourceNote?: string
  reference: string
  txnAmount: number
  amount: number
}

export const ledger: LedgerEntry[] = [
  { date: '2026-10-31T21:46:00', type: 'debit', source: 'Disbursement', reference: 'PO179346340419294CB18', txnAmount: 90018, amount: -90018 },
  { date: '2026-10-31T21:23:00', type: 'credit', source: 'Reversal', reference: 'PO179326887535485F82A', txnAmount: 90018, amount: 90018 },
  { date: '2026-10-31T21:08:00', type: 'debit', source: 'Disbursement', reference: 'PO1793461094004D003CC', txnAmount: 990, amount: -990 },
  { date: '2026-10-31T20:47:00', type: 'debit', source: 'Disbursement', reference: 'PO1793459868231F18FA2', txnAmount: 96515, amount: -96515 },
  { date: '2026-10-31T20:40:00', type: 'credit', source: 'Fund Load', sourceNote: 'SAIFIRE Travel · Payin', reference: '6882444706', txnAmount: 49997, amount: 48477.09 },
  { date: '2026-10-31T20:32:00', type: 'debit', source: 'Disbursement', reference: 'PO1793458968052A40C80', txnAmount: 31525, amount: -31525 },
  { date: '2026-10-31T20:32:00', type: 'credit', source: 'Fund Load', sourceNote: 'SAIFIRE Ferry · Payin', reference: '6882403109', txnAmount: 49999, amount: 48904.02 },
  { date: '2026-10-31T20:30:00', type: 'debit', source: 'Bank Verification', reference: '34811', txnAmount: 5, amount: -5 },
  { date: '2026-10-31T20:28:00', type: 'credit', source: 'Fund Load', sourceNote: 'SAIFIRE Travel · Payin', reference: '6882387393', txnAmount: 32501, amount: 31649.47 },
  { date: '2026-10-29T19:11:00', type: 'debit', source: 'Disbursement', reference: 'PO1793281272917FBD605', txnAmount: 1770, amount: -1770 },
  { date: '2026-10-29T15:44:00', type: 'debit', source: 'Disbursement', reference: 'PO179326887535485F82A', txnAmount: 90018, amount: -90018 },
  { date: '2026-10-29T13:32:00', type: 'debit', source: 'Disbursement', reference: 'PO179326097373617F788', txnAmount: 93213, amount: -93213 },
]

/* Overview "Recent Transactions" — the ledger read as plain English. */
export const recentActivity = ledger.slice(0, 8).map((entry) => ({
  date: entry.date,
  type: entry.type,
  amount: entry.amount,
  description:
    entry.source === 'Disbursement'
      ? `Payout to ${payouts.find((p) => p.orderId === entry.reference)?.beneficiary ?? 'beneficiary'}`
      : entry.source === 'Reversal'
        ? `Refund: payout ${entry.reference} — webhook reported failed`
        : entry.source === 'Fund Load'
          ? 'Load Money'
          : entry.source,
  note: entry.sourceNote,
}))

/* ------------------------------------------------------------- qr payments */

export type QrPayment = {
  id: string
  date: string
  gateway: string
  utr: string
  amount: number
  status: Status
  reason?: string
}

export const qrPayments: QrPayment[] = [
  { id: 'QR17932552977040D175C', date: '2026-10-29T11:58:00', gateway: 'Sai QR 1', utr: '553479158955', amount: 95000, status: 'success' },
  { id: 'QR17931955617328316FC', date: '2026-10-28T19:22:00', gateway: 'Sai QR 1', utr: '003058054659', amount: 54000, status: 'success' },
  { id: 'QR1793180762798E5324B', date: '2026-10-28T15:16:00', gateway: 'Sai QR 1', utr: '616970813051', amount: 35000, status: 'success' },
  { id: 'QR17931779913901D94B9', date: '2026-10-28T14:29:00', gateway: 'Sai QR 1', utr: '131981018940', amount: 40000, status: 'success' },
  { id: 'QR1793177223488DAD48A', date: '2026-10-28T14:17:00', gateway: 'Sai QR 1', utr: '666760411652', amount: 30000, status: 'success' },
  { id: 'QR1793177008298A803D5', date: '2026-10-28T14:13:00', gateway: 'Sai QR 1', utr: '131980189740', amount: 59990, status: 'success' },
  { id: 'QR179317334883624DF27', date: '2026-10-28T13:12:00', gateway: 'Sai QR 1', utr: '630192986645', amount: 10000, status: 'success' },
  { id: 'QR1793173292594031CB0', date: '2026-10-28T13:11:00', gateway: 'Sai QR 1', utr: '666730001437', amount: 40000, status: 'success' },
  { id: 'QR1793104082035707A0B', date: '2026-10-27T17:58:00', gateway: 'Sai QR 1', utr: '788434410051', amount: 50000, status: 'success' },
  { id: 'QR1793084522261CEF08D', date: '2026-10-27T12:32:00', gateway: 'Sai QR 1', utr: '122629314253', amount: 27600, status: 'success' },
  { id: 'QR17930832725670BF7C6', date: '2026-10-27T12:11:00', gateway: 'Sai QR 1', utr: '564485862478', amount: 10000, status: 'success' },
  { id: 'QR1793077229166DF712F', date: '2026-10-27T10:30:00', gateway: 'Sai QR 1', utr: '131920663604', amount: 10000, status: 'success' },
  { id: 'QR179307007246743FB77', date: '2026-10-27T08:31:00', gateway: 'Sai QR 1', utr: '666603364239', amount: 60000, status: 'success' },
  { id: 'QR1793070007246D7826D', date: '2026-10-27T08:30:00', gateway: 'Sai QR 1', utr: '666643784038', amount: 30000, status: 'success' },
  { id: 'QR179300950137375E735', date: '2026-10-26T15:41:00', gateway: 'Sai QR 1', utr: '666506013388', amount: 12500, status: 'success' },
  { id: 'QR17930032817790E6AE1', date: '2026-10-26T13:58:00', gateway: 'Sai QR 1', utr: '666524574427', amount: 30581, status: 'success' },
  { id: 'QR17928295679634D04C4', date: '2026-10-24T13:42:00', gateway: 'Sai QR 1', utr: '629745943961', amount: 55000, status: 'success' },
  { id: 'QR17928264961647061AF', date: '2026-10-24T12:51:00', gateway: 'Sai QR 1', utr: '629774273874', amount: 20000, status: 'success' },
]

export const qrPaymentTotal = 417

/* ----------------------------------------------------------------- reports */

export const monthlyVolume = [
  { month: 'Nov 25', value: 0 },
  { month: 'Dec 25', value: 0 },
  { month: 'Jan 26', value: 0 },
  { month: 'Feb 26', value: 0 },
  { month: 'Mar 26', value: 0 },
  { month: 'Apr 26', value: 0 },
  { month: 'May 26', value: 0 },
  { month: 'Jun 26', value: 0 },
  { month: 'Jul 26', value: 0 },
  { month: 'Aug 26', value: 0 },
  { month: 'Sep 26', value: 397547 },
  { month: 'Oct 26', value: 3548000 },
]

export const yearlyVolume = [
  { month: '2024', value: 0 },
  { month: '2025', value: 0 },
  { month: '2026', value: 3945547 },
]

export const gateways = ['SAIFIRE | Travel', 'SAIFIRE | Ferry', 'SAIWATER | Ferry', 'SAIWATER | Travel']

/* -------------------------------------------------------------- commission */

export const commissionSummary = {
  balance: 574.81,
  totalEarned: 574.81,
  transactions: 66,
  todayTransactions: 0,
  todayCommission: 0,
  monthTransactions: 0,
  monthCommission: 0,
  /** Withdrawal is paused upstream, so the transfer action is advisory only. */
  withdrawalPaused: true,
}

export type CommissionSource = 'QR Payments' | 'Utility Payments' | 'Credit Card Payments'

export type CommissionTxn = {
  date: string
  amount: number
  orderId: string
  source: CommissionSource
  earnedFrom: string
}

const MUBARAK = 'METTUR MUBARAK JEEWAS'
const RAMAN = 'RAMAN VENKATESAN'

export const commissionTxns: CommissionTxn[] = [
  { date: '2026-10-25T13:18:00', amount: 3.0, orderId: 'order_Ts3vhnhCOqXWA7', source: 'Utility Payments', earnedFrom: RAMAN },
  { date: '2026-10-23T17:22:00', amount: 19.98, orderId: 'QR1792755859119E77C19', source: 'QR Payments', earnedFrom: MUBARAK },
  { date: '2026-10-23T16:47:00', amount: 5.0, orderId: 'QR179275412933433877A', source: 'QR Payments', earnedFrom: MUBARAK },
  { date: '2026-10-23T13:08:00', amount: 4.9, orderId: 'QR1792740724474813EED', source: 'QR Payments', earnedFrom: MUBARAK },
  { date: '2026-10-22T16:21:00', amount: 12.0, orderId: 'QR1792665909477B46BCE', source: 'QR Payments', earnedFrom: RAMAN },
  { date: '2026-10-22T16:21:00', amount: 8.0, orderId: 'QR1792665957214451A0E', source: 'QR Payments', earnedFrom: RAMAN },
  { date: '2026-10-22T15:31:00', amount: 9.8, orderId: 'QR1792662760518F366DF', source: 'QR Payments', earnedFrom: MUBARAK },
  { date: '2026-10-22T14:09:00', amount: 10.0, orderId: 'QR1792657928712CE7FDC', source: 'QR Payments', earnedFrom: MUBARAK },
  { date: '2026-10-21T16:50:00', amount: 8.2, orderId: 'QR179258141450010C8A0', source: 'QR Payments', earnedFrom: MUBARAK },
  { date: '2026-10-21T16:10:00', amount: 5.2, orderId: 'QR179257886791018417B', source: 'QR Payments', earnedFrom: MUBARAK },
  { date: '2026-10-21T14:59:00', amount: 13.6, orderId: 'QR1792574271505C67678', source: 'QR Payments', earnedFrom: MUBARAK },
  { date: '2026-10-21T14:51:00', amount: 12.0, orderId: 'QR1792574225593BA5972', source: 'QR Payments', earnedFrom: MUBARAK },
  { date: '2026-10-21T13:39:00', amount: 18.0, orderId: 'QR1792569877287F813FD', source: 'QR Payments', earnedFrom: MUBARAK },
  { date: '2026-10-20T14:33:00', amount: 10.0, orderId: 'order_Tq6YY9I8LUcbaQ', source: 'Utility Payments', earnedFrom: RAMAN },
  { date: '2026-10-20T12:57:00', amount: 17.6, orderId: 'QR1792480969348F0399B', source: 'QR Payments', earnedFrom: MUBARAK },
  { date: '2026-10-20T11:27:00', amount: 2.0, orderId: 'QR17924756582834BDC35', source: 'QR Payments', earnedFrom: MUBARAK },
  { date: '2026-10-19T17:14:00', amount: 10.8, orderId: 'QR1792410116647053E53', source: 'QR Payments', earnedFrom: RAMAN },
  { date: '2026-10-19T16:30:00', amount: 6.0, orderId: 'QR1792407508229989E32', source: 'QR Payments', earnedFrom: MUBARAK },
]

export const commissionTxnTotal = 66

/* Derived, not transcribed — the ranking and the overview chart read from the
   same transactions, so the two can never disagree. */
export const topEarningDays = Object.entries(
  commissionTxns.reduce<Record<string, number>>((days, txn) => {
    const day = txn.date.slice(0, 10)
    days[day] = (days[day] ?? 0) + txn.amount
    return days
  }, {}),
)
  .map(([date, amount]) => ({ date, amount: Number(amount.toFixed(2)) }))
  .sort((a, b) => b.amount - a.amount)
  .slice(0, 5)

export type CommissionRate = {
  service: string
  note: string
  basis: string
  rate: string
  cap: string
  credited: string
  effectiveFrom: string
}

export const commissionRates: CommissionRate[] = [
  { service: 'QR Payments', note: 'Collections against your static and dynamic QRs', basis: 'Percentage', rate: '0.02% of transaction value', cap: 'No cap', credited: 'Instantly on success', effectiveFrom: '2026-09-01' },
  { service: 'Utility Payments', note: 'Electricity, gas, broadband and DTH', basis: 'Flat', rate: '₹3.00 per transaction', cap: '—', credited: 'Instantly on success', effectiveFrom: '2026-09-01' },
  { service: 'Credit Card Payments', note: 'Card bill payments routed over Bharat Connect', basis: 'Percentage', rate: '0.015% of transaction value', cap: '₹250 per transaction', credited: 'On settlement, T+1', effectiveFrom: '2026-09-01' },
  { service: 'Payment Links', note: 'Collections against links you share', basis: 'Percentage', rate: '0.02% of transaction value', cap: 'No cap', credited: 'On settlement, T+1', effectiveFrom: '2026-09-01' },
  { service: 'Bank Verification', note: 'Penny-drop checks on beneficiary accounts', basis: 'Flat', rate: 'No commission', cap: '—', credited: '—', effectiveFrom: '2026-09-01' },
]

/* -------------------------------------------------------------------- team */

export type TeamStatus = 'active' | 'inactive' | 'banned'

export type TeamMember = {
  id: string
  name: string
  email: string
  mobile: string
  role: 'Sub-Distributor' | 'Retailer'
  status: TeamStatus
  joined: string
  payin: number
  disbursement: number
  wallet: number
  team: TeamMember[]
}

export const team: TeamMember[] = [
  {
    id: 'MER202608112',
    name: RAMAN,
    email: 'raman.venkatesan@gmail.com',
    mobile: '9843122087',
    role: 'Sub-Distributor',
    status: 'active',
    joined: '2026-09-14T10:24:00',
    payin: 1284500,
    disbursement: 1180200,
    wallet: 4210.55,
    team: [
      { id: 'MER202609341', name: 'K PRABAKARAN', email: 'prabakaran.k@gmail.com', mobile: '9080455321', role: 'Retailer', status: 'active', joined: '2026-09-26T12:05:00', payin: 412000, disbursement: 398500, wallet: 980.4, team: [] },
      { id: 'MER202609477', name: 'T ANBUSELVAM', email: 'anbuselvam.t@gmail.com', mobile: '9566310224', role: 'Retailer', status: 'banned', joined: '2026-09-29T16:48:00', payin: 0, disbursement: 0, wallet: 0, team: [] },
    ],
  },
  {
    id: 'MER202608456',
    name: MUBARAK,
    email: 'mubarak.jeewas@gmail.com',
    mobile: '9025771340',
    role: 'Sub-Distributor',
    status: 'active',
    joined: '2026-09-21T09:10:00',
    payin: 2946000,
    disbursement: 2702350,
    wallet: 1865.2,
    team: [
      { id: 'MER202610028', name: 'J FAIZAL RAHMAN', email: 'faizal.rahman@gmail.com', mobile: '9710228845', role: 'Retailer', status: 'active', joined: '2026-10-04T11:32:00', payin: 736400, disbursement: 701900, wallet: 1240.75, team: [] },
    ],
  },
  {
    id: 'MER202609903',
    name: 'S NAGARADJANE',
    email: 'nagaradjane.s@gmail.com',
    mobile: '9367605320',
    role: 'Retailer',
    status: 'inactive',
    joined: '2026-10-02T14:55:00',
    payin: 0,
    disbursement: 0,
    wallet: 0,
    team: [],
  },
  {
    id: 'MER202610554',
    name: 'D RAMKUMAR',
    email: 'ramkumar.d@gmail.com',
    mobile: '6381295496',
    role: 'Retailer',
    status: 'active',
    joined: '2026-10-11T08:20:00',
    payin: 158900,
    disbursement: 142600,
    wallet: 312.9,
    team: [],
  },
]

/* ----------------------------------------------------------------- tickets */

export type TicketStatus = 'submitted' | 'opened' | 'in_progress' | 'resolved' | 'rejected'

export type Ticket = {
  id: string
  title: string
  subject: string
  status: TicketStatus
  raisedOn: string
  updatedOn: string
  replies: number
}

export const tickets: Ticket[] = [
  { id: 'TKT-2611-0002', title: 'Add a retailer under my account', subject: 'Onboarding blocked at merchant type', status: 'submitted', raisedOn: '2026-11-01T09:15:00', updatedOn: '2026-11-01T09:15:00', replies: 0 },
  { id: 'TKT-2610-0041', title: 'Payout stuck in pending', subject: 'Disbursement PO1793268875354 not settled', status: 'in_progress', raisedOn: '2026-10-29T16:12:00', updatedOn: '2026-10-31T10:04:00', replies: 3 },
  { id: 'TKT-2610-0038', title: 'Commission withdrawal paused', subject: 'Transfer to CC wallet unavailable', status: 'opened', raisedOn: '2026-10-27T11:45:00', updatedOn: '2026-10-28T09:22:00', replies: 1 },
  { id: 'TKT-2610-0033', title: 'Beneficiary verification failing', subject: 'Penny drop rejected for ESMF0001304', status: 'resolved', raisedOn: '2026-10-22T13:08:00', updatedOn: '2026-10-24T17:40:00', replies: 5 },
  { id: 'TKT-2610-0029', title: 'QR settlement report mismatch', subject: 'October QR totals differ from the ledger', status: 'resolved', raisedOn: '2026-10-18T10:30:00', updatedOn: '2026-10-20T12:15:00', replies: 4 },
  { id: 'TKT-2610-0024', title: 'Raise daily disbursement limit', subject: 'Request to increase the IMPS cap', status: 'rejected', raisedOn: '2026-10-14T15:55:00', updatedOn: '2026-10-16T11:02:00', replies: 2 },
]

/* ----------------------------------------------------------------- support */

export type SupportContact = {
  kind: 'phone' | 'whatsapp' | 'email' | 'escalation'
  channel: string
  detail: string
  note: string
  href: string
}

export const supportContacts: SupportContact[] = [
  { kind: 'phone', channel: 'Merchant helpline', detail: '1800 419 7732', note: 'Mon to Sat, 9:00 am – 8:00 pm IST', href: 'tel:18004197732' },
  { kind: 'whatsapp', channel: 'WhatsApp support', detail: '+91 94445 01732', note: 'Replies within 30 minutes on working days', href: 'https://wa.me/919444501732' },
  { kind: 'email', channel: 'Email support', detail: 'support@saimobiles.in', note: 'First response within one business day', href: 'mailto:support@saimobiles.in' },
  { kind: 'escalation', channel: 'Settlement escalation', detail: 'settlements@saimobiles.in', note: 'For payouts unresolved beyond 48 hours', href: 'mailto:settlements@saimobiles.in' },
]

export const supportTopics = [
  {
    question: 'When does a disbursement settle?',
    answer:
      'IMPS payouts settle within minutes. A payout still showing In progress after two hours is auto-reconciled against the bank and either credited to the beneficiary or reversed to your wallet.',
  },
  {
    question: 'Why was my beneficiary rejected?',
    answer:
      'Every account goes through a penny-drop check. A rejection means the name on the account did not match, or the account does not accept credits. Add it again with the name exactly as the bank holds it.',
  },
  {
    question: 'When is commission credited?',
    answer:
      'QR and utility commission is credited the moment the transaction succeeds. Card payments and payment links are credited on settlement, T+1.',
  },
  {
    question: 'How do I add someone to my team?',
    answer:
      'User Management, then Add User. You will need their PAN, Aadhaar, a photograph and a cancelled cheque for the settlement account.',
  },
]

/* ---------------------------------------------------------------- settings */

export const profile = {
  merchantCode: 'MER202604654',
  merchantType: 'Distributor',
  email: 'saimobilespondy@gmail.com',
  mobile: '9025232475',
  shopName: '',
  gender: 'Female',
  address: 'W/O Nagaradjane, 4, Sangaradoss Street, Rajbhavan, Pondicherry, Pondicherry, India, 605001',
  accountStatus: 'Active',
  onboardedOn: '2026-04-18T10:02:00',
}

export type KycRecord = {
  label: string
  value: string
  status: Status
  verifiedOn?: string
  document?: string
}

export const kycRecords: KycRecord[] = [
  { label: 'PAN', value: 'ABXPP4821K', status: 'verified', verifiedOn: '2026-04-18T10:46:00', document: 'pan-front.jpg' },
  { label: 'Aadhaar', value: 'XXXX XXXX 4417', status: 'verified', verifiedOn: '2026-04-18T10:51:00', document: 'aadhaar-front.jpg, aadhaar-back.jpg' },
  { label: 'Customer photo', value: 'Captured at onboarding', status: 'verified', verifiedOn: '2026-04-18T10:53:00', document: 'customer-photo.jpg' },
  { label: 'Settlement account', value: '1242200100008666 · PUNB0124220', status: 'verified', verifiedOn: '2026-04-18T11:12:00', document: 'cancelled-cheque.pdf' },
  { label: 'Shop establishment proof', value: 'Not submitted', status: 'pending' },
]

export type SessionRecord = {
  device: string
  browser: string
  location: string
  ip: string
  lastActive: string
  current: boolean
}

export const sessions: SessionRecord[] = [
  { device: 'Windows 11', browser: 'Chrome 141', location: 'Pondicherry, IN', ip: '103.214.61.22', lastActive: '2026-11-01T09:42:00', current: true },
  { device: 'Android 15', browser: 'Sai Mobiles app 3.4', location: 'Pondicherry, IN', ip: '49.206.14.180', lastActive: '2026-10-31T21:05:00', current: false },
  { device: 'Windows 11', browser: 'Edge 140', location: 'Chennai, IN', ip: '106.51.77.4', lastActive: '2026-10-28T18:33:00', current: false },
]

export type ActivityEvent = {
  event: string
  detail: string
  at: string
  ip: string
  tone: 'neutral' | 'success' | 'warning' | 'danger'
}

export const activityEvents: ActivityEvent[] = [
  { event: 'Signed in', detail: 'Password and MPIN verified', at: '2026-11-01T09:42:00', ip: '103.214.61.22', tone: 'neutral' },
  { event: 'Disbursement created', detail: 'PO179346340419294CB18 to HARIMOORTHY .', at: '2026-10-31T21:46:00', ip: '103.214.61.22', tone: 'success' },
  { event: 'Beneficiary added', detail: 'D Rajesh · ESMF0001304', at: '2026-10-31T15:00:00', ip: '103.214.61.22', tone: 'neutral' },
  { event: 'Disbursement failed', detail: 'PO179326887535485F82A reversed to wallet', at: '2026-10-29T15:44:00', ip: '49.206.14.180', tone: 'danger' },
  { event: 'MPIN changed', detail: 'Changed from the merchant console', at: '2026-10-26T11:18:00', ip: '103.214.61.22', tone: 'warning' },
  { event: 'Signed in', detail: 'Password and MPIN verified', at: '2026-10-26T11:02:00', ip: '103.214.61.22', tone: 'neutral' },
]
