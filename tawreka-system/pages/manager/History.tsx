import React, { useEffect, useState } from 'react';
import { Order, OrderStatus, User } from '../../types';
import { api } from '../../services/api';
import { Search, Filter, X, ClipboardList, Loader2, Eye, Phone, MapPin, Clock, Truck, ShoppingBag } from 'lucide-react';
import { useI18n } from '../../i18n';

interface HistoryProps {
  user: User;
}

const History: React.FC<HistoryProps> = ({ user }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('active');
  const [filterPayment, setFilterPayment] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<{ start: string, end: string }>({ start: '', end: '' });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { t, language } = useI18n();

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        // Operations manager (no branch_id) sees ALL orders; branch_manager sees only their branch
        const data = await api.getOrders(user.branch_id || undefined);
        const sorted = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setOrders(sorted);
      } catch (err) {
        console.error("History fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user.branch_id]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      (order.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm) ||
      (order.customer_phone || '').includes(searchTerm);

    const matchesStatus = filterStatus === 'active'
      ? !['done', 'cancelled'].includes(order.status)
      : filterStatus === 'ALL'
        ? true
        : order.status === filterStatus;

    let matchesDate = true;
    if (dateRange.start) {
      const start = new Date(dateRange.start).setHours(0, 0, 0, 0);
      if (new Date(order.created_at).getTime() < start) matchesDate = false;
    }
    if (dateRange.end) {
      const end = new Date(dateRange.end).setHours(23, 59, 59, 999);
      if (new Date(order.created_at).getTime() > end) matchesDate = false;
    }

    let matchesPayment = true;
    if (filterPayment !== 'ALL') {
      const pm = (order.payment_method || 'cash').toLowerCase();
      if (filterPayment === 'card') {
        matchesPayment = pm.includes('card');
      } else {
        matchesPayment = pm === filterPayment;
      }
    }

    return matchesSearch && matchesStatus && matchesDate && matchesPayment;
  });

  const getStatusBadge = (status: OrderStatus) => {
    const styles: any = {
      'done': 'bg-green-100 text-green-800 border-green-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200',
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'accepted': 'bg-blue-100 text-blue-800 border-blue-200',
      'in_kitchen': 'bg-orange-100 text-orange-800 border-orange-200',
      'out_for_delivery': 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || 'bg-gray-100'}`}>
        {t(`status.${status}`) || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center h-96 items-center">
        <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t('nav.history')}</h2>
              <p className="text-sm text-gray-500">Archived orders</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Found: <span className="font-bold text-gray-900">{filteredOrders.length}</span>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('kds.search_placeholder')}
              className="w-full ltr:pl-10 ltr:pr-4 rtl:pr-10 rtl:pl-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative min-w-[160px]">
              <Filter className="absolute right-3 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <select
                className="w-full ltr:pl-10 ltr:pr-4 rtl:pr-10 rtl:pl-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 appearance-none shadow-sm cursor-pointer hover:bg-white transition-colors"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value="active">{t('filter.active')}</option>
                <option value="done">{t('status.done')}</option>
                <option value="cancelled">{t('status.cancelled')}</option>
                <option value="ALL">{t('kds.filter_all')}</option>
              </select>
            </div>

            <div className="relative min-w-[140px]">
              <select
                className="w-full ltr:pl-4 ltr:pr-4 rtl:pr-4 rtl:pl-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 appearance-none shadow-sm cursor-pointer hover:bg-white transition-colors"
                value={filterPayment}
                onChange={e => setFilterPayment(e.target.value)}
              >
                <option value="ALL">{t('filter.all_payments') || 'All Payments'}</option>
                <option value="cash">{t('checkout.cash') || 'Cash'}</option>
                <option value="card">{t('checkout.card') || 'Card'}</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2.5 outline-none shadow-sm h-[42px]"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
              <span className="text-gray-400">→</span>
              <input
                type="date"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2.5 outline-none shadow-sm h-[42px]"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
              {(dateRange.start || dateRange.end) && (
                <button
                  onClick={() => setDateRange({ start: '', end: '' })}
                  className="p-2.5 bg-gray-100 hover:bg-red-50 hover:text-red-500 rounded-lg text-gray-500 transition-colors border border-gray-200"
                  title={t('filter.reset')}
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right rtl:text-right ltr:text-left whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">#</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Address</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4 text-center">Payment</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-center">{language === 'ar' ? 'تفاصيل' : 'Details'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-blue-50/50 transition duration-150 group cursor-pointer" onClick={() => setSelectedOrder(order)}>
                <td className="px-6 py-4 text-sm font-bold text-gray-900">#{order.id}</td>
                <td className="px-6 py-4 text-gray-600 text-sm">{new Date(order.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4">{order.customer_name}</td>
                <td className="px-6 py-4 text-gray-600 text-sm max-w-[250px] truncate">{order.address_text || '-'}</td>
                <td className="px-6 py-4 font-bold">{order.total_price} {t('common.currency')}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${(order.payment_method || '').includes('card')
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-green-100 text-green-700'
                    }`}>
                    {(order.payment_method || 'cash').includes('card') ? '💳 Card' : '💵 Cash'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">{getStatusBadge(order.status)}</td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                    className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                    title={language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr><td colSpan={8} className="px-6 py-16 text-center text-gray-500">No orders found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-gray-900">
                  {language === 'ar' ? 'تفاصيل الطلب' : 'Order Details'} #{selectedOrder.id}
                </h3>
                {getStatusBadge(selectedOrder.status)}
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
                <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wide">{language === 'ar' ? 'معلومات العميل' : 'Customer Info'}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-gray-500 text-xs">{language === 'ar' ? 'الاسم' : 'Name'}</p>
                    <p className="font-semibold text-gray-800">{selectedOrder.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">{language === 'ar' ? 'الهاتف' : 'Phone'}</p>
                    <p className="font-semibold text-gray-800 font-mono" dir="ltr">
                      <Phone className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                      {selectedOrder.customer_phone}
                    </p>
                  </div>
                  {selectedOrder.address_text && (
                    <div className="md:col-span-2">
                      <p className="text-gray-500 text-xs">{language === 'ar' ? 'العنوان' : 'Address'}</p>
                      <p className="font-semibold text-gray-800">
                        <MapPin className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                        {selectedOrder.address_text}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Meta */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 text-center">
                  <p className="text-gray-500 text-xs mb-1">{language === 'ar' ? 'نوع الخدمة' : 'Service'}</p>
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${selectedOrder.service_type === 'delivery' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                    {selectedOrder.service_type === 'delivery' ? <><Truck className="w-3 h-3" /> {language === 'ar' ? 'توصيل' : 'Delivery'}</> : <><ShoppingBag className="w-3 h-3" /> {language === 'ar' ? 'استلام' : 'Pickup'}</>}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 text-center">
                  <p className="text-gray-500 text-xs mb-1">{language === 'ar' ? 'الدفع' : 'Payment'}</p>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${(selectedOrder.payment_method || '').includes('card') ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                    {(selectedOrder.payment_method || 'cash').includes('card') ? '💳 Card' : '💵 Cash'}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 text-center">
                  <p className="text-gray-500 text-xs mb-1">{language === 'ar' ? 'الوقت' : 'Time'}</p>
                  <p className="text-sm font-bold text-gray-800">
                    <Clock className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                    {new Date(selectedOrder.created_at).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {selectedOrder.branch_name && (
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-100 text-center">
                    <p className="text-purple-500 text-xs mb-1">{language === 'ar' ? 'الفرع' : 'Branch'}</p>
                    <p className="text-sm font-bold text-purple-800">🏪 {selectedOrder.branch_name}</p>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wide mb-3">{language === 'ar' ? 'الأصناف' : 'Order Items'}</h4>
                <div className="bg-gray-50 rounded-xl border border-gray-100 divide-y divide-gray-200">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-4 flex justify-between items-start">
                      <div className="flex items-start gap-3 flex-1">
                        <span className="bg-white border border-gray-200 w-7 h-7 flex items-center justify-center rounded-lg text-sm font-bold text-gray-700 shadow-sm flex-shrink-0">
                          {item.qty}
                        </span>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{item.name}</p>
                          {item.size && (
                            <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded-md inline-block mt-1 border border-blue-100">{item.size}</span>
                          )}
                          {item.options && item.options.length > 0 && (
                            <div className="mt-1.5 space-y-0.5">
                              {item.options.map((opt, oIdx) => (
                                <p key={oIdx} className="text-xs text-gray-500">
                                  <span className="text-gray-400">•</span> {opt.choice}
                                  {opt.price > 0 && <span className="text-green-600 font-medium"> (+{opt.price} {t('common.currency')})</span>}
                                </p>
                              ))}
                            </div>
                          )}
                          {item.notes && (
                            <p className="text-xs text-amber-600 mt-1 italic bg-amber-50 px-2 py-1 rounded border border-amber-100">📝 {item.notes}</p>
                          )}
                        </div>
                      </div>
                      <p className="font-bold text-gray-800 whitespace-nowrap">{item.price} {t('common.currency')}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <h4 className="font-bold text-amber-700 text-sm mb-1">📝 {language === 'ar' ? 'ملاحظات' : 'Notes'}</h4>
                  <p className="text-amber-800 text-sm">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Total */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 flex justify-between items-center text-white">
                <span className="font-bold text-lg">{language === 'ar' ? 'الإجمالي' : 'Total'}</span>
                <span className="text-2xl font-black">{selectedOrder.total_price} {t('common.currency')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;