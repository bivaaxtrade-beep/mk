const fs = require('fs');
let code = fs.readFileSync('src/api/routes.ts', 'utf8');

const target = `    // Check if the deposit transaction has already been processed
    let depositDoc = null;
    let depositData: any = {};

    try {
      depositDoc = await adminDb.collection('deposits').doc(id).get();
    } catch (e: any) {
      logger.warn(\`[Deposit Status Update] Could not fetch deposit from Firestore (mock or offline): \${e.message}\`);
    }

    if (depositDoc && depositDoc.exists) {
      depositData = depositDoc.data() || {};
      // If already marked as credited and admin clicks approve again, return gracefully
      if (depositData?.credited === true && (status === 'success' || status === 'approved')) {
        return res.json({ success: true, message: 'This deposit has already been credited to user balance.' });
      }
    } else {
      logger.info(\`[Deposit Status Update] Deposit ID \${id} not found in Firestore. Proceeding with payload data.\`);
    }

    const userId = rawUserId || depositData?.userId || depositData?.uid || depositData?.user_id || '';
    const isSuccessOrApproved = status === 'success' || status === 'approved';

    if (!userId && isSuccessOrApproved) {
      return res.status(400).json({ error: 'User ID is missing. Cannot approve this ghost request. Please reject it.' });
    }

    // Determine the exact deposit amount requested by user
    let rawDepositAmount = 0;
    if (depositData?.amount !== undefined && !isNaN(Number(depositData.amount)) && Number(depositData.amount) > 0) {
      rawDepositAmount = Number(depositData.amount);
    } else if (amount !== undefined && !isNaN(Number(amount)) && Number(amount) > 0) {
      rawDepositAmount = Number(amount);
    } else if (finalAmountInBase !== undefined && !isNaN(Number(finalAmountInBase)) && Number(finalAmountInBase) > 0) {
      rawDepositAmount = Number(finalAmountInBase);
    }

    logger.info(\`Processing deposit update for user \${userId}, status: \${status}, rawAmount: \${rawDepositAmount}, isSuccessOrApproved: \${isSuccessOrApproved}\`);

    // Exact amount + bonus calculation (Bonus is separate system)
    let depositAmountWithBonus = new Big(rawDepositAmount);
    let bonusAmount = new Big(0);
    const bonusPercent = Number(depositData?.promoBonus || 0);

    if (isSuccessOrApproved && bonusPercent > 0) {
      bonusAmount = new Big(rawDepositAmount).times(bonusPercent).div(100);
      depositAmountWithBonus = depositAmountWithBonus.plus(bonusAmount);
      logger.info(\`Applying promo bonus: \${depositData?.promoCode || 'PROMO'} (\${bonusPercent}%) for user \${userId}. Base: \${rawDepositAmount}, Bonus: \${bonusAmount.toFixed(2)}, Total: \${depositAmountWithBonus.toFixed(2)}\`);
    }

    // 1. Sync with SQL transactions table if applicable
    let sqlTx = null;
    let firestoreIdToUpdate = id;

    // Try finding by exact SQL ID first (if 'id' is numeric)
    if (!isNaN(Number(id))) {
      sqlTx = await get('SELECT * FROM transactions WHERE id = ?', [id]) as any;
      if (sqlTx) {
        try {
          const detailsObj = JSON.parse(sqlTx.details || '{}');
          if (detailsObj.firestoreId) {
             firestoreIdToUpdate = detailsObj.firestoreId;
          }
        } catch (e) {}
      }
    }`;

const replacement = `    // 1. Sync with SQL transactions table if applicable (Resolve ID early)
    let sqlTx = null;
    let firestoreIdToUpdate = id;

    // Try finding by exact SQL ID first (if 'id' is numeric)
    if (!isNaN(Number(id))) {
      sqlTx = await get('SELECT * FROM transactions WHERE id = ?', [id]) as any;
      if (sqlTx) {
        try {
          const detailsObj = JSON.parse(sqlTx.details || '{}');
          if (detailsObj.firestoreId) {
             firestoreIdToUpdate = detailsObj.firestoreId;
          }
        } catch (e) {}
      }
    }

    // Check if the deposit transaction has already been processed
    let depositDoc = null;
    let depositData: any = {};

    try {
      depositDoc = await adminDb.collection('deposits').doc(firestoreIdToUpdate).get();
    } catch (e: any) {
      logger.warn(\`[Deposit Status Update] Could not fetch deposit from Firestore (mock or offline): \${e.message}\`);
    }

    if (depositDoc && depositDoc.exists) {
      depositData = depositDoc.data() || {};
      // If already marked as credited and admin clicks approve again, return gracefully
      if (depositData?.credited === true && (status === 'success' || status === 'approved')) {
        return res.json({ success: true, message: 'This deposit has already been credited to user balance.' });
      }
    } else {
      logger.info(\`[Deposit Status Update] Deposit ID \${id} not found in Firestore. Proceeding with payload data.\`);
    }

    const userId = rawUserId || depositData?.userId || depositData?.uid || depositData?.user_id || '';
    const isSuccessOrApproved = status === 'success' || status === 'approved';

    if (!userId && isSuccessOrApproved) {
      return res.status(400).json({ error: 'User ID is missing. Cannot approve this ghost request. Please reject it.' });
    }

    // Determine the exact deposit amount requested by user
    let rawDepositAmount = 0;
    if (depositData?.amount !== undefined && !isNaN(Number(depositData.amount)) && Number(depositData.amount) > 0) {
      rawDepositAmount = Number(depositData.amount);
    } else if (amount !== undefined && !isNaN(Number(amount)) && Number(amount) > 0) {
      rawDepositAmount = Number(amount);
    } else if (finalAmountInBase !== undefined && !isNaN(Number(finalAmountInBase)) && Number(finalAmountInBase) > 0) {
      rawDepositAmount = Number(finalAmountInBase);
    }

    logger.info(\`Processing deposit update for user \${userId}, status: \${status}, rawAmount: \${rawDepositAmount}, isSuccessOrApproved: \${isSuccessOrApproved}\`);

    // Exact amount + bonus calculation (Bonus is separate system)
    let depositAmountWithBonus = new Big(rawDepositAmount);
    let bonusAmount = new Big(0);
    const bonusPercent = Number(depositData?.promoBonus || 0);

    if (isSuccessOrApproved && bonusPercent > 0) {
      bonusAmount = new Big(rawDepositAmount).times(bonusPercent).div(100);
      depositAmountWithBonus = depositAmountWithBonus.plus(bonusAmount);
      logger.info(\`Applying promo bonus: \${depositData?.promoCode || 'PROMO'} (\${bonusPercent}%) for user \${userId}. Base: \${rawDepositAmount}, Bonus: \${bonusAmount.toFixed(2)}, Total: \${depositAmountWithBonus.toFixed(2)}\`);
    }
`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/api/routes.ts', code);
    console.log("Success");
} else {
    console.log("Target not found");
}
