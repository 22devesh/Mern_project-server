const bcrypt=require('bcryptjs');
bcrypt.hash('ABC@1234',10).then(console.log);