const fs = require('fs');
let code = fs.readFileSync('src/api/routes.ts', 'utf8');

code = code.replace(
  /const key = String\(item\.id \|\| item\.userId \|\| Math\.random\(\)\);/g,
  'const key = String(item.id || item.userId || item.uid || Math.random());'
);
code = code.replace(
  /userId: item\.userId \|\| '',/g,
  "userId: item.userId || item.uid || item.user_id || '',"
);
code = code.replace(
  /fullName: item\.fullName \|\| item\.userName \|\| '---',/g,
  "fullName: item.fullName || item.userName || item.name || item.full_name || '---',"
);
code = code.replace(
  /idType: item\.idType \|\| item\.documentType \|\| 'NID',/g,
  "idType: item.idType || item.documentType || item.document_type || 'NID',"
);
code = code.replace(
  /idNumber: item\.idNumber \|\| item\.documentNumber \|\| '---',/g,
  "idNumber: item.idNumber || item.documentNumber || item.document_number || '---',"
);
code = code.replace(
  /idFrontUrl: item\.idFrontUrl \|\| item\.frontImage \|\| '',/g,
  "idFrontUrl: item.idFrontUrl || item.frontImage || item.front_image || item.photoURL || '',"
);
code = code.replace(
  /idBackUrl: item\.idBackUrl \|\| item\.backImage \|\| '',/g,
  "idBackUrl: item.idBackUrl || item.backImage || item.back_image || '',"
);
code = code.replace(
  /selfieUrl: item\.selfieUrl \|\| item\.selfieImage \|\| '',/g,
  "selfieUrl: item.selfieUrl || item.selfieImage || item.selfie_image || '',"
);

fs.writeFileSync('src/api/routes.ts', code);
console.log('patched');
