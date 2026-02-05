 import { forwardRef } from 'react';
 import { format } from 'date-fns';
 import { ar } from 'date-fns/locale';
 import { Sale } from '@/types/inventory';
 
 interface SurgeryPrintReportProps {
   sale: Sale;
 }
 
 export const SurgeryPrintReport = forwardRef<HTMLDivElement, SurgeryPrintReportProps>(
   ({ sale }, ref) => {
     const formatCurrency = (value: number) => {
       return new Intl.NumberFormat('en-EG', {
         style: 'decimal',
         minimumFractionDigits: 0,
         maximumFractionDigits: 2,
       }).format(value) + ' EGP';
     };
 
     return (
       <div
         ref={ref}
         className="bg-white text-black p-8 min-h-[297mm] w-[210mm] mx-auto print:p-6 print:m-0"
         dir="rtl"
         style={{ fontFamily: 'Arial, sans-serif' }}
       >
         {/* Header with Logos */}
         <div className="flex items-center justify-between border-b-2 border-gray-800 pb-4 mb-6">
           <div className="text-center">
             <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center mb-2">
               <span className="text-white text-2xl font-bold">Δ</span>
             </div>
             <p className="text-xs font-semibold text-gray-700">Delta Medical Supplies</p>
           </div>
           
           <div className="text-center flex-1 px-4">
             <h1 className="text-2xl font-bold text-gray-900 mb-1">
               تقرير العملية الجراحية
             </h1>
             <h2 className="text-lg text-gray-600">Surgery Consumption Report</h2>
             <p className="text-sm text-gray-500 mt-2">
               رقم التقرير: {sale.id.toUpperCase()}
             </p>
           </div>
           
           <div className="text-center">
             <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-lg flex items-center justify-center mb-2">
               <span className="text-white text-lg font-bold">وثق</span>
             </div>
             <p className="text-xs font-semibold text-gray-700">Wathqq Digital Systems</p>
           </div>
         </div>
 
         {/* Patient & Surgery Info */}
         <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
           <h3 className="text-sm font-bold text-gray-800 mb-3 border-b border-gray-300 pb-2">
             بيانات المريض والعملية | Patient & Surgery Details
           </h3>
           <div className="grid grid-cols-2 gap-4 text-sm">
             <div className="space-y-2">
               <div className="flex justify-between">
                 <span className="text-gray-600">اسم المريض:</span>
                 <span className="font-semibold">{sale.patientName || '-'}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-gray-600">Patient Name:</span>
                 <span className="font-semibold" dir="ltr">{sale.patientName || '-'}</span>
               </div>
             </div>
             <div className="space-y-2">
               <div className="flex justify-between">
                 <span className="text-gray-600">الطبيب المعالج:</span>
                 <span className="font-semibold">{sale.doctorName || '-'}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-gray-600">التاريخ:</span>
                 <span className="font-semibold" dir="ltr">
                   {format(sale.date, 'dd/MM/yyyy', { locale: ar })}
                 </span>
               </div>
             </div>
           </div>
           {sale.notes && (
             <div className="mt-3 pt-3 border-t border-gray-200">
               <span className="text-gray-600 text-sm">نوع العملية: </span>
               <span className="font-semibold text-sm">{sale.notes}</span>
             </div>
           )}
         </div>
 
         {/* Items Table */}
         <div className="mb-8">
           <h3 className="text-sm font-bold text-gray-800 mb-3">
             المستلزمات المستخدمة | Items Used
           </h3>
           <table className="w-full border-collapse border border-gray-300 text-sm">
             <thead>
               <tr className="bg-gray-800 text-white">
                 <th className="border border-gray-300 px-3 py-2 text-right">#</th>
                 <th className="border border-gray-300 px-3 py-2 text-right">كود الصنف<br/><span className="text-xs font-normal">Item Code</span></th>
                 <th className="border border-gray-300 px-3 py-2 text-right">الوصف<br/><span className="text-xs font-normal">Description</span></th>
                 <th className="border border-gray-300 px-3 py-2 text-center">الكمية<br/><span className="text-xs font-normal">Qty</span></th>
               </tr>
             </thead>
             <tbody>
               <tr className="bg-white hover:bg-gray-50">
                 <td className="border border-gray-300 px-3 py-3 text-center font-medium">1</td>
                 <td className="border border-gray-300 px-3 py-3 font-mono text-xs" dir="ltr">
                   {sale.itemId.toUpperCase()}
                 </td>
                 <td className="border border-gray-300 px-3 py-3">{sale.itemName}</td>
                 <td className="border border-gray-300 px-3 py-3 text-center font-bold">
                   {sale.quantity}
                 </td>
               </tr>
             </tbody>
           </table>
         </div>
 
         {/* Notes Section */}
         <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
           <h3 className="text-sm font-bold text-gray-800 mb-2">ملاحظات | Notes</h3>
           <p className="text-sm text-gray-600 min-h-[40px]">
             {sale.notes || 'لا توجد ملاحظات'}
           </p>
         </div>
 
         {/* Signature Lines */}
         <div className="mt-auto pt-8">
           <div className="grid grid-cols-2 gap-8">
             <div className="text-center">
               <div className="border-b-2 border-gray-400 h-16 mb-2"></div>
               <p className="font-semibold text-sm text-gray-800">توقيع الجراح</p>
               <p className="text-xs text-gray-500">Surgeon Signature</p>
               <p className="text-xs text-gray-600 mt-1">{sale.doctorName || '________________'}</p>
             </div>
             <div className="text-center">
               <div className="border-b-2 border-gray-400 h-16 mb-2"></div>
               <p className="font-semibold text-sm text-gray-800">توقيع أمين المخزن</p>
               <p className="text-xs text-gray-500">Storekeeper Signature</p>
               <p className="text-xs text-gray-600 mt-1">________________</p>
             </div>
           </div>
         </div>
 
         {/* Footer */}
         <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
           <p>تم إنشاء هذا التقرير بواسطة نظام وثق للحلول الرقمية</p>
           <p className="mt-1">Generated by Wathqq Digital Systems • {format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
         </div>
       </div>
     );
   }
 );
 
 SurgeryPrintReport.displayName = 'SurgeryPrintReport';