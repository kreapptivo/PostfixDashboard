import { ArrowDownTrayIcon } from './icons/IconComponents';

interface DataExportProps<T extends object> {
  data: T[];
  filename: string;
}

const DataExport = <T extends object>({ data, filename }: DataExportProps<T>) => {
  const convertToCSV = (objArray: T[]) => {
    if (objArray.length === 0) return '';

    const headers = Object.keys(objArray[0]) as Array<keyof T>;
    const rows = objArray.map((row) =>
      headers
        .map((header) => {
          const value = row[header] as unknown;
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') {
            return JSON.stringify(value);
          }
          if (typeof value === 'symbol') {
            return value.toString();
          }
          if (typeof value === 'function') {
            return '';
          }
          if (typeof value === 'bigint') {
            return value.toString();
          }
          if (
            typeof value === 'string' ||
            typeof value === 'number' ||
            typeof value === 'boolean'
          ) {
            return String(value).replace(/"/g, '""');
          }
          return JSON.stringify(value);
        })
        .join(','),
    );

    return `${headers.join(',')}` + '\r\n' + rows.join('\r\n');
  };

  const handleExport = () => {
    const csvData = convertToCSV(data);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors"
    >
      <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
      Export CSV
    </button>
  );
};

export default DataExport;
