const fs = require('fs');
let lines = fs.readFileSync('src/api/routes.ts', 'utf8').split('\n');

const startIndex = lines.findIndex(l => l.includes('// Check if the deposit transaction has already been processed'));
const blockEndIndex = lines.findIndex(l => l.includes('if (!sqlTx) {'));

if (startIndex !== -1 && blockEndIndex !== -1) {
    const firestoreIdMatchIndex = lines.findIndex(l => l.includes('let firestoreIdToUpdate = id;'));
    
    // Create new block
    const newBlock = `    // 1. Sync with SQL transactions table if applicable (Resolve ID early)
    let sqlTx = null;
    let firestoreIdToUpdate = id;

    // Try finding by exact SQL ID first (if 'id' is numeric)
    if (!isNaN(Number(id))) {
      sqlTx = await (get as any)('SELECT * FROM transactions WHERE id = ?', [id]);
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
    }`;

    lines.splice(startIndex, blockEndIndex - startIndex, newBlock);
    fs.writeFileSync('src/api/routes.ts', lines.join('\n'));
    console.log("Success");
} else {
    console.log("Indices not found", startIndex, blockEndIndex);
}
