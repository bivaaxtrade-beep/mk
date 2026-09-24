#!/bin/bash
FILE="src/pages/Affiliate.tsx"
# Find the line containing q3 listener and replace the forEach line following it
sed -i '/onSnapshot(q3, (snap) => {/,/updateCombinedReferrals();/s/snap.docs.forEach(d => referralMap.set(d.id, { id: d.id, ...d.data() }));/snap.docs.forEach(d => { if (d.id !== currentUser.uid) { referralMap.set(d.id, { id: d.id, ...d.data() }); } });/' "$FILE"
# Repeat for q4
sed -i '/onSnapshot(q4, (snap) => {/,/updateCombinedReferrals();/s/snap.docs.forEach(d => referralMap.set(d.id, { id: d.id, ...d.data() }));/snap.docs.forEach(d => { if (d.id !== currentUser.uid) { referralMap.set(d.id, { id: d.id, ...d.data() }); } });/' "$FILE"
# Repeat for q5
sed -i '/onSnapshot(q5, (snap) => {/,/updateCombinedReferrals();/s/snap.docs.forEach(d => referralMap.set(d.id, { id: d.id, ...d.data() }));/snap.docs.forEach(d => { if (d.id !== currentUser.uid) { referralMap.set(d.id, { id: d.id, ...d.data() }); } });/' "$FILE"
