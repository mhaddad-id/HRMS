const fs = require('fs');
const file = 'src/app/dashboard/payroll/payroll-table.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add Office column
content = content.replace(
  /    columnHelper\.accessor\('position', \{/,
  `    columnHelper.accessor('office_name', {
      header: 'Office',
      cell: (info) => <span className="text-sm font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor('position', {`
);

// 2. Adjust table width
content = content.replace(
  /<table className="w-full border-collapse text-sm">/,
  '<table className="w-full min-w-max lg:w-screen border-collapse text-sm">'
);

fs.writeFileSync(file, content);
console.log("Done");
